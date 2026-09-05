import { Customer, RecoveryCase } from '../models/index.js';
import { isDbConnected } from '../config/db.js';

/**
 * GET /api/customers
 * Returns paginated customer recovery profiles enriched with total cases, revenue at risk, and recovered amounts
 */
export const getCustomers = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, customers: [], total: 0, page: 1, pages: 1 });
    }

    const { search, segment, page = 1, limit = 20 } = req.query;
    const query = {};

    if (segment && segment !== 'all') {
      query.segment = segment.toLowerCase();
    }

    if (search) {
      query.$or = [
        { customerId: { $regex: search, $options: 'i' } },
        { segment: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find(query)
      .sort({ previousSuccessfulPayments: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Customer.countDocuments(query);

    // Enrich with aggregated case metrics
    const customerIds = customers.map(c => c.customerId);
    const caseAgg = await RecoveryCase.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: '$customerId',
          totalCases: { $sum: 1 },
          atRiskAmount: { $sum: '$amount' },
          recoveredAmount: { $sum: '$recoveredAmount' }
        }
      }
    ]);

    const caseMap = new Map();
    caseAgg.forEach(item => caseMap.set(item._id, item));

    const enrichedCustomers = customers.map(c => {
      const metrics = caseMap.get(c.customerId) || { totalCases: 0, atRiskAmount: 0, recoveredAmount: 0 };
      return {
        ...c.toObject(),
        totalCases: metrics.totalCases,
        atRiskAmount: metrics.atRiskAmount,
        recoveredAmount: metrics.recoveredAmount
      };
    });

    return res.status(200).json({
      success: true,
      customers: enrichedCustomers,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/customers/:id
 * Fetch detailed customer context profile along with case history
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database disconnected.' });
    }

    const customer = await Customer.findOne({ customerId: id });
    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer '${id}' not found.` });
    }

    const cases = await RecoveryCase.find({ customerId: id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      customer,
      cases
    });
  } catch (error) {
    next(error);
  }
};
