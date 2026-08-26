import dotenv from 'dotenv';
dotenv.config();

console.log('====================================================');
console.log(' ORVIX Revenue Risk & Webhook Event Simulator ');
console.log('====================================================');
console.log(`Target Backend URL: ${process.env.TARGET_BACKEND_URL || 'http://localhost:5000/api'}`);
console.log('Simulator initialized. Ready for Phase 2 synthetic test event generation.');
