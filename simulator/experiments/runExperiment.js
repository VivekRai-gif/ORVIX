import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runBaselineStrategy } from './baselineStrategy.js';
import { runOrvixStrategy } from './orvixStrategy.js';
import { calculateExperimentMetrics } from './metrics.js';
import { generateDataset } from '../generators/eventGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runExperiment(eventCount = 1000, seed = 42) {
  console.log('====================================================');
  console.log(' ORVIX Controlled Strategy Experimentation Runner ');
  console.log('====================================================');

  // 1. Ingest or generate synthetic events dataset
  const dataDir = path.join(__dirname, '..', 'data');
  const datasetPath = path.join(dataDir, 'synthetic_events.json');

  let events = [];
  if (fs.existsSync(datasetPath)) {
    events = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    console.log(`[Ingest] Loaded ${events.length} synthetic events from ${datasetPath}`);
  } else {
    console.log(`[Generate] Dataset not found. Generating ${eventCount} synthetic events...`);
    events = generateDataset(eventCount, seed);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(datasetPath, JSON.stringify(events, null, 2), 'utf-8');
  }

  // 2. Run both strategies on the EXACT SAME synthetic dataset
  console.log('[Runner] Executing Baseline Recovery Strategy...');
  const baselineResults = runBaselineStrategy(events);

  console.log('[Runner] Executing ORVIX Dynamic AI Strategy...');
  const orvixResults = runOrvixStrategy(events);

  // 3. Compute empirical comparison metrics
  const metrics = calculateExperimentMetrics(events, baselineResults, orvixResults);

  // 4. Save results to simulator/data/experiment_results.json
  const resultsPath = path.join(dataDir, 'experiment_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(metrics, null, 2), 'utf-8');
  console.log(`[Success] Saved experiment results to ${resultsPath}\n`);

  // 5. Output Summary Table
  console.log('====================================================');
  console.log(' EXPERIMENT RESULTS SUMMARY ');
  console.log('====================================================');
  console.log(`Total Events Evaluated:      ${metrics.totalCases.toLocaleString()}`);
  console.log(`Total Revenue at Risk:       ₹${metrics.revenueAtRisk.toLocaleString('en-IN')}`);
  console.log(`----------------------------------------------------`);
  console.log(`PRIMARY METRIC: Incremental Revenue Recovered:`);
  console.log(`>>>  ₹${metrics.incrementalRevenueRecovered.toLocaleString('en-IN')} (+${metrics.incrementalRecoveryRate}% lift)  <<<`);
  console.log(`----------------------------------------------------`);
  console.log(`Baseline Strategy (Control):`);
  console.log(`  - Revenue Recovered:       ₹${metrics.baseline.revenueRecovered.toLocaleString('en-IN')}`);
  console.log(`  - Recovery Rate:           ${metrics.baseline.recoveryRate}% (${metrics.baseline.recoveredCasesCount} cases)`);
  console.log(`  - Total Interventions:     ${metrics.baseline.totalInterventions}`);
  console.log(`  - Intervention Cost:       ₹${metrics.baseline.interventionCost.toLocaleString('en-IN')}`);
  console.log(`  - Avg Recovery Time:       ${metrics.baseline.avgRecoveryTimeHours} hrs`);
  console.log(`----------------------------------------------------`);
  console.log(`ORVIX Dynamic Strategy (Treatment):`);
  console.log(`  - Revenue Recovered:       ₹${metrics.orvix.revenueRecovered.toLocaleString('en-IN')}`);
  console.log(`  - Recovery Rate:           ${metrics.orvix.recoveryRate}% (${metrics.orvix.recoveredCasesCount} cases)`);
  console.log(`  - Total Interventions:     ${metrics.orvix.totalInterventions}`);
  console.log(`  - Intervention Cost:       ₹${metrics.orvix.interventionCost.toLocaleString('en-IN')}`);
  console.log(`  - Avg Recovery Time:       ${metrics.orvix.avgRecoveryTimeHours} hrs`);
  console.log(`  - Customer Friction Red.:  ${metrics.reductionInCustomerFriction}`);
  console.log('====================================================\n');

  return metrics;
}

if (process.argv[1] && process.argv[1].endsWith('runExperiment.js')) {
  runExperiment();
}
