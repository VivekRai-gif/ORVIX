import { RecoveryCase, AuditLog } from '../models/index.js';
import { isDbConnected } from '../config/db.js';

/**
 * Pure rule-based failure diagnosis function.
 * Evaluates deterministic rules first before falling back to unknown classification.
 *
 * @param {string} failureReason
 * @returns {Object} Structured diagnosis result
 */
export function diagnoseFailureReason(failureReason) {
  const reason = (failureReason || 'UNKNOWN').toUpperCase().trim();

  // 1. SOFT_FAILURE (Insufficient funds, balance issues)
  if (reason.includes('FUNDS') || reason.includes('BALANCE') || reason.includes('LIMIT_EXCEEDED')) {
    return {
      category: 'SOFT_FAILURE',
      recoverable: true,
      rootCause: 'Insufficient account balance',
      candidateActions: ['RETRY', 'PAYMENT_LINK', 'EMAIL'],
      confidence: 0.91,
      explanation: 'Customer account balance was insufficient during charge attempt. A delayed retry or payment link reminder has high recovery probability.'
    };
  }

  // 2. TEMPORARY_FAILURE (Network errors, timeouts, bank declines)
  if (reason.includes('NETWORK') || reason.includes('TIMEOUT') || reason.includes('GATEWAY') || reason.includes('DECLINED') || reason.includes('DOWN')) {
    const isDecline = reason.includes('DECLINED');
    return {
      category: 'TEMPORARY_FAILURE',
      recoverable: true,
      rootCause: isDecline ? 'Issuing bank temporary decline' : 'Temporary gateway network timeout',
      candidateActions: isDecline ? ['RETRY', 'PAYMENT_LINK'] : ['RETRY'],
      confidence: isDecline ? 0.87 : 0.95,
      explanation: isDecline
        ? 'The issuing bank declined the transaction temporarily. Retrying during off-peak hours or sending a Payment Link is recommended.'
        : 'Temporary network communication timeout occurred between payment gateway and issuing bank. Immediate or short-interval retry recommended.'
    };
  }

  // 3. CUSTOMER_ACTION_REQUIRED (Expired card, OTP dropoff, checkout abandonment)
  if (reason.includes('EXPIRED') || reason.includes('DROPOFF') || reason.includes('AUTHENTICATION') || reason.includes('OTP')) {
    return {
      category: 'CUSTOMER_ACTION_REQUIRED',
      recoverable: true,
      rootCause: 'Card expired or customer authorization dropoff',
      candidateActions: ['PAYMENT_LINK', 'EMAIL'],
      confidence: 0.89,
      explanation: 'Payment method requires customer intervention (updating card details or completing 2FA authentication). Interactive Payment Link or Email is required.'
    };
  }

  // 4. HARD_FAILURE (Invalid payment method, blocked card, stolen card)
  if (reason.includes('INVALID') || reason.includes('BLOCKED') || reason.includes('STOLEN') || reason.includes('DISABLED')) {
    return {
      category: 'HARD_FAILURE',
      recoverable: false,
      rootCause: 'Invalid or permanently blocked payment method',
      candidateActions: ['EMAIL'],
      confidence: 0.96,
      explanation: 'The payment instrument is invalid or permanently disabled. Automated retries will fail; notification sent to request new payment method.'
    };
  }

  // 5. UNKNOWN (Fallback for unclassified reasons)
  return {
    category: 'UNKNOWN',
    recoverable: true,
    rootCause: 'Unclassified payment failure reason',
    candidateActions: ['RETRY', 'PAYMENT_LINK', 'EMAIL'],
    confidence: 0.50,
    explanation: 'Unclassified failure code encountered. Conservative fallback sequence evaluated.'
  };
}

/**
 * Perform diagnosis for a RecoveryCase instance in MongoDB,
 * update case metadata, and record audit log.
 *
 * @param {string|Object} recoveryCaseOrId
 * @returns {Promise<Object>} Diagnosis result and updated case
 */
export async function diagnoseCase(recoveryCaseOrId) {
  let caseId = typeof recoveryCaseOrId === 'string' ? recoveryCaseOrId : recoveryCaseOrId.caseId;
  let rCase = typeof recoveryCaseOrId === 'object' ? recoveryCaseOrId : null;

  if (isDbConnected() && !rCase) {
    rCase = await RecoveryCase.findOne({ caseId });
  }

  const failureReason = rCase ? rCase.failureReason : (typeof recoveryCaseOrId === 'object' ? recoveryCaseOrId.failureReason : 'UNKNOWN');
  const diagnosis = diagnoseFailureReason(failureReason);

  if (isDbConnected() && rCase) {
    rCase.failureCategory = diagnosis.category.toLowerCase();
    await rCase.save();

    await AuditLog.create({
      caseId,
      eventType: 'DIAGNOSIS_PERFORMED',
      actor: 'ai_engine',
      message: `AI Diagnosis performed: ${diagnosis.category} (Confidence: ${(diagnosis.confidence * 100).toFixed(0)}%). Root Cause: ${diagnosis.rootCause}`,
      metadata: {
        category: diagnosis.category,
        recoverable: diagnosis.recoverable,
        rootCause: diagnosis.rootCause,
        candidateActions: diagnosis.candidateActions,
        confidence: diagnosis.confidence
      }
    });
  }

  return {
    caseId,
    diagnosis,
    case: rCase
  };
}

export default {
  diagnoseFailureReason,
  diagnoseCase
};
