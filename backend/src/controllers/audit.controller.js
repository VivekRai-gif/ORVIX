import { AuditLog } from '../models/index.js';
import { isDbConnected } from '../config/db.js';

export const getAuditLogs = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ logs: [], total: 0, page: 1, pages: 1 });
    }
    const { eventType, actor, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    if (actor && actor !== 'all') {
      query.actor = actor;
    }

    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await AuditLog.countDocuments(query);

    return res.status(200).json({
      logs,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (error) {
    console.error('[Audit Controller Error]', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
