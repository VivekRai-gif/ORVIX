ORVIX --- AI Revenue Recovery Orchestrator

Version: 1.0
Status: MVP / Buildathon PRD
Track: Razorpay Buildathon --- AI Revenue Recovery
Frontend: React.js

1. Product Overview

Product Name

ORVIX

One-line pitch

An AI decision layer that dynamically selects, executes, and measures
the best recovery intervention for revenue at risk---using existing
payment infrastructure, merchant-defined guardrails, and measurable
incremental recovery.

Problem

Revenue loss does not happen through one failure mode. A payment can
fail, a checkout can be abandoned, a subscription can fail, or an
invoice can become overdue.

Basic recovery mechanisms can retry or remind customers, but the key
decision problem is:

For this specific revenue event, what should we do next to maximize
the probability of recovery while minimizing unnecessary
intervention?

ORVIX addresses this by combining diagnosis, recovery prediction,
expected recovery value, policy enforcement, action execution, outcome
tracking, and experimentation.

Brand Positioning

ORVIX stands for the product identity, not a specific recovery channel.

Tagline:

Decide the next best action. Recover more revenue.

Positioning:

ORVIX doesn't just retry failed payments. It decides the next best recovery action and proves the incremental revenue recovered.

Product thesis

ORVIX is not another payment retry system or chatbot.

It is an AI recovery decision and orchestration layer that sits
above payment infrastructure.

2. Goals

Primary Goals

Detect revenue at risk.

Diagnose why revenue is at risk.

Predict the probability of recovery for available actions.

Calculate expected recovery value for each action.

Select the best bounded recovery action.

Execute the approved action through tools.

Track whether revenue was recovered.

Stop or escalate when further intervention is not justified.

Maintain a complete audit trail.

Compare ORVIX against a baseline strategy and measure
incremental revenue recovered.

Secondary Goals

Explain every AI decision in human-readable language.

Give merchants configurable recovery policies.

Provide a real-time recovery dashboard.

Support Razorpay Test Mode integration.

Make the system easy to demonstrate in a 5-minute buildathon demo.

3. Non-Goals

The MVP will NOT:

Replace Razorpay's payment processing infrastructure.

Build a new payment gateway.

Automatically contact real customers without explicit merchant
configuration.

Make unrestricted payment decisions using an LLM.

Build a full CRM.

Build a production-grade collections/legal system.

Start with voice as a core dependency.

Voice recovery can be added as a later enhancement.

4. Target Users

Primary User --- Merchant / Revenue Operations Manager

Needs to:

Understand revenue at risk.

See why payments are failing.

Recover more revenue.

Avoid unnecessary customer contact.

Configure recovery rules.

Measure recovery performance.

Secondary User --- Support / Finance Team

Needs to:

Review escalated cases.

Understand AI decisions.

See the complete recovery history.

Take manual action where required.

Demo User --- Razorpay Evaluator

Needs to quickly understand:

The problem.

What is different.

How AI is used.

How actions are bounded.

Whether money recovery is actually measured.

5. Core User Journey

Razorpay Event / Synthetic Event
        ↓
Revenue-at-Risk Detection
        ↓
AI Diagnosis
        ↓
Recovery Prediction
        ↓
Expected Recovery Value
        ↓
Recovery Orchestrator
        ↓
Policy / Guardrail Check
        ↓
Action Planner
        ↓
Retry / Payment Link / Message / Escalation
        ↓
Outcome Tracking
        ↓
Recovered?
   ↙          ↘
 YES           NO
  ↓             ↓
STOP        Re-evaluate
                ↓
          STOP / ESCALATE
                ↓
       Audit + Experiment Engine

6. Core Product Modules

6.1 Revenue-at-Risk Detector

Purpose

Identify events that may cause revenue loss.

Initial event types

payment.failed

checkout abandonment

subscription payment failure

overdue invoice (synthetic for MVP)

Output

A Recovery Case.

Example:

{
  "caseId": "RC_1001",
  "amount": 4999,
  "currency": "INR",
  "failureReason": "INSUFFICIENT_FUNDS",
  "status": "AT_RISK"
}

