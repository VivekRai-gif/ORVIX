import {
  RecoveryCase,
  Customer,
  Payment,
  RecoveryPrediction,
  ActionExecution,
  AuditLog
} from '../models/index.js';
import { isDbConnected } from '../config/db.js';
import { runOrchestrator } from '../agents/recoveryOrchestrator.js';
import { processActionOutcome } from '../services/outcomeService.js';

/**
 * POST /api/recovery/cases
 * Ingest payment & customer, create RecoveryCase with status AT_RISK and audit log
 */
export const createRecoveryCase = async (req, res, next) => {
  try {
    const { paymentId, customerId, amount = 1000, currency = 'INR', failureReason = 'PAYMENT_FAILED' } = req.body;

    if (!paymentId || !customerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: paymentId and customerId are required.'
      });
    }

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database disconnected. Cannot create recovery case.'
      });
    }

    // 1. Load or create Customer
    let customer = await Customer.findOne({ customerId });
    if (!customer) {
      customer = await Customer.create({
        customerId,
        segment: 'consumer',
        previousSuccessfulPayments: 1,
        previousFailedPayments: 1,
        historicalRecoveryRate: 0.50
      });
    }

    // 2. Load or create Payment
    let payment = await Payment.findOne({ paymentId });
    if (!payment) {
      payment = await Payment.create({
        paymentId,
        customerId,
        amount: parseFloat(amount),
        currency,
        paymentMethod: 'card',
        status: 'failed',
        failureReason
      });
    }

    // 3. Generate unique case ID
    const count = await RecoveryCase.countDocuments();
    const caseId = `case_rcv_${String(count + 1).padStart(6, '0')}`;

    // 4. Create RecoveryCase with status AT_RISK
    const newCase = await RecoveryCase.create({
      caseId,
      paymentId,
      customerId,
      amount: payment.amount,
      currency: payment.currency,
      failureReason: payment.failureReason,
      failureCategory: failureReason.toLowerCase().includes('bank') ? 'bank_outage' : 'soft_failure',
      status: 'AT_RISK',
      attemptCount: 0,
      contactCount: 0,
      expectedRecoveryValue: Math.round(payment.amount * 0.70)
    });

    // 5. Create Audit Log
    await AuditLog.create({
      caseId,
      eventType: 'CASE_CREATED',
      actor: 'system',
      message: `Recovery case initialized with status AT_RISK for payment ${paymentId} (₹${payment.amount})`,
      metadata: { customerId, failureReason: payment.failureReason }
    });

    return res.status(201).json({
      success: true,
      case: newCase
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recovery/cases
 * Query recovery cases with filters (status, failureReason, selectedAction, minAmount, maxAmount) and pagination
 */
export const getRecoveryCases = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, cases: [], total: 0, page: 1, pages: 1 });
    }

    const {
      status,
      failureReason,
      selectedAction,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (failureReason && failureReason !== 'all') {
      query.failureReason = failureReason;
    }

    if (selectedAction && selectedAction !== 'all') {
      query.selectedAction = selectedAction;
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } },
        { failureReason: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const cases = await RecoveryCase.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await RecoveryCase.countDocuments(query);

    return res.status(200).json({
      success: true,
      cases,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recovery/cases/:id
 * Detailed recovery case lookup returning case, customer, payment, predictions, actions, and audit logs
 */
export const getRecoveryCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database disconnected.' });
    }

    const rCase = await RecoveryCase.findOne({ caseId: id });
    if (!rCase) {
      return res.status(404).json({ success: false, error: `Recovery case '${id}' not found.` });
    }

    const customer = await Customer.findOne({ customerId: rCase.customerId });
    const payment = await Payment.findOne({ paymentId: rCase.paymentId });
    const predictions = await RecoveryPrediction.find({ caseId: id }).sort({ expectedValue: -1 });
    const actions = await ActionExecution.find({ caseId: id }).sort({ executedAt: -1 });
    const auditLogs = await AuditLog.find({ caseId: id }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      case: rCase,
      customer,
      payment,
      predictions,
      actions,
      auditLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recovery/cases/:id/decide
 * Run Recovery Orchestrator to diagnose case, compute ERVs, apply merchant policies, and return full decision
 */
export const decideRecoveryCase = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database disconnected.' });
    }

    const rCase = await RecoveryCase.findOne({ caseId: id });
    if (!rCase) {
      return res.status(404).json({ success: false, error: `Recovery case '${id}' not found.` });
    }

    const decision = await runOrchestrator(id);

    return res.status(200).json({
      success: true,
      ...decision
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recovery/cases/:id/execute
 * Execute the selected recovery action
 */
export const executeRecoveryAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actionToExecute = req.body.action || 'intelligent_retry';

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database disconnected.' });
    }

    const rCase = await RecoveryCase.findOne({ caseId: id });
    if (!rCase) {
      return res.status(404).json({ success: false, error: `Recovery case '${id}' not found.` });
    }

    const actionName = req.body.action || rCase.selectedAction || 'intelligent_retry';

    // Record Action Execution
    const execution = await ActionExecution.create({
      caseId: id,
      action: actionName,
      status: 'success',
      executedAt: new Date(),
      completedAt: new Date(),
      toolResponse: { status: 'COMPLETED', message: `Executed ${actionName} successfully.` }
    });

    rCase.attemptCount = (rCase.attemptCount || 0) + 1;
    rCase.selectedAction = actionName;
    rCase.status = 'recovered';
    rCase.recoveredAmount = rCase.amount;
    rCase.closedAt = new Date();
    await rCase.save();

    await AuditLog.create({
      caseId: id,
      eventType: 'ACTION_EXECUTED',
      actor: 'system',
      message: `Executed '${actionName}' action successfully. ₹${rCase.amount} recovered.`,
      metadata: { executionId: execution._id, action: actionName, recoveredAmount: rCase.amount }
    });

    return res.status(200).json({
      success: true,
      case: rCase,
      execution
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recovery/cases/:id/stop
 * Stop further recovery interventions
 */
export const stopRecoveryCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Policy limit reached' } = req.body;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database disconnected.' });
    }

    const rCase = await RecoveryCase.findOne({ caseId: id });
    if (!rCase) {
      return res.status(404).json({ success: false, error: `Recovery case '${id}' not found.` });
    }

    rCase.status = 'closed';
    rCase.closedAt = new Date();
    await rCase.save();

    await AuditLog.create({
      caseId: id,
      eventType: 'CASE_STOPPED',
      actor: 'system',
      message: `Stopped recovery interventions for case ${id}. Reason: ${reason}`,
      metadata: { reason }
    });

    return res.status(200).json({
      success: true,
      case: rCase
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recovery/cases/:id/escalate
 * Escalate case to human queue
 */
export const escalateRecoveryCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Requires manual human review' } = req.body;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database disconnected.' });
    }

    const rCase = await RecoveryCase.findOne({ caseId: id });
    if (!rCase) {
      return res.status(404).json({ success: false, error: `Recovery case '${id}' not found.` });
    }

    rCase.status = 'escalated';
    await rCase.save();

    await AuditLog.create({
      caseId: id,
      eventType: 'CASE_ESCALATED',
      actor: 'merchant',
      message: `Escalated case ${id} to human support queue. Reason: ${reason}`,
      metadata: { reason }
    });

    return res.status(200).json({
      success: true,
      case: rCase
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recovery/cases/:id/outcome
 * Record outcome of a recovery action (RECOVERED, FAILED, PENDING, STOPPED, ESCALATED, EXPIRED)
 */
export const recordActionOutcomeController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { executionId, outcome, failureReason, metadata } = req.body;

    const result = await processActionOutcome({
      caseId: id,
      executionId,
      outcome,
      failureReason,
      metadata
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
