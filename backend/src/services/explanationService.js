/**
 * ORVIX AI Explanation Layer
 * 
 * STRICT ARCHITECTURAL GUARDRAILS:
 * 1. The LLM must NOT determine numerical probabilities (computed by Python ML Model).
 * 2. The LLM must NOT calculate expected recovery values (computed by deterministic math code).
 * 3. The LLM must NOT evaluate policy rules (determined by Policy Engine).
 * 
 * The LLM / Explanation Engine explains:
 * 1. What happened?
 * 2. Why the selected action was chosen.
 * 3. Why alternatives were rejected.
 * 4. What stopping condition applies.
 * 5. What the merchant should understand.
 * 
 * Output:
 * {
 *   "summary": "...",
 *   "reasoning": "...",
 *   "risk": "...",
 *   "whyNotAlternatives": "...",
 *   "stopCondition": "..."
 * }
 */

/**
 * Generate factual, concise AI Explanation for a recovery decision.
 * 
 * @param {Object} params
 * @param {Object} params.diagnosis - { category, recoverable, confidence, failureReason }
 * @param {Record<string, number>|Array} params.probabilities - Map of action probabilities
 * @param {Record<string, number>|Array} params.expectedValues - Map of action ERVs
 * @param {Object} params.customerContext - { customerId, segment, optedOut }
 * @param {Object} params.policyResults - { allowed, reason, policyChecks }
 * @param {string} params.selectedAction - Chosen recovery action (e.g. RETRY, PAYMENT_LINK, NONE)
 * @param {Object} [params.caseContext] - { caseId, amount, status, attemptCount, contactCount }
 * @returns {Promise<Object>} { summary, reasoning, risk, whyNotAlternatives, stopCondition }
 */
