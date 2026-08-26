import { Policy } from '../models/index.js';
import { isDbConnected } from '../config/db.js';

export const getPolicy = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        merchantId: 'default_merchant',
        maxRetries: 3,
        maxContacts: 2,
        recoveryWindowDays: 7,
        minimumExpectedValue: 50,
        humanEscalationEnabled: true,
        allowedChannels: ['retry', 'payment_link', 'email']
      });
    }
    let policy = await Policy.findOne({ merchantId: 'default_merchant' });
    if (!policy) {
      policy = await Policy.create({
        merchantId: 'default_merchant',
        maxRetries: 3,
        maxContacts: 2,
        recoveryWindowDays: 7,
        minimumExpectedValue: 50,
        humanEscalationEnabled: true,
        allowedChannels: ['retry', 'payment_link', 'email']
      });
    }
    return res.status(200).json(policy);
  } catch (error) {
    console.error('[Policy Controller Error]', error);
    return res.status(500).json({ error: 'Failed to fetch policy' });
  }
};

export const updatePolicy = async (req, res) => {
  try {
    const {
      maxRetries,
      maxContacts,
      recoveryWindowDays,
      minimumExpectedValue,
      humanEscalationEnabled,
      allowedChannels
    } = req.body;

    const policy = await Policy.findOneAndUpdate(
      { merchantId: 'default_merchant' },
      {
        maxRetries,
        maxContacts,
        recoveryWindowDays,
        minimumExpectedValue,
        humanEscalationEnabled,
        allowedChannels
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(policy);
  } catch (error) {
    console.error('[Policy Update Error]', error);
    return res.status(500).json({ error: 'Failed to update merchant policy' });
  }
};
