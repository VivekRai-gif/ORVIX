import mongoose from 'mongoose';
import { ActionExecution } from '../models/ActionExecution.js';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * Messaging Provider Interface & Abstraction Layer
 */
class BaseMessagingProvider {
  async send(params) {
    throw new Error('Method "send" must be implemented by MessagingProvider');
  }
}

/**
 * Email Messaging Provider Implementation (Simulated / Pluggable SMTP/SendGrid)
 */
export class EmailProvider extends BaseMessagingProvider {
  async send({ recipient, subject, body, caseId }) {
    const messageId = `msg_email_syn_${Date.now()}`;
    return {
      providerName: 'SimulatedEmailProvider',
      messageId,
      recipient: recipient || 'customer@orvix-test.ai',
      status: 'DELIVERED',
      details: `Simulated Email sent to ${recipient || 'customer@orvix-test.ai'} for case ${caseId}`
    };
  }
}

/**
 * SMS Messaging Provider Abstraction (Twilio / SMS Gateway Placeholder)
 */
export class SMSProvider extends BaseMessagingProvider {
  async send({ recipient, body, caseId }) {
    const messageId = `msg_sms_syn_${Date.now()}`;
    return {
      providerName: 'SimulatedSMSProvider',
      messageId,
      recipient: recipient || '+919999999999',
      status: 'DELIVERED',
      details: `Simulated SMS sent to ${recipient || '+919999999999'} for case ${caseId}`
    };
  }
}

/**
 * WhatsApp Messaging Provider Abstraction (WhatsApp Business API Placeholder)
 */
export class WhatsAppProvider extends BaseMessagingProvider {
  async send({ recipient, body, caseId }) {
    const messageId = `msg_wa_syn_${Date.now()}`;
    return {
      providerName: 'SimulatedWhatsAppProvider',
      messageId,
      recipient: recipient || '+919999999999',
      status: 'DELIVERED',
      details: `Simulated WhatsApp message sent to ${recipient || '+919999999999'} for case ${caseId}`
    };
  }
}

// Provider Registry
const PROVIDERS = {
  EMAIL: new EmailProvider(),
  SMS: new SMSProvider(),
  WHATSAPP: new WhatsAppProvider()
};

/**
 * Register a custom messaging provider dynamically.
 */
export function registerMessagingProvider(channel, providerInstance) {
  PROVIDERS[channel.toUpperCase()] = providerInstance;
}

/**
 * ORVIX Controlled Messaging Tool
 * 
 * Supports EMAIL, SMS, and WHATSAPP via clean Provider Abstraction.
 */
export async function sendMessaging(params = {}) {
  const {
    caseId,
    customerId,
    channel = 'EMAIL',
    recipient,
    template = 'PAYMENT_RECOVERY_NOTICE',
    paymentUrl,
    idempotencyKey
  } = params;

  // 1. Input Validation
  if (!caseId) {
    throw new Error('messagingTool: Missing required parameter "caseId"');
  }

  const normChannel = (channel || 'EMAIL').toUpperCase();
  const provider = PROVIDERS[normChannel] || PROVIDERS.EMAIL;

  const isDbReady = typeof mongoose !== 'undefined' && mongoose?.connection?.readyState === 1;

  // 2. Idempotency Check
  if (isDbReady && typeof ActionExecution?.findOne === 'function') {
    try {
      const existing = await ActionExecution.findOne({
        caseId,
        action: normChannel,
        status: 'success'
      }).sort({ executedAt: -1 });

      if (existing) {
        return {
          success: true,
          action: normChannel,
          channel: normChannel,
          caseId,
          messageId: existing.toolResponse?.messageId || `msg_cached_${caseId}`,
          recipient: recipient || 'customer@orvix-test.ai',
          status: 'IDEMPOTENT_SKIPPED',
          message: `Messaging (${normChannel}) already delivered for case ${caseId}. Returning cached result.`,
          executionId: existing._id
        };
      }
    } catch (e) {
      // Ignore DB read errors
    }
  }

  // 3. Provider Delivery Execution
  const subject = `Urgent: Resolve your payment for case ${caseId}`;
  const body = `Dear Customer, please update your payment method to avoid subscription interruption. Link: ${paymentUrl || 'https://pay.orvix.ai'}`;

  const deliveryResult = await provider.send({
    recipient,
    subject,
    body,
    caseId,
    template
  });

  // 4. Persistence & Audit Logging
  let executionId = `exec_msg_${Date.now()}`;

  if (isDbReady) {
    if (typeof ActionExecution?.create === 'function') {
      try {
        const execution = await ActionExecution.create({
          caseId,
          action: normChannel,
          status: 'success',
          executedAt: new Date(),
          completedAt: new Date(),
          toolResponse: {
            status: deliveryResult.status,
            channel: normChannel,
            messageId: deliveryResult.messageId,
            provider: deliveryResult.providerName,
            recipient: deliveryResult.recipient
          }
        });
        executionId = execution._id;
      } catch (e) {}
    }

    if (typeof RecoveryCase?.findOne === 'function') {
      try {
        const rCase = await RecoveryCase.findOne({ caseId });
        if (rCase) {
          rCase.contactCount = (rCase.contactCount || 0) + 1;
          rCase.status = 'in_progress';
          await rCase.save();
        }
      } catch (e) {}
    }

    if (typeof AuditLog?.create === 'function') {
      try {
        await AuditLog.create({
          caseId,
          eventType: 'ACTION_EXECUTED',
          actor: 'messagingTool',
          message: `Controlled Tool delivered ${normChannel} notification via ${deliveryResult.providerName}. MessageId: ${deliveryResult.messageId}`,
          metadata: { action: normChannel, channel: normChannel, messageId: deliveryResult.messageId }
        });
      } catch (e) {}
    }
  }

  // 5. Mask Secrets in Output
  return {
    success: true,
    action: normChannel,
    channel: normChannel,
    caseId,
    messageId: deliveryResult.messageId,
    recipient: deliveryResult.recipient,
    provider: deliveryResult.providerName,
    status: deliveryResult.status,
    executionId
  };
}

export default sendMessaging;