7. AI Diagnosis Tool

Purpose

Understand what happened and classify the recovery opportunity.

Responsibilities

Classify failure.

Identify likely root cause.

Determine whether recovery is possible.

Identify suitable action types.

Generate explanation.

Failure categories

SOFT_FAILURE

HARD_FAILURE

TEMPORARY_FAILURE

CUSTOMER_ACTION_REQUIRED

UNKNOWN

Example

Payment failed
Reason: insufficient funds

Classification:
SOFT_FAILURE

Recovery possible:
YES

Recommended action candidates:
RETRY
MESSAGE
PAYMENT_LINK

8. Recovery Prediction Engine

Purpose

Estimate the probability of successful recovery for each available
action.

Initial approach

Use a simple supervised model such as:

Logistic Regression, or

XGBoost

The MVP should prioritize explainability and measurable performance over
model complexity.

Input features

Payment amount

Failure reason

Payment method

Customer segment

Previous successful payments

Previous failed payments

Previous recovery outcomes

Number of attempts

Time since failure

Historical action success rate

Customer engagement signals

Output

{
  "RETRY": 0.71,
  "PAYMENT_LINK": 0.55,
  "EMAIL": 0.32,
  "HUMAN_ESCALATION": 0.63
}

9. Expected Recovery Value Engine

For every possible action:

Expected Recovery Value
=
P(recovery | context, action)
×
Revenue at Risk
−
Intervention Cost

Example:

Revenue at Risk = ₹10,000

Retry:
0.70 × ₹10,000 - ₹1
= ₹6,999

Payment Link:
0.55 × ₹10,000 - ₹2
= ₹5,498

Human:
0.63 × ₹10,000 - ₹100
= ₹6,200

The orchestrator selects the action with the highest eligible expected
value.

The system must record the calculation for auditability.

10. Recovery Orchestrator

Purpose

Coordinate the complete decision-making loop.

Responsibilities

Receive Recovery Case.

Request diagnosis.

Request recovery probabilities.

Calculate expected recovery values.

Generate candidate actions.

Apply merchant policies.

Select an eligible action.

Execute the action through a controlled tool.

Track the outcome.

Re-evaluate if recovery fails.

Stop or escalate according to policy.

Key principle

The LLM must not directly execute payment operations.

Correct flow:

AI Decision
    ↓
Policy Engine
    ↓
Allowed?
    ↓
YES → Tool Execution
NO  → Reject / Alternative / Human Review

11. Action Tools

The MVP will support four primary actions.

11.1 Retry Tool

Attempts a permitted payment retry.

11.2 Payment Link Tool

Creates a Razorpay Test Mode Payment Link when appropriate.

11.3 Messaging Tool

Sends a recovery message through a configured channel.

Initial MVP:

Email

Future:

SMS

WhatsApp

11.4 Human Escalation Tool

Creates a case for manual intervention.

Future:

Voice recovery

Human support queue integration

12. Policy / Guardrail Engine

The policy engine prevents uncontrolled AI actions.

Merchant-configurable policies

Maximum retries: 2
Maximum customer contacts: 2
Recovery window: 7 days
Minimum expected recovery value: ₹100
Human escalation: Enabled

Mandatory stop conditions

Stop recovery when:

Payment succeeds.

Customer opts out.

Maximum retry limit is reached.

Maximum contact limit is reached.

Recovery window expires.

Payment is classified as non-recoverable.

Expected recovery value falls below threshold.

Merchant policy prohibits the action.

Example

if (paymentSucceeded) STOP;

if (customerOptedOut) STOP;

if (retryCount >= maxRetries) STOP;

if (expectedRecoveryValue < minimumExpectedValue) STOP;

13. Outcome Tracker

Every action must produce an outcome.

Possible outcomes

RECOVERED

FAILED

PENDING

STOPPED

ESCALATED

EXPIRED

Example

Action:
PAYMENT_LINK

Result:
PAYMENT_SUCCESS

Recovered:
₹18,500

