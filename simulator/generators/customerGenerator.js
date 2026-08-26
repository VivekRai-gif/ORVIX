import { randomInt, randomFloat, weightedChoice } from '../utils/random.js';

const SEGMENTS = [
  { value: 'HIGH_VALUE', weight: 15 },
  { value: 'B2B', weight: 20 },
  { value: 'RETURNING', weight: 30 },
  { value: 'PRICE_SENSITIVE', weight: 20 },
  { value: 'NEW', weight: 15 }
];

export function generateCustomer(index) {
  const customerId = `cust_syn_${String(index).padStart(5, '0')}`;
  const customerSegment = weightedChoice(SEGMENTS);

  let previousSuccessfulPayments = 0;
  let previousFailedPayments = 0;
  let historicalRecoveryRate = 0.50;

  switch (customerSegment) {
    case 'HIGH_VALUE':
      previousSuccessfulPayments = randomInt(25, 120);
      previousFailedPayments = randomInt(0, 3);
      historicalRecoveryRate = randomFloat(0.80, 0.98);
      break;
    case 'B2B':
      previousSuccessfulPayments = randomInt(15, 60);
      previousFailedPayments = randomInt(0, 4);
      historicalRecoveryRate = randomFloat(0.75, 0.95);
      break;
    case 'RETURNING':
      previousSuccessfulPayments = randomInt(5, 30);
      previousFailedPayments = randomInt(1, 5);
      historicalRecoveryRate = randomFloat(0.60, 0.85);
      break;
    case 'PRICE_SENSITIVE':
      previousSuccessfulPayments = randomInt(1, 10);
      previousFailedPayments = randomInt(1, 6);
      historicalRecoveryRate = randomFloat(0.35, 0.65);
      break;
    case 'NEW':
    default:
      previousSuccessfulPayments = 0;
      previousFailedPayments = randomInt(0, 2);
      historicalRecoveryRate = randomFloat(0.20, 0.50);
      break;
  }

  return {
    customerId,
    customerSegment,
    previousSuccessfulPayments,
    previousFailedPayments,
    historicalRecoveryRate,
    isSynthetic: true
  };
}
