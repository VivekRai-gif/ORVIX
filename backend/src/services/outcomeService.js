import mongoose from 'mongoose';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { ActionExecution } from '../models/ActionExecution.js';
import { AuditLog } from '../models/AuditLog.js';
import { evaluateStopRules } from '../policies/recoveryPolicy.js';
import { runOrchestrator } from '../agents/recoveryOrchestrator.js';

export const OUTCOME_STATUSES = ['RECOVERED', 'FAILED', 'PENDING', 'STOPPED', 'ESCALATED', 'EXPIRED'];

/**
 * Outcome Tracking & Audit Service
 * 
 * Flow:
 * 1. Create/Update ActionExecution
 * 2. Create AuditLog
 * 3. Receive outcome (RECOVERED, FAILED, PENDING, STOPPED, ESCALATED, EXPIRED)
 * 4. Update RecoveryCase status
 * 5. Update recoveredAmount
 * 6. If RECOVERED -> close case
 * 7. If FAILED -> increment attempts, re-evaluate next action or stop
 * 8. If policy says stop -> stop case
 */
export async function processActionOutcome({
  caseId,
  executionId,
  outcome,
  failureReason,
  metadata = {}
}) {
  const normOutcome = (outcome || 'PENDING').toUpperCase();

  if (!OUTCOME_STATUSES.includes(normOutcome)) {
    throw new Error(`Invalid outcome status '${outcome}'. Allowed: ${OUTCOME_STATUSES.join(', ')}`);
  }

  const isDbReady = typeof mongoose !== 'undefined' && mongoose?.connection?.readyState === 1;

  // 1. Load RecoveryCase
  let rCase = null;
  if (isDbReady && typeof RecoveryCase?.findOne === 'function') {
    try {
      rCase = await RecoveryCase.findOne({ caseId });
    } catch (e) {}
  }

  if (!rCase) {
    rCase = {
      caseId,
      status: 'AT_RISK',
      amount: metadata.amount || 1000,
      attemptCount: 0,
      contactCount: 0,
      recoveredAmount: 0
    };
  }

  // 2. Load or update ActionExecution
  let execution = null;
  if (isDbReady && typeof ActionExecution?.findOne === 'function') {
    try {
      if (executionId) {
        execution = await ActionExecution.findById(executionId);
      }
      if (!execution) {
        execution = await ActionExecution.create({
          caseId,
          action: metadata.action || rCase.selectedAction || 'RETRY',
          status: normOutcome.toLowerCase(),
          executedAt: new Date(),
          completedAt: new Date(),
          toolResponse: { outcome: normOutcome, failureReason, ...metadata }
        });
      } else {
        execution.status = normOutcome.toLowerCase();
        execution.completedAt = new Date();
        execution.toolResponse = { ...execution.toolResponse, outcome: normOutcome, failureReason, ...metadata };
        await execution.save();
      }
    } catch (e) {}
  }

  // 3. Process Status Updates & Rules
  let nextDecision = null;
  let stopReason = null;

  switch (normOutcome) {
    case 'RECOVERED':
      rCase.status = 'recovered';
      rCase.recoveredAmount = rCase.amount || metadata.amount || 0;
      rCase.closedAt = new Date();
      break;

    case 'FAILED':
      rCase.attemptCount = (rCase.attemptCount || 0) + 1;
      
      // Re-evaluate Stop Rules
      const stopCheck = evaluateStopRules({
        action: rCase.selectedAction || 'RETRY',
        caseContext: rCase,
        expectedRecoveryValue: rCase.expectedRecoveryValue || 0
      });

      if (stopCheck.stopped) {
        rCase.status = 'closed';
        stopReason = stopCheck.reason;
      } else {
        rCase.status = 'in_progress';
        // Trigger orchestrator re-evaluation for next best action
        if (isDbReady) {
          try {
            nextDecision = await runOrchestrator(caseId);
          } catch (e) {}
        }
      }
      break;

    case 'STOPPED':
      rCase.status = 'closed';
      rCase.closedAt = new Date();
      stopReason = metadata.reason || 'Recovery intervention stopped by policy/operator';
      break;

    case 'ESCALATED':
      rCase.status = 'escalated';
      break;

    case 'EXPIRED':
      rCase.status = 'closed';
      rCase.closedAt = new Date();
      break;

    case 'PENDING':
    default:
      rCase.status = 'in_progress';
      break;
  }

  // 4. Save RecoveryCase
  if (rCase.save && typeof rCase.save === 'function') {
    try {
      await rCase.save();
    } catch (e) {}
  }

  // 5. Create AuditLog
  if (isDbReady && typeof AuditLog?.create === 'function') {
    try {
      await AuditLog.create({
        caseId,
        eventType: `OUTCOME_${normOutcome}`,
        actor: 'outcomeService',
        message: `Processed outcome '${normOutcome}' for case ${caseId}.${stopReason ? ` Stop Reason: ${stopReason}` : ''}`,
        metadata: {
          outcome: normOutcome,
          failureReason,
          recoveredAmount: rCase.recoveredAmount,
          status: rCase.status,
          nextSelectedAction: nextDecision ? nextDecision.selectedAction : null
        }
      });
    } catch (e) {}
  }

  return {
    success: true,
    caseId,
    outcome: normOutcome,
    status: rCase.status,
    recoveredAmount: rCase.recoveredAmount || 0,
    attemptCount: rCase.attemptCount || 0,
    stopReason,
    nextDecision
  };
}
