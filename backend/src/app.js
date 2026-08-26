import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';
import razorpayWebhookRoutes from './routes/razorpayWebhook.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature', 'x-razorpay-event-id']
  })
);

// Middleware with rawBody capture for webhook cryptographic verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', razorpayWebhookRoutes);
app.use('/api', apiRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Root route placeholder
app.get('/', (req, res) => {
  res.json({
    message: 'ORVIX AI Revenue Recovery Intelligence API',
    healthCheck: '/api/health'
  });
});

export default app;
