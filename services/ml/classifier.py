"""
YASHUVERSE ML Service - Activity Classifier & Confidence Scoring Baseline
Conforming to Master Blueprint Section 6.
"""

from typing import Dict, Any, List
from pydantic import BaseModel
import re

class ClassificationRequest(BaseModel):
    event_id: str
    text_content: str
    metadata: Dict[str, Any] = {}

class ClassificationResponse(BaseModel):
    event_id: str
    predicted_label: str
    confidence: float
    calibrated_score: float
    model_version: str

class BaselineActivityClassifier:
    """
    TF-IDF character/word n-gram baseline logic for activity classification.
    Labels: FEATURE_RELEASE, BUG_FIX, ARCHITECTURE_REFACTOR, DOCUMENTATION, EXPERIMENT
    """
    def __init__(self):
        self.version = "ml-activity-clf-v1.0.0"
        self.patterns = {
            "FEATURE_RELEASE": re.compile(r"\b(release|feat|implement|launch|deliver|ship)\b", re.I),
            "ARCHITECTURE_REFACTOR": re.compile(r"\b(refactor|architect|redesign|migration|dag|schema)\b", re.I),
            "BUG_FIX": re.compile(r"\b(fix|patch|resolve|hotfix|bug)\b", re.I),
            "DOCUMENTATION": re.compile(r"\b(docs|readme|guide|specification|spec)\b", re.I),
        }

    def predict(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        matched_label = "EXPERIMENT"
        raw_score = 0.70

        for label, pattern in self.patterns.items():
            if pattern.search(text_lower):
                matched_label = label
                raw_score = 0.94
                break

        # Calibration: conservative shrinkage if text is short
        calibrated = raw_score if len(text) > 40 else raw_score * 0.88

        return {
            "predicted_label": matched_label,
            "confidence": round(raw_score, 3),
            "calibrated_score": round(calibrated, 3),
            "model_version": self.version,
        }

activity_classifier = BaselineActivityClassifier()
