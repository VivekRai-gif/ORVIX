import { isDbConnected } from '../config/db.js';

export const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'orvix-backend',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
