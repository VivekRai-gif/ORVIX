import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog.js';

/**
 * ORVIX Recovery Guardrail & Policy Engine
 * 
 * Configurable Policies:
 * - maxRetries (default 3)
 * - maxContacts (default 2)
 * - recoveryWindowDays (default 7)
 * - minimumExpectedValue (default 50)
 * - humanEscalationEnabled (default true)
 * - allowedChannels (default ['RETRY', 'PAYMENT_LINK', 'EMAIL', 'HUMAN_ESCALATION'])
 * - highValueThreshold (default 50000)
 */

export const DEFAULT_RECOVERY_POLICY = {
  merchantId: 'default_merchant',
  maxRetries: 3,
  maxContacts: 2,
  recoveryWindowDays: 7,
  minimumExpectedValue: 50,
  humanEscalationEnabled: true,
  allowedChannels: ['RETRY', 'PAYMENT_LINK', 'EMAIL', 'HUMAN_ESCALATION'],
  highValueThreshold: 50000
};

/**
 * Evaluate Stop Rules for a case and candidate action.
 * Returns status 'STOPPED' if any stop condition is triggered.
 * 
 * Stop Rules:
 * 1. Payment is already recovered
 * 2. Retry limit reached
 * 3. Contact limit reached
 * 4. Customer opted out
 * 5. Recovery window expired
 * 6. Expected recovery value is below threshold
 * 
 * @param {Object} params
 * @returns {Object} { status: 'STOPPED' | 'ACTIVE', stopped: boolean, reason: string, check: string }
 */
