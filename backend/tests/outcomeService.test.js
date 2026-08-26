import assert from 'node:assert';
import { processActionOutcome, OUTCOME_STATUSES } from '../src/services/outcomeService.js';

console.log('====================================================');
console.log(' ORVIX Outcome Tracking & Audit System Unit Test Suite ');
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
  // 1. Outcome Statuses Check
  await runTestAsync('Outcome Engine: Validates 6 required outcome statuses', async () => {
    assert.deepStrictEqual(OUTCOME_STATUSES, ['RECOVERED', 'FAILED', 'PENDING', 'STOPPED', 'ESCALATED', 'EXPIRED']);
    await assert.rejects(async () => {
      await processActionOutcome({ caseId: 'RC_OUT_01', outcome: 'INVALID_STATUS' });
    }, /Invalid outcome status/);
  });

  // 2. RECOVERED Outcome Processing
  await runTestAsync('Outcome: RECOVERED updates status to recovered and sets recoveredAmount', async () => {
    const res = await processActionOutcome({
      caseId: 'RC_OUT_RECOVERED',
      outcome: 'RECOVERED',
      metadata: { amount: 10000, action: 'RETRY' }
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.outcome, 'RECOVERED');
    assert.strictEqual(res.status, 'recovered');
    assert.strictEqual(res.recoveredAmount, 10000);
  });

  // 3. FAILED Outcome Processing & Attempt Counter
  await runTestAsync('Outcome: FAILED increments attempts and triggers re-evaluation', async () => {
    const res = await processActionOutcome({
      caseId: 'RC_OUT_FAILED',
      outcome: 'FAILED',
      failureReason: 'PAYMENT_DECLINED',
      metadata: { amount: 5000, action: 'RETRY' }
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.outcome, 'FAILED');
    assert.strictEqual(res.attemptCount, 1);
  });

  // 4. STOPPED Outcome Processing
  await runTestAsync('Outcome: STOPPED closes case with stop reason', async () => {
    const res = await processActionOutcome({
      caseId: 'RC_OUT_STOPPED',
      outcome: 'STOPPED',
      metadata: { reason: 'Merchant policy stop rule triggered' }
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.outcome, 'STOPPED');
    assert.strictEqual(res.status, 'closed');
    assert(res.stopReason.includes('Merchant policy stop rule'));
  });

  // 5. ESCALATED Outcome Processing
  await runTestAsync('Outcome: ESCALATED sets case status to escalated', async () => {
    const res = await processActionOutcome({
      caseId: 'RC_OUT_ESCALATED',
      outcome: 'ESCALATED',
      metadata: { reason: 'Requires manual review' }
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.outcome, 'ESCALATED');
    assert.strictEqual(res.status, 'escalated');
  });

  // 6. EXPIRED Outcome Processing
  await runTestAsync('Outcome: EXPIRED closes case due to window expiration', async () => {
    const res = await processActionOutcome({
      caseId: 'RC_OUT_EXPIRED',
      outcome: 'EXPIRED'
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.outcome, 'EXPIRED');
    assert.strictEqual(res.status, 'closed');
  });

  console.log('\n====================================================');
  console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
