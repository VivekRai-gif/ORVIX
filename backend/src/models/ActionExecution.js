import mongoose from 'mongoose';

const actionExecutionSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed'],
      default: 'pending',
      index: true
    },
    toolResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    executedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  }
);

// Compound index to look up executions by case and status
actionExecutionSchema.index({ caseId: 1, status: 1 });

export const ActionExecution = mongoose.model('ActionExecution', actionExecutionSchema);
export default ActionExecution;
