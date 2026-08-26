import { Router } from 'express';
import { diagnoseCase } from '../services/diagnosisService.js';

const router = Router();

/**
 * POST /api/recovery/cases/:id/diagnose
 * Trigger AI diagnosis engine on a recovery case
 */
router.post('/recovery/cases/:id/diagnose', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await diagnoseCase(id);

    return res.status(200).json({
      success: true,
      caseId: id,
      diagnosis: result.diagnosis,
      case: result.case
    });
  } catch (error) {
    next(error);
  }
});

export default router;
