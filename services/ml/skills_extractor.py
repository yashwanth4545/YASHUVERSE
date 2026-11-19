"""
YASHUVERSE ML Intelligence - Evidence-Based Skills Extractor
Extracts technical competencies strictly bounded by verified repository evidence
(language distributions, topics, and sanitized README documentation).
"""

from typing import Dict, Any, List

class SkillsExtractor:
    def __init__(self):
        self.version = "ml-skills-extractor-v1.0.0"

    def extract_skills(self, artifact: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts verified skill records bound to evidence IDs.
        """
        extracted_skills: List[Dict[str, Any]] = []
        seen = set()

        metadata = artifact.get("metadata", {})
        languages = artifact.get("languages", {}).get("languages", {})
        readme = artifact.get("readme") or {}
        evidence_ids = artifact.get("evidenceIds", ["ev-repo-source-default"])

        # 1. Extract from Verified Language Byte Share
        for lang_name, lang_stats in languages.items():
            if lang_name.lower() in seen:
                continue
            seen.add(lang_name.lower())

            pct = lang_stats.get("percentage", 0)
            level = "Specialized" if pct >= 40 else ("Advanced" if pct >= 15 else "Proficient")

            extracted_skills.append({
                "name": lang_name,
                "category": "Languages & Core Systems",
                "level": level,
                "confidence": round(min(0.99, 0.85 + (pct / 500)), 2),
                "evidenceIds": evidence_ids,
                "provenance": f"Verified language distribution ({pct}% of codebase bytes)",
            })

        # 2. Extract from Sanitized README Technologies
        detected_techs = readme.get("technologiesDetected", [])
        for tech in detected_techs:
            if tech.lower() in seen:
                continue
            seen.add(tech.lower())

            category = "Full-Stack & Systems"
            if tech in ["PyTorch", "TensorFlow", "scikit-learn", "FastAPI"]:
                category = "Applied ML & NLP"
            elif tech in ["Docker", "Kubernetes", "PostgreSQL", "Supabase", "Redis"]:
                category = "Cloud & Data Infrastructure"

            extracted_skills.append({
                "name": tech,
                "category": category,
                "level": "Advanced",
                "confidence": 0.94,
                "evidenceIds": evidence_ids,
                "provenance": "Documented in repository README architecture manifest",
            })

        # 3. Extract from Repository Topics
        topics = metadata.get("topics", [])
        for topic in topics:
            topic_clean = topic.replace("-", " ").title()
            if topic_clean.lower() in seen or len(topic_clean) < 3:
                continue
            seen.add(topic_clean.lower())

            extracted_skills.append({
                "name": topic_clean,
                "category": "Specialized Domains",
                "level": "Proficient",
                "confidence": 0.88,
                "evidenceIds": evidence_ids,
                "provenance": f"Repository GitHub topic tag: {topic}",
            })

        return extracted_skills

skills_extractor = SkillsExtractor()
