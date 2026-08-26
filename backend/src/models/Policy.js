import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    merchantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'default_merchant',
      trim: true
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 0
    },
    maxContacts: {
      type: Number,
      default: 2,
      min: 0
    },
    recoveryWindowDays: {
      type: Number,
      default: 7,
      min: 1
    },
    minimumExpectedValue: {
      type: Number,
      default: 50,
      min: 0
    },
    humanEscalationEnabled: {
      type: Boolean,
      default: true
    },
    allowedChannels: {
      type: [String],
      default: ['retry', 'payment_link', 'email', 'human_escalation']
    },
    highValueThreshold: {
      type: Number,
      default: 50000,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export const Policy = mongoose.model('Policy', policySchema);
export default Policy;
