import assert from 'node:assert';
import {
  validateRecoveryPolicy,
  evaluateStopRules,
  DEFAULT_RECOVERY_POLICY
} from '../src/policies/recoveryPolicy.js';

console.log('====================================================');
console.log(' ORVIX Policy & Guardrail Engine Unit Test Suite ');
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
  // Test 1: All Policy Checks Passed (Allowed)
  await runTestAsync('Validation: All 7 policy guardrail checks pass', async () => {
    const result = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { attemptCount: 1, contactCount: 0, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_001', optedOut: false },
      expectedRecoveryValue: 7099,
      logAudit: false
    });

    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.reason, 'All policy guardrail checks passed successfully.');
    assert.strictEqual(result.policyChecks.length, 7);
    assert(result.policyChecks.every(c => c.passed === true));
  });

  // Test 2: Retry Limit Exceeded
  await runTestAsync('Validation: Retry limit exceeded -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { attemptCount: 3, contactCount: 0, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_002', optedOut: false },
      expectedRecoveryValue: 5000,
      policy: { maxRetries: 3 },
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('Retry limit reached'));
    const retryCheck = result.policyChecks.find(c => c.check === 'RETRY_LIMIT');
    assert.strictEqual(retryCheck.passed, false);
  });

  // Test 3: Contact Limit Exceeded
  await runTestAsync('Validation: Contact limit exceeded for PAYMENT_LINK -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'PAYMENT_LINK',
      caseContext: { attemptCount: 0, contactCount: 2, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_003', optedOut: false },
      expectedRecoveryValue: 4000,
      policy: { maxContacts: 2 },
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('Contact limit reached'));
    const contactCheck = result.policyChecks.find(c => c.check === 'CONTACT_LIMIT');
    assert.strictEqual(contactCheck.passed, false);
  });

  // Test 4: Customer Opt-Out
  await runTestAsync('Validation: Customer opted out -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'EMAIL',
      caseContext: { attemptCount: 0, contactCount: 0, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_004', optedOut: true },
      expectedRecoveryValue: 3000,
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('opted out'));
    const optOutCheck = result.policyChecks.find(c => c.check === 'CUSTOMER_OPT_OUT');
    assert.strictEqual(optOutCheck.passed, false);
  });

  // Test 5: Recovery Window Expired
  await runTestAsync('Validation: Recovery window expired (10 days > 7 days) -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'RETRY',
      caseContext: { attemptCount: 0, contactCount: 0, timeSinceFailure: 10.0 },
      customerContext: { customerId: 'cust_005', optedOut: false },
      expectedRecoveryValue: 6000,
      policy: { recoveryWindowDays: 7 },
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('Recovery window expired'));
    const windowCheck = result.policyChecks.find(c => c.check === 'RECOVERY_WINDOW');
    assert.strictEqual(windowCheck.passed, false);
  });

  // Test 6: Minimum ERV Threshold Unmet
  await runTestAsync('Validation: ERV below minimum threshold (₹20 < ₹50) -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'EMAIL',
      caseContext: { attemptCount: 0, contactCount: 0, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_006', optedOut: false },
      expectedRecoveryValue: 20,
      policy: { minimumExpectedValue: 50 },
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('below minimum threshold'));
    const evCheck = result.policyChecks.find(c => c.check === 'MINIMUM_EXPECTED_VALUE');
    assert.strictEqual(evCheck.passed, false);
  });

  // Test 7: Merchant Channel Prohibited
  await runTestAsync('Validation: Action not in allowedChannels -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'HUMAN_ESCALATION',
      caseContext: { attemptCount: 0, contactCount: 0, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_007', optedOut: false },
      expectedRecoveryValue: 8000,
      policy: { allowedChannels: ['RETRY', 'PAYMENT_LINK'] },
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('not allowed by merchant channel configuration'));
    const channelCheck = result.policyChecks.find(c => c.check === 'ALLOWED_CHANNELS');
    assert.strictEqual(channelAllowedPassed(channelCheck), false);
  });

  function channelAllowedPassed(check) {
    return check.passed;
  }

  // Test 8: Human Escalation Disabled
  await runTestAsync('Validation: Human escalation disabled -> REJECTED', async () => {
    const result = await validateRecoveryPolicy({
      action: 'HUMAN_ESCALATION',
      caseContext: { attemptCount: 0, contactCount: 0, timeSinceFailure: 1.0 },
      customerContext: { customerId: 'cust_008', optedOut: false },
      expectedRecoveryValue: 8000,
      policy: { allowedChannels: ['HUMAN_ESCALATION'], humanEscalationEnabled: false },
      logAudit: false
    });

    assert.strictEqual(result.allowed, false);
    assert(result.reason.includes('Human escalation is disabled'));
    const escalationCheck = result.policyChecks.find(c => c.check === 'HUMAN_ESCALATION');
    assert.strictEqual(escalationCheck.passed, false);
  });

  // Stop Rules Tests
  await runTestAsync('Stop Rules: Payment already recovered -> STOPPED', async () => {
    const stopResult = evaluateStopRules({
      action: 'RETRY',
      caseContext: { status: 'recovered', recoveredAmount: 1000 }
    });

    assert.strictEqual(stopResult.status, 'STOPPED');
    assert.strictEqual(stopResult.stopped, true);
    assert.strictEqual(stopResult.check, 'ALREADY_RECOVERED');
  });

  await runTestAsync('Stop Rules: Retry limit reached -> STOPPED', async () => {
    const stopResult = evaluateStopRules({
      action: 'RETRY',
      caseContext: { attemptCount: 3 },
      policy: { maxRetries: 3 }
    });

    assert.strictEqual(stopResult.status, 'STOPPED');
    assert.strictEqual(stopResult.stopped, true);
    assert.strictEqual(stopResult.check, 'RETRY_LIMIT_REACHED');
  });

  await runTestAsync('Stop Rules: Customer opted out -> STOPPED', async () => {
    const stopResult = evaluateStopRules({
      action: 'PAYMENT_LINK',
      customerContext: { optedOut: true }
    });

    assert.strictEqual(stopResult.status, 'STOPPED');
    assert.strictEqual(stopResult.stopped, true);
    assert.strictEqual(stopResult.check, 'CUSTOMER_OPTED_OUT');
  });

  await runTestAsync('Stop Rules: Recovery window expired -> STOPPED', async () => {
    const stopResult = evaluateStopRules({
      action: 'EMAIL',
      caseContext: { timeSinceFailure: 14.0 },
      policy: { recoveryWindowDays: 7 }
    });

    assert.strictEqual(stopResult.status, 'STOPPED');
    assert.strictEqual(stopResult.stopped, true);
    assert.strictEqual(stopResult.check, 'RECOVERY_WINDOW_EXPIRED');
  });

  await runTestAsync('Stop Rules: ERV below threshold -> STOPPED', async () => {
    const stopResult = evaluateStopRules({
      action: 'RETRY',
      expectedRecoveryValue: 10,
      policy: { minimumExpectedValue: 50 }
    });

    assert.strictEqual(stopResult.status, 'STOPPED');
    assert.strictEqual(stopResult.stopped, true);
    assert.strictEqual(stopResult.check, 'EXPECTED_VALUE_BELOW_THRESHOLD');
  });

  console.log('\n====================================================');
  console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
