# ORVIX Event Simulator

Synthetic payment failure and event generator for testing ORVIX decision & recovery orchestration workflows.

## Features (Phase 2+)
- Generates synthetic Razorpay `payment.failed`, `checkout.abandoned`, and `subscription.halted` events.
- Emulates merchant customer metadata, retry counts, and card failure reason codes.
- Pushes payloads to ORVIX Backend webhook ingestion endpoint.

## Run Baseline Test
```bash
npm install
npm start
```
