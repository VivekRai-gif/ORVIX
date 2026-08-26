import os
import json
from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "..", "..", "models", "recovery_model_v1.joblib")
    report_path = os.path.join(script_dir, "..", "..", "models", "evaluation_report.json")
    
    model_loaded = os.path.exists(model_path)
    report_data = None
    
    if os.path.exists(report_path):
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                report_data = json.load(f)
        except Exception:
            report_data = None

    return {
        "status": "ok",
        "service": "orvix-ml-service",
        "version": settings.VERSION,
        "modelStatus": "loaded" if model_loaded else "not_trained",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.ENV,
        "evaluation": report_data
    }

