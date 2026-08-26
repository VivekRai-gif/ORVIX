import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
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
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'nach', 'wallet'],
      default: 'card'
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      required: true,
      index: true
    },
    failureReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying customer payments by status
paymentSchema.index({ customerId: 1, status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