Recovery Case:
CLOSED

14. Audit Trail

Every important event must be recorded.

Example

10:31:02
PAYMENT_FAILED

10:31:03
FAILURE_CLASSIFIED
→ SOFT_FAILURE

10:31:04
RECOVERY_PREDICTION
→ Retry: 71%
→ Payment Link: 55%
→ Human: 63%

10:31:04
EXPECTED_VALUE
→ Retry: ₹6,999

10:31:04
POLICY_CHECK
→ APPROVED

10:31:05
ACTION_EXECUTED
→ RETRY

10:32:12
PAYMENT_SUCCESS

10:32:12
REVENUE_RECOVERED
→ ₹4,999

The audit trail must show:

What happened?

What did AI decide?

Why?

Which policy allowed/rejected it?

What action was executed?

What was the result?

15. Experiment Engine

This is a core differentiator.

ORVIX must compare its strategy against a baseline.

Baseline Strategy

Example:

Payment Failed
      ↓
Fixed Retry
      ↓
Reminder
      ↓
Fixed Retry
      ↓
Stop

ORVIX Strategy

Payment Failed
      ↓
Diagnosis
      ↓
Prediction
      ↓
Expected Recovery Value
      ↓
Dynamic Action
      ↓
Outcome
      ↓
Re-evaluate / Stop

Required metrics

Revenue at risk

Revenue recovered

Recovery rate

Incremental revenue recovered

Number of interventions

Number of retries

Number of stopped cases

Number of escalations

Average intervention cost

Recovery by action

Recovery by failure type

Primary KPI

Incremental Revenue Recovered

Example:

Baseline:
₹4.8L recovered

ORVIX:
₹6.3L recovered

Incremental:
₹1.5L

All reported numbers must be generated from the actual experiment or
simulator.

16. Dashboard

16.1 Main Dashboard

Hero KPIs:

Revenue at Risk
₹10.2L

Revenue Recovered
₹6.3L

Recovery Rate
62%

Incremental Recovery
₹1.5L

Additional sections:

Recovery trend

Recovery by action

Recovery by failure reason

Cases by status

Baseline vs ORVIX

Recent recovery events

17. Recovery Cases Page

Columns:

Case ID
Customer
Amount
Failure Reason
AI Action
Expected Recovery
Status
Recovered Amount
Created At

Filters:

Status

Failure type

Amount range

Action

Date

18. Case Details Page

Display:

Payment Information

Payment ID

Amount

Payment method

Failure reason

Customer Context

Customer segment

Previous successes

Previous failures

Historical recovery rate

AI Decision

Diagnosis

Candidate actions

Recovery probabilities

Expected recovery values

Selected action

Explanation

Policy

Applicable rules

Approved / rejected

Timeline

Complete audit trail.

19. Experiment Page

Show:

                 Baseline       ORVIX

Cases              1000           1000
At Risk            ₹10L           ₹10L
Recovered          ₹4.8L          ₹6.3L
Recovery Rate       48%            63%
Attempts            1800           1210
Contacts            1650            920

Incremental Revenue
                     —            ₹1.5L

Also show confidence intervals / statistical notes when enough data is
available.

20. Policy Page

Merchant can configure:

Maximum retries
Maximum contacts
Recovery window
Minimum expected value
Allowed channels
Human escalation
High-value transaction threshold

Changes must be logged in the audit trail.

21. Audit Page

Searchable event log.

Filters:

Case

Action

Decision

Date

Result

AI confidence

22. Data Model

RecoveryCase

_id
caseId
paymentId
customerId
amount
currency
failureReason
failureCategory
status
attemptCount
contactCount
selectedAction
expectedRecoveryValue
recoveredAmount
createdAt
updatedAt
closedAt

Customer

_id
customerId
segment
previousSuccessfulPayments
previousFailedPayments
historicalRecoveryRate
optedOut
createdAt

RecoveryPrediction

_id
caseId
action
probability
expectedValue
modelVersion
createdAt

ActionExecution

_id
caseId
action
status
toolResponse
executedAt
completedAt

