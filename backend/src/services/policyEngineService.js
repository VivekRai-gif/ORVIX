/**
 * ORVIX Merchant Policy Evaluation Engine
 */

export const DEFAULT_POLICY = {
  merchantId: 'default_merchant',
  maxRetries: 3,
  maxContacts: 2,
  recoveryWindowDays: 7,
  minimumExpectedValue: 50,
  humanEscalationEnabled: true,
  allowedChannels: ['RETRY', 'PAYMENT_LINK', 'EMAIL', 'HUMAN_ESCALATION']
};

/**
 * Evaluate if a candidate action is compliant with merchant policy rules and case context.
 * 
 * @param {Object} params
 * @param {string} params.action - Candidate action (RETRY, PAYMENT_LINK, EMAIL, HUMAN_ESCALATION)
 * @param {number} params.expectedValue - Calculated Expected Recovery Value
 * @param {Object} params.caseContext - { attemptCount, contactCount }
 * @param {Object} params.customerContext - { customerId, optedOut }
 * @param {Object} params.diagnosis - { category, recoverable }
 * @param {Object} params.policy - Policy document or defaults
 * @returns {Object} { approved: boolean, reason: string }
 */
export function evaluatePolicyRule({
  action,
  expectedValue,
  caseContext = {},
  customerContext = {},
  diagnosis = {},
  policy = DEFAULT_POLICY
}) {
  const normAction = (action || '').toUpperCase();
  const mergedPolicy = { ...DEFAULT_POLICY, ...policy };

  // Rule 1: Customer Opt-Out Check
  if (customerContext.optedOut) {
    return {
      approved: false,
      reason: 'Customer has opted out of automated recovery communications'
    };
  }

  // Rule 2: Hard Failure / Unrecoverable Failure Check
  if (diagnosis.recoverable === false || diagnosis.category === 'HARD_FAILURE') {
    return {
      approved: false,
      reason: `Unrecoverable failure category '${diagnosis.category || 'HARD_FAILURE'}' - recovery prohibited`
    };
  }

  // Rule 3: Allowed Channels Policy Check
  const allowed = (mergedPolicy.allowedChannels || []).map(ch => ch.toUpperCase());
  if (allowed.length > 0 && !allowed.includes(normAction)) {
    return {
      approved: false,
      reason: `Action '${normAction}' is prohibited by merchant policy allowed channels`
    };
  }

  // Rule 4: Max Retries Limit Check
  if (normAction === 'RETRY') {
    const attempts = caseContext.attemptCount || 0;
    if (attempts >= mergedPolicy.maxRetries) {
      return {
        approved: false,
        reason: `Maximum payment retries limit (${mergedPolicy.maxRetries}) reached`
      };
    }
  }

  // Rule 5: Max Contacts Limit Check
  if (normAction === 'PAYMENT_LINK' || normAction === 'EMAIL') {
    const contacts = caseContext.contactCount || 0;
    if (contacts >= mergedPolicy.maxContacts) {
      return {
        approved: false,
        reason: `Maximum customer contacts limit (${mergedPolicy.maxContacts}) reached`
      };
    }
  }

  // Rule 6: Human Escalation Policy Check
  if (normAction === 'HUMAN_ESCALATION' && mergedPolicy.humanEscalationEnabled === false) {
    return {
      approved: false,
      reason: 'Human escalation is disabled by merchant policy'
    };
  }

  // Rule 7: Minimum Expected Value Threshold Check
  const minEv = mergedPolicy.minimumExpectedValue ?? 0;
  if (expectedValue < minEv) {
    return {
      approved: false,
      reason: `Expected Recovery Value (₹${expectedValue}) is below policy minimum threshold (₹${minEv})`
    };
  }

  return {
    approved: true,
    reason: `Action '${normAction}' approved by Policy Engine with Expected Recovery Value ₹${expectedValue}`
  };
}
