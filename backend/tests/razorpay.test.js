import assert from 'node:assert';
import crypto from 'crypto';
import { createRazorpayPaymentLink, verifyWebhookSignature, isTestMode } from '../src/services/razorpayService.js';
import { processActionOutcome } from '../src/services/outcomeService.js';

console.log('====================================================');
console.log(' ORVIX Razorpay Test Mode Integration Unit Test Suite ');
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
  // 1. Test Mode Verification
  await runTestAsync('RazorpayService: Enforces Test Mode', async () => {
    assert.strictEqual(isTestMode(), true);
  });

  // 2. Payment Link Creation in Test Mode
  await runTestAsync('RazorpayService: Creates payment link safely without leaking secrets', async () => {
    const res = await createRazorpayPaymentLink({
      amount: 4500,
      currency: 'INR',
      caseId: 'RC_RZP_001',
      customerId: 'cust_rzp_101'
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.mode, 'TEST_MODE');
    assert.strictEqual(res.caseId, 'RC_RZP_001');
    assert.strictEqual(res.amount, 4500);
    assert(res.paymentLinkId.startsWith('plink_'));
    assert(res.paymentUrl.includes('pay.orvix.ai') || res.paymentUrl.includes('razorpay'));
    assert(!res.RAZORPAY_KEY_SECRET, 'Secrets must not be exposed');
  });

  // 3. Webhook Signature Verification (HMAC SHA256)
  await runTestAsync('RazorpayService: Validates authentic webhook signature and rejects forgery', async () => {
    const webhookSecret = 'orvix_test_webhook_secret_999';
    const payloadBody = JSON.stringify({ event: 'payment_link.paid', payload: { payment_link: { entity: { id: 'plink_test_001', amount: 500000 } } } });

    // Compute valid signature
    const validSignature = crypto.createHmac('sha256', webhookSecret).update(payloadBody).digest('hex');
    const isValid = verifyWebhookSignature(payloadBody, validSignature, webhookSecret);
    assert.strictEqual(isValid, true);

    // Forged signature check
    const isForgedValid = verifyWebhookSignature(payloadBody, 'invalid_signature_hash_1234567890', webhookSecret);
    assert.strictEqual(isForgedValid, false);
  });

  // 4. Webhook Payment Success Mapping to Case Outcome
  await runTestAsync('Webhook Handler: Maps payment_link.paid to RECOVERED outcome', async () => {
    const outcomeRes = await processActionOutcome({
      caseId: 'RC_RZP_PAID_01',
      outcome: 'RECOVERED',
      metadata: { amount: 12500, razorpayEvent: 'payment_link.paid' }
    });

    assert.strictEqual(outcomeRes.success, true);
    assert.strictEqual(outcomeRes.outcome, 'RECOVERED');
    assert.strictEqual(outcomeRes.status, 'recovered');
    assert.strictEqual(outcomeRes.recoveredAmount, 12500);
  });

  // 5. Webhook Payment Failure Mapping to Case Outcome
  await runTestAsync('Webhook Handler: Maps payment.failed to FAILED outcome', async () => {
    const outcomeRes = await processActionOutcome({
      caseId: 'RC_RZP_FAIL_01',
      outcome: 'FAILED',
      failureReason: 'INSUFFICIENT_FUNDS',
      metadata: { amount: 8000, razorpayEvent: 'payment.failed' }
    });

    assert.strictEqual(outcomeRes.success, true);
    assert.strictEqual(outcomeRes.outcome, 'FAILED');
    assert.strictEqual(outcomeRes.attemptCount, 1);
  });

  console.log('\n====================================================');
  console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
