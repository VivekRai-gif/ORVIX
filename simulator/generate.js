import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDataset } from './generators/eventGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const count = parseInt(process.env.EVENT_COUNT, 10) || 1000;
const seed = parseInt(process.env.SEED, 10) || 42;

console.log('====================================================');
console.log(' ORVIX Synthetic Revenue Event Generator ');
console.log('====================================================');
console.log(`[Config] Event Count Target: ${count}`);
console.log(`[Config] Random Seed:        ${seed}`);
console.log('[Notice] ALL GENERATED DATA IS SYNTHETIC. NO REAL CUSTOMER INFORMATION IS USED.\n');

const events = generateDataset(count, seed);

// Create data directory if not exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputPath = path.join(dataDir, 'synthetic_events.json');
fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf-8');
console.log(`[Success] Saved ${events.length} synthetic events to ${outputPath}\n`);

// Calculate Summary Statistics
const totalEvents = events.length;
const totalRevenueAtRisk = events.reduce((sum, e) => sum + e.amount, 0);
const avgTransactionValue = Math.round(totalRevenueAtRisk / totalEvents);

const failureDist = {};
const customerDist = {};
const eventTypeDist = {};
let softFailureCount = 0;
let hardFailureCount = 0;

events.forEach(e => {
  failureDist[e.failureReason] = (failureDist[e.failureReason] || 0) + 1;
  customerDist[e.customerSegment] = (customerDist[e.customerSegment] || 0) + 1;
  eventTypeDist[e.eventType] = (eventTypeDist[e.eventType] || 0) + 1;
  if (e.groundTruthOutcome?.isSoftFailure) {
    softFailureCount++;
  } else {
    hardFailureCount++;
  }
});

console.log('====================================================');
console.log(' SIMULATOR SUMMARY STATISTICS ');
console.log('====================================================');
console.log(`- Total Events Generated:     ${totalEvents.toLocaleString()}`);
console.log(`- Total Revenue at Risk:      ₹${totalRevenueAtRisk.toLocaleString('en-IN')}`);
console.log(`- Average Transaction Value:  ₹${avgTransactionValue.toLocaleString('en-IN')}`);
console.log(`- Ground-Truth Soft Failures: ${softFailureCount} (${((softFailureCount/totalEvents)*100).toFixed(1)}%)`);
console.log(`- Ground-Truth Hard Failures: ${hardFailureCount} (${((hardFailureCount/totalEvents)*100).toFixed(1)}%)`);

console.log('\n--- Customer Segment Distribution ---');
Object.entries(customerDist)
  .sort((a, b) => b[1] - a[1])
  .forEach(([seg, cnt]) => {
    const pct = ((cnt / totalEvents) * 100).toFixed(1);
    console.log(`  ${seg.padEnd(16)}: ${cnt.toString().padStart(4)} (${pct}%)`);
  });

console.log('\n--- Failure Reason Distribution ---');
Object.entries(failureDist)
  .sort((a, b) => b[1] - a[1])
  .forEach(([reason, cnt]) => {
    const pct = ((cnt / totalEvents) * 100).toFixed(1);
    console.log(`  ${reason.padEnd(24)}: ${cnt.toString().padStart(4)} (${pct}%)`);
  });

console.log('\n--- Event Type Distribution ---');
Object.entries(eventTypeDist)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, cnt]) => {
    const pct = ((cnt / totalEvents) * 100).toFixed(1);
    console.log(`  ${type.padEnd(22)}: ${cnt.toString().padStart(4)} (${pct}%)`);
  });

console.log('====================================================\n');
