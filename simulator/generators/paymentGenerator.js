import { randomInt, randomFloat, weightedChoice, choice } from '../utils/random.js';

const FAILURE_TYPES = [
  { value: 'INSUFFICIENT_FUNDS', weight: 28 },
  { value: 'NETWORK_ERROR', weight: 20 },
  { value: 'BANK_DECLINED', weight: 18 },
  { value: 'TIMEOUT', weight: 14 },
  { value: 'EXPIRED_CARD', weight: 10 },
  { value: 'INVALID_PAYMENT_METHOD', weight: 6 },
  { value: 'UNKNOWN', weight: 4 }
];

export function generatePaymentDetails(customer, index) {
  const paymentId = `pay_syn_${String(index).padStart(6, '0')}`;
  
  // Method preference by segment
  let paymentMethod;
  if (customer.customerSegment === 'B2B') {
    paymentMethod = weightedChoice([
      { value: 'netbanking', weight: 45 },
      { value: 'nach', weight: 35 },
      { value: 'card', weight: 20 }
    ]);
  } else if (customer.customerSegment === 'PRICE_SENSITIVE') {
    paymentMethod = weightedChoice([
      { value: 'upi', weight: 70 },
      { value: 'card', weight: 20 },
      { value: 'wallet', weight: 10 }
    ]);
  } else {
    paymentMethod = weightedChoice([
      { value: 'card', weight: 45 },
      { value: 'upi', weight: 35 },
      { value: 'netbanking', weight: 20 }
    ]);
  }

  // Amount generation by segment
  let amount = 0;
  switch (customer.customerSegment) {
    case 'HIGH_VALUE':
      amount = randomInt(15000, 120000);
      break;
    case 'B2B':
      amount = randomInt(25000, 450000);
      break;
    case 'RETURNING':
      amount = randomInt(1500, 18000);
      break;
    case 'PRICE_SENSITIVE':
      amount = randomInt(250, 2500);
      break;
    case 'NEW':
    default:
      amount = randomInt(500, 6000);
      break;
  }

  const failureReason = weightedChoice(FAILURE_TYPES);

  // Determine ground-truth recovery potential
  const isSoftFailure = ['NETWORK_ERROR', 'TIMEOUT', 'BANK_DECLINED'].includes(failureReason);
  
  let retrySuccessProb = 0.0;
  let paymentLinkSuccessProb = 0.0;

  if (isSoftFailure) {
    retrySuccessProb = failureReason === 'BANK_DECLINED' ? randomFloat(0.50, 0.70) : randomFloat(0.75, 0.92);
    paymentLinkSuccessProb = randomFloat(0.40, 0.65);
  } else if (failureReason === 'INSUFFICIENT_FUNDS') {
    retrySuccessProb = randomFloat(0.15, 0.30);
    paymentLinkSuccessProb = randomFloat(0.60, 0.85);
  } else {
    // EXPIRED_CARD or INVALID_PAYMENT_METHOD
    retrySuccessProb = 0.0;
    paymentLinkSuccessProb = randomFloat(0.50, 0.80);
  }

  // Multiply by customer historical recovery factor
  const overallRecoveryMultiplier = customer.historicalRecoveryRate;
  const finalRetryProb = parseFloat((retrySuccessProb * overallRecoveryMultiplier).toFixed(2));
  const finalLinkProb = parseFloat((paymentLinkSuccessProb * overallRecoveryMultiplier).toFixed(2));

  // Determine ground-truth optimal action
  let optimalAction = 'stop';
  if (finalRetryProb >= 0.50 && finalRetryProb >= finalLinkProb) {
    optimalAction = 'intelligent_retry';
  } else if (finalLinkProb >= 0.40) {
    optimalAction = 'payment_link';
  }

  const groundTruthOutcome = {
    isSoftFailure,
    retrySuccessProb: finalRetryProb,
    paymentLinkSuccessProb: finalLinkProb,
    wouldRecoverIfRetried: finalRetryProb >= 0.50,
    wouldRecoverIfLinkSent: finalLinkProb >= 0.40,
    optimalAction
  };

  return {
    paymentId,
    amount,
    currency: 'INR',
    paymentMethod,
    failureReason,
    groundTruthOutcome
  };
}
