import { ActionExecution } from '../models/ActionExecution.js';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * Controlled Backend Tools for Payment & Recovery Operations
 * 
 * IMPORTANT: The LLM/Agent must NOT directly execute payment operations.
 * All operations are strictly executed through these controlled, audited backend tools.
 */

/**
 * Execute Payment Retry Tool
 */
export async function executePaymentRetryTool({ caseId, amount }) {
  const execution = await ActionExecution.create({
    caseId,
    action: 'RETRY',
    status: 'success',
    executedAt: new Date(),
    completedAt: new Date(),
    toolResponse: { status: 'COMPLETED', message: `Executed payment retry for ₹${amount}` }
  });

  const rCase = await RecoveryCase.findOne({ caseId });
  if (rCase) {
    rCase.attemptCount = (rCase.attemptCount || 0) + 1;
    rCase.status = 'recovered';
    rCase.recoveredAmount = amount || rCase.amount;
    rCase.closedAt = new Date();
    await rCase.save();
  }

  await AuditLog.create({
    caseId,
    eventType: 'ACTION_EXECUTED',
    actor: 'controlled_tool',
    message: `Controlled Tool executed payment RETRY for case ${caseId} (₹${amount}).`,
    metadata: { action: 'RETRY', executionId: execution._id }
  });

  return { success: true, action: 'RETRY', executionId: execution._id };
}

/**
 * Send Payment Link Tool
 */
export async function sendPaymentLinkTool({ caseId, customerId, amount }) {
  const execution = await ActionExecution.create({
    caseId,
    action: 'PAYMENT_LINK',
    status: 'success',
    executedAt: new Date(),
    completedAt: new Date(),
    toolResponse: {
      status: 'SENT',
      paymentUrl: `https://pay.orvix.ai/link/${caseId}`,
      message: `Payment link generated and sent to customer ${customerId}`
    }
  });

  const rCase = await RecoveryCase.findOne({ caseId });
  if (rCase) {
    rCase.contactCount = (rCase.contactCount || 0) + 1;
    rCase.status = 'in_progress';
    await rCase.save();
  }

  await AuditLog.create({
    caseId,
    eventType: 'ACTION_EXECUTED',
    actor: 'controlled_tool',
    message: `Controlled Tool sent PAYMENT_LINK for case ${caseId} to customer ${customerId}.`,
    metadata: { action: 'PAYMENT_LINK', executionId: execution._id }
  });

  return { success: true, action: 'PAYMENT_LINK', executionId: execution._id };
}

/**
 * Send Email Tool
 */
export async function sendEmailTool({ caseId, customerId }) {
  const execution = await ActionExecution.create({
    caseId,
    action: 'EMAIL',
    status: 'success',
    executedAt: new Date(),
    completedAt: new Date(),
    toolResponse: { status: 'SENT', message: `Recovery email sent to customer ${customerId}` }
  });

  const rCase = await RecoveryCase.findOne({ caseId });
  if (rCase) {
    rCase.contactCount = (rCase.contactCount || 0) + 1;
    rCase.status = 'in_progress';
    await rCase.save();
  }

  await AuditLog.create({
    caseId,
    eventType: 'ACTION_EXECUTED',
    actor: 'controlled_tool',
    message: `Controlled Tool sent EMAIL notification for case ${caseId}.`,
    metadata: { action: 'EMAIL', executionId: execution._id }
  });

  return { success: true, action: 'EMAIL', executionId: execution._id };
}

/**
 * Escalate to Human Support Tool
 */
export async function escalateToHumanTool({ caseId, reason }) {
  const execution = await ActionExecution.create({
    caseId,
    action: 'HUMAN_ESCALATION',
    status: 'success',
    executedAt: new Date(),
    completedAt: new Date(),
    toolResponse: { status: 'ESCALATED', ticketId: `TICKET_${caseId}`, message: `Escalated to support queue: ${reason}` }
  });

  const rCase = await RecoveryCase.findOne({ caseId });
  if (rCase) {
    rCase.attemptCount = (rCase.attemptCount || 0) + 1;
    rCase.status = 'escalated';
    await rCase.save();
  }

  await AuditLog.create({
    caseId,
    eventType: 'ACTION_EXECUTED',
    actor: 'controlled_tool',
    message: `Controlled Tool escalated case ${caseId} to human support queue.`,
    metadata: { action: 'HUMAN_ESCALATION', reason, executionId: execution._id }
  });

  return { success: true, action: 'HUMAN_ESCALATION', executionId: execution._id };
}

/**
 * Controlled Tool Dispatcher
 */
export async function executeControlledTool(action, params) {
  const normAction = (action || '').toUpperCase();
  switch (normAction) {
    case 'RETRY':
      return await executePaymentRetryTool(params);
    case 'PAYMENT_LINK':
      return await executePaymentLinkTool(params);
    case 'EMAIL':
      return await executeEmailTool(params);
    case 'HUMAN_ESCALATION':
      return await escalateToHumanTool(params);
    default:
      throw new Error(`Unknown action type '${action}' for controlled tool execution.`);
  }
}
