import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.predict import router as predict_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI Revenue Recovery Intelligence & Prediction Service"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(predict_router)

@app.get("/")
def read_root():
    model_path = os.path.join(os.path.dirname(__file__), "models", "recovery_model_v1.joblib")
    return {
        "service": "ORVIX ML Intelligence Service",
        "modelLoaded": os.path.exists(model_path),
        "healthCheck": "/health",
        "predictEndpoint": "/predict"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
