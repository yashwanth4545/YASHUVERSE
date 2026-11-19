"""
YASHUVERSE ML Intelligence - Test Suite
Tests embeddings, Platt-calibrated classification, entity resolution,
skills extraction, claim verification policy, and model registry rollback.
Runs with standard python test runner (unittest).
"""

import unittest
import math
from embeddings import generate_embedding, cosine_similarity
from classifier import activity_classifier
from entity_matcher import entity_matcher
from skills_extractor import skills_extractor
from claim_verifier import claim_verifier
from model_registry import model_registry

class TestMLIntelligenceSuite(unittest.TestCase):

    def test_embeddings_dimension_and_l2_normalization(self):
        """Verifies dense 384-d vector output and unit hypersphere norm."""
        text = "Autonomous AI agent engineering workspace and real-time cursor orchestrator"
        vec = generate_embedding(text)
        self.assertEqual(len(vec), 384, "Embedding must have exactly 384 dimensions for pgvector")

        # Norm must equal 1.0 (within float precision)
        norm = math.sqrt(sum(v * v for v in vec))
        self.assertAlmostEqual(norm, 1.0, places=3, msg="Embedding vector must be L2-normalized")

    def test_cosine_similarity_properties(self):
        """Verifies cosine similarity self-match and directional sensitivity."""
        vec_a = generate_embedding("Kubernetes microservices distributed deployment")
        vec_b = generate_embedding("Kubernetes microservices distributed deployment")
        vec_c = generate_embedding("Chocolate chip cookies baking recipe")

        self.assertAlmostEqual(cosine_similarity(vec_a, vec_b), 1.0, places=2)
        sim_ac = cosine_similarity(vec_a, vec_c)
        self.assertLess(sim_ac, 0.50, "Dissimilar topics must exhibit low cosine similarity")

    def test_classifier_labels_and_platt_calibration(self):
        """Verifies activity classification and calibrated probability output."""
        res_feat = activity_classifier.predict("Ship and launch feature release v2.0 for live agent cursors")
        self.assertEqual(res_feat["predicted_label"], "FEATURE_RELEASE")
        self.assertGreaterEqual(res_feat["calibrated_score"], 0.70)
        self.assertIn("model_version", res_feat)

        res_bug = activity_classifier.predict("Fix hotfix bug issue resolving runtime memory crash")
        self.assertEqual(res_bug["predicted_label"], "BUG_FIX")

        res_refactor = activity_classifier.predict("Refactor architecture redesign DAG pipeline schema")
        self.assertEqual(res_refactor["predicted_label"], "ARCHITECTURE_REFACTOR")

    def test_entity_matcher_duplicate_resolution(self):
        """Verifies duplicate project deduplication and distinct entity creation."""
        existing = [
            {
                "entityId": "proj-agent-core",
                "title": "Agent Core Engine",
                "description": "Multi-agent orchestration system for distributed tasks",
                "repoUrl": "https://github.com/yashwanth4545/agent-core",
                "technologies": ["TypeScript", "Node.js", "Docker"]
            }
        ]

        # Case 1: Exact repo URL match -> duplicate_merge
        candidate_exact = {
            "title": "Agent Core New Commits",
            "repoUrl": "https://github.com/yashwanth4545/agent-core",
            "technologies": ["TypeScript"]
        }
        res_exact = entity_matcher.match_project(candidate_exact, existing)
        self.assertEqual(res_exact["decision"], "duplicate_merge")
        self.assertEqual(res_exact["matched_entity_id"], "proj-agent-core")

        # Case 2: Unrelated project -> distinct_entity
        candidate_distinct = {
            "title": "Crypto Arbitrage Bot",
            "description": "High frequency automated crypto trading bot in Rust",
            "repoUrl": "https://github.com/yashwanth4545/crypto-bot",
            "technologies": ["Rust", "WebSockets"]
        }
        res_distinct = entity_matcher.match_project(candidate_distinct, existing)
        self.assertEqual(res_distinct["decision"], "distinct_entity")

    def test_evidence_bounded_skills_extractor(self):
        """Verifies skill extraction strictly backed by verified repository evidence."""
        mock_artifact = {
            "metadata": {"topics": ["machine-learning", "agentic-ai"]},
            "languages": {
                "languages": {
                    "TypeScript": {"bytes": 80000, "percentage": 80.0},
                    "Python": {"bytes": 20000, "percentage": 20.0}
                }
            },
            "readme": {
                "technologiesDetected": ["FastAPI", "PostgreSQL", "Docker"]
            },
            "evidenceIds": ["ev-repo-yashuverse-github"]
        }

        skills = skills_extractor.extract_skills(mock_artifact)
        self.assertGreaterEqual(len(skills), 4)

        ts_skill = next(s for s in skills if s["name"] == "TypeScript")
        self.assertEqual(ts_skill["level"], "Specialized")
        self.assertEqual(ts_skill["evidenceIds"], ["ev-repo-yashuverse-github"])

        fastapi_skill = next(s for s in skills if s["name"] == "FastAPI")
        self.assertEqual(fastapi_skill["category"], "Applied ML & NLP")

    def test_claim_verifier_policy_enforcement(self):
        """Verifies that unsupported or extraordinary claims are strictly blocked."""
        available_evidence = [
            {"evidenceId": "ev-github-release-1", "type": "github_release"},
            {"evidenceId": "ev-github-commit-42", "type": "github_commit"},
        ]

        # Case 1: No evidence IDs -> BLOCKED
        res_no_ev = claim_verifier.verify_claim(
            {"claimId": "c-1", "claimText": "Built real-time agent canvas", "evidenceIds": []},
            available_evidence
        )
        self.assertEqual(res_no_ev["verificationStatus"], "blocked")

        # Case 2: Extraordinary unproven claim -> BLOCKED (< 0.75)
        res_unproven = claim_verifier.verify_claim(
            {
                "claimId": "c-2",
                "claimText": "Founder and Chief Architect of company that raised $50M",
                "evidenceIds": ["ev-github-commit-42"],
                "confidenceScore": 0.60
            },
            available_evidence
        )
        self.assertEqual(res_unproven["verificationStatus"], "blocked")

        # Case 3: Verified claim with release proof -> VERIFIED (>= 0.92)
        res_verified = claim_verifier.verify_claim(
            {
                "claimId": "c-3",
                "claimText": "Shipped v1.0.0 release of autonomous agent workspace",
                "evidenceIds": ["ev-github-release-1"],
                "confidenceScore": 0.95
            },
            available_evidence
        )
        self.assertEqual(res_verified["verificationStatus"], "verified")
        self.assertEqual(res_verified["policyAction"], "AUTHORIZE_PUBLIC_PUBLICATION")

    def test_model_registry_and_rollback(self):
        """Verifies model version tracking and zero-downtime rollback."""
        active = model_registry.get_active_models()
        self.assertIn("activity_classifier", active)
        self.assertEqual(active["activity_classifier"], "ml-activity-clf-v1.0.0")

        # Rollback activity_classifier to v0.9.0
        rollback_res = model_registry.rollback("activity_classifier", "ml-activity-clf-v0.9.0")
        self.assertTrue(rollback_res["success"])
        self.assertEqual(model_registry.get_active_models()["activity_classifier"], "ml-activity-clf-v0.9.0")

        # Rollback back to v1.0.0
        rollback_restore = model_registry.rollback("activity_classifier", "ml-activity-clf-v1.0.0")
        self.assertTrue(rollback_restore["success"])
        self.assertEqual(model_registry.get_active_models()["activity_classifier"], "ml-activity-clf-v1.0.0")

if __name__ == "__main__":
    unittest.main()
