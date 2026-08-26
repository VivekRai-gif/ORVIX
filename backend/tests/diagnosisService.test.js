import assert from 'node:assert';
import { diagnoseFailureReason } from '../src/services/diagnosisService.js';

console.log('====================================================');
console.log(' ORVIX AI Diagnosis Engine Unit Test Suite ');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

// 1. SOFT_FAILURE Category Tests
runTest('Diagnosis: INSUFFICIENT_FUNDS -> SOFT_FAILURE', () => {
  const result = diagnoseFailureReason('INSUFFICIENT_FUNDS');
  assert.strictEqual(result.category, 'SOFT_FAILURE');
  assert.strictEqual(result.recoverable, true);
  assert.deepStrictEqual(result.candidateActions, ['RETRY', 'PAYMENT_LINK', 'EMAIL']);
  assert.strictEqual(result.confidence, 0.91);
});

runTest('Diagnosis: LOW_BALANCE -> SOFT_FAILURE', () => {
  const result = diagnoseFailureReason('LOW_BALANCE');
  assert.strictEqual(result.category, 'SOFT_FAILURE');
  assert.strictEqual(result.recoverable, true);
});

// 2. TEMPORARY_FAILURE Category Tests
runTest('Diagnosis: NETWORK_ERROR -> TEMPORARY_FAILURE', () => {
  const result = diagnoseFailureReason('NETWORK_ERROR');
  assert.strictEqual(result.category, 'TEMPORARY_FAILURE');
  assert.strictEqual(result.recoverable, true);
  assert.deepStrictEqual(result.candidateActions, ['RETRY']);
  assert.strictEqual(result.confidence, 0.95);
});

runTest('Diagnosis: TIMEOUT -> TEMPORARY_FAILURE', () => {
  const result = diagnoseFailureReason('GATEWAY_TIMEOUT');
  assert.strictEqual(result.category, 'TEMPORARY_FAILURE');
  assert.strictEqual(result.recoverable, true);
});

runTest('Diagnosis: BANK_DECLINED -> TEMPORARY_FAILURE', () => {
  const result = diagnoseFailureReason('BANK_DECLINED');
  assert.strictEqual(result.category, 'TEMPORARY_FAILURE');
  assert.strictEqual(result.recoverable, true);
  assert.deepStrictEqual(result.candidateActions, ['RETRY', 'PAYMENT_LINK']);
  assert.strictEqual(result.confidence, 0.87);
});

// 3. CUSTOMER_ACTION_REQUIRED Category Tests
runTest('Diagnosis: EXPIRED_CARD -> CUSTOMER_ACTION_REQUIRED', () => {
  const result = diagnoseFailureReason('EXPIRED_CARD');
  assert.strictEqual(result.category, 'CUSTOMER_ACTION_REQUIRED');
  assert.strictEqual(result.recoverable, true);
  assert.deepStrictEqual(result.candidateActions, ['PAYMENT_LINK', 'EMAIL']);
  assert.strictEqual(result.confidence, 0.89);
});

runTest('Diagnosis: CHECKOUT_DROPOFF -> CUSTOMER_ACTION_REQUIRED', () => {
  const result = diagnoseFailureReason('CHECKOUT_DROPOFF');
  assert.strictEqual(result.category, 'CUSTOMER_ACTION_REQUIRED');
  assert.strictEqual(result.recoverable, true);
});

// 4. HARD_FAILURE Category Tests
runTest('Diagnosis: INVALID_PAYMENT_METHOD -> HARD_FAILURE', () => {
  const result = diagnoseFailureReason('INVALID_PAYMENT_METHOD');
  assert.strictEqual(result.category, 'HARD_FAILURE');
  assert.strictEqual(result.recoverable, false);
  assert.deepStrictEqual(result.candidateActions, ['EMAIL']);
  assert.strictEqual(result.confidence, 0.96);
});

runTest('Diagnosis: STOLEN_CARD -> HARD_FAILURE', () => {
  const result = diagnoseFailureReason('STOLEN_CARD_BLOCKED');
  assert.strictEqual(result.category, 'HARD_FAILURE');
  assert.strictEqual(result.recoverable, false);
});

// 5. UNKNOWN Category Tests
runTest('Diagnosis: Unclassified Code -> UNKNOWN', () => {
  const result = diagnoseFailureReason('ERR_CODE_999_RANDOM');
  assert.strictEqual(result.category, 'UNKNOWN');
  assert.strictEqual(result.recoverable, true);
  assert.strictEqual(result.confidence, 0.50);
});

console.log('\n====================================================');
console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
console.log('====================================================\n');

if (passed !== total) {
  process.exit(1);
}
