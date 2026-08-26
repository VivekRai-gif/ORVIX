export function buildCheckoutAbandonmentEvent(customer, payment, eventId, timestamp) {
  return {
    eventId,
    eventType: 'checkout.abandoned',
    customerId: customer.customerId,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    failureReason: 'CHECKOUT_DROPOFF',
    customerSegment: customer.customerSegment,
    previousSuccessfulPayments: customer.previousSuccessfulPayments,
    previousFailedPayments: customer.previousFailedPayments,
    historicalRecoveryRate: customer.historicalRecoveryRate,
    timestamp,
    groundTruthOutcome: {
      isSoftFailure: true,
      retrySuccessProb: 0.10,
      paymentLinkSuccessProb: 0.65,
      wouldRecoverIfRetried: false,
      wouldRecoverIfLinkSent: true,
      optimalAction: 'payment_link'
    },
    isSynthetic: true
  };
}
