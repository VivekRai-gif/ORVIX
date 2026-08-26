import os
from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "..", "..", "models", "recovery_model_v1.joblib")
    model_loaded = os.path.exists(model_path)

    return {
        "status": "ok",
        "service": "orvix-ml-service",
        "version": settings.VERSION,
        "modelStatus": "loaded" if model_loaded else "not_trained",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": settings.ENV
    }
