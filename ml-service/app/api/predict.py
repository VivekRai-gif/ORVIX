import os
import joblib
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict, AliasChoices

router = APIRouter()

# Model loader singleton
MODEL_PIPELINE = None
MODEL_VERSION = "v1"

def get_model():
    global MODEL_PIPELINE
    if MODEL_PIPELINE is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "..", "..", "models", "recovery_model_v1.joblib")
        if os.path.exists(model_path):
            MODEL_PIPELINE = joblib.load(model_path)
        else:
            raise RuntimeError(f"Trained model not found at {model_path}. Please run 'python train.py' first.")
    return MODEL_PIPELINE

class CaseContextRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    amount: float = Field(..., example=4500.0)
    failure_reason: str = Field(
        ...,
        validation_alias=AliasChoices("failure_reason", "failureReason"),
        example="INSUFFICIENT_FUNDS"
    )
    payment_method: str = Field(
        "card",
        validation_alias=AliasChoices("payment_method", "paymentMethod"),
        example="card"
    )
    customer_segment: str = Field(
        "RETURNING",
        validation_alias=AliasChoices("customer_segment", "customerSegment"),
        example="RETURNING"
    )
    previous_successful_payments: int = Field(
        0,
        validation_alias=AliasChoices("previous_successful_payments", "previousSuccessfulPayments"),
        example=5
    )
    previous_failed_payments: int = Field(
        0,
        validation_alias=AliasChoices("previous_failed_payments", "previousFailedPayments"),
        example=1
    )
    historical_recovery_rate: float = Field(
        0.50,
        validation_alias=AliasChoices("historical_recovery_rate", "historicalRecoveryRate"),
        example=0.75
    )
    attempt_count: int = Field(
        0,
        validation_alias=AliasChoices("attempt_count", "attemptCount"),
        example=0
    )
    contact_count: int = Field(
        0,
        validation_alias=AliasChoices("contact_count", "contactCount"),
        example=0
    )
    time_since_failure: float = Field(
        0.0,
        validation_alias=AliasChoices("time_since_failure", "timeSinceFailure"),
        example=2.5
    )
    action: str = Field(
        "RETRY",
        validation_alias=AliasChoices("action"),
        example="RETRY"
    )

class SinglePredictionResponse(BaseModel):
    probability: float = Field(..., example=0.71)
    modelVersion: str = Field("v1", example="v1")
    action: Optional[str] = Field(None, example="RETRY")

class CandidatePrediction(BaseModel):
    action: str
    probability: float
    expectedValue: float

class BatchPredictionResponse(BaseModel):
    caseId: Optional[str] = "case_syn_000001"
    amount: float
    modelVersion: str = "v1"
    rankings: List[CandidatePrediction]

@router.post("/predict", response_model=SinglePredictionResponse)
def predict_single_action(request: CaseContextRequest):
    try:
        model = get_model()
        
        # Prepare DataFrame input matching model training features exactly
        input_data = pd.DataFrame([{
            "amount": float(request.amount),
            "failure_reason": str(request.failure_reason),
            "payment_method": str(request.payment_method),
            "customer_segment": str(request.customer_segment),
            "previous_successful_payments": int(request.previous_successful_payments),
            "previous_failed_payments": int(request.previous_failed_payments),
            "historical_recovery_rate": float(request.historical_recovery_rate),
            "attempt_count": int(request.attempt_count),
            "contact_count": int(request.contact_count),
            "time_since_failure": float(request.time_since_failure),
            "action": str(request.action).upper()
        }])

        proba = float(model.predict_proba(input_data)[0, 1])
        prob_rounded = round(proba, 2)

        return SinglePredictionResponse(
            probability=prob_rounded,
            modelVersion=MODEL_VERSION,
            action=str(request.action).upper()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/predict-all", response_model=BatchPredictionResponse)
def predict_all_actions(request: CaseContextRequest):
    try:
        model = get_model()
        actions = ["RETRY", "PAYMENT_LINK", "EMAIL", "HUMAN_ESCALATION"]
        action_costs = {
            "RETRY": 10.0,
            "PAYMENT_LINK": 25.0,
            "EMAIL": 5.0,
            "HUMAN_ESCALATION": 250.0
        }

        rankings = []
        for act in actions:
            # Override attempt_count and contact_count based on candidate action
            attempts = 1 if act in ["RETRY", "HUMAN_ESCALATION"] else 0
            contacts = 1 if act in ["PAYMENT_LINK", "EMAIL", "HUMAN_ESCALATION"] else 0

            input_data = pd.DataFrame([{
                "amount": float(request.amount),
                "failure_reason": str(request.failure_reason),
                "payment_method": str(request.payment_method),
                "customer_segment": str(request.customer_segment),
                "previous_successful_payments": int(request.previous_successful_payments),
                "previous_failed_payments": int(request.previous_failed_payments),
                "historical_recovery_rate": float(request.historical_recovery_rate),
                "attempt_count": attempts,
                "contact_count": contacts,
                "time_since_failure": float(request.time_since_failure),
                "action": act
            }])

            proba = float(model.predict_proba(input_data)[0, 1])
            cost = action_costs.get(act, 10.0)
            expected_value = round(max(0.0, (proba * request.amount) - cost), 2)

            rankings.append(CandidatePrediction(
                action=act,
                probability=round(proba, 2),
                expectedValue=expected_value
            ))

        # Sort by Expected Value descending
        rankings.sort(key=lambda x: x.expectedValue, reverse=True)

        return BatchPredictionResponse(
            amount=request.amount,
            modelVersion=MODEL_VERSION,
            rankings=rankings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

