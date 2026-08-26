import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect Database (non-blocking)
connectDB();

app.listen(PORT, () => {
  console.log(`[ORVIX Backend] Server running on http://localhost:${PORT}`);
  console.log(`[ORVIX Backend] Health Check: http://localhost:${PORT}/api/health`);
});