AuditLog

_id
caseId
eventType
actor
message
metadata
timestamp

Policy

_id
merchantId
maxRetries
maxContacts
recoveryWindowDays
minimumExpectedValue
humanEscalationEnabled
allowedChannels
updatedAt

23. API Design

Recovery

POST /api/recovery/cases
GET  /api/recovery/cases
GET  /api/recovery/cases/:id
POST /api/recovery/cases/:id/decide
POST /api/recovery/cases/:id/execute
POST /api/recovery/cases/:id/stop
POST /api/recovery/cases/:id/escalate

Webhooks

POST /api/webhooks/razorpay

Webhook processing must be idempotent.

Analytics

GET /api/analytics/overview
GET /api/analytics/recovery
GET /api/analytics/actions
GET /api/analytics/experiments

Policies

GET  /api/policies
PUT  /api/policies

24. Frontend Structure

React.js application:

src/
├── components/
│   ├── Navbar.jsx
│   ├── KPICard.jsx
│   ├── RecoveryTable.jsx
│   ├── DecisionTimeline.jsx
│   ├── ActionBadge.jsx
│   └── RecoveryChart.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── RecoveryCases.jsx
│   ├── CaseDetails.jsx
│   ├── Experiments.jsx
│   ├── Policies.jsx
│   └── AuditLogs.jsx
│
├── services/
│   └── api.js
│
├── App.jsx
└── main.jsx

25. Backend Structure

backend/
├── agents/
│   └── recoveryOrchestrator.js
│
├── services/
│   ├── paymentService.js
│   ├── predictionService.js
│   ├── recoveryService.js
│   ├── notificationService.js
│   └── auditService.js
│
├── policies/
│   └── recoveryPolicy.js
│
├── models/
│   ├── RecoveryCase.js
│   ├── Customer.js
│   ├── RecoveryPrediction.js
│   ├── ActionExecution.js
│   ├── AuditLog.js
│   └── Policy.js
│
├── routes/
│   ├── recovery.js
│   ├── analytics.js
│   ├── policies.js
│   └── webhooks.js
│
└── server.js

26. AI/ML Architecture

                  Recovery Case
                       ↓
                Feature Builder
                       ↓
              Prediction Model
                       ↓
         P(recovery | action, context)
                       ↓
            Expected Value Engine
                       ↓
               LLM Explanation
                       ↓
                Policy Engine
                       ↓
                 Action Tool

Important design principle

Do not make the LLM responsible for numerical truth.

Use:

ML/model for probability.

Deterministic code for expected value.

Policy engine for safety.

LLM for reasoning, classification where appropriate, and
explanation.

27. Synthetic Data Simulator

The MVP must include a simulator capable of generating at least 1,000
revenue-risk events.

Features should include:

Multiple failure types.

Multiple customer segments.

Different transaction amounts.

Different historical behavior.

Different action success probabilities.

Recoverable and non-recoverable cases.

Checkout abandonment events.

The simulator should produce realistic but clearly synthetic data.

28. Razorpay Test Mode Integration

Integration target:

Razorpay Test Mode
       ↓
Payment Events
       ↓
Webhook Receiver
       ↓
Recovery Case

Use Razorpay APIs only in Test Mode for the buildathon MVP.

Potential integrations:

Payment events

Payment Links

Subscription-related events

Webhooks

The product must clearly distinguish test/synthetic data from real
customer data.

29. Security & Safety Requirements

Never expose Razorpay secret keys to React.

Store credentials only on the backend.

Never allow the LLM to directly call unrestricted payment APIs.

Validate every AI-selected action through deterministic policies.

Verify webhook authenticity.

Make webhook processing idempotent.

Respect customer opt-out.

Enforce retry/contact limits.

Log every automated action.

Never fabricate recovery metrics.

30. Buildathon Demo

5-minute demo flow

Minute 1 --- Problem

Show:

₹10L revenue at risk across 1,000 events.

Minute 2 --- AI Diagnosis

Open one failed ₹18,500 payment.

Show:

