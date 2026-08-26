# ORVIX Machine Learning Intelligence Service

The ML service powers the ORVIX Revenue Recovery Prediction Engine using Python, FastAPI, and scikit-learn.

## Features & Goals
Predicts $P(\text{recovery} \mid \text{context}, \text{action})$ for candidate actions:
- `RETRY`
- `PAYMENT_LINK`
- `EMAIL`
- `HUMAN_ESCALATION`

### Features Used:
- `amount`
- `failure_reason`
- `payment_method`
- `customer_segment`
- `previous_successful_payments`
- `previous_failed_payments`
- `historical_recovery_rate`
- `attempt_count`
- `contact_count`
- `time_since_failure`
- `action`

---

## Training Pipeline & Metrics

To train or retrain the model on synthetic historical data:

```bash
python train.py
```

The script performs:
1. Data Ingestion from `simulator/data/synthetic_events.json`.
2. Multi-action observation matrix construction.
3. Train/Test Stratified Split (80/20).
4. Feature Preprocessing with scikit-learn `ColumnTransformer` (`OneHotEncoder` + `StandardScaler`).
5. Classifier Training with `LogisticRegression`.
6. Performance Evaluation: Accuracy, Precision, Recall, F1-Score, ROC-AUC.
7. Artifact Persistence (`models/recovery_model_v1.joblib` and `models/evaluation_report.json`).

---

## API Endpoints

### 1. Health Check
`GET /health`
Returns service status, model load status, and evaluation metrics.

### 2. Single Prediction
`POST /predict`

**Input Payload:**
```json
{
  "amount": 4500.0,
  "failure_reason": "INSUFFICIENT_FUNDS",
  "payment_method": "card",
  "customer_segment": "RETURNING",
  "previous_successful_payments": 5,
  "previous_failed_payments": 1,
  "historical_recovery_rate": 0.75,
  "attempt_count": 0,
  "contact_count": 0,
  "time_since_failure": 2.5,
  "action": "RETRY"
}
```

**Output:**
```json
{
  "probability": 0.71,
  "modelVersion": "v1"
}
```

### 3. Batch Action Ranking
`POST /predict-all`
Ranks all 4 candidate actions by Expected Recovery Value ($E[V] = P(\text{recovery}) \times \text{amount} - \text{cost}$).

---

## Model Limitations

See [MODEL_LIMITATIONS.md](file:///c:/Users/ASUS/OneDrive/Desktop/ORVIX/ml-service/MODEL_LIMITATIONS.md) for full details on:
1. Linear decision boundary limitations of Logistic Regression.
2. Synthetic simulator data distribution assumptions.
3. Single-step action independence assumption vs sequential RL policies.
