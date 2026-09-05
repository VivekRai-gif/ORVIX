import mongoose from 'mongoose';
import { RecoveryCase } from '../models/RecoveryCase.js';
import { Customer } from '../models/Customer.js';
import { Payment } from '../models/Payment.js';
import { Policy } from '../models/Policy.js';
import { AuditLog } from '../models/AuditLog.js';
import { RecoveryPrediction } from '../models/RecoveryPrediction.js';
import { diagnoseFailureReason } from '../services/diagnosisService.js';
import { calculateExpectedRecoveryValues } from '../services/expectedValueService.js';
import { evaluatePolicyRule, DEFAULT_POLICY } from '../services/policyEngineService.js';
import { executeTool } from '../tools/index.js';
import { generateExplanation } from '../services/explanationService.js';
import { evaluateWithGeminiAI } from '../services/geminiService.js';

/**
 * Fetch recovery probability and assignees for candidate actions via Google Gemini AI.
 */
export async function fetchActionProbabilities(caseData, customerData, diagnosis, overrideProbs = null) {
  if (overrideProbs) {
    return overrideProbs;
  }

  const geminiEval = await evaluateWithGeminiAI({
    amount: caseData.amount,
    failureReason: caseData.failureReason || 'INSUFFICIENT_FUNDS',
    paymentMethod: caseData.paymentMethod || 'card',
    customerContext: customerData
  });

  const probMap = {};
  if (geminiEval.actions) {
    Object.entries(geminiEval.actions).forEach(([act, details]) => {
      probMap[act.toUpperCase()] = details.probability;
    });
  }
  return probMap;
}

/**
 * ORVIX Recovery Orchestrator Flow powered by Google Gemini AI
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

  // 2. Load Customer Context Profile
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

  // 5. Evaluate Candidate Actions using Google Gemini AI Engine
  const geminiEval = await evaluateWithGeminiAI({
    amount: rCase.amount,
    failureReason,
    paymentMethod: rCase.paymentMethod || payment.paymentMethod || 'card',
    customerContext: customer
  });

  // Extract probability map from Gemini evaluation
  const probMap = {};
  if (probabilitiesOverride) {
    Object.assign(probMap, probabilitiesOverride);
  } else if (geminiEval.actions) {
    Object.entries(geminiEval.actions).forEach(([act, details]) => {
      probMap[act.toUpperCase()] = details.probability;
    });
  }

  // 6. Calculate Expected Recovery Value (ERV)
  const ervResults = calculateExpectedRecoveryValues({
    amount: rCase.amount,
    probabilities: probMap,
    customCosts
  });

  // 7. Enrich candidate actions summary with Gemini reasoning, assignedTo, and assigneeWhy
  const actionsSummary = ervResults.map(item => {
    const actDetails = geminiEval.actions?.[item.action] || {};
    return {
      action: item.action,
      probability: item.probability,
      expectedValue: item.expectedRecoveryValue,
      reason: actDetails.reason || `Gemini AI probability prediction ${Math.round(item.probability * 100)}% based on failure code '${failureReason}'`,
      assignedTo: actDetails.assignedTo || 'Automated Recovery Dispatcher',
      assigneeWhy: actDetails.assigneeWhy || 'Assigned by Gemini AI Engine based on transaction value & customer context profile'
    };
  });

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

  // Persist RecoveryPredictions to database if ready
  if (isDbReady && typeof RecoveryPrediction?.deleteMany === 'function') {
    try {
      await RecoveryPrediction.deleteMany({ caseId });
      await RecoveryPrediction.insertMany(
        actionsSummary.map(a => ({
          caseId,
          action: a.action,
          probability: a.probability,
          expectedValue: a.expectedValue,
          reason: a.reason,
          assignedTo: a.assignedTo,
          assigneeWhy: a.assigneeWhy,
          modelVersion: '1.0.0'
        }))
      );
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
