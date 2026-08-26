import mongoose from 'mongoose';

const recoveryCaseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    paymentId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    customerId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true
    },
    failureReason: {
      type: String,
      default: null
    },
    failureCategory: {
      type: String,
      index: true,
      default: 'unknown'
    },
    status: {
      type: String,
      enum: ['AT_RISK', 'open', 'in_progress', 'recovered', 'failed', 'closed', 'escalated'],
      default: 'AT_RISK',
      index: true
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0
    },
    contactCount: {
      type: Number,
      default: 0,
      min: 0
    },
    selectedAction: {
      type: String,
      default: null
    },
    expectedRecoveryValue: {
      type: Number,
      default: 0,
      min: 0
    },
    recoveredAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for active recovery cases by customer
recoveryCaseSchema.index({ customerId: 1, status: 1 });

export const RecoveryCase = mongoose.model('RecoveryCase', recoveryCaseSchema);
export default RecoveryCase;
