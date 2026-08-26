import { setSeed, randomInt, weightedChoice } from '../utils/random.js';
import { generateCustomer } from './customerGenerator.js';
import { generatePaymentDetails } from './paymentGenerator.js';
import { buildPaymentFailureEvent } from '../scenarios/paymentFailure.js';
import { buildCheckoutAbandonmentEvent } from '../scenarios/checkoutAbandonment.js';
import { buildSubscriptionFailureEvent } from '../scenarios/subscriptionFailure.js';

const EVENT_TYPE_WEIGHTS = [
  { value: 'payment.failed', weight: 70 },
  { value: 'subscription.halted', weight: 18 },
  { value: 'checkout.abandoned', weight: 12 }
];

export function generateDataset(count = 1000, seed = 42) {
  setSeed(seed);

  const events = [];
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 1; i <= count; i++) {
    const eventId = `evt_syn_${String(i).padStart(6, '0')}`;
    const customer = generateCustomer(i);
    const payment = generatePaymentDetails(customer, i);

    // Random timestamp within last 30 days
    const randomOffset = randomInt(0, thirtyDaysMs);
    const timestamp = new Date(now - randomOffset).toISOString();

    const selectedEventType = weightedChoice(EVENT_TYPE_WEIGHTS);

    let eventObject;
    if (selectedEventType === 'checkout.abandoned') {
      eventObject = buildCheckoutAbandonmentEvent(customer, payment, eventId, timestamp);
    } else if (selectedEventType === 'subscription.halted') {
      eventObject = buildSubscriptionFailureEvent(customer, payment, eventId, timestamp);
    } else {
      eventObject = buildPaymentFailureEvent(customer, payment, eventId, timestamp);
    }

    events.push(eventObject);
  }

  return events;
}
