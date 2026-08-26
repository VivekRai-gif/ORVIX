import assert from 'node:assert';
import {
  calculateSingleExpectedValue,
  calculateExpectedRecoveryValues,
  getInterventionCosts,
  setInterventionCosts,
  resetInterventionCosts
} from '../src/services/expectedValueService.js';

console.log('====================================================');
console.log(' ORVIX Expected Recovery Value Engine Unit Test Suite ');
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

// 1. Normal Case Test
runTest('Normal Case: RETRY (p=0.71, amount=10000, cost=1) -> ERV = 7099', () => {
  const result = calculateSingleExpectedValue({
    amount: 10000,
    action: 'RETRY',
    probability: 0.71
  });

  assert.strictEqual(result.action, 'RETRY');
  assert.strictEqual(result.probability, 0.71);
  assert.strictEqual(result.amount, 10000);
  assert.strictEqual(result.interventionCost, 1);
  assert.strictEqual(result.expectedRecoveryValue, 7099);
});

// 2. Zero Probability Test
runTest('Zero Probability: EMAIL (p=0.0, amount=5000, cost=1) -> ERV = -1', () => {
  const result = calculateSingleExpectedValue({
    amount: 5000,
    action: 'EMAIL',
    probability: 0.0
  });

  assert.strictEqual(result.action, 'EMAIL');
  assert.strictEqual(result.probability, 0.0);
  assert.strictEqual(result.amount, 5000);
  assert.strictEqual(result.interventionCost, 1);
  assert.strictEqual(result.expectedRecoveryValue, -1);
});

// 3. High Intervention Cost Test
runTest('High Intervention Cost: HUMAN_ESCALATION (p=0.02, amount=2000, cost=100) -> ERV = -60', () => {
  const result = calculateSingleExpectedValue({
    amount: 2000,
    action: 'HUMAN_ESCALATION',
    probability: 0.02
  });

  assert.strictEqual(result.action, 'HUMAN_ESCALATION');
  assert.strictEqual(result.probability, 0.02);
  assert.strictEqual(result.amount, 2000);
  assert.strictEqual(result.interventionCost, 100);
  assert.strictEqual(result.expectedRecoveryValue, -60);
});

runTest('High Custom Intervention Cost: RETRY with custom cost 500 (p=0.10, amount=2000) -> ERV = -300', () => {
  const result = calculateSingleExpectedValue({
    amount: 2000,
    action: 'RETRY',
    probability: 0.10,
    customCosts: { RETRY: 500 }
  });

  assert.strictEqual(result.interventionCost, 500);
  assert.strictEqual(result.expectedRecoveryValue, -300);
});

// 4. Multiple Actions & Sorting Test
runTest('Multiple Actions: Evaluate all candidate actions and sort by ERV descending', () => {
  const probabilities = {
    RETRY: 0.71,
    PAYMENT_LINK: 0.85,
    EMAIL: 0.50,
    HUMAN_ESCALATION: 0.90
  };

  const results = calculateExpectedRecoveryValues({
    amount: 10000,
    probabilities
  });

  assert.strictEqual(results.length, 4);

  // ERVs:
  // HUMAN_ESCALATION = 0.90 * 10000 - 100 = 8900
  // PAYMENT_LINK     = 0.85 * 10000 - 2   = 8498
  // RETRY            = 0.71 * 10000 - 1   = 7099
  // EMAIL            = 0.50 * 10000 - 1   = 4999

  assert.strictEqual(results[0].action, 'HUMAN_ESCALATION');
  assert.strictEqual(results[0].expectedRecoveryValue, 8900);

  assert.strictEqual(results[1].action, 'PAYMENT_LINK');
  assert.strictEqual(results[1].expectedRecoveryValue, 8498);

  assert.strictEqual(results[2].action, 'RETRY');
  assert.strictEqual(results[2].expectedRecoveryValue, 7099);

  assert.strictEqual(results[3].action, 'EMAIL');
  assert.strictEqual(results[3].expectedRecoveryValue, 4999);
});

// 5. Configurable Default Intervention Costs Test
runTest('Configurable Costs: Modify and reset global intervention costs', () => {
  resetInterventionCosts();
  const initial = getInterventionCosts();
  assert.strictEqual(initial.RETRY, 1);
  assert.strictEqual(initial.HUMAN_ESCALATION, 100);

  setInterventionCosts({ RETRY: 5, HUMAN_ESCALATION: 200 });
  const updated = getInterventionCosts();
  assert.strictEqual(updated.RETRY, 5);
  assert.strictEqual(updated.HUMAN_ESCALATION, 200);

  resetInterventionCosts();
  const reset = getInterventionCosts();
  assert.strictEqual(reset.RETRY, 1);
  assert.strictEqual(reset.HUMAN_ESCALATION, 100);
});

console.log('\n====================================================');
console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
console.log('====================================================\n');

if (passed !== total) {
  process.exit(1);
}
