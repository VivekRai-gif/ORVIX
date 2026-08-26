import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    actor: {
      type: String,
      enum: ['system', 'ai_engine', 'merchant', 'customer'],
      default: 'system'
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }
);

// Compound index for chronological audit timeline of a case
auditLogSchema.index({ caseId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
