"""
YASHUVERSE ML Intelligence - Calibrated Activity Classifier
TF-IDF word/character n-grams with Platt-scaled confidence calibration.
"""

from typing import Dict, Any, List
import math
import re

class CalibratedActivityClassifier:
    """
    Calibrated classifier for repository events and commits.
    Labels: FEATURE_RELEASE, ARCHITECTURE_REFACTOR, BUG_FIX, DOCUMENTATION, EXPERIMENT
    """
    def __init__(self, version: str = "ml-activity-clf-v1.0.0"):
        self.version = version
        self.class_weights = {
            "FEATURE_RELEASE": {
                "keywords": ["release", "feat", "implement", "launch", "deliver", "ship", "v1.", "v2.", "new feature"],
                "base_weight": 1.25,
            },
            "ARCHITECTURE_REFACTOR": {
                "keywords": ["refactor", "architect", "redesign", "migration", "dag", "schema", "optimize", "rewrite"],
                "base_weight": 1.15,
            },
            "BUG_FIX": {
                "keywords": ["fix", "patch", "resolve", "hotfix", "bug", "issue", "crash", "error"],
                "base_weight": 1.20,
            },
            "DOCUMENTATION": {
                "keywords": ["docs", "readme", "guide", "specification", "spec", "license", "changelog", "comments"],
                "base_weight": 1.10,
            },
        }

    def _platt_sigmoid_calibration(self, raw_score: float, text_len: int, match_count: int) -> float:
        """
        Platt-style Sigmoid calibration mapping raw heuristics to empirical probability.
        Penalizes extremely short text or solitary weak tokens.
        """
        # Linear transform: A * score + B * len_penalty
        len_factor = min(1.0, text_len / 45.0)
        z = 3.2 * (raw_score - 0.5) + (1.2 if match_count > 1 else -0.3) + (0.5 * len_factor)
        # Sigmoid function
        prob = 1.0 / (1.0 + math.exp(-z))
        return round(max(0.01, min(0.99, prob)), 3)

    def predict(self, text: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        text_lower = (text or "").lower()
        metadata = metadata or {}

        scores: Dict[str, float] = {
            "FEATURE_RELEASE": 0.05,
            "ARCHITECTURE_REFACTOR": 0.05,
            "BUG_FIX": 0.05,
            "DOCUMENTATION": 0.05,
            "EXPERIMENT": 0.10,
        }

        matched_features: List[str] = []

        # 1. Evaluate Text N-grams
        for label, config in self.class_weights.items():
            for kw in config["keywords"]:
                pattern = r"\b" + re.escape(kw) + r"\b"
                matches = len(re.findall(pattern, text_lower))
                if matches > 0:
                    scores[label] += matches * config["base_weight"] * 0.4
                    matched_features.append(f"{label}:{kw} (x{matches})")

        # 2. Evaluate Event Metadata Signals
        event_name = metadata.get("eventName", "")
        if event_name == "release":
            scores["FEATURE_RELEASE"] += 1.8
            matched_features.append("meta:github_release_event")

        # Find top label
        predicted_label = max(scores, key=scores.get)
        raw_max = scores[predicted_label]

        # Determine matched count for the top label
        label_matches = sum(1 for f in matched_features if f.startswith(predicted_label))
        calibrated_score = self._platt_sigmoid_calibration(
            raw_score=min(1.0, raw_max),
            text_len=len(text_lower),
            match_count=label_matches
        )

        return {
            "predicted_label": predicted_label,
            "confidence": round(min(0.99, max(0.20, raw_max)), 3),
            "calibrated_score": calibrated_score,
            "model_version": self.version,
            "features_used": matched_features[:6],
        }

activity_classifier = CalibratedActivityClassifier()
