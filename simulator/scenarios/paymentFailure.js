export function buildPaymentFailureEvent(customer, payment, eventId, timestamp) {
  return {
    eventId,
    eventType: 'payment.failed',
    customerId: customer.customerId,
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    failureReason: payment.failureReason,
    customerSegment: customer.customerSegment,
    previousSuccessfulPayments: customer.previousSuccessfulPayments,
    previousFailedPayments: customer.previousFailedPayments,
    historicalRecoveryRate: customer.historicalRecoveryRate,
    timestamp,
    groundTruthOutcome: payment.groundTruthOutcome,
    isSynthetic: true
  };
}