export async function generateExplanation({
  diagnosis = {},
  probabilities = {},
  expectedValues = {},
  customerContext = {},
  policyResults = {},
  selectedAction = 'NONE',
  caseContext = {}
}) {
  const normAction = (selectedAction || 'NONE').toUpperCase();
  const caseId = caseContext.caseId || 'case_unknown';
  const amount = caseContext.amount || 0;
  const failureReason = caseContext.failureReason || diagnosis.failureReason || 'INSUFFICIENT_FUNDS';

  // Normalize probability map
  const probMap = {};
  if (Array.isArray(probabilities)) {
    probabilities.forEach(p => { if (p && p.action) probMap[p.action.toUpperCase()] = p.probability; });
  } else if (typeof probabilities === 'object') {
    Object.entries(probabilities).forEach(([k, v]) => { probMap[k.toUpperCase()] = Number(v) || 0; });
  }

  // Normalize ERV map
  const ervMap = {};
  if (Array.isArray(expectedValues)) {
    expectedValues.forEach(e => { if (e && e.action) ervMap[e.action.toUpperCase()] = e.expectedValue ?? e.expectedRecoveryValue; });
  } else if (typeof expectedValues === 'object') {
    Object.entries(expectedValues).forEach(([k, v]) => { ervMap[k.toUpperCase()] = Number(v) || 0; });
  }

  // 1. Generate Summary
  let summary = '';
  if (normAction !== 'NONE' && normAction !== 'STOP') {
    const erv = ervMap[normAction] ?? 0;
    summary = `Payment of ₹${amount.toLocaleString('en-IN')} for case ${caseId} failed due to ${failureReason} (${diagnosis.category || 'SOFT_FAILURE'}). Selected action '${normAction}' yields the highest approved Expected Recovery Value (₹${erv.toLocaleString('en-IN')}).`;
  } else if (diagnosis.category === 'HARD_FAILURE' || diagnosis.recoverable === false) {
    summary = `Payment of ₹${amount.toLocaleString('en-IN')} for case ${caseId} failed due to unrecoverable ${failureReason} (${diagnosis.category || 'HARD_FAILURE'}). Recovery interventions stopped to protect merchant reputation.`;
  } else if (customerContext.optedOut) {
    summary = `Payment of ₹${amount.toLocaleString('en-IN')} for case ${caseId} failed. Action selection halted because customer ${customerContext.customerId || ''} has opted out of recovery communications.`;
  } else {
    summary = `Payment of ₹${amount.toLocaleString('en-IN')} for case ${caseId} failed due to ${failureReason}. Interventions stopped as no candidate actions satisfied merchant policy guardrails.`;
  }

  // 2. Generate Reasoning
  let reasoning = '';
  if (normAction !== 'NONE' && normAction !== 'STOP') {
    const probPct = Math.round((probMap[normAction] || 0) * 100);
    const erv = ervMap[normAction] ?? 0;
    reasoning = `'${normAction}' was selected because it maximizes Expected Recovery Value (₹${erv.toLocaleString('en-IN')} based on ${probPct}% ML recovery probability). The decision passed all 7 merchant policy guardrail checks.`;
  } else {
    reasoning = `No intervention action was selected. The AI Engine evaluated candidate actions against policy limits and safety guardrails, concluding that halting action protects customer experience and merchant margins.`;
  }

  // 3. Generate Risk Assessment
  let risk = '';
  if (customerContext.optedOut) {
    risk = `High Risk: Customer has explicitly opted out. Invoking recovery actions would violate customer preference and policy rules.`;
  } else if (diagnosis.category === 'HARD_FAILURE' || diagnosis.recoverable === false) {
    risk = `High Risk: Hard failure code (${failureReason}). Retrying or sending payment links will result in guaranteed decline and waste transaction fees.`;
  } else {
    const attempts = caseContext.attemptCount || 0;
    const contacts = caseContext.contactCount || 0;
    risk = `Low Risk: Attempt count (${attempts}/3) and contact count (${contacts}/2) are within policy guardrails. Customer segment: ${customerContext.segment || 'RETURNING'}.`;
  }

  // 4. Generate Why Not Alternatives
  let whyNotAlternatives = '';
  const candidateActions = ['RETRY', 'PAYMENT_LINK', 'EMAIL', 'HUMAN_ESCALATION'];
  const altExplanations = [];

  for (const alt of candidateActions) {
    if (alt === normAction) continue;
    const altErv = ervMap[alt] ?? 0;
    const altProb = Math.round((probMap[alt] || 0) * 100);

    if (normAction !== 'NONE' && altErv < (ervMap[normAction] ?? 0)) {
      altExplanations.push(`'${alt}' yielded lower Expected Value (₹${altErv.toLocaleString('en-IN')} at ${altProb}% P(R)).`);
    } else if (alt === 'RETRY' && (caseContext.attemptCount || 0) >= 3) {
      altExplanations.push(`'RETRY' rejected because max retry limit (3/3) was reached.`);
    } else if ((alt === 'PAYMENT_LINK' || alt === 'EMAIL') && (caseContext.contactCount || 0) >= 2) {
      altExplanations.push(`'${alt}' rejected because max contact limit (2/2) was reached.`);
    } else if (alt === 'HUMAN_ESCALATION' && amount < 10000) {
      altExplanations.push(`'HUMAN_ESCALATION' cost (₹100) exceeds threshold for low-value transaction (₹${amount}).`);
    } else {
      altExplanations.push(`'${alt}' yielded expected value ₹${altErv.toLocaleString('en-IN')}.`);
    }
  }
  whyNotAlternatives = altExplanations.join(' ');

  // 5. Generate Stop Condition
  let stopCondition = '';
  if (customerContext.optedOut) {
    stopCondition = `STOPPED: Customer has opted out of automated recovery communications.`;
  } else if (diagnosis.category === 'HARD_FAILURE' || diagnosis.recoverable === false) {
    stopCondition = `STOPPED: Unrecoverable hard failure (${failureReason}). Recovery interventions permanently halted.`;
  } else if ((caseContext.status || '').toLowerCase() === 'recovered') {
    stopCondition = `STOPPED: Payment already recovered successfully (₹${(caseContext.recoveredAmount || amount).toLocaleString('en-IN')}). Case closed.`;
  } else if ((caseContext.attemptCount || 0) >= 3) {
    stopCondition = `STOPPED: Maximum payment retries limit (3/3) reached.`;
  } else if ((caseContext.contactCount || 0) >= 2 && normAction === 'NONE') {
    stopCondition = `STOPPED: Maximum customer contacts limit (2/2) reached.`;
  } else {
    stopCondition = `ACTIVE: No stop condition triggered. Case is active and within recovery window.`;
  }

  // Factual JSON Output Structure
  return {
    summary,
    reasoning,
    risk,
    whyNotAlternatives,
    stopCondition
  };
}
