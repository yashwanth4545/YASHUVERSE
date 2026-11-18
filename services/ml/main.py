"""
YASHUVERSE ML Service FastAPI App
Provides endpoints for activity classification, project matching, and confidence evaluation.
"""

from fastapi import FastAPI
from classifier import ClassificationRequest, ClassificationResponse, activity_classifier

app = FastAPI(title="YASHUVERSE Custom ML Intelligence Service", version="1.0.0")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "yashuverse-ml",
        "model_version": activity_classifier.version
    }

@app.post("/classify-activity", response_model=ClassificationResponse)
def classify_activity(req: ClassificationRequest):
    result = activity_classifier.predict(req.text_content)
    return ClassificationResponse(
        event_id=req.event_id,
        predicted_label=result["predicted_label"],
        confidence=result["confidence"],
        calibrated_score=result["calibrated_score"],
        model_version=result["model_version"]
    )
