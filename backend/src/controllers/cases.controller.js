import { RecoveryCase, Customer, Payment, RecoveryPrediction, ActionExecution, AuditLog } from '../models/index.js';
import { isDbConnected } from '../config/db.js';

export const getCases = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ cases: [], total: 0, page: 1, pages: 1 });
    }
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } },
        { failureReason: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const cases = await RecoveryCase.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await RecoveryCase.countDocuments(query);

    return res.status(200).json({
      cases,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (error) {
    console.error('[Cases Controller Error]', error);
    return res.status(500).json({ error: 'Failed to fetch recovery cases' });
  }
};

export const getCaseById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(404).json({ error: 'Database disconnected. Recovery case unavailable.' });
    }
    const { id } = req.params;
    const recoveryCase = await RecoveryCase.findOne({ caseId: id });

    if (!recoveryCase) {
      return res.status(404).json({ error: 'Recovery case not found' });
    }

    const customer = await Customer.findOne({ customerId: recoveryCase.customerId });
    const payment = await Payment.findOne({ paymentId: recoveryCase.paymentId });
    const predictions = await RecoveryPrediction.find({ caseId: id }).sort({ expectedValue: -1 });
    const executions = await ActionExecution.find({ caseId: id }).sort({ executedAt: -1 });
    const auditLogs = await AuditLog.find({ caseId: id }).sort({ timestamp: -1 });

    return res.status(200).json({
      case: recoveryCase,
      customer,
      payment,
      predictions,
      executions,
      auditLogs
    });
  } catch (error) {
    console.error('[Case Details Controller Error]', error);
    return res.status(500).json({ error: 'Failed to fetch recovery case details' });
  }
};
