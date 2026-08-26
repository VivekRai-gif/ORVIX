import os
import json
import random
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_recovery_model():
    print("====================================================")
    print(" ORVIX Recovery Prediction Model Training Pipeline ")
    print("====================================================")

    # 1. Locate synthetic events dataset
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, "..", "simulator", "data", "synthetic_events.json")

    if not os.path.exists(dataset_path):
        print(f"[Warning] Dataset not found at {dataset_path}. Generating on the fly...")
        # Fallback dataset path inside workspace
        dataset_path = os.path.join(script_dir, "synthetic_events.json")

    with open(dataset_path, "r", encoding="utf-8") as f:
        events = json.load(f)

    print(f"[Train] Ingested {len(events)} synthetic recovery events.")

    # 2. Build multi-action training matrix (4 candidate actions per context)
    records = []
    np.random.seed(42)
    random.seed(42)

    candidate_actions = ["RETRY", "PAYMENT_LINK", "EMAIL", "HUMAN_ESCALATION"]

    for e in events:
        amount = e.get("amount", 2500)
        failure_reason = e.get("failureReason", "UNKNOWN")
        payment_method = e.get("paymentMethod", "card")
        customer_segment = e.get("customerSegment", "RETURNING")
        prev_success = e.get("previousSuccessfulPayments", 0)
        prev_failed = e.get("previousFailedPayments", 0)
        rec_rate = e.get("historicalRecoveryRate", 0.5)

        gt = e.get("groundTruthOutcome", {})
        retry_prob = gt.get("retrySuccessProb", 0.5)
        link_prob = gt.get("paymentLinkSuccessProb", 0.5)

        for action in candidate_actions:
            if action == "RETRY":
                prob = retry_prob
                attempts = 1
                contacts = 0
            elif action == "PAYMENT_LINK":
                prob = link_prob
                attempts = 0
                contacts = 1
            elif action == "EMAIL":
                prob = link_prob * 0.70
                attempts = 0
                contacts = 1
            else:  # HUMAN_ESCALATION
                prob = min(0.92, link_prob * 1.25)
                attempts = 1
                contacts = 1

            target = 1 if random.random() < prob else 0

            records.append({
                "amount": float(amount),
                "failure_reason": str(failure_reason),
                "payment_method": str(payment_method),
                "customer_segment": str(customer_segment),
                "previous_successful_payments": int(prev_success),
                "previous_failed_payments": int(prev_failed),
                "historical_recovery_rate": float(rec_rate),
                "attempt_count": attempts,
                "contact_count": contacts,
                "time_since_failure": float(random.randint(1, 48)),
                "action": action,
                "recovery_success": target
            })

    df = pd.DataFrame(records)
    print(f"[Train] Constructed training matrix with {len(df)} samples ({df['recovery_success'].sum()} positive outcomes).")

    # 3. Define feature columns
    cat_features = ["failure_reason", "payment_method", "customer_segment", "action"]
    num_features = [
        "amount",
        "previous_successful_payments",
        "previous_failed_payments",
        "historical_recovery_rate",
        "attempt_count",
        "contact_count",
        "time_since_failure"
    ]

    X = df[cat_features + num_features]
    y = df["recovery_success"]

    # 4. Train / Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 5. Build scikit-learn Preprocessing & Logistic Regression Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
            ("num", StandardScaler(), num_features)
        ]
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(max_iter=1000, C=1.0, random_state=42))
    ])

    # 6. Fit Model
    pipeline.fit(X_train, y_train)

    # 7. Evaluate Performance Metrics on Test Set
    y_pred = pipeline.predict(X_test)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]

    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_pred_proba))

    print("\n====================================================")
    print(" MODEL EVALUATION METRICS ")
    print("====================================================")
    print(f"- Accuracy:  {accuracy * 100:.2f}%")
    print(f"- Precision: {precision * 100:.2f}%")
    print(f"- Recall:    {recall * 100:.2f}%")
    print(f"- F1-Score:  {f1:.4f}")
    print(f"- ROC-AUC:   {roc_auc:.4f}")
    print("====================================================\n")

    # 8. Save Model & Metrics Artifacts
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, "recovery_model_v1.joblib")
    joblib.dump(pipeline, model_path)
    print(f"[Success] Saved trained pipeline to {model_path}")

    report = {
        "modelVersion": "v1",
        "algorithm": "Logistic Regression with OneHotEncoder & StandardScaler",
        "trainingSamples": len(X_train),
        "testSamples": len(X_test),
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4)
        }
    }

    report_path = os.path.join(models_dir, "evaluation_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"[Success] Saved evaluation report to {report_path}")

    return report

if __name__ == "__main__":
    train_recovery_model()
