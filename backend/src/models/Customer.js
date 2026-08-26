import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    segment: {
      type: String,
      enum: ['NEW', 'RETURNING', 'HIGH_VALUE', 'PRICE_SENSITIVE', 'B2B', 'ENTERPRISE', 'SMB', 'CONSUMER', 'VIP'],
      default: 'CONSUMER',
      uppercase: true,
      index: true
    },
    previousSuccessfulPayments: {
      type: Number,
      default: 0,
      min: 0
    },
    previousFailedPayments: {
      type: Number,
      default: 0,
      min: 0
    },
    historicalRecoveryRate: {
      type: Number,
      default: 0.0,
      min: 0.0,
      max: 1.0
    },
    optedOut: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
