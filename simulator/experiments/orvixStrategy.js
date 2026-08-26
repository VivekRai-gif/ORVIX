/**
 * ORVIX Dynamic Recovery Strategy (Treatment Group)
 * 
 * Flow:
 * Payment Failed
 * → Diagnose
 * → Predict
 * → Expected Recovery Value
 * → Policy
 * → Dynamic Action
 * → Outcome
 * → Re-evaluate
 * → Stop
 */

export function runOrvixStrategy(events = []) {
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
    const failureReason = (e.failureReason || 'UNKNOWN').toUpperCase();
    const gt = e.groundTruthOutcome || {};
    const isHardFailure = !gt.isSoftFailure && (failureReason.includes('STOLEN') || failureReason.includes('INVALID'));

    let isRecovered = false;
    let caseRetries = 0;
    let caseContacts = 0;
    let caseEscalations = 0;
    let caseCost = 0;
    let recoveryTimeHours = 0;
    const history = [];

    // Deterministic pseudo-random seed per event
    let seedVal = (parseInt(e.eventId?.replace(/[^0-9]/g, '') || '1') * 9301 + 49297) % 233280;
    const nextRandom = () => {
      seedVal = (seedVal * 9301 + 49297) % 233280;
      return seedVal / 233280;
    };

    // Step 1: Diagnose
    if (isHardFailure) {
      stopCount++;
      history.push({ step: 1, action: 'DIAGNOSE', category: 'HARD_FAILURE', recoverable: false });
      history.push({ step: 2, action: 'STOP', status: 'STOPPED', reason: 'Unrecoverable hard failure' });
      return {
        eventId: e.eventId,
        amount,
        isRecovered: false,
        recoveredAmount: 0,
        interventions: 0,
        cost: 0,
        history
      };
    }

    // Step 2 & 3: Predict & Calculate ERV
    const retryProb = gt.retrySuccessProb ?? 0.30;
    const linkProb = gt.paymentLinkSuccessProb ?? 0.65;
    const emailProb = linkProb * 0.70;
    const humanProb = Math.min(0.92, linkProb * 1.25);

    const candidates = [
      { action: 'RETRY', prob: retryProb, cost: actionCosts.RETRY },
      { action: 'PAYMENT_LINK', prob: linkProb, cost: actionCosts.PAYMENT_LINK },
      { action: 'EMAIL', prob: emailProb, cost: actionCosts.EMAIL },
      { action: 'HUMAN_ESCALATION', prob: humanProb, cost: actionCosts.HUMAN_ESCALATION }
    ].map(c => ({
      ...c,
      expectedValue: parseFloat(((c.prob * amount) - c.cost).toFixed(2))
    }));

    // Step 4: Sort by ERV descending
    candidates.sort((a, b) => b.expectedValue - a.expectedValue);

    // Step 5, 6, 7: Policy Evaluation & Dynamic Action Loop
    const maxRetries = 3;
    const maxContacts = 2;
    const minErv = 50;

    for (let step = 1; step <= 4 && !isRecovered; step++) {
      let selectedCandidate = null;

      for (const cand of candidates) {
        if (cand.expectedValue < minErv) continue;
        if (cand.action === 'RETRY' && caseRetries >= maxRetries) continue;
        if ((cand.action === 'PAYMENT_LINK' || cand.action === 'EMAIL') && caseContacts >= maxContacts) continue;
        if (cand.action === 'HUMAN_ESCALATION' && amount < 10000) continue; // Policy check for high-value escalation

        selectedCandidate = cand;
        break;
      }

      if (!selectedCandidate) {
        stopCount++;
        history.push({ step, action: 'STOP', status: 'STOPPED', reason: 'Policy limits reached / ERV below threshold' });
        break;
      }

      // Execute Selected Candidate Action
      const act = selectedCandidate.action;
      caseCost += selectedCandidate.cost;
      totalInterventions++;

      if (act === 'RETRY') caseRetries++;
      else if (act === 'PAYMENT_LINK' || act === 'EMAIL') caseContacts++;
      else if (act === 'HUMAN_ESCALATION') caseEscalations++;

      // Check Outcome against Ground Truth
      const successProb = selectedCandidate.prob;
      if (nextRandom() < successProb) {
        isRecovered = true;
        recoveryTimeHours += act === 'RETRY' ? 1.0 : (act === 'HUMAN_ESCALATION' ? 4.0 : 6.0);
        history.push({ step, action: act, expectedValue: selectedCandidate.expectedValue, status: 'RECOVERED' });
      } else {
        recoveryTimeHours += 12.0;
        history.push({ step, action: act, expectedValue: selectedCandidate.expectedValue, status: 'FAILED' });
        // Re-evaluate next best candidate in loop
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
      interventions: caseRetries + caseContacts + caseEscalations,
      cost: caseCost,
      history
    };
  });

  return {
    strategyName: 'ORVIX Dynamic Strategy',
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
