export function buildSubscriptionFailureEvent(customer, payment, eventId, timestamp) {
  return {
    eventId,
    eventType: 'subscription.halted',
    customerId: customer.customerId,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    failureReason: payment.failureReason || 'AUTO_DEBIT_FAILED',
    customerSegment: customer.customerSegment,
    previousSuccessfulPayments: customer.previousSuccessfulPayments,
    previousFailedPayments: customer.previousFailedPayments,
    historicalRecoveryRate: customer.historicalRecoveryRate,
    timestamp,
    groundTruthOutcome: payment.groundTruthOutcome,
    isSynthetic: true
  };
}
