import mongoose from 'mongoose';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { Customer } from '../models/Customer.js';
import { Payment } from '../models/Payment.js';
import { Policy } from '../models/Policy.js';
import { AuditLog } from '../models/AuditLog.js';
import { diagnoseFailureReason } from '../services/diagnosisService.js';
import { calculateExpectedRecoveryValues } from '../services/expectedValueService.js';
import { evaluatePolicyRule, DEFAULT_POLICY } from '../services/policyEngineService.js';
import { executeTool } from '../tools/index.js';
import { generateExplanation } from '../services/explanationService.js';

/**
 * Fetch recovery probability for candidate actions from ML Service or fallback engine.
 */
export async function fetchActionProbabilities(caseData, customerData, diagnosis, overrideProbs = null) {
  if (overrideProbs) {
    return overrideProbs;
  }
  if (process.env.SKIP_ML_FETCH === 'true') {
    return getHeuristicProbabilities(caseData.failureReason, diagnosis, customerData);
  }

  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${mlUrl}/predict-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(500),
      body: JSON.stringify({
        amount: caseData.amount,
        failure_reason: caseData.failureReason || 'UNKNOWN',
        payment_method: caseData.paymentMethod || 'card',
        customer_segment: customerData.segment || 'RETURNING',
        previous_successful_payments: customerData.previousSuccessfulPayments || 0,
        previous_failed_payments: customerData.previousFailedPayments || 0,
        historical_recovery_rate: customerData.historicalRecoveryRate || 0.5,
        attempt_count: caseData.attemptCount || 0,
        contact_count: caseData.contactCount || 0,
        time_since_failure: 1.0
      })
    });

    if (response.ok) {
      const data = await response.json();
      const probMap = {};
      if (data.rankings && Array.isArray(data.rankings)) {
        data.rankings.forEach(item => {
          probMap[item.action.toUpperCase()] = item.probability;
        });
        return probMap;
      }
    }
  } catch (err) {
    // Offline / unavailable ML service fallback
  }

  return getHeuristicProbabilities(caseData.failureReason, diagnosis, customerData);
}

function getHeuristicProbabilities(failureReason, diagnosis, customerData) {
  const reason = (failureReason || '').toUpperCase();
  const baseRate = customerData?.historicalRecoveryRate ?? 0.60;

  if (diagnosis?.category === 'HARD_FAILURE' || diagnosis?.recoverable === false) {
    return { RETRY: 0.0, PAYMENT_LINK: 0.0, EMAIL: 0.0, HUMAN_ESCALATION: 0.0 };
  }

  if (reason.includes('INSUFFICIENT_FUNDS') || reason.includes('LOW_BALANCE')) {
    return {
      RETRY: Math.min(0.85, baseRate + 0.15),
      PAYMENT_LINK: 0.55,
      EMAIL: 0.40,
      HUMAN_ESCALATION: 0.70
    };
  }

  if (reason.includes('TIMEOUT') || reason.includes('NETWORK') || reason.includes('GATEWAY')) {
    return {
      RETRY: Math.min(0.92, baseRate + 0.25),
      PAYMENT_LINK: 0.35,
      EMAIL: 0.25,
      HUMAN_ESCALATION: 0.50
    };
  }

  if (reason.includes('EXPIRED') || reason.includes('DROPOFF')) {
    return {
      RETRY: 0.10,
      PAYMENT_LINK: Math.min(0.85, baseRate + 0.20),
      EMAIL: 0.65,
      HUMAN_ESCALATION: 0.80
    };
  }

  return {
    RETRY: 0.50,
    PAYMENT_LINK: 0.50,
    EMAIL: 0.40,
    HUMAN_ESCALATION: 0.60
  };
}

/**
 * ORVIX Recovery Orchestrator Flow
 * 
 * 1. Load RecoveryCase
 * 2. Load Customer
 * 3. Load Payment
 * 4. Run Diagnosis Engine
 * 5. Get recovery probability for every candidate action
 * 6. Calculate Expected Recovery Value for every candidate action
 * 7. Sort candidate actions by ERV
 * 8. Send the best action to Policy Engine
 * 9. If approved: execute action (via controlled backend tools)
 * 10. If rejected: try the next eligible action
 * 11. Record every decision in AuditLog
 * 12. Return complete decision object
 */
