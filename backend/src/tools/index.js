import executeRetry from './retryTool.js';
import createPaymentLink from './paymentLinkTool.js';
import sendMessaging from './messagingTool.js';
import escalateToHuman from './escalationTool.js';

/**
 * ORVIX Controlled Tool Registry
 * 
 * Strict mapping of recovery actions to controlled backend tool implementations.
 * All orchestrator executions MUST go through this registry.
 */
export const TOOL_REGISTRY = {
  RETRY: executeRetry,
  PAYMENT_LINK: createPaymentLink,
  EMAIL: sendMessaging,
  HUMAN_ESCALATION: escalateToHuman
};

/**
 * Execute a tool safely through the TOOL_REGISTRY dispatcher.
 * 
 * @param {string} action - Action identifier (RETRY, PAYMENT_LINK, EMAIL, HUMAN_ESCALATION)
 * @param {Object} params - Tool parameters
 * @returns {Promise<Object>} Tool execution output
 */
export async function executeTool(action, params = {}) {
  const normAction = (action || '').toUpperCase();
  const toolFn = TOOL_REGISTRY[normAction];

  if (!toolFn || typeof toolFn !== 'function') {
    throw new Error(`ToolRegistry: No controlled tool registered for action '${action}'. Available: ${Object.keys(TOOL_REGISTRY).join(', ')}`);
  }

  return await toolFn(params);
}

export { executeRetry, createPaymentLink, sendMessaging, escalateToHuman };
export default TOOL_REGISTRY;
