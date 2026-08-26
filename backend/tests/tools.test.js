import assert from 'node:assert';
import { executeRetry } from '../src/tools/retryTool.js';
import { createPaymentLink } from '../src/tools/paymentLinkTool.js';
import { sendMessaging, registerMessagingProvider, EmailProvider } from '../src/tools/messagingTool.js';
import { escalateToHuman } from '../src/tools/escalationTool.js';
import { TOOL_REGISTRY, executeTool } from '../src/tools/index.js';

console.log('====================================================');
console.log(' ORVIX Controlled Action Tools Unit Test Suite ');
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
  // 1. Tool Registry Structure Test
  await runTestAsync('ToolRegistry: All required 4 recovery actions registered', async () => {
    assert.strictEqual(typeof TOOL_REGISTRY.RETRY, 'function');
    assert.strictEqual(typeof TOOL_REGISTRY.PAYMENT_LINK, 'function');
    assert.strictEqual(typeof TOOL_REGISTRY.EMAIL, 'function');
    assert.strictEqual(typeof TOOL_REGISTRY.HUMAN_ESCALATION, 'function');
  });

  // 2. retryTool Tests
  await runTestAsync('retryTool: Input validation & simulated execution', async () => {
    // Missing caseId should throw
    await assert.rejects(async () => {
      await executeRetry({ amount: 1000 });
    }, /Missing required parameter "caseId"/);

    // Invalid amount should throw
    await assert.rejects(async () => {
      await executeRetry({ caseId: 'RC_TEST_01', amount: -50 });
    }, /Invalid amount/);

    // Successful execution
    const res = await executeRetry({ caseId: 'RC_TEST_01', amount: 5000 });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.action, 'RETRY');
    assert.strictEqual(res.caseId, 'RC_TEST_01');
    assert.strictEqual(res.status, 'COMPLETED');
    assert(res.transactionId.includes('txn_retry_syn_') || res.transactionId.includes('pay_rzp_test_'));
    assert(!res.RAZORPAY_KEY_SECRET, 'Secrets must not be exposed');
  });

  // 3. paymentLinkTool Tests
  await runTestAsync('paymentLinkTool: Input validation & link generation', async () => {
    await assert.rejects(async () => {
      await createPaymentLink({ amount: 500 });
    }, /Missing required parameter "caseId"/);

    const res = await createPaymentLink({ caseId: 'RC_TEST_02', amount: 10000, customerId: 'cust_999' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.action, 'PAYMENT_LINK');
    assert.strictEqual(res.amount, 10000);
    assert(res.paymentUrl.includes('pay.orvix.ai') || res.paymentUrl.includes('razorpay'));
    assert(!res.RAZORPAY_KEY_SECRET, 'Secrets must not be exposed');
  });

  // 4. messagingTool & Provider Abstraction Tests
  await runTestAsync('messagingTool: Email simulation & Provider Abstraction', async () => {
    await assert.rejects(async () => {
      await sendMessaging({ channel: 'EMAIL' });
    }, /Missing required parameter "caseId"/);

    // Default Email channel
    const resEmail = await sendMessaging({ caseId: 'RC_TEST_03', channel: 'EMAIL', recipient: 'sub@test.com' });
    assert.strictEqual(resEmail.success, true);
    assert.strictEqual(resEmail.channel, 'EMAIL');
    assert.strictEqual(resEmail.provider, 'SimulatedEmailProvider');
    assert.strictEqual(resEmail.status, 'DELIVERED');

    // SMS Channel Provider Abstraction
    const resSms = await sendMessaging({ caseId: 'RC_TEST_03', channel: 'SMS', recipient: '+919876543210' });
    assert.strictEqual(resSms.success, true);
    assert.strictEqual(resSms.channel, 'SMS');
    assert.strictEqual(resSms.provider, 'SimulatedSMSProvider');

    // WhatsApp Channel Provider Abstraction
    const resWa = await sendMessaging({ caseId: 'RC_TEST_03', channel: 'WHATSAPP', recipient: '+919876543210' });
    assert.strictEqual(resWa.success, true);
    assert.strictEqual(resWa.channel, 'WHATSAPP');
    assert.strictEqual(resWa.provider, 'SimulatedWhatsAppProvider');
  });

  // 5. escalationTool Tests
  await runTestAsync('escalationTool: Support ticket generation & priority', async () => {
    await assert.rejects(async () => {
      await escalateToHuman({ reason: 'Needs review' });
    }, /Missing required parameter "caseId"/);

    const res = await escalateToHuman({ caseId: 'RC_TEST_04', reason: 'High value customer payment failure', priority: 'HIGH' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.action, 'HUMAN_ESCALATION');
    assert.strictEqual(res.caseId, 'RC_TEST_04');
    assert.strictEqual(res.priority, 'HIGH');
    assert(res.ticketId.includes('TICKET_RC_TEST_04'));
  });

  // 6. Tool Registry Dispatcher Test
  await runTestAsync('ToolRegistry: Dispatcher executeTool() correctly maps actions', async () => {
    const resRetry = await executeTool('RETRY', { caseId: 'RC_DISPATCH_01', amount: 2500 });
    assert.strictEqual(resRetry.action, 'RETRY');

    const resLink = await executeTool('PAYMENT_LINK', { caseId: 'RC_DISPATCH_02', amount: 4500 });
    assert.strictEqual(resLink.action, 'PAYMENT_LINK');

    const resMsg = await executeTool('EMAIL', { caseId: 'RC_DISPATCH_03' });
    assert.strictEqual(resMsg.action, 'EMAIL');

    const resEsc = await executeTool('HUMAN_ESCALATION', { caseId: 'RC_DISPATCH_04' });
    assert.strictEqual(resEsc.action, 'HUMAN_ESCALATION');

    // Unregistered action should throw
    await assert.rejects(async () => {
      await executeTool('INVALID_ACTION_NAME', { caseId: 'RC_FAIL' });
    }, /No controlled tool registered for action/);
  });

  console.log('\n====================================================');
  console.log(` UNIT TEST RESULTS: ${passed}/${total} PASSED `);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests();
