"""
YASHUVERSE ML Intelligence - Model Registry and Version Manager
Maintains active and historical models, performance metrics, and zero-downtime rollback.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class ModelRegistry:
    def __init__(self):
        self.models: Dict[str, Dict[str, Any]] = {
            "activity_classifier": {
                "active_version": "ml-activity-clf-v1.0.0",
                "versions": {
                    "ml-activity-clf-v1.0.0": {
                        "version": "ml-activity-clf-v1.0.0",
                        "registered_at": "2026-03-01T00:00:00Z",
                        "status": "active",
                        "calibration": "platt_sigmoid",
                        "f1_score": 0.942,
                        "accuracy": 0.951,
                    },
                    "ml-activity-clf-v0.9.0": {
                        "version": "ml-activity-clf-v0.9.0",
                        "registered_at": "2026-02-15T00:00:00Z",
                        "status": "deprecated",
                        "calibration": "linear",
                        "f1_score": 0.885,
                        "accuracy": 0.890,
                    }
                }
            },
            "embedding_engine": {
                "active_version": "ml-minilm-embed-v1.0.0",
                "versions": {
                    "ml-minilm-embed-v1.0.0": {
                        "version": "ml-minilm-embed-v1.0.0",
                        "registered_at": "2026-03-01T00:00:00Z",
                        "status": "active",
                        "dimension": 384,
                        "metric": "cosine",
                        "mrr": 0.912,
                    }
                }
            },
            "entity_matcher": {
                "active_version": "ml-entity-matcher-v1.0.0",
                "versions": {
                    "ml-entity-matcher-v1.0.0": {
                        "version": "ml-entity-matcher-v1.0.0",
                        "registered_at": "2026-03-01T00:00:00Z",
                        "status": "active",
                        "merge_threshold": 0.88,
                        "related_threshold": 0.70,
                        "precision": 0.978,
                    }
                }
            },
            "skills_extractor": {
                "active_version": "ml-skills-extractor-v1.0.0",
                "versions": {
                    "ml-skills-extractor-v1.0.0": {
                        "version": "ml-skills-extractor-v1.0.0",
                        "registered_at": "2026-03-01T00:00:00Z",
                        "status": "active",
                        "grounding": "evidence_bounded",
                    }
                }
            },
            "claim_verifier": {
                "active_version": "ml-claim-verifier-v1.0.0",
                "versions": {
                    "ml-claim-verifier-v1.0.0": {
                        "version": "ml-claim-verifier-v1.0.0",
                        "registered_at": "2026-03-01T00:00:00Z",
                        "status": "active",
                        "verified_threshold": 0.92,
                        "review_threshold": 0.75,
                    }
                }
            }
        }

    def get_active_models(self) -> Dict[str, str]:
        """Returns the currently active model version for each service component."""
        return {name: config["active_version"] for name, config in self.models.items()}

    def get_model_history(self, component: str) -> Optional[List[Dict[str, Any]]]:
        if component not in self.models:
            return None
        return list(self.models[component]["versions"].values())

    def rollback(self, component: str, target_version: str) -> Dict[str, Any]:
        """
        Safely rolls back a component to a previously registered version.
        Guarantees zero downtime by updating the reference pointer.
        """
        if component not in self.models:
            return {"success": False, "error": f"Component '{component}' not found in registry."}

        versions = self.models[component]["versions"]
        if target_version not in versions:
            return {"success": False, "error": f"Version '{target_version}' not found for '{component}'."}

        old_active = self.models[component]["active_version"]
        versions[old_active]["status"] = "inactive"
        versions[target_version]["status"] = "active"
        self.models[component]["active_version"] = target_version

        return {
            "success": True,
            "component": component,
            "previous_version": old_active,
            "current_version": target_version,
            "rollback_timestamp": datetime.now(timezone.utc).isoformat(),
        }

model_registry = ModelRegistry()
