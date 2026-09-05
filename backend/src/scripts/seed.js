import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  Customer,
  Payment,
  RecoveryCase,
  RecoveryPrediction,
  ActionExecution,
  AuditLog,
  Policy,
  User
} from '../models/index.js';

dotenv.config();

const seedDatabase = async () => {
  console.log('====================================================');
  console.log(' ORVIX Database Seeder ');
  console.log('====================================================');

  const connection = await connectDB();
  if (!connection) {
    console.error('ERROR: Database connection failed. Please ensure MongoDB is running.');
    console.error('Hint: Start MongoDB locally or set MONGO_URI in backend/.env');
    process.exit(1);
  }

  try {
    console.log('[Seed] Clearing existing collections...');
    await Customer.deleteMany({});
    await Payment.deleteMany({});
    await RecoveryCase.deleteMany({});
    await RecoveryPrediction.deleteMany({});
    await ActionExecution.deleteMany({});
    await AuditLog.deleteMany({});
    await Policy.deleteMany({});
    await User.deleteMany({});
    console.log('[Seed] Collections cleared successfully.');

    // 0. Seed Demo User
    console.log('[Seed] Creating Demo Merchant User...');
    const demoUser = await User.create({
      name: 'Demo Merchant',
      email: 'merchant@orvix.com',
      password: 'password123',
      role: 'merchant'
    });
    console.log(`[Seed] Created Demo User: ${demoUser.email} / password123`);

    // 1. Create 10 Customers
    console.log('[Seed] Inserting 10 Customers...');
    const customersData = [
      { customerId: 'cust_1001', segment: 'enterprise', previousSuccessfulPayments: 42, previousFailedPayments: 2, historicalRecoveryRate: 0.85, optedOut: false },
      { customerId: 'cust_1002', segment: 'smb', previousSuccessfulPayments: 12, previousFailedPayments: 3, historicalRecoveryRate: 0.60, optedOut: false },
      { customerId: 'cust_1003', segment: 'consumer', previousSuccessfulPayments: 3, previousFailedPayments: 1, historicalRecoveryRate: 0.50, optedOut: false },
      { customerId: 'cust_1004', segment: 'vip', previousSuccessfulPayments: 88, previousFailedPayments: 0, historicalRecoveryRate: 1.00, optedOut: false },
      { customerId: 'cust_1005', segment: 'smb', previousSuccessfulPayments: 5, previousFailedPayments: 5, historicalRecoveryRate: 0.35, optedOut: false },
      { customerId: 'cust_1006', segment: 'consumer', previousSuccessfulPayments: 1, previousFailedPayments: 2, historicalRecoveryRate: 0.20, optedOut: true },
      { customerId: 'cust_1007', segment: 'enterprise', previousSuccessfulPayments: 120, previousFailedPayments: 4, historicalRecoveryRate: 0.90, optedOut: false },
      { customerId: 'cust_1008', segment: 'consumer', previousSuccessfulPayments: 0, previousFailedPayments: 1, historicalRecoveryRate: 0.00, optedOut: false },
      { customerId: 'cust_1009', segment: 'smb', previousSuccessfulPayments: 18, previousFailedPayments: 2, historicalRecoveryRate: 0.75, optedOut: false },
      { customerId: 'cust_1010', segment: 'vip', previousSuccessfulPayments: 54, previousFailedPayments: 1, historicalRecoveryRate: 0.95, optedOut: false }
    ];

    const insertedCustomers = await Customer.insertMany(customersData);
    console.log(`[Seed] Successfully created ${insertedCustomers.length} customers.`);

    // 2. Create 30 Payments
    console.log('[Seed] Inserting 30 Payments...');
    const paymentMethods = ['card', 'upi', 'netbanking', 'nach', 'wallet'];
    const failureReasons = [
      'BANK_TECHNICAL_ERROR',
      'INSUFFICIENT_FUNDS',
      'CARD_EXPIRED',
      'AUTHENTICATION_FAILED',
      'NETWORK_TIMEOUT'
    ];

    const paymentsData = [];
    let caseCount = 0;
    const failedPaymentDetails = [];

    for (let i = 1; i <= 30; i++) {
      const paymentId = `pay_tx_${1000 + i}`;
      const customer = customersData[(i - 1) % customersData.length];
      const isFailed = i % 3 === 0; // 10 out of 30 payments fail
      const amount = Math.floor(Math.random() * 8500) + 1500;
      const method = paymentMethods[i % paymentMethods.length];

      const paymentRecord = {
        paymentId,
        customerId: customer.customerId,
        amount,
        currency: 'INR',
        paymentMethod: method,
        status: isFailed ? 'failed' : 'captured',
        failureReason: isFailed ? failureReasons[caseCount % failureReasons.length] : null
      };

      paymentsData.push(paymentRecord);

      if (isFailed) {
        caseCount++;
        failedPaymentDetails.push({
          caseId: `case_rcv_${5000 + caseCount}`,
          paymentId,
          customerId: customer.customerId,
          amount,
          failureReason: paymentRecord.failureReason,
          failureCategory: paymentRecord.failureReason.toLowerCase().includes('bank') ? 'bank_outage' :
                           paymentRecord.failureReason.toLowerCase().includes('funds') ? 'insufficient_funds' :
                           paymentRecord.failureReason.toLowerCase().includes('card') ? 'card_expired' : 'technical'
        });
      }
    }

    const insertedPayments = await Payment.insertMany(paymentsData);
    console.log(`[Seed] Successfully created ${insertedPayments.length} payments.`);

    // 3. Create 10 Recovery Cases
    console.log('[Seed] Inserting 10 Recovery Cases...');
    const recoveryCasesData = failedPaymentDetails.map((detail, idx) => ({
      caseId: detail.caseId,
      paymentId: detail.paymentId,
      customerId: detail.customerId,
      amount: detail.amount,
      currency: 'INR',
      failureReason: detail.failureReason,
      failureCategory: detail.failureCategory,
      status: idx < 4 ? 'open' : idx < 7 ? 'in_progress' : idx < 9 ? 'recovered' : 'closed',
      attemptCount: idx < 4 ? 0 : idx < 7 ? 1 : 2,
      contactCount: idx < 4 ? 0 : 1,
      selectedAction: idx >= 4 ? (idx % 2 === 0 ? 'intelligent_retry' : 'payment_link') : null,
      expectedRecoveryValue: Math.round(detail.amount * 0.72),
      recoveredAmount: idx >= 7 && idx < 9 ? detail.amount : 0,
      closedAt: idx >= 7 ? new Date() : null
    }));

    const insertedCases = await RecoveryCase.insertMany(recoveryCasesData);
    console.log(`[Seed] Successfully created ${insertedCases.length} recovery cases.`);

    // 4. Create Recovery Predictions & Audit Logs for sample cases
    console.log('[Seed] Inserting predictions, executions, and audit logs...');
    const sampleCase = recoveryCasesData[0];

    await RecoveryPrediction.insertMany([
      { caseId: sampleCase.caseId, action: 'intelligent_retry', probability: 0.82, expectedValue: Math.round(sampleCase.amount * 0.82), modelVersion: '1.0.0' },
      { caseId: sampleCase.caseId, action: 'payment_link', probability: 0.65, expectedValue: Math.round(sampleCase.amount * 0.65), modelVersion: '1.0.0' },
      { caseId: sampleCase.caseId, action: 'email_reminder', probability: 0.40, expectedValue: Math.round(sampleCase.amount * 0.40), modelVersion: '1.0.0' }
    ]);

    await ActionExecution.create({
      caseId: sampleCase.caseId,
      action: 'intelligent_retry',
      status: 'pending',
      executedAt: new Date()
    });

    await AuditLog.create({
      caseId: sampleCase.caseId,
      eventType: 'CASE_CREATED',
      actor: 'system',
      message: `Recovery case created for failed payment ${sampleCase.paymentId} of ₹${sampleCase.amount}`,
      metadata: { failureCategory: sampleCase.failureCategory }
    });

    // 5. Create 1 Default Policy
    console.log('[Seed] Inserting Default Merchant Policy...');
    const defaultPolicy = await Policy.create({
      merchantId: 'default_merchant',
      maxRetries: 3,
      maxContacts: 2,
      recoveryWindowDays: 7,
      minimumExpectedValue: 50,
      humanEscalationEnabled: true,
      allowedChannels: ['retry', 'payment_link', 'email']
    });
    console.log(`[Seed] Successfully created default merchant policy (ID: ${defaultPolicy.merchantId}).`);

    console.log('\n====================================================');
    console.log(' SEED SUMMARY ');
    console.log('====================================================');
    console.log(`- Customers:     ${insertedCustomers.length}`);
    console.log(`- Payments:      ${insertedPayments.length}`);
    console.log(`- RecoveryCases: ${insertedCases.length}`);
    console.log(`- Policy:        1 (${defaultPolicy.merchantId})`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedDatabase();
