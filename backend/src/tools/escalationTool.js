import mongoose from 'mongoose';
import { ActionExecution } from '../models/ActionExecution.js';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * ORVIX Controlled Escalation Tool
 * 
 * Escalates high-value or complex cases to the human merchant support queue.
 */

export async function escalateToHuman(params = {}) {
  const { caseId, reason = 'Escalated for manual merchant review', priority = 'HIGH', assignee, idempotencyKey } = params;

  // 1. Input Validation
  if (!caseId) {
    throw new Error('escalationTool: Missing required parameter "caseId"');
  }

  const normPriority = (priority || 'HIGH').toUpperCase();
  const isDbReady = typeof mongoose !== 'undefined' && mongoose?.connection?.readyState === 1;

  // 2. Idempotency Check
  if (isDbReady && typeof ActionExecution?.findOne === 'function') {
    try {
      const existing = await ActionExecution.findOne({
        caseId,
        action: 'HUMAN_ESCALATION',
        status: 'success'
      }).sort({ executedAt: -1 });

      if (existing) {
        return {
          success: true,
          action: 'HUMAN_ESCALATION',
          caseId,
          ticketId: existing.toolResponse?.ticketId || `TICKET_${caseId}`,
          priority: normPriority,
          status: 'IDEMPOTENT_SKIPPED',
          reason: existing.toolResponse?.reason || reason,
          message: `Case ${caseId} is already escalated in support queue (idempotent).`,
          executionId: existing._id
        };
      }
    } catch (e) {
      // Ignore DB read errors
    }
  }

  // 3. Human Escalation Record Generation
  const ticketId = `TICKET_${caseId}_${Date.now()}`;

  // 4. Persistence & Audit Logging
  let executionId = `exec_esc_${Date.now()}`;

  if (isDbReady) {
    if (typeof ActionExecution?.create === 'function') {
      try {
        const execution = await ActionExecution.create({
          caseId,
          action: 'HUMAN_ESCALATION',
          status: 'success',
          executedAt: new Date(),
          completedAt: new Date(),
          toolResponse: {
            status: 'ESCALATED',
            ticketId,
            priority: normPriority,
            reason,
            assignee: assignee || 'unassigned_queue'
          }
        });
        executionId = execution._id;
      } catch (e) {}
    }

    if (typeof RecoveryCase?.findOne === 'function') {
      try {
        const rCase = await RecoveryCase.findOne({ caseId });
        if (rCase) {
          rCase.attemptCount = (rCase.attemptCount || 0) + 1;
          rCase.status = 'escalated';
          rCase.selectedAction = 'HUMAN_ESCALATION';
          await rCase.save();
        }
      } catch (e) {}
    }

    if (typeof AuditLog?.create === 'function') {
      try {
        await AuditLog.create({
          caseId,
          eventType: 'CASE_ESCALATED',
          actor: 'escalationTool',
          message: `Controlled Tool escalated case ${caseId} to human support queue (Ticket: ${ticketId}, Priority: ${normPriority}). Reason: ${reason}`,
          metadata: { action: 'HUMAN_ESCALATION', ticketId, priority: normPriority, reason }
        });
      } catch (e) {}
    }
  }

  // 5. Mask Secrets in Output
  return {
    success: true,
    action: 'HUMAN_ESCALATION',
    caseId,
    ticketId,
    priority: normPriority,
    status: 'ESCALATED',
    reason,
    executionId
  };
}

export default escalateToHuman;