Failure reason.

Customer context.

Recovery classification.

Minute 3 --- Decision

Show:

Retry         42%
Payment Link  71%
Email         31%
Human         58%

Then:

Payment Link has highest expected recovery value.

Policy approves.

Payment Link is created in Test Mode.

Minute 4 --- Recovery

Simulate/customer completes payment.

Webhook arrives.

Dashboard updates:

₹18,500 RECOVERED

Audit trail updates automatically.

Minute 5 --- Proof

Show:

Baseline recovered: ₹4.8L
ORVIX recovered: ₹6.3L

Incremental recovery:
₹1.5L

End with:

"We don't just identify revenue at risk. We decide what action is
worth taking, execute it safely, and prove the incremental revenue
recovered."

31. MVP Acceptance Criteria

The MVP is complete when:

React dashboard works.

Synthetic data generator creates 1,000+ events.

Revenue-at-risk cases are created.

Failure diagnosis works.

Recovery probability is generated.

Expected recovery value is calculated.

Orchestrator selects an action.

Policy engine can approve/reject actions.

At least three recovery tools work.

Stop rules work.

Outcome tracking works.

Audit trail works.

Baseline experiment works.

Incremental recovery is calculated.

Razorpay Test Mode integration works for the chosen demo flow.

No real customer data is used.

5-minute demo can be completed end-to-end.

32. Success Metrics

Primary

Incremental Revenue Recovered

Secondary

Recovery rate

Recovery probability calibration

False-positive rate

Intervention cost

Number of unnecessary interventions

Average recovery time

Escalation rate

Stop rate

Action-level recovery rate

33. Competitive Differentiation

ORVIX should not claim that Razorpay has no recovery functionality.

Razorpay already provides recovery primitives such as subscription
retries and Payment Link reminders.

The differentiation is:

ORVIX adds a dynamic intelligence layer that chooses the best
recovery intervention for each case and measures the incremental
revenue recovered against a baseline.

Differentiators

Dynamic action selection.

Expected-₹ optimization.

Context-aware recovery.

Bounded autonomous workflows.

Explicit stopping decisions.

Explainable decisions.

Baseline vs AI experimentation.

Incremental revenue measurement.

Merchant-configurable policies.

Auditability.

34. Future Roadmap

V1 --- Buildathon MVP

Payment failure recovery.

Retry.

Payment Link.

Email.

Human escalation.

AI diagnosis.

Recovery prediction.

Expected recovery value.

Guardrails.

Audit.

Experiment engine.

V2

Checkout abandonment.

Subscription recovery.

WhatsApp.

SMS.

Better ML models.

Merchant-specific model learning.

V3

Hinglish voice recovery.

Multi-agent recovery workflows.

Real-time policy optimization.

Reinforcement learning / contextual bandits.

Cross-channel optimization.

35. Final Product Principle

ORVIX should follow one core rule:

Do not ask "Can we take another recovery action?" Ask "Is another
recovery action worth taking?"

The system wins only when it can demonstrate:

More revenue recovered
+
Fewer unnecessary interventions
+
Bounded automation
+
Explainable decisions
+
Measurable incremental value

Final Architecture

                    RAZORPAY TEST MODE
                           │
                           ▼
                 Revenue Risk Detector
                           │
                           ▼
                    AI Diagnosis
                           │
                           ▼
                 Recovery Prediction
                           │
                           ▼
              Expected Recovery Value
                           │
                           ▼
                 RECOVERY ORCHESTRATOR
                           │
                  Policy / Guardrails
                           │
                    Action Planner
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
        Retry        Payment Link       Messaging
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    Outcome Tracker
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
              Recovered           Failed
                  │                 │
                 STOP        Re-evaluate / Stop
                  │                 │
                  └────────┬────────┘
                           ▼
                   Audit / Analytics
                           │
                           ▼
                   Experiment Engine
                           │
                           ▼
              INCREMENTAL ₹ RECOVERED

Core loop:

Detect → Diagnose → Predict → Optimize → Guard → Act → Measure →
Stop/Learn