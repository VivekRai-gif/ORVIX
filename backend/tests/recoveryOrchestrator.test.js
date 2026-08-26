import assert from 'node:assert';
import { runOrchestrator } from '../src/agents/recoveryOrchestrator.js';

process.env.SKIP_ML_FETCH = 'true';

console.log('====================================================');
console.log(' ORVIX Recovery Orchestrator Unit Test Suite ');
console.log('====================================================\n');

let passed = 0;
let total = 0;

async function runTestAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

async function runAllTests() {
  // Test 1: Highest ERV selected
  await runTestAsync('Highest ERV Selected: RETRY (ERV 7099) vs PAYMENT_LINK (ERV 5498)', async () => {
    const mockCase = {
      caseId: 'RC_1001',
      customerId: 'cust_101',
      paymentId: 'pay_101',
      amount: 10000,
      failureReason: 'INSUFFICIENT_FUNDS',
      attemptCount: 0,
      contactCount: 0,
      status: 'AT_RISK'
    };

    const mockCustomer = {
      customerId: 'cust_101',
      segment: 'RETURNING',
      optedOut: false
    };

    const probabilities = {
      RETRY: 0.71,
      PAYMENT_LINK: 0.55,
      EMAIL: 0.40,
      HUMAN_ESCALATION: 0.50
    };

    const decision = await runOrchestrator('RC_1001', {
      dbOverridingCase: mockCase,
      dbOverridingCustomer: mockCustomer,
      probabilitiesOverride: probabilities
    });

    assert.strictEqual(decision.caseId, 'RC_1001');
    assert.strictEqual(decision.selectedAction, 'RETRY');
    assert.strictEqual(decision.policyDecision, 'APPROVED');
    assert.strictEqual(decision.actions[0].action, 'RETRY');
    assert.strictEqual(decision.actions[0].expectedValue, 7099);
    assert.strictEqual(decision.actions[1].action, 'PAYMENT_LINK');
    assert.strictEqual(decision.actions[1].expectedValue, 5498);
    assert.strictEqual(decision.actions[2].action, 'HUMAN_ESCALATION');
  });

  // Test 2: Prohibited Action Rejected (Fallback to next best action)
  await runTestAsync('Prohibited Action Rejected: RETRY prohibited by policy -> Fallback to PAYMENT_LINK', async () => {
    const mockCase = {
      caseId: 'RC_1002',
      customerId: 'cust_102',
      paymentId: 'pay_102',
      amount: 10000,
      failureReason: 'INSUFFICIENT_FUNDS',
      attemptCount: 0,
      contactCount: 0
    };

    const mockCustomer = { customerId: 'cust_102', optedOut: false };

    const mockPolicy = {
      allowedChannels: ['PAYMENT_LINK', 'EMAIL'],
      maxContacts: 3,
      minimumExpectedValue: 100
    };

    const probabilities = {
      RETRY: 0.71,       // Highest ERV (7099), but prohibited
      PAYMENT_LINK: 0.55, // Second highest ERV (5498), allowed
      EMAIL: 0.40
    };

    const decision = await runOrchestrator('RC_1002', {
      dbOverridingCase: mockCase,
      dbOverridingCustomer: mockCustomer,
      dbOverridingPolicy: mockPolicy,
      probabilitiesOverride: probabilities
    });

    assert.strictEqual(decision.selectedAction, 'PAYMENT_LINK');
    assert.strictEqual(decision.policyDecision, 'APPROVED');
    assert(decision.reason.includes('5498'));
  });

  // Test 3: No Eligible Actions
  await runTestAsync('No Eligible Actions: All candidate actions fail policy thresholds', async () => {
    const mockCase = {
      caseId: 'RC_1003',
      customerId: 'cust_103',
      paymentId: 'pay_103',
      amount: 1000,
      failureReason: 'INSUFFICIENT_FUNDS',
      attemptCount: 3, // Max retries exceeded
      contactCount: 2  // Max contacts exceeded
    };

    const mockPolicy = {
      maxRetries: 3,
      maxContacts: 2,
      humanEscalationEnabled: false,
      minimumExpectedValue: 50
    };

    const decision = await runOrchestrator('RC_1003', {
      dbOverridingCase: mockCase,
      dbOverridingPolicy: mockPolicy
    });

    assert.strictEqual(decision.selectedAction, 'NONE');
    assert.strictEqual(decision.policyDecision, 'REJECTED');
    assert.strictEqual(decision.reason, 'No eligible actions approved by Policy Engine.');
  });

  // Test 4: Hard Failure
  await runTestAsync('Hard Failure: STOLEN_CARD -> Recovery prohibited', async () => {
    const mockCase = {
      caseId: 'RC_1004',
      customerId: 'cust_104',
      paymentId: 'pay_104',
      amount: 5000,
      failureReason: 'STOLEN_CARD_BLOCKED',
      attemptCount: 0,
      contactCount: 0
    };

    const decision = await runOrchestrator('RC_1004', {
      dbOverridingCase: mockCase
    });

    assert.strictEqual(decision.diagnosis.category, 'HARD_FAILURE');
    assert.strictEqual(decision.diagnosis.recoverable, false);
    assert.strictEqual(decision.selectedAction, 'NONE');
    assert.strictEqual(decision.policyDecision, 'REJECTED');
  });

  // Test 5: Customer Opt-Out
  await runTestAsync('Customer Opt-Out: optedOut=true -> Communications blocked', async () => {
    const mockCase = {
      caseId: 'RC_1005',
      customerId: 'cust_105',
      paymentId: 'pay_105',
      amount: 8000,
      failureReason: 'INSUFFICIENT_FUNDS',
      attemptCount: 0,
      contactCount: 0
    };

    const mockCustomer = {
      customerId: 'cust_105',
      optedOut: true
    };

    const decision = await runOrchestrator('RC_1005', {
      dbOverridingCase: mockCase,
      dbOverridingCustomer: mockCustomer
    });

    assert.strictEqual(decision.selectedAction, 'NONE');
    assert.strictEqual(decision.policyDecision, 'REJECTED');
  });

  console.log('\n====================================================');
  console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
