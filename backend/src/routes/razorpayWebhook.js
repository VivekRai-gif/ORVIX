import { Router } from 'express';
import mongoose from 'mongoose';
import { verifyWebhookSignature } from '../services/razorpayService.js';
import { processActionOutcome } from '../services/outcomeService.js';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { AuditLog } from '../models/AuditLog.js';

const router = Router();

// In-memory set for fast webhook event deduplication
const PROCESSED_WEBHOOK_IDS = new Set();
const MAX_CACHE_SIZE = 5000;

/**
 * Deduplicate webhook events.
 */
function isDuplicateWebhook(eventId) {
  if (!eventId) return false;
  if (PROCESSED_WEBHOOK_IDS.has(eventId)) {
    return true;
  }
  if (PROCESSED_WEBHOOK_IDS.size >= MAX_CACHE_SIZE) {
    const firstKey = PROCESSED_WEBHOOK_IDS.keys().next().value;
    PROCESSED_WEBHOOK_IDS.delete(firstKey);
  }
  PROCESSED_WEBHOOK_IDS.add(eventId);
  return false;
}

/**
 * POST /api/webhooks/razorpay
 * 
 * Razorpay Test Mode Webhook Receiver & Orchestrator Dispatcher
 */
router.post('/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventHeaderId = req.headers['x-razorpay-event-id'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // 1. Signature Verification
    // If webhook secret is configured or signature present, verify authenticity
    if (process.env.RAZORPAY_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[Razorpay Webhook Warning] Invalid HMAC signature received.');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const payload = req.body || {};
    const eventType = payload.event || 'unknown.event';
    const eventId = eventHeaderId || payload.event_id || `evt_${Date.now()}_${Math.random()}`;

    // 2. Deduplication / Idempotency Check
    if (isDuplicateWebhook(eventId)) {
      return res.status(200).json({
        success: true,
        status: 'DEDUPLICATED',
        message: `Webhook event '${eventId}' already processed (idempotent).`
      });
    }

    // Extract payload entity
    const payloadEntity = payload.payload?.payment_link?.entity ||
      payload.payload?.payment?.entity ||
      payload.entity ||
      {};

    const notes = payloadEntity.notes || {};
    let caseId = notes.caseId || notes.case_id;
    const paymentId = payloadEntity.payment_id || payloadEntity.id;
    const amount = payloadEntity.amount ? payloadEntity.amount / 100 : (payloadEntity.amount_paid ? payloadEntity.amount_paid / 100 : 0);

    // 3. Identify RecoveryCase if caseId not directly in notes
    const isDbReady = typeof mongoose !== 'undefined' && mongoose?.connection?.readyState === 1;

    if (!caseId && isDbReady && paymentId && typeof RecoveryCase?.findOne === 'function') {
      try {
        const foundCase = await RecoveryCase.findOne({
          $or: [{ paymentId }, { caseId: paymentId }]
        });
        if (foundCase) {
          caseId = foundCase.caseId;
        }
      } catch (e) {}
    }

    if (!caseId) {
      caseId = `case_syn_wh_${eventId.slice(-6)}`;
    }

    // 4. Map Razorpay Events to Outcome
    let targetOutcome = 'PENDING';
    let failureReason = null;

    switch (eventType) {
      case 'payment_link.paid':
      case 'payment.captured':
      case 'payment.authorized':
      case 'order.paid':
        targetOutcome = 'RECOVERED';
        break;

      case 'payment_link.expired':
      case 'payment_link.cancelled':
        targetOutcome = 'EXPIRED';
        failureReason = `Razorpay payment link ${eventType.split('.')[1]}`;
        break;

      case 'payment.failed':
        targetOutcome = 'FAILED';
        failureReason = payloadEntity.error_description || payloadEntity.reason || 'Payment declined by gateway';
        break;

      default:
        targetOutcome = 'PENDING';
        break;
    }

    // 5. Process Outcome & Update Case
    const outcomeResult = await processActionOutcome({
      caseId,
      outcome: targetOutcome,
      failureReason,
      metadata: {
        amount,
        razorpayEvent: eventType,
        razorpayEventId: eventId,
        razorpayPaymentId: paymentId,
        source: 'RAZORPAY_WEBHOOK'
      }
    });

    // 6. Audit Log Entry
    if (isDbReady && typeof AuditLog?.create === 'function') {
      try {
        await AuditLog.create({
          caseId,
          eventType: 'RAZORPAY_WEBHOOK_PROCESSED',
          actor: 'razorpay_webhook',
          message: `Processed Razorpay Webhook event '${eventType}' -> Outcome '${targetOutcome}' for ₹${amount}.`,
          metadata: {
            eventId,
            eventType,
            targetOutcome,
            paymentId,
            amount
          }
        });
      } catch (e) {}
    }

    // 7. Return Response
    return res.status(200).json({
      success: true,
      mode: 'TEST_MODE',
      eventId,
      eventType,
      caseId,
      outcome: targetOutcome,
      result: outcomeResult
    });
  } catch (error) {
    console.error('[Razorpay Webhook Exception]', error);
    return res.status(500).json({ error: 'Failed to process Razorpay webhook', detail: error.message });
  }
});

export default router;