export function evaluateStopRules({
  action,
  caseContext = {},
  customerContext = {},
  expectedRecoveryValue = 0,
  policy = DEFAULT_RECOVERY_POLICY
}) {
  const normAction = (action || 'RETRY').toUpperCase();
  const activePolicy = { ...DEFAULT_RECOVERY_POLICY, ...policy };

  // Stop Rule 1: Payment is already recovered
  const isRecovered = (caseContext.status || '').toLowerCase() === 'recovered' || (caseContext.recoveredAmount || 0) > 0;
  if (isRecovered) {
    return {
      status: 'STOPPED',
      stopped: true,
      reason: 'Payment is already recovered',
      check: 'ALREADY_RECOVERED'
    };
  }

  // Stop Rule 2: Customer opted out
  if (customerContext.optedOut === true) {
    return {
      status: 'STOPPED',
      stopped: true,
      reason: 'Customer opted out of communications',
      check: 'CUSTOMER_OPTED_OUT'
    };
  }

  // Stop Rule 3: Recovery window expired
  const daysSinceFailure = caseContext.timeSinceFailure ??
    (caseContext.createdAt ? (Date.now() - new Date(caseContext.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0);

  if (daysSinceFailure > activePolicy.recoveryWindowDays) {
    return {
      status: 'STOPPED',
      stopped: true,
      reason: `Recovery window expired (${daysSinceFailure.toFixed(1)} days > ${activePolicy.recoveryWindowDays} days)`,
      check: 'RECOVERY_WINDOW_EXPIRED'
    };
  }

  // Stop Rule 4: Retry limit reached
  if (normAction === 'RETRY' && (caseContext.attemptCount || 0) >= activePolicy.maxRetries) {
    return {
      status: 'STOPPED',
      stopped: true,
      reason: `Retry limit reached (${caseContext.attemptCount || 0}/${activePolicy.maxRetries})`,
      check: 'RETRY_LIMIT_REACHED'
    };
  }

  // Stop Rule 5: Contact limit reached
  if (['PAYMENT_LINK', 'EMAIL'].includes(normAction) && (caseContext.contactCount || 0) >= activePolicy.maxContacts) {
    return {
      status: 'STOPPED',
      stopped: true,
      reason: `Contact limit reached (${caseContext.contactCount || 0}/${activePolicy.maxContacts})`,
      check: 'CONTACT_LIMIT_REACHED'
    };
  }

  // Stop Rule 6: Expected recovery value is below threshold
  if (expectedRecoveryValue < activePolicy.minimumExpectedValue) {
    return {
      status: 'STOPPED',
      stopped: true,
      reason: `Expected recovery value (₹${expectedRecoveryValue}) is below threshold (₹${activePolicy.minimumExpectedValue})`,
      check: 'EXPECTED_VALUE_BELOW_THRESHOLD'
    };
  }

  return {
    status: 'ACTIVE',
    stopped: false,
    reason: 'Case is active and eligible for recovery intervention',
    check: 'NONE'
  };
}

/**
 * Validate all policy guardrails for a candidate action.
 * 
 * Validates:
 * 1. Retry limit
 * 2. Contact limit
 * 3. Customer opt-out
 * 4. Recovery window
 * 5. Minimum expected recovery value
 * 6. Action allowed by merchant
 * 7. Human escalation configuration
 * 
 * @param {Object} params
 * @returns {Promise<Object>} { allowed: boolean, reason: string, policyChecks: Array<Object> }
 */
export async function validateRecoveryPolicy({
  action,
  caseContext = {},
  customerContext = {},
  expectedRecoveryValue = 0,
  policy = DEFAULT_RECOVERY_POLICY,
  logAudit = true
}) {
  const normAction = (action || 'RETRY').toUpperCase();
  const activePolicy = { ...DEFAULT_RECOVERY_POLICY, ...policy };
  const policyChecks = [];

  // Check 1: Retry Limit
  const attempts = caseContext.attemptCount || 0;
  const retryLimitPassed = normAction !== 'RETRY' || attempts < activePolicy.maxRetries;
  policyChecks.push({
    check: 'RETRY_LIMIT',
    passed: retryLimitPassed,
    message: retryLimitPassed
      ? `Attempt count ${attempts} is within maxRetries limit of ${activePolicy.maxRetries}`
      : `Retry limit reached (${attempts}/${activePolicy.maxRetries})`
  });

  // Check 2: Contact Limit
  const contacts = caseContext.contactCount || 0;
  const isContactAction = ['PAYMENT_LINK', 'EMAIL'].includes(normAction);
  const contactLimitPassed = !isContactAction || contacts < activePolicy.maxContacts;
  policyChecks.push({
    check: 'CONTACT_LIMIT',
    passed: contactLimitPassed,
    message: contactLimitPassed
      ? `Contact count ${contacts} is within maxContacts limit of ${activePolicy.maxContacts}`
      : `Contact limit reached (${contacts}/${activePolicy.maxContacts})`
  });

  // Check 3: Customer Opt-Out
  const isOptedOut = customerContext.optedOut === true || caseContext.customer?.optedOut === true || caseContext.optedOut === true;
  policyChecks.push({
    check: 'CUSTOMER_OPT_OUT',
    passed: !isOptedOut,
    message: !isOptedOut
      ? 'Customer opt-out check passed (active subscriber)'
      : `Customer ${customerContext.customerId || caseContext.customerId || ''} has opted out of communications`
  });

  // Check 4: Recovery Window
  const daysSinceFailure = caseContext.createdDaysAgo ?? caseContext.timeSinceFailure ??
    (caseContext.createdAt ? (Date.now() - new Date(caseContext.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0);
  const recoveryWindowPassed = daysSinceFailure <= activePolicy.recoveryWindowDays;
  policyChecks.push({
    check: 'RECOVERY_WINDOW',
    passed: recoveryWindowPassed,
    message: recoveryWindowPassed
      ? `Time since failure (${daysSinceFailure.toFixed(1)} days) is within recovery window (${activePolicy.recoveryWindowDays} days)`
      : `Recovery window expired (${daysSinceFailure.toFixed(1)} days > ${activePolicy.recoveryWindowDays} days)`
  });

  // Check 5: Minimum Expected Recovery Value
  const evPassed = expectedRecoveryValue >= activePolicy.minimumExpectedValue;
  policyChecks.push({
    check: 'MINIMUM_EXPECTED_VALUE',
    passed: evPassed,
    message: evPassed
      ? `Expected Recovery Value (₹${expectedRecoveryValue}) satisfies minimum threshold (₹${activePolicy.minimumExpectedValue})`
      : `Expected Recovery Value (₹${expectedRecoveryValue}) is below minimum threshold (₹${activePolicy.minimumExpectedValue})`
  });

  // Check 6: Action Allowed by Merchant
  const allowedChannelsUpper = (activePolicy.allowedChannels || []).map(ch => ch.toUpperCase());
  const channelAllowed = allowedChannelsUpper.length === 0 || allowedChannelsUpper.includes(normAction);
  policyChecks.push({
    check: 'ALLOWED_CHANNELS',
    passed: channelAllowed,
    message: channelAllowed
      ? `Action '${normAction}' is permitted by merchant allowed channels`
      : `Action '${normAction}' is not allowed by merchant channel configuration`
  });

  // Check 7: Human Escalation Configuration
  const escalationPassed = normAction !== 'HUMAN_ESCALATION' || activePolicy.humanEscalationEnabled === true;
  policyChecks.push({
    check: 'HUMAN_ESCALATION',
    passed: escalationPassed,
    message: escalationPassed
      ? 'Human escalation configuration check passed'
      : 'Human escalation is disabled by merchant configuration'
  });

  // Determine overall outcome
  const allowed = policyChecks.every(c => c.passed);
  const failedCheck = policyChecks.find(c => !c.passed);
  const reason = allowed
    ? 'All policy guardrail checks passed successfully.'
    : (failedCheck ? failedCheck.message : 'Policy guardrail validation failed.');

  // Write to AuditLog if enabled and database connected
  if (logAudit && typeof mongoose !== 'undefined' && mongoose?.connection?.readyState === 1 && typeof AuditLog?.create === 'function') {
    try {
      await AuditLog.create({
        caseId: caseContext.caseId || 'SYSTEM',
        eventType: allowed ? 'POLICY_APPROVED' : 'POLICY_REJECTED',
        actor: 'guardrail_engine',
        message: `Guardrail evaluation for '${normAction}': ${reason}`,
        metadata: {
          action: normAction,
          allowed,
          expectedRecoveryValue,
          failedCheck: failedCheck ? failedCheck.check : null,
          policyChecks
        }
      });
    } catch (e) {
      // Ignore DB write errors in mock/offline mode
    }
  }

  return {
    allowed,
    reason,
    policyChecks
  };
}
