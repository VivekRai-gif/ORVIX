# ORVIX Architecture & Event Orchestration

## Overview
**ORVIX** is an AI Decision Layer and Revenue Recovery Orchestrator designed to sit on top of existing payment gateway infrastructure (such as Razorpay). Instead of taking blanket retry actions or sending blind customer notifications, ORVIX evaluates revenue-at-risk events dynamically, calculates expected recovery value (₹), enforces merchant policy guardrails, executes optimal recovery workflows, and tracks incremental revenue recovered against baseline strategies.

---

## Technical Stack Architecture

```
                                  +-----------------------+
                                  |   Razorpay Gateway /  |
                                  |   Event Simulator     |
                                  +-----------+-----------+
                                              |
                                              v (Webhooks / Events)
+-----------------------------------------------------------------------------------+
| Node.js / Express Backend (Port 5000)                                              |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  | Webhook Ingestion  |   | Recovery Orchestrator |   | Experiment & Baseline  |  |
|  +---------+----------+   +-----------+-----------+   +-----------+------------+  |
|            |                          |                           |               |
|            +--------------------------+---------------------------+               |
|                                       |                                           |
|                                       v                                           |
|                            MongoDB / Mongoose Models                              |
+---------------------------------------+-------------------------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
+---------------------------------------+   +---------------------------------------+
| Python FastAPI ML Engine (Port 8000)  |   | React + Vite Frontend (Port 5173)     |
|                                       |   |                                       |
| - AI Diagnosis Engine                 |   | - Real-time Recovery Dashboard        |
| - Recovery Probability Model          |   | - Intervention Audit Log              |
| - Expected-Value (₹) Optimizer        |   | - Merchant Guardrails & Policies      |
| - Explainability Generator            |   | - Incremental Revenue Measurement     |
+---------------------------------------+   +---------------------------------------+
```

---

## Core Operational Loop
1. **Detect:** Capture payment failure, checkout abandonment, or subscription halt.
2. **Diagnose:** AI engine classifies failure category (e.g. temporary bank outage vs insufficient funds vs invalid details).
3. **Predict:** Model estimates recovery probability \(P(R|A)\) for candidate actions \(A\).
4. **Optimize:** Calculate Expected Recovery Value \(EV(A) = P(R|A) \times \text{Amount} - \text{InterventionCost}(A)\).
5. **Guard:** Policy check validates action against merchant-defined limits (e.g. max retries, max contact frequency).
6. **Act:** Execute optimal action (e.g. intelligent retry, dynamic Payment Link, interactive reminder, or human escalation).
7. **Measure:** Outcome tracker logs recovered revenue and evaluates against control baseline.

---

## Repository Components
- `/frontend`: React SPA built with Vite, Tailwind CSS, Recharts, and Axios.
- `/backend`: Node.js Express server handling API routing, database models, policy checks, and orchestrating interventions.
- `/ml-service`: FastAPI Python service serving scikit-learn models and AI explanation generators.
- `/simulator`: Synthetic event generator emulating Razorpay webhook payloads for end-to-end testing.
- `/docs`: Architectural specifications and PRD references.
