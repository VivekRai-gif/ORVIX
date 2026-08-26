import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../backend/src/config/db.js';
import { Customer, Payment, RecoveryCase, AuditLog } from '../backend/src/models/index.js';
import { generateDataset } from './generators/eventGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedSimulatorData = async () => {
  console.log('====================================================');
  console.log(' ORVIX Synthetic Event Database Seeder ');
  console.log('====================================================');

  const connection = await connectDB();
  if (!connection) {
    console.error('ERROR: Database connection failed. Please ensure MongoDB is running.');
    console.error('Hint: Start MongoDB locally or set MONGO_URI in backend/.env');
    process.exit(1);
  }

  try {
    const jsonPath = path.join(__dirname, 'data', 'synthetic_events.json');
    let events = [];

    if (fs.existsSync(jsonPath)) {
      console.log(`[Seed] Loading synthetic dataset from ${jsonPath}...`);
      events = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } else {
      console.log('[Seed] Synthetic dataset not found. Generating 1,000 synthetic events...');
      events = generateDataset(1000, 42);
    }

    console.log(`[Seed] Processing ${events.length} synthetic events into MongoDB...`);

    // Extract unique customers
    const customerMap = new Map();
    events.forEach(e => {
      if (!customerMap.has(e.customerId)) {
        customerMap.set(e.customerId, {
          customerId: e.customerId,
          segment: e.customerSegment,
          previousSuccessfulPayments: e.previousSuccessfulPayments,
          previousFailedPayments: e.previousFailedPayments,
          historicalRecoveryRate: e.historicalRecoveryRate,
          optedOut: false
        });
      }
    });

    const customersToInsert = Array.from(customerMap.values());
    console.log(`[Seed] Inserting ${customersToInsert.length} unique synthetic customers...`);
    await Customer.deleteMany({});
    await Customer.insertMany(customersToInsert);

    // Extract payments & recovery cases
    const paymentsToInsert = [];
    const casesToInsert = [];
    const auditLogsToInsert = [];

    events.forEach((e, idx) => {
      paymentsToInsert.push({
        paymentId: e.paymentId,
        customerId: e.customerId,
        amount: e.amount,
        currency: e.currency || 'INR',
        paymentMethod: e.paymentMethod,
        status: 'failed',
        failureReason: e.failureReason,
        createdAt: new Date(e.timestamp)
      });

      const caseId = `case_syn_${String(idx + 1).padStart(6, '0')}`;
      const expectedRecoveryValue = Math.round(e.amount * (e.groundTruthOutcome?.retrySuccessProb || 0.5));

      casesToInsert.push({
        caseId,
        paymentId: e.paymentId,
        customerId: e.customerId,
        amount: e.amount,
        currency: e.currency || 'INR',
        failureReason: e.failureReason,
        failureCategory: e.groundTruthOutcome?.isSoftFailure ? 'soft_failure' : 'hard_failure',
        status: 'open',
        attemptCount: 0,
        contactCount: 0,
        expectedRecoveryValue,
        recoveredAmount: 0
      });

      auditLogsToInsert.push({
        caseId,
        eventType: 'SYNTHETIC_EVENT_INGESTED',
        actor: 'system',
        message: `Synthetic ${e.eventType} ingested for ${e.customerId} (Amount: ₹${e.amount})`,
        metadata: { failureReason: e.failureReason, segment: e.customerSegment, isSynthetic: true }
      });
    });

    console.log(`[Seed] Inserting ${paymentsToInsert.length} synthetic payments...`);
    await Payment.deleteMany({});
    await Payment.insertMany(paymentsToInsert);

    console.log(`[Seed] Inserting ${casesToInsert.length} synthetic recovery cases...`);
    await RecoveryCase.deleteMany({});
    await RecoveryCase.insertMany(casesToInsert);

    console.log(`[Seed] Inserting ${auditLogsToInsert.length} initial audit logs...`);
    await AuditLog.deleteMany({});
    await AuditLog.insertMany(auditLogsToInsert);

    console.log('\n====================================================');
    console.log(' SIMULATOR SEED COMPLETE ');
    console.log('====================================================');
    console.log(`- Unique Customers Seeded:  ${customersToInsert.length}`);
    console.log(`- Payments Seeded:          ${paymentsToInsert.length}`);
    console.log(`- Recovery Cases Seeded:    ${casesToInsert.length}`);
    console.log(`- Audit Logs Seeded:        ${auditLogsToInsert.length}`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('[Seed Error] Synthetic database seeding failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedSimulatorData();
