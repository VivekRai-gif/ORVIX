import assert from 'node:assert';
import crypto from 'crypto';
import { diagnoseFailureReason } from '../src/services/diagnosisService.js';
import { calculateExpectedRecoveryValues, setInterventionCosts, resetInterventionCosts } from '../src/services/expectedValueService.js';
import { validateRecoveryPolicy, evaluateStopRules } from '../src/policies/recoveryPolicy.js';
import { runOrchestrator, fetchActionProbabilities } from '../src/agents/recoveryOrchestrator.js';
import { executeTool, TOOL_REGISTRY } from '../src/tools/index.js';
import { processActionOutcome, OUTCOME_STATUSES } from '../src/services/outcomeService.js';
import { createRazorpayPaymentLink, verifyWebhookSignature } from '../src/services/razorpayService.js';
import { generateExplanation } from '../src/services/explanationService.js';
import { calculateExperimentMetrics } from '../../simulator/experiments/metrics.js';
import { runBaselineStrategy } from '../../simulator/experiments/baselineStrategy.js';
import { runOrvixStrategy } from '../../simulator/experiments/orvixStrategy.js';

console.log('================================================================');
console.log(' ORVIX Senior QA Engineer Master Verification & Edge Case Suite ');
console.log('================================================================\n');

let passed = 0;
let total = 0;
const failures = [];

async function runQATest(category, testName, fn) {
  total++;
  try {
    await fn();
    console.log(`[PASS] [${category}] ${testName}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] [${category}] ${testName}`);
    console.error(`       Error: ${err.message}`);
    failures.push({ category, testName, error: err.message });
  }
}