export async function runOrchestrator(caseId, options = {}) {
  const {
    dbOverridingCase,
    dbOverridingCustomer,
    dbOverridingPayment,
    dbOverridingPolicy,
    probabilitiesOverride,
    customCosts,
    executeImmediately = false
  } = options;

  const isDbReady = typeof mongoose !== 'undefined' && mongoose?.connection?.readyState === 1;

  // 1. Load RecoveryCase
  let rCase = dbOverridingCase;
  if (!rCase && isDbReady && typeof RecoveryCase?.findOne === 'function') {
    try {
      rCase = await RecoveryCase.findOne({ caseId });
    } catch (e) {
      rCase = null;
    }
  }

  if (!rCase) {
    if (dbOverridingCase) {
      rCase = dbOverridingCase;
    } else {
      rCase = {
        caseId,
        amount: options.amount || 10000,
        failureReason: options.failureReason || 'INSUFFICIENT_FUNDS',
        status: options.status || 'AT_RISK',
        attemptCount: options.attemptCount || 0,
        contactCount: options.contactCount || 0,
        customerId: options.customerId || 'cust_unknown',
        paymentId: options.paymentId || 'pay_unknown'
      };
    }
  }

  // 2. Load Customer
  let customer = dbOverridingCustomer;
  if (!customer && isDbReady && typeof Customer?.findOne === 'function') {
    try {
      customer = await Customer.findOne({ customerId: rCase.customerId });
    } catch (e) {
      customer = null;
    }
  }
  if (!customer) {
    customer = { customerId: rCase.customerId || 'cust_unknown', segment: 'CONSUMER', optedOut: false };
  }

  // 3. Load Payment
  let payment = dbOverridingPayment;
  if (!payment && isDbReady && typeof Payment?.findOne === 'function') {
    try {
      payment = await Payment.findOne({ paymentId: rCase.paymentId });
    } catch (e) {
      payment = null;
    }
  }
  if (!payment) {
    payment = { paymentId: rCase.paymentId || 'pay_unknown', amount: rCase.amount, failureReason: rCase.failureReason };
  }

  // 4. Run Diagnosis Engine
  const failureReason = rCase.failureReason || payment.failureReason || 'UNKNOWN';
  const diagnosis = diagnoseFailureReason(failureReason);

  // 5. Get recovery probability for candidate actions
  const probMap = await fetchActionProbabilities(rCase, customer, diagnosis, probabilitiesOverride);

  // 6. Calculate Expected Recovery Value for every candidate action
  const ervResults = calculateExpectedRecoveryValues({
    amount: rCase.amount,
    probabilities: probMap,
    customCosts
  });

  // 7. Candidate actions are sorted by ERV descending
  const actionsSummary = ervResults.map(item => ({
    action: item.action,
    probability: item.probability,
    expectedValue: item.expectedRecoveryValue
  }));

  // 8. Load Policy
  let merchantPolicy = dbOverridingPolicy;
  if (!merchantPolicy && isDbReady && typeof Policy?.findOne === 'function') {
    try {
      merchantPolicy = await Policy.findOne({ merchantId: 'default_merchant' });
    } catch (e) {
      merchantPolicy = null;
    }
  }
  if (!merchantPolicy) {
    merchantPolicy = DEFAULT_POLICY;
  }

  // 8, 9, 10. Evaluate candidate actions against Policy Engine in descending ERV order
  let selectedAction = 'NONE';
  let policyDecision = 'REJECTED';
  let decisionReason = 'No eligible actions approved by Policy Engine.';
  let approvedErvItem = null;

  for (const item of ervResults) {
    const policyResult = evaluatePolicyRule({
      action: item.action,
      expectedValue: item.expectedRecoveryValue,
      caseContext: { attemptCount: rCase.attemptCount || 0, contactCount: rCase.contactCount || 0 },
      customerContext: { customerId: customer.customerId, optedOut: customer.optedOut },
      diagnosis,
      policy: merchantPolicy
    });

    if (policyResult.approved) {
      selectedAction = item.action;
      policyDecision = 'APPROVED';
      decisionReason = `Highest Expected Recovery Value (₹${item.expectedRecoveryValue}) approved by Policy Engine.`;
      approvedErvItem = item;
      break;
    }
  }

  // Update RecoveryCase model if database instance
  if (rCase && rCase.save && typeof rCase.save === 'function') {
    rCase.selectedAction = selectedAction;
    rCase.expectedRecoveryValue = approvedErvItem ? approvedErvItem.expectedRecoveryValue : 0;
    if (policyDecision === 'APPROVED' && (rCase.status === 'AT_RISK' || rCase.status === 'open')) {
      rCase.status = 'in_progress';
    } else if (policyDecision === 'REJECTED' && diagnosis.category === 'HARD_FAILURE') {
      rCase.status = 'closed';
    }
    try {
      await rCase.save();
    } catch (e) {
      // Ignore DB save errors in test mocks
    }
  }

  // 11. Record decision in AuditLog
  if (typeof AuditLog?.create === 'function') {
    try {
      await AuditLog.create({
        caseId,
        eventType: 'ORCHESTRATOR_DECISION',
        actor: 'recovery_orchestrator',
        message: `Orchestrator selected '${selectedAction}' with decision '${policyDecision}'. Reason: ${decisionReason}`,
        metadata: {
          diagnosisCategory: diagnosis.category,
          selectedAction,
          policyDecision,
          topErv: approvedErvItem ? approvedErvItem.expectedRecoveryValue : 0
        }
      });
    } catch (e) {
      // Ignore DB write errors in test mocks
    }
  }

  // Optional immediate execution via controlled backend tools
  let executionResult = null;
  if (policyDecision === 'APPROVED' && executeImmediately && selectedAction !== 'NONE') {
    try {
      executionResult = await executeTool(selectedAction, {
        caseId,
        customerId: customer.customerId,
        amount: rCase.amount,
        reason: decisionReason
      });
    } catch (e) {
      executionResult = { error: e.message };
    }
  }

  // 12. Generate AI Explanation Layer (Factual & Non-Invented)
  const explanation = await generateExplanation({
    diagnosis,
    probabilities: probMap,
    expectedValues: ervResults,
    customerContext: { customerId: customer.customerId, segment: customer.segment, optedOut: customer.optedOut },
    policyResults: { allowed: policyDecision === 'APPROVED', reason: decisionReason, merchantPolicy },
    selectedAction,
    caseContext: { caseId, amount: rCase.amount, status: rCase.status, attemptCount: rCase.attemptCount, contactCount: rCase.contactCount, failureReason }
  });

  // 13. Return complete decision object
  return {
    caseId,
    diagnosis,
    actions: actionsSummary,
    selectedAction,
    reason: decisionReason,
    policyDecision,
    explanation,
    ...(executionResult ? { execution: executionResult } : {})
  };
}
