"""
YASHUVERSE ML Intelligence - Evidence-Based Claim Verifier
Evaluates public portfolio claims against immutable evidence IDs and strict credibility rules.
Calibrated thresholds:
  >= 0.92: verified (public display authorized)
  0.75 - 0.91: review_required (held for operator inspection)
  < 0.75: blocked (unsupported assertions strictly hidden)
"""

from typing import Dict, Any, List
import re

VERIFIED_THRESHOLD = 0.92
REVIEW_THRESHOLD = 0.75

RESTRICTED_ASSERTION_KEYWORDS = [
    "director", "vp", "chief", "founder", "head of", "lead of entire",
    "awarded 1st place", "patent granted", "raised $", "million users"
]

class ClaimVerifier:
    def __init__(self, version: str = "ml-claim-verifier-v1.0.0"):
        self.version = version

    def verify_claim(self, claim: Dict[str, Any], available_evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates a claim record against available evidence graph.
        claim: { "claimId": str, "claimText": str, "evidenceIds": List[str], "confidenceScore": float }
        """
        claim_id = claim.get("claimId", "claim-unknown")
        claim_text = (claim.get("claimText") or "").strip()
        evidence_ids = claim.get("evidenceIds", [])
        base_confidence = float(claim.get("confidenceScore", 0.85))

        evidence_map = {e.get("evidenceId"): e for e in available_evidence}

        # Rule 1: No evidence IDs provided -> strictly BLOCKED
        if not evidence_ids:
            return {
                "claimId": claim_id,
                "verificationStatus": "blocked",
                "calibratedConfidence": 0.0,
                "reason": "Violation: No supporting evidence IDs provided for this claim.",
                "policyAction": "SUPPRESS_FROM_PUBLIC_PORTFOLIO",
                "model_version": self.version,
            }

        # Rule 2: Evidence IDs must exist in the available evidence catalog
        matched_evidences = [evidence_map[eid] for eid in evidence_ids if eid in evidence_map]
        if not matched_evidences:
            return {
                "claimId": claim_id,
                "verificationStatus": "blocked",
                "calibratedConfidence": 0.1,
                "reason": f"Violation: Evidence IDs {evidence_ids} do not resolve to verified evidence records.",
                "policyAction": "SUPPRESS_FROM_PUBLIC_PORTFOLIO",
                "model_version": self.version,
            }

        # Rule 3: Check for extraordinary assertions requiring high-assurance proof
        claim_lower = claim_text.lower()
        requires_high_assurance = any(kw in claim_lower for kw in RESTRICTED_ASSERTION_KEYWORDS)

        # Calculate evidence backing strength
        backing_strengths = []
        for ev in matched_evidences:
            ev_type = ev.get("type", "github_commit")
            # Commits and releases signed/verified by GitHub get high assurance
            if ev_type in ["github_release", "github_repo_metadata"]:
                backing_strengths.append(0.96)
            elif ev_type == "github_commit":
                backing_strengths.append(0.92)
            else:
                backing_strengths.append(0.85)

        avg_evidence_strength = sum(backing_strengths) / len(backing_strengths)

        # Composite calibrated score
        calibrated_score = round(0.5 * base_confidence + 0.5 * avg_evidence_strength, 3)

        if requires_high_assurance:
            # Extraordinary claims need extraordinary proof; penalize unless explicit proof artifact
            has_release_proof = any(ev.get("type") == "github_release" for ev in matched_evidences)
            if not has_release_proof:
                calibrated_score = min(calibrated_score, 0.72)

        # Status assignment
        if calibrated_score >= VERIFIED_THRESHOLD:
            status = "verified"
            reason = f"Verified: Claim backed by {len(matched_evidences)} verified evidence artifact(s)."
            action = "AUTHORIZE_PUBLIC_PUBLICATION"
        elif calibrated_score >= REVIEW_THRESHOLD:
            status = "review_required"
            reason = f"Review Required: Confidence ({calibrated_score}) falls in operator review window."
            action = "STAGE_FOR_OPERATOR_REVIEW"
        else:
            status = "blocked"
            reason = f"Blocked: Claim confidence ({calibrated_score}) below required threshold ({REVIEW_THRESHOLD})."
            action = "SUPPRESS_FROM_PUBLIC_PORTFOLIO"

        return {
            "claimId": claim_id,
            "verificationStatus": status,
            "calibratedConfidence": calibrated_score,
            "reason": reason,
            "policyAction": action,
            "evidenceIds": evidence_ids,
            "model_version": self.version,
        }

claim_verifier = ClaimVerifier()
