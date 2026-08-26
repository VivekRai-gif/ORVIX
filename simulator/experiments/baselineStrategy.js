/**
 * Baseline Recovery Strategy (Control Group)
 * 
 * Flow:
 * Payment Failed
 * → Retry (Attempt 1)
 * → Reminder / Payment Link (Contact 1)
 * → Retry (Attempt 2)
 * → Stop
 * 
 * Fixed naive execution without AI diagnosis, probability estimation, or ERV optimization.
 */

export function runBaselineStrategy(events = []) {
  let revenueRecovered = 0;
  let retryCount = 0;
  let contactCount = 0;
  let escalationCount = 0;
  let stopCount = 0;
  let totalInterventions = 0;
  let totalInterventionCost = 0;
  let totalRecoveryTimeHours = 0;
  let recoveredCasesCount = 0;

  const actionCosts = {
    RETRY: 1,
    PAYMENT_LINK: 2,
    EMAIL: 1,
    HUMAN_ESCALATION: 100
  };

  const results = events.map(e => {
    const amount = e.amount || 0;
    const gt = e.groundTruthOutcome || {};
    const retryProb = gt.retrySuccessProb ?? 0.20;
    const linkProb = gt.paymentLinkSuccessProb ?? 0.35;
    const isHardFailure = !gt.isSoftFailure && (e.failureReason?.includes('STOLEN') || e.failureReason?.includes('INVALID'));

    let isRecovered = false;
    let caseRetries = 0;
    let caseContacts = 0;
    let caseEscalations = 0;
    let caseCost = 0;
    let recoveryTimeHours = 0;
    const history = [];

    // Deterministic pseudo-random seed per event for repeatable simulation
    let seedVal = (parseInt(e.eventId?.replace(/[^0-9]/g, '') || '1') * 9301 + 49297) % 233280;
    const nextRandom = () => {
      seedVal = (seedVal * 9301 + 49297) % 233280;
      return seedVal / 233280;
    };

    // Step 1: Naive Retry (Attempt 1)
    caseRetries++;
    caseCost += actionCosts.RETRY;
    totalInterventions++;
    history.push({ step: 1, action: 'RETRY', status: 'ATTEMPTED' });

    if (!isHardFailure && nextRandom() < retryProb) {
      isRecovered = true;
      history[0].status = 'RECOVERED';
      recoveryTimeHours = 2.0;
    } else {
      history[0].status = 'FAILED';
      recoveryTimeHours += 6.0;

      // Step 2: Naive Payment Link Reminder (Contact 1)
      caseContacts++;
      caseCost += actionCosts.PAYMENT_LINK;
      totalInterventions++;
      history.push({ step: 2, action: 'PAYMENT_LINK', status: 'ATTEMPTED' });

      if (!isHardFailure && nextRandom() < linkProb) {
        isRecovered = true;
        history[1].status = 'RECOVERED';
        recoveryTimeHours += 12.0;
      } else {
        history[1].status = 'FAILED';
        recoveryTimeHours += 24.0;

        // Step 3: Naive Retry (Attempt 2)
        caseRetries++;
        caseCost += actionCosts.RETRY;
        totalInterventions++;
        history.push({ step: 3, action: 'RETRY', status: 'ATTEMPTED' });

        if (!isHardFailure && nextRandom() < (retryProb * 0.7)) {
          isRecovered = true;
          history[2].status = 'RECOVERED';
          recoveryTimeHours += 6.0;
        } else {
          history[2].status = 'FAILED';
          recoveryTimeHours += 12.0;

          // Step 4: Stop
          stopCount++;
          history.push({ step: 4, action: 'STOP', status: 'STOPPED' });
        }
      }
    }

    if (isRecovered) {
      recoveredCasesCount++;
      revenueRecovered += amount;
      totalRecoveryTimeHours += recoveryTimeHours;
    }

    retryCount += caseRetries;
    contactCount += caseContacts;
    escalationCount += caseEscalations;
    totalInterventionCost += caseCost;

    return {
      eventId: e.eventId,
      amount,
      isRecovered,
      recoveredAmount: isRecovered ? amount : 0,
      interventions: caseRetries + caseContacts,
      cost: caseCost,
      history
    };
  });

  return {
    strategyName: 'Baseline Recovery Strategy',
    totalCases: events.length,
    recoveredCasesCount,
    revenueRecovered,
    totalInterventions,
    retryCount,
    contactCount,
    escalationCount,
    stopCount,
    interventionCost: totalInterventionCost,
    avgRecoveryTimeHours: recoveredCasesCount > 0 ? parseFloat((totalRecoveryTimeHours / recoveredCasesCount).toFixed(1)) : 0,
    caseResults: results
  };
}
