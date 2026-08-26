/**
 * Experiment Metrics Engine
 * 
 * Calculates empirical comparison metrics for:
 * A. Baseline Recovery Strategy
 * B. ORVIX Dynamic Strategy
 * 
 * Primary Metric: Incremental Revenue Recovered
 * Formula: ORVIX recovered revenue - baseline recovered revenue
 */

export function calculateExperimentMetrics(events = [], baselineRes = {}, orvixRes = {}) {
  const totalCases = events.length;
  const revenueAtRisk = events.reduce((sum, e) => sum + (e.amount || 0), 0);

  const baselineRev = baselineRes.revenueRecovered || 0;
  const orvixRev = orvixRes.revenueRecovered || 0;

  const baselineRate = totalCases > 0 ? parseFloat(((baselineRes.recoveredCasesCount / totalCases) * 100).toFixed(1)) : 0;
  const orvixRate = totalCases > 0 ? parseFloat(((orvixRes.recoveredCasesCount / totalCases) * 100).toFixed(1)) : 0;

  const incrementalRevenue = Math.max(0, orvixRev - baselineRev);
  const incrementalRate = parseFloat((orvixRate - baselineRate).toFixed(1));

  const baselineInterventions = baselineRes.totalInterventions || 1;
  const frictionReductionPct = Math.max(0, parseFloat((((baselineInterventions - (orvixRes.totalInterventions || 0)) / baselineInterventions) * 100).toFixed(1)));

  // Comparison Chart Data Structure for Recharts Bar Charts
  const comparisonChart = [
    {
      category: 'Revenue Recovered (₹)',
      Baseline: baselineRev,
      ORVIX: orvixRev
    },
    {
      category: 'Recovery Rate (%)',
      Baseline: baselineRate,
      ORVIX: orvixRate
    },
    {
      category: 'Total Interventions',
      Baseline: baselineRes.totalInterventions || 0,
      ORVIX: orvixRes.totalInterventions || 0
    },
    {
      category: 'Unnecessary Retries',
      Baseline: baselineRes.retryCount || 0,
      ORVIX: orvixRes.retryCount || 0
    },
    {
      category: 'Intervention Cost (₹)',
      Baseline: baselineRes.interventionCost || 0,
      ORVIX: orvixRes.interventionCost || 0
    }
  ];

  // Action Distribution Breakdown
  const actionDistribution = [
    { action: 'RETRY', Baseline: baselineRes.retryCount || 0, ORVIX: orvixRes.retryCount || 0 },
    { action: 'PAYMENT_LINK', Baseline: baselineRes.contactCount || 0, ORVIX: orvixRes.contactCount || 0 },
    { action: 'HUMAN_ESCALATION', Baseline: baselineRes.escalationCount || 0, ORVIX: orvixRes.escalationCount || 0 },
    { action: 'STOP', Baseline: baselineRes.stopCount || 0, ORVIX: orvixRes.stopCount || 0 }
  ];

  return {
    totalCases,
    revenueAtRisk,
    primaryMetric: {
      name: 'Incremental Revenue Recovered',
      formula: 'ORVIX recovered revenue - baseline recovered revenue',
      value: incrementalRevenue
    },
    incrementalRevenueRecovered: incrementalRevenue,
    incrementalRecoveryRate: incrementalRate,
    reductionInCustomerFriction: `${frictionReductionPct}%`,
    baseline: {
      strategyName: 'Baseline Recovery Strategy',
      totalCases,
      recoveredCasesCount: baselineRes.recoveredCasesCount || 0,
      revenueRecovered: baselineRev,
      recoveryRate: baselineRate,
      totalInterventions: baselineRes.totalInterventions || 0,
      retryCount: baselineRes.retryCount || 0,
      contactCount: baselineRes.contactCount || 0,
      escalationCount: baselineRes.escalationCount || 0,
      stopCount: baselineRes.stopCount || 0,
      avgRecoveryTimeHours: baselineRes.avgRecoveryTimeHours || 0,
      interventionCost: baselineRes.interventionCost || 0
    },
    orvix: {
      strategyName: 'ORVIX Dynamic Strategy',
      totalCases,
      recoveredCasesCount: orvixRes.recoveredCasesCount || 0,
      revenueRecovered: orvixRev,
      recoveryRate: orvixRate,
      totalInterventions: orvixRes.totalInterventions || 0,
      retryCount: orvixRes.retryCount || 0,
      contactCount: orvixRes.contactCount || 0,
      escalationCount: orvixRes.escalationCount || 0,
      stopCount: orvixRes.stopCount || 0,
      avgRecoveryTimeHours: orvixRes.avgRecoveryTimeHours || 0,
      interventionCost: orvixRes.interventionCost || 0
    },
    comparisonChart,
    actionDistribution
  };
}
