"""
YASHUVERSE Custom ML Intelligence Service
Provides RESTful endpoints for activity classification, semantic embeddings,
duplicate entity resolution, skills extraction, claim verification, and model registry.
Compatible with FastAPI/Uvicorn, and includes a zero-dependency standard-library fallback server.
"""

import sys
import json
from typing import Dict, Any, List

from embeddings import generate_embedding, cosine_similarity
from classifier import activity_classifier
from entity_matcher import entity_matcher
from skills_extractor import skills_extractor
from claim_verifier import claim_verifier
from model_registry import model_registry

# Handler functions (framework agnostic)
def handle_health() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "yashuverse-ml",
        "active_models": model_registry.get_active_models(),
    }

def handle_classify(payload: Dict[str, Any]) -> Dict[str, Any]:
    text = payload.get("textContent", payload.get("text_content", ""))
    metadata = payload.get("metadata", {})
    result = activity_classifier.predict(text, metadata)
    return {
        "eventId": payload.get("eventId", payload.get("event_id", "evt-unknown")),
        **result
    }

def handle_embed(payload: Dict[str, Any]) -> Dict[str, Any]:
    text = payload.get("text", "")
    embedding = generate_embedding(text)
    return {
        "text": text[:100],
        "dimension": len(embedding),
        "embedding": embedding,
        "model_version": model_registry.get_active_models()["embedding_engine"]
    }

def handle_match_entities(payload: Dict[str, Any]) -> Dict[str, Any]:
    candidate = payload.get("candidate", {})
    existing = payload.get("existingCatalog", [])
    return entity_matcher.match_project(candidate, existing)

def handle_extract_skills(payload: Dict[str, Any]) -> Dict[str, Any]:
    artifact = payload.get("artifact", payload)
    skills = skills_extractor.extract_skills(artifact)
    return {
        "extractedCount": len(skills),
        "skills": skills,
        "model_version": model_registry.get_active_models()["skills_extractor"]
    }

def handle_verify_claim(payload: Dict[str, Any]) -> Dict[str, Any]:
    claim = payload.get("claim", {})
    evidence = payload.get("evidence", [])
    return claim_verifier.verify_claim(claim, evidence)

def handle_get_models() -> Dict[str, Any]:
    return {
        "active": model_registry.get_active_models(),
        "registry": model_registry.models
    }

def handle_rollback(payload: Dict[str, Any]) -> Dict[str, Any]:
    component = payload.get("component", "")
    target_version = payload.get("targetVersion", "")
    return model_registry.rollback(component, target_version)


# FastAPI Integration (if installed)
try:
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel

    app = FastAPI(
        title="YASHUVERSE Custom ML Intelligence Service",
        description="Production ML Intelligence Layer for Autonomous Portfolio Generation",
        version="1.0.0"
    )

    @app.get("/health")
    def api_health():
        return handle_health()

    @app.post("/classify-activity")
    async def api_classify(request: Request):
        payload = await request.json()
        return handle_classify(payload)

    @app.post("/embed-text")
    async def api_embed(request: Request):
        payload = await request.json()
        return handle_embed(payload)

    @app.post("/match-entities")
    async def api_match(request: Request):
        payload = await request.json()
        return handle_match_entities(payload)

    @app.post("/extract-skills")
    async def api_skills(request: Request):
        payload = await request.json()
        return handle_extract_skills(payload)

    @app.post("/verify-claim")
    async def api_verify(request: Request):
        payload = await request.json()
        return handle_verify_claim(payload)

    @app.get("/models")
    def api_models():
        return handle_get_models()

    @app.post("/models/rollback")
    async def api_rollback(request: Request):
        payload = await request.json()
        return handle_rollback(payload)

except ImportError:
    app = None


# Zero-dependency Fallback Server for Standalone Execution
if __name__ == "__main__":
    if app:
        try:
            import uvicorn
            print("[YASHUVERSE-ML] Launching with Uvicorn / FastAPI on port 8000...")
            uvicorn.run(app, host="0.0.0.0", port=8000)
            sys.exit(0)
        except ImportError:
            pass

    # Built-in HTTP server fallback using standard library
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import urllib.parse

    class NativeMLHandler(BaseHTTPRequestHandler):
        def _send_json(self, status: int, data: Any):
            body = json.dumps(data).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/health":
                self._send_json(200, handle_health())
            elif parsed.path == "/models":
                self._send_json(200, handle_get_models())
            else:
                self._send_json(404, {"error": "Not found"})

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path)
            length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                payload = json.loads(raw_body)
            except Exception:
                payload = {}

            if parsed.path == "/classify-activity":
                self._send_json(200, handle_classify(payload))
            elif parsed.path == "/embed-text":
                self._send_json(200, handle_embed(payload))
            elif parsed.path == "/match-entities":
                self._send_json(200, handle_match_entities(payload))
            elif parsed.path == "/extract-skills":
                self._send_json(200, handle_extract_skills(payload))
            elif parsed.path == "/verify-claim":
                self._send_json(200, handle_verify_claim(payload))
            elif parsed.path == "/models/rollback":
                self._send_json(200, handle_rollback(payload))
            else:
                self._send_json(404, {"error": "Not found"})

        def log_message(self, format, *args):
            return  # Suppress default noisy access logs

    server = HTTPServer(("0.0.0.0", 8000), NativeMLHandler)
    print("[YASHUVERSE-ML] Native Zero-Dependency HTTP Server listening on port 8000...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