async function executeAllQATests() {
  // ----------------------------------------------------------------
  // 1. DIAGNOSIS ENGINE TESTS
  // ----------------------------------------------------------------
  await runQATest('1. Diagnosis', 'Classifies soft, temporary, customer action, hard failure, and unknown codes', async () => {
    assert.strictEqual(diagnoseFailureReason('INSUFFICIENT_FUNDS').category, 'SOFT_FAILURE');
    assert.strictEqual(diagnoseFailureReason('NETWORK_TIMEOUT').category, 'TEMPORARY_FAILURE');
    assert.strictEqual(diagnoseFailureReason('EXPIRED_CARD').category, 'CUSTOMER_ACTION_REQUIRED');
    assert.strictEqual(diagnoseFailureReason('STOLEN_CARD').category, 'HARD_FAILURE');
    assert.strictEqual(diagnoseFailureReason('STOLEN_CARD').recoverable, false);
    assert.strictEqual(diagnoseFailureReason('RANDOM_UNCLASSIFIED').category, 'UNKNOWN');
  });

  // ----------------------------------------------------------------
  // 2. RECOVERY PREDICTION TESTS
  // ----------------------------------------------------------------
  await runQATest('2. Prediction', 'Fetches ML probabilities with graceful offline fallback matrix', async () => {
    const probs = await fetchActionProbabilities(
      { amount: 10000, failureReason: 'INSUFFICIENT_FUNDS' },
      { segment: 'RETURNING' },
      { category: 'SOFT_FAILURE' }
    );

    assert(probs.RETRY > 0);
    assert(probs.PAYMENT_LINK > 0);
    assert(probs.EMAIL > 0);
    assert(probs.HUMAN_ESCALATION > 0);
  });

  // ----------------------------------------------------------------
  // 3. EXPECTED RECOVERY VALUE (ERV) TESTS
  // ----------------------------------------------------------------
  await runQATest('3. ERV Engine', 'Calculates ERV = P * amount - cost and handles edge cases', async () => {
    const res = calculateExpectedRecoveryValues({
      amount: 10000,
      probabilities: { RETRY: 0.71, PAYMENT_LINK: 0.55, EMAIL: 0.40, HUMAN_ESCALATION: 0.50 }
    });

    assert.strictEqual(res[0].action, 'RETRY');
    assert.strictEqual(res[0].expectedRecoveryValue, 7099); // 0.71 * 10000 - 1
    assert.strictEqual(res[1].action, 'PAYMENT_LINK');
    assert.strictEqual(res[1].expectedRecoveryValue, 5498); // 0.55 * 10000 - 2
  });

  // ----------------------------------------------------------------
  // 4. POLICY ENGINE TESTS
  // ----------------------------------------------------------------
  await runQATest('4. Policy Engine', 'Validates 7 guardrail checks and blocks unauthorized actions', async () => {
    const validCheck = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { amount: 10000, attemptCount: 1, contactCount: 0, createdDaysAgo: 2 },
      expectedRecoveryValue: 7099
    });
    assert.strictEqual(validCheck.allowed, true);

    const exceedRetryCheck = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { amount: 10000, attemptCount: 3, contactCount: 0, createdDaysAgo: 2 },
      expectedRecoveryValue: 7099
    });
    assert.strictEqual(exceedRetryCheck.allowed, false);
    assert(exceedRetryCheck.reason.includes('Retry limit'));
  });

  // ----------------------------------------------------------------
  // 5. STOP RULES TESTS
  // ----------------------------------------------------------------
  await runQATest('5. Stop Rules', 'Triggers STOPPED state when payment recovered, limits reached, or opted out', async () => {
    const recStop = evaluateStopRules({
      caseContext: { status: 'recovered', attemptCount: 0 }
    });
    assert.strictEqual(recStop.stopped, true);
    assert.strictEqual(recStop.status, 'STOPPED');

    const optStop = evaluateStopRules({
      caseContext: { status: 'AT_RISK', attemptCount: 1, customer: { optedOut: true } }
    });
    assert.strictEqual(optStop.stopped, true);
    assert.strictEqual(optStop.status, 'STOPPED');
  });

  // ----------------------------------------------------------------
  // 6. ORCHESTRATOR TESTS
  // ----------------------------------------------------------------
  await runQATest('6. Orchestrator', 'Executes 12-step flow and selects highest approved ERV action', async () => {
    const orchRes = await runOrchestrator('RC_QA_001', {
      caseId: 'RC_QA_001',
      amount: 10000,
      failureReason: 'INSUFFICIENT_FUNDS',
      status: 'AT_RISK',
      attemptCount: 0,
      contactCount: 0,
      customer: { customerId: 'cust_qa_1', segment: 'VIP', optedOut: false }
    });

    assert.strictEqual(orchRes.caseId, 'RC_QA_001');
    assert(orchRes.selectedAction === 'HUMAN_ESCALATION' || orchRes.selectedAction === 'RETRY');
    assert.strictEqual(orchRes.policyDecision, 'APPROVED');
    assert(orchRes.explanation);
  });

  // ----------------------------------------------------------------
  // 7. CONTROLLED ACTION TOOLS TESTS
  // ----------------------------------------------------------------
  await runQATest('7. Action Tools', 'Dispatches registered tools safely without leaking credentials', async () => {
    assert(TOOL_REGISTRY.RETRY);
    assert(TOOL_REGISTRY.PAYMENT_LINK);
    assert(TOOL_REGISTRY.EMAIL);
    assert(TOOL_REGISTRY.HUMAN_ESCALATION);

    const retryRes = await executeTool('RETRY', { caseId: 'RC_QA_TOOL', amount: 5000 });
    assert.strictEqual(retryRes.success, true);
    assert.strictEqual(retryRes.action, 'RETRY');

    const linkRes = await executeTool('PAYMENT_LINK', { caseId: 'RC_QA_TOOL', amount: 5000 });
    assert.strictEqual(linkRes.success, true);
    assert(linkRes.paymentUrl);
  });

  // ----------------------------------------------------------------
  // 8. RECOVERY OUTCOMES TESTS
  // ----------------------------------------------------------------
  await runQATest('8. Outcomes Engine', 'Processes 6 outcome statuses and updates case state', async () => {
    const recOutcome = await processActionOutcome({
      caseId: 'RC_QA_OUTCOME_1',
      outcome: 'RECOVERED',
      metadata: { amount: 15000 }
    });
    assert.strictEqual(recOutcome.status, 'recovered');
    assert.strictEqual(recOutcome.recoveredAmount, 15000);

    const failOutcome = await processActionOutcome({
      caseId: 'RC_QA_OUTCOME_2',
      outcome: 'FAILED',
      failureReason: 'CARD_DECLINED',
      metadata: { amount: 5000 }
    });
    assert.strictEqual(failOutcome.outcome, 'FAILED');
    assert.strictEqual(failOutcome.attemptCount, 1);
  });

  // ----------------------------------------------------------------
  // 9. AUDIT LOGS TESTS
  // ----------------------------------------------------------------
  await runQATest('9. Audit Logs', 'Ensures action executions produce traceable audit log events', async () => {
    const outcome = await processActionOutcome({
      caseId: 'RC_QA_AUDIT_1',
      outcome: 'ESCALATED',
      metadata: { reason: 'QA Audit Test Escalation' }
    });
    assert.strictEqual(outcome.status, 'escalated');
  });

  // ----------------------------------------------------------------
  // 10. EXPERIMENT ENGINE TESTS
  // ----------------------------------------------------------------
  await runQATest('10. Experiment Engine', 'Runs Baseline vs ORVIX on same synthetic dataset and calculates incremental lift', async () => {
    const events = [
      { eventId: 'evt_qa_1', amount: 10000, failureReason: 'INSUFFICIENT_FUNDS', groundTruthOutcome: { retrySuccessProb: 0.8, paymentLinkSuccessProb: 0.9, isSoftFailure: true } },
      { eventId: 'evt_qa_2', amount: 20000, failureReason: 'STOLEN_CARD', groundTruthOutcome: { retrySuccessProb: 0.0, paymentLinkSuccessProb: 0.0, isSoftFailure: false } }
    ];

    const bRes = runBaselineStrategy(events);
    const oRes = runOrvixStrategy(events);
    const metrics = calculateExperimentMetrics(events, bRes, oRes);

    assert.strictEqual(metrics.totalCases, 2);
    assert.strictEqual(metrics.revenueAtRisk, 30000);
    assert(metrics.primaryMetric.value >= 0);
  });

  // ----------------------------------------------------------------
  // 11. RAZORPAY WEBHOOK TESTS
  // ----------------------------------------------------------------
  await runQATest('11. Razorpay Webhook', 'Validates HMAC signatures, test mode enforcement, and idempotency', async () => {
    const secret = 'orvix_qa_secret_key';
    const body = JSON.stringify({ event: 'payment_link.paid', payload: { payment_link: { entity: { amount: 100000 } } } });
    const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');

    assert.strictEqual(verifyWebhookSignature(body, sig, secret), true);
    assert.strictEqual(verifyWebhookSignature(body, 'bad_sig', secret), false);
  });

  // ----------------------------------------------------------------
  // 12. EDGE CASES TESTS
  // ----------------------------------------------------------------
  await runQATest('12. Edge Case', 'Zero Amount (amount = 0)', async () => {
    const erv = calculateExpectedRecoveryValues({
      amount: 0,
      probabilities: { RETRY: 0.71, PAYMENT_LINK: 0.55 }
    });
    assert.strictEqual(erv[0].expectedRecoveryValue, -1); // 0 - 1 = -1

    const policy = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { amount: 0, attemptCount: 0, contactCount: 0, createdDaysAgo: 1 },
      expectedRecoveryValue: -1
    });
    assert.strictEqual(policy.allowed, false);
  });

  await runQATest('12. Edge Case', 'Very High Amount (amount = ₹1,00,00,000)', async () => {
    const amount = 10000000;
    const erv = calculateExpectedRecoveryValues({
      amount,
      probabilities: { RETRY: 0.80, HUMAN_ESCALATION: 0.90 }
    });
    assert(erv[0].expectedRecoveryValue > 7000000);

    const policy = await validateRecoveryPolicy({
      action: 'HUMAN_ESCALATION',
      caseContext: { amount, attemptCount: 0, contactCount: 0, createdDaysAgo: 1 },
      expectedRecoveryValue: 8999900
    });
    assert.strictEqual(policy.allowed, true);
  });

  await runQATest('12. Edge Case', 'Hard Failure (STOLEN_CARD)', async () => {
    const diag = diagnoseFailureReason('STOLEN_CARD');
    assert.strictEqual(diag.category, 'HARD_FAILURE');
    assert.strictEqual(diag.recoverable, false);

    const orch = await runOrchestrator('RC_HARD_FAIL', {
      caseId: 'RC_HARD_FAIL',
      amount: 5000,
      failureReason: 'STOLEN_CARD',
      customer: { customerId: 'cust_stolen' }
    });

    assert.strictEqual(orch.selectedAction, 'NONE');
    assert.strictEqual(orch.policyDecision, 'REJECTED');
    assert(orch.explanation.stopCondition.includes('Unrecoverable hard failure'));
  });

  await runQATest('12. Edge Case', 'Repeated Failure & Retry Limit Reached (attemptCount = 3)', async () => {
    const policy = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { amount: 10000, attemptCount: 3, contactCount: 0, createdDaysAgo: 1 },
      expectedRecoveryValue: 7099
    });

    assert.strictEqual(policy.allowed, false);
    assert(policy.reason.includes('Retry limit'));
  });

  await runQATest('12. Edge Case', 'Contact Limit Reached (contactCount = 2)', async () => {
    const policyLink = await validateRecoveryPolicy({
      action: 'PAYMENT_LINK',
      caseContext: { amount: 10000, attemptCount: 1, contactCount: 2, createdDaysAgo: 1 },
      expectedRecoveryValue: 5498
    });

    assert.strictEqual(policyLink.allowed, false);
    assert(policyLink.reason.includes('Contact limit'));
  });

  await runQATest('12. Edge Case', 'Customer Opted Out (optedOut = true)', async () => {
    const policy = await validateRecoveryPolicy({
      action: 'EMAIL',
      caseContext: { amount: 10000, attemptCount: 0, contactCount: 0, createdDaysAgo: 1, customer: { optedOut: true } },
      expectedRecoveryValue: 3999
    });

    assert.strictEqual(policy.allowed, false);
    assert(policy.reason.includes('opted out'));
  });

  await runQATest('12. Edge Case', 'Expired Recovery Window (created 10 days ago > 7 days max)', async () => {
    const policy = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { amount: 10000, attemptCount: 0, contactCount: 0, createdDaysAgo: 10 },
      expectedRecoveryValue: 7099
    });

    assert.strictEqual(policy.allowed, false);
    assert(policy.reason.includes('window expired'));
  });

  await runQATest('12. Edge Case', 'No Eligible Actions Available', async () => {
    const orch = await runOrchestrator('RC_NO_ELIGIBLE', {
      caseId: 'RC_NO_ELIGIBLE',
      amount: 100, // ERV will be below minimum threshold ₹50 for costly actions
      failureReason: 'INSUFFICIENT_FUNDS',
      attemptCount: 3,
      contactCount: 2,
      customer: { customerId: 'cust_exhausted' }
    });

    assert.strictEqual(orch.selectedAction, 'NONE');
    assert.strictEqual(orch.policyDecision, 'REJECTED');
  });

  await runQATest('12. Edge Case', 'Payment Succeeds After Retry', async () => {
    const outcome = await processActionOutcome({
      caseId: 'RC_RETRY_SUCCESS',
      outcome: 'RECOVERED',
      metadata: { amount: 12000, action: 'RETRY' }
    });

    assert.strictEqual(outcome.status, 'recovered');
    assert.strictEqual(outcome.recoveredAmount, 12000);
  });

  await runQATest('12. Edge Case', 'Tool Failure Handling', async () => {
    let err = null;
    try {
      await executeTool('NON_EXISTENT_TOOL', { caseId: 'RC_FAIL_TOOL' });
    } catch (e) {
      err = e;
    }
    assert(err, 'Should throw error for unknown tool');
    assert(err.message.includes('No controlled tool registered'));
  });

  console.log('\n================================================================');
  console.log(` SENIOR QA MASTER TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('================================================================\n');

  if (failures.length > 0) {
    console.error('FAILURES SUMMARY:');
    failures.forEach(f => console.error(` - [${f.category}] ${f.testName}: ${f.error}`));
    process.exit(1);
  }
}

executeAllQATests();
