import mongoose from 'mongoose';

const recoveryPredictionSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    probability: {
      type: Number,
      required: true,
      min: 0.0,
      max: 1.0
    },
    expectedValue: {
      type: Number,
      required: true,
      min: 0
    },
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  }
);

// Compound index to quickly fetch candidate predictions for a case
recoveryPredictionSchema.index({ caseId: 1, expectedValue: -1 });

export const RecoveryPrediction = mongoose.model('RecoveryPrediction', recoveryPredictionSchema);
export default RecoveryPrediction;
