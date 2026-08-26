import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { getCases, getCaseById } from '../controllers/cases.controller.js';
import {
  createRecoveryCase,
  getRecoveryCases,
  getRecoveryCaseById,
  decideRecoveryCase,
  executeRecoveryAction,
  stopRecoveryCase,
  escalateRecoveryCase,
  recordActionOutcomeController
} from '../controllers/recovery.controller.js';

import { getPolicy, updatePolicy } from '../controllers/policies.controller.js';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { getExperimentStats } from '../controllers/experiments.controller.js';

import diagnosisRoutes from './diagnosis.routes.js';

const router = Router();

// Health Check
router.get('/health', getHealth);

// Dashboard APIs
router.get('/dashboard/stats', getDashboardStats);

// Legacy Cases Compatibility APIs
router.get('/cases', getCases);
router.get('/cases/:id', getCaseById);

// Specific Recovery Case REST APIs
router.post('/recovery/cases', createRecoveryCase);
router.get('/recovery/cases', getRecoveryCases);
router.get('/recovery/cases/:id', getRecoveryCaseById);
router.post('/recovery/cases/:id/decide', decideRecoveryCase);
router.post('/recovery/cases/:id/execute', executeRecoveryAction);
router.post('/recovery/cases/:id/outcome', recordActionOutcomeController);
router.post('/recovery/cases/:id/stop', stopRecoveryCase);
router.post('/recovery/cases/:id/escalate', escalateRecoveryCase);

// Diagnosis API
router.use('/', diagnosisRoutes);

// Merchant Policy APIs
router.get('/policies', getPolicy);
router.put('/policies', updatePolicy);

// Audit Logs APIs
router.get('/audit-logs', getAuditLogs);

// Experiment Analytics APIs
router.get('/experiments/stats', getExperimentStats);
router.get('/analytics/experiments', getExperimentStats);

export default router;
