# ORVIX --- AI Revenue Recovery Intelligence & Orchestrator

[![Architecture](https://img.shields.io/badge/Architecture-3--Tier-indigo)](#system-architecture)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue)](#frontend-setup)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20MongoDB-green)](#backend-setup)
[![ML Service](https://img.shields.io/badge/ML%20Service-Python%20%7C%20FastAPI%20%7C%20scikit--learn-cyan)](#ml-service-setup)

> **Tagline:** Decide the next best action. Recover more revenue.

---

## 1. Executive Summary

**ORVIX** is an AI decision layer that dynamically selects, executes, and measures the best recovery intervention for revenue at risk---using existing payment infrastructure, merchant-defined guardrails, and measurable incremental recovery.

### The Decision Problem Solved
When payments fail or checkout is abandoned, traditional platforms trigger blanket retries or repetitive customer reminders. ORVIX solves the key decision problem:
> *For this specific revenue event, what should we do next to maximize the probability of recovery while minimizing unnecessary intervention?*

---
### 💳 Watch ORVIX in Action

<p align="center">
  <a href="https://www.youtube.com/watch?v=JKn0ZJKEY-E">
    <img src="https://img.youtube.com/vi/JKn0ZJKEY-E/maxresdefault.jpg"
         alt="ORVIX Product Demo"
         width="900">
  </a>
</p>

> **What if a failed payment didn't mean lost revenue?**

**ORVIX — AI Revenue Recovery Intelligence & Orchestrator**

**Detect → Diagnose → Predict → Optimize → Recover**

▶️ **[Watch the full demo on YouTube](https://www.youtube.com/watch?v=JKn0ZJKEY-E)**

---

## 2. Project Architecture Overview

The repository follows a clean, modular 3-tier micro-architecture:

```
orvix/
├── frontend/             # React.js + Vite + Tailwind CSS + Recharts + Axios
├── backend/              # Node.js + Express.js + Mongoose (REST & Orchestrator)
├── ml-service/           # Python FastAPI + scikit-learn + Pydantic (AI Engine)
├── simulator/            # Synthetic event generator & Razorpay webhook runner
├── docs/                 # Architectural specifications & PRD reference
├── .gitignore            # Top-level workspace gitignore
├── .env.example          # Environment variables template
└── README.md             # Project documentation
```

---

## 3. Quick Start & Execution Guide

### Prerequisites
- **Node.js**: v18.x or higher (`v22.x` recommended)
- **Python**: v3.10 or higher (`v3.13.x` recommended)
- **MongoDB**: Optional for Phase 1 local startup (Backend runs gracefully with or without local Mongo instance)

---

### Step 1: Start Backend Service (Port 5000)

```bash
cd backend
npm install   # (Already completed during initialization)
npm run dev   # Or `npm start`
```

Verify backend health check:
```bash
curl http://localhost:5000/api/health
# Output: {"status":"ok","service":"orvix-backend","timestamp":"...","environment":"development"}
```

---

### Step 2: Start ML Service (Port 8000)

```bash
cd ml-service
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
python main.py

# On Linux/macOS:
source venv/bin/activate
python main.py
```

Verify ML service health check:
```bash
curl http://localhost:8000/health
# Output: {"status":"ok","service":"orvix-ml-service","version":"1.0.0","timestamp":"...","environment":"development"}
```

---

### Step 3: Start React Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

Access dashboard in browser:
[http://localhost:5173](http://localhost:5173)

---

### Step 4: Run Event Simulator (Optional)

```bash
cd simulator
npm start
```

---

## 4. Verification & Testing

| Service | Health Check Endpoint | Expected HTTP Response |
|---|---|---|
| **Backend API** | `GET http://localhost:5000/api/health` | `HTTP 200` `{"status": "ok", "service": "orvix-backend"}` |
| **ML Engine** | `GET http://localhost:8000/health` | `HTTP 200` `{"status": "ok", "service": "orvix-ml-service"}` |
| **Frontend UI** | `GET http://localhost:5173` | Renders Dashboard with Live Health Indicators |

---

## 5. Implementation Summary & Roadmap

### Implemented in Phase 1 Foundation:
- [x] Complete directory structure (`frontend/`, `backend/`, `ml-service/`, `simulator/`, `docs/`).
- [x] React frontend initialized with Vite, Tailwind CSS, React Router, Recharts, and Axios.
- [x] Node.js Express backend initialized with CORS, Mongoose configuration, and `/api/health`.
- [x] Python FastAPI ML service initialized with virtual environment, scikit-learn, and `/health`.
- [x] Synthetic event simulator directory initialized with startup runner.
- [x] Full `.env.example` templates and `.gitignore` rules created across all directories.
- [x] Architectural documentation in `docs/architecture.md`.

### Next Steps (Phase 1 Business Logic):
- [ ] Database Schema definitions (Event, Diagnosis, Action, Audit, Experiment).
- [ ] Ingestion endpoint `POST /api/events/ingest`.
- [ ] Failure Category Classification Model in ML service.
- [ ] Recovery Probability prediction model \(P(R|A)\).
- [ ] Expected Recovery Value calculator \(EV(A)\).
- [ ] Merchant Policy Guardrails engine.
- [ ] Intervention Execution Action Planner.
- [ ] Razorpay Test Mode integration & webhook handlers.
