"""
YASHUVERSE ML Intelligence - Entity Resolution & Duplicate Project Matcher
Performs hybrid semantic cosine distance and metadata Jaccard matching
to prevent duplicate portfolio projects when commits/repositories are discovered.
"""

from typing import Dict, Any, List, Optional
from embeddings import generate_embedding, cosine_similarity

class EntityMatcher:
    def __init__(self, merge_threshold: float = 0.88, related_threshold: float = 0.70):
        self.merge_threshold = merge_threshold
        self.related_threshold = related_threshold
        self.version = "ml-entity-matcher-v1.0.0"

    def match_project(
        self,
        candidate: Dict[str, Any],
        existing_catalog: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluates candidate project against existing project catalog.
        Returns match decision: 'duplicate_merge' | 'candidate_related' | 'distinct_entity'.
        """
        candidate_title = candidate.get("title", "")
        candidate_desc = candidate.get("description", "")
        candidate_repo = candidate.get("repoUrl", "").strip().lower()
        candidate_techs = set(t.lower() for t in candidate.get("technologies", []))

        # Generate candidate embedding
        candidate_text = f"{candidate_title}. {candidate_desc}"
        candidate_vec = generate_embedding(candidate_text)

        best_match: Optional[Dict[str, Any]] = None
        best_score = 0.0
        match_method = "none"

        for item in existing_catalog:
            item_repo = item.get("repoUrl", "").strip().lower()

            # 1. Exact Repository URL match (Ground truth identity)
            if candidate_repo and item_repo and candidate_repo == item_repo:
                return {
                    "decision": "duplicate_merge",
                    "matched_entity_id": item.get("entityId"),
                    "match_score": 1.0,
                    "match_method": "exact_repo_match",
                    "explanation": f"Repository URL exact match: {candidate_repo}",
                    "model_version": self.version,
                }

            # 2. Semantic Embedding Cosine Similarity
            item_title = item.get("title", "")
            item_desc = item.get("description", "")
            item_vec = item.get("embedding")
            if not item_vec:
                item_vec = generate_embedding(f"{item_title}. {item_desc}")

            sim = cosine_similarity(candidate_vec, item_vec)

            # 3. Technology Jaccard Overlap
            item_techs = set(t.lower() for t in item.get("technologies", []))
            jaccard = 0.0
            if candidate_techs and item_techs:
                intersection = len(candidate_techs.intersection(item_techs))
                union = len(candidate_techs.union(item_techs))
                jaccard = intersection / union if union > 0 else 0.0

            # Composite match score: 70% semantic embedding + 30% technology overlap
            composite = round(0.70 * sim + 0.30 * jaccard, 3)

            if composite > best_score:
                best_score = composite
                best_match = item
                match_method = "vector_cosine_jaccard"

        # Determine decision based on calibrated thresholds
        if best_match and best_score >= self.merge_threshold:
            decision = "duplicate_merge"
            explanation = f"High semantic similarity ({best_score}) with existing project: {best_match.get('title')}"
        elif best_match and best_score >= self.related_threshold:
            decision = "candidate_related"
            explanation = f"Moderate semantic overlap ({best_score}) with {best_match.get('title')}. Queued for human review."
        else:
            decision = "distinct_entity"
            explanation = "No matching canonical project found. Eligible for new canonical entity creation."

        return {
            "decision": decision,
            "matched_entity_id": best_match.get("entityId") if best_match and best_score >= self.related_threshold else None,
            "match_score": best_score,
            "match_method": match_method,
            "explanation": explanation,
            "model_version": self.version,
        }

entity_matcher = EntityMatcher()
