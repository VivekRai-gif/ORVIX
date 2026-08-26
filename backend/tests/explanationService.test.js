import assert from 'node:assert';
import { generateExplanation } from '../src/services/explanationService.js';

console.log('====================================================');
console.log(' ORVIX AI Explanation Layer Unit Test Suite ');
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
  // Test 1: Output JSON Structure Verification
  await runTestAsync('Explanation: Contains required 5 keys (summary, reasoning, risk, whyNotAlternatives, stopCondition)', async () => {
    const res = await generateExplanation({
      diagnosis: { category: 'SOFT_FAILURE', recoverable: true, failureReason: 'INSUFFICIENT_FUNDS' },
      probabilities: { RETRY: 0.71, PAYMENT_LINK: 0.55, EMAIL: 0.40, HUMAN_ESCALATION: 0.50 },
      expectedValues: { RETRY: 7099, PAYMENT_LINK: 5498, EMAIL: 3999, HUMAN_ESCALATION: 4899 },
      customerContext: { customerId: 'cust_exp_101', segment: 'RETURNING', optedOut: false },
      policyResults: { allowed: true, reason: 'All checks passed' },
      selectedAction: 'RETRY',
      caseContext: { caseId: 'RC_EXP_001', amount: 10000, attemptCount: 1, contactCount: 0 }
    });

    assert(res.summary, 'summary must be present');
    assert(res.reasoning, 'reasoning must be present');
    assert(res.risk, 'risk must be present');
    assert(res.whyNotAlternatives, 'whyNotAlternatives must be present');
    assert(res.stopCondition, 'stopCondition must be present');

    // Factual verification of exact numbers
    assert(res.summary.includes('10,000'));
    assert(res.summary.includes('7,099'));
    assert(res.reasoning.includes('71%'));
    assert(res.whyNotAlternatives.includes('PAYMENT_LINK'));
  });

  // Test 2: Hard Failure Stop Condition Explanation
  await runTestAsync('Explanation: Correctly explains hard failure stop condition', async () => {
    const res = await generateExplanation({
      diagnosis: { category: 'HARD_FAILURE', recoverable: false, failureReason: 'STOLEN_CARD_BLOCKED' },
      probabilities: { RETRY: 0.0, PAYMENT_LINK: 0.0 },
      expectedValues: { RETRY: -1, PAYMENT_LINK: -2 },
      customerContext: { customerId: 'cust_exp_102', optedOut: false },
      policyResults: { allowed: false, reason: 'Hard failure prohibited' },
      selectedAction: 'NONE',
      caseContext: { caseId: 'RC_EXP_002', amount: 5000 }
    });

    assert(res.stopCondition.includes('Unrecoverable hard failure'));
    assert(res.risk.includes('Hard failure code'));
  });

  // Test 3: Customer Opt-Out Explanation
  await runTestAsync('Explanation: Correctly explains customer opt-out risk and stop condition', async () => {
    const res = await generateExplanation({
      diagnosis: { category: 'SOFT_FAILURE', recoverable: true },
      probabilities: { RETRY: 0.70 },
      expectedValues: { RETRY: 6999 },
      customerContext: { customerId: 'cust_exp_103', optedOut: true },
      policyResults: { allowed: false, reason: 'Customer opted out' },
      selectedAction: 'NONE',
      caseContext: { caseId: 'RC_EXP_003', amount: 10000 }
    });

    assert(res.stopCondition.includes('opted out'));
    assert(res.risk.includes('opted out'));
  });

  console.log('\n====================================================');
  console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
