/**
 * ORVIX Expected Recovery Value (ERV) Engine
 * 
 * Formula:
 *   ERV(action) = P(recovery | context, action) * revenueAtRisk - interventionCost
 * 
 * Configurable Initial Intervention Costs:
 *   RETRY = 1
 *   PAYMENT_LINK = 2
 *   EMAIL = 1
 *   HUMAN_ESCALATION = 100
 */

let DEFAULT_INTERVENTION_COSTS = {
  RETRY: 1,
  PAYMENT_LINK: 2,
  EMAIL: 1,
  HUMAN_ESCALATION: 100
};

/**
 * Get active default intervention costs.
 * @returns {Record<string, number>}
 */
export function getInterventionCosts() {
  return { ...DEFAULT_INTERVENTION_COSTS };
}

/**
 * Dynamically configure default intervention costs globally.
 * @param {Record<string, number>} newCosts 
 * @returns {Record<string, number>}
 */
export function setInterventionCosts(newCosts = {}) {
  DEFAULT_INTERVENTION_COSTS = {
    ...DEFAULT_INTERVENTION_COSTS,
    ...newCosts
  };
  return getInterventionCosts();
}

/**
 * Reset intervention costs to factory defaults.
 * @returns {Record<string, number>}
 */
export function resetInterventionCosts() {
  DEFAULT_INTERVENTION_COSTS = {
    RETRY: 1,
    PAYMENT_LINK: 2,
    EMAIL: 1,
    HUMAN_ESCALATION: 100
  };
  return getInterventionCosts();
}

/**
 * Calculate ERV for a single action.
 * 
 * @param {Object} params
 * @param {number} params.amount - Revenue at risk (amount)
 * @param {string} params.action - Candidate action (e.g. RETRY, PAYMENT_LINK, EMAIL, HUMAN_ESCALATION)
 * @param {number} params.probability - P(recovery | context, action)
 * @param {Record<string, number>} [params.customCosts] - Optional custom action cost overrides
 * @returns {Object} Output object with keys: action, probability, amount, interventionCost, expectedRecoveryValue
 */
export function calculateSingleExpectedValue({ amount, action, probability, customCosts = {} }) {
  const normAmount = Math.max(0, Number(amount) || 0);
  const normProb = Math.min(1.0, Math.max(0.0, Number(probability) || 0));
  const normAction = (action || 'RETRY').toUpperCase();

  const costs = { ...DEFAULT_INTERVENTION_COSTS, ...customCosts };
  const cost = typeof costs[normAction] === 'number'
    ? costs[normAction]
    : (DEFAULT_INTERVENTION_COSTS[normAction] ?? 0);

  const rawErv = (normProb * normAmount) - cost;
  const expectedRecoveryValue = parseFloat(rawErv.toFixed(2));

  return {
    action: normAction,
    probability: parseFloat(normProb.toFixed(4)),
    amount: normAmount,
    interventionCost: cost,
    expectedRecoveryValue
  };
}

/**
 * Calculate ERV for every candidate action and sort descending by expectedRecoveryValue.
 * 
 * @param {Object} params
 * @param {number} params.amount - Revenue at risk
 * @param {Record<string, number> | Array<{action: string, probability: number}>} params.probabilities - Action probabilities map or array
 * @param {Record<string, number>} [params.customCosts] - Optional custom costs mapping override
 * @returns {Array<Object>} Array of action ERV objects sorted by expectedRecoveryValue descending
 */
export function calculateExpectedRecoveryValues({ amount, probabilities, customCosts = {} }) {
  const probMap = {};

  if (Array.isArray(probabilities)) {
    probabilities.forEach(item => {
      if (item && item.action) {
        probMap[item.action.toUpperCase()] = Number(item.probability) || 0;
      }
    });
  } else if (probabilities && typeof probabilities === 'object') {
    Object.entries(probabilities).forEach(([act, prob]) => {
      probMap[act.toUpperCase()] = Number(prob) || 0;
    });
  }

  const candidateActions = ['RETRY', 'PAYMENT_LINK', 'EMAIL', 'HUMAN_ESCALATION'];
  const allActions = Array.from(new Set([...candidateActions, ...Object.keys(probMap)]));

  const results = allActions.map(action => {
    const probability = probMap[action] ?? 0;
    return calculateSingleExpectedValue({
      amount,
      action,
      probability,
      customCosts
    });
  });

  // Sort actions by expectedRecoveryValue descending
  results.sort((a, b) => {
    if (b.expectedRecoveryValue !== a.expectedRecoveryValue) {
      return b.expectedRecoveryValue - a.expectedRecoveryValue;
    }
    return b.probability - a.probability;
  });

  return results;
}
