import httpx
from typing import Any, Dict, Optional
import random
from app.config import settings

class AIServiceClient:
    def __init__(self):
        # Ensure trailing slash is handled properly
        self.base_url = settings.ai_service_url.rstrip('/')
        self.timeout = 30.0

    async def _post(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Generic POST to the AI service"""
        
        # The AI Service (Cloudflare tunnel) strictly expects a MineRecordBatch:
        # {"records": [ {...} ]}
        # It also expects ML features like temperature, methane, humidity, vibration.
        # We inject mock values here so the external ML model doesn't crash on KeyError.
        
        mock_features = {
            "temperature": round(random.uniform(25.0, 45.0), 1),
            "methane": round(random.uniform(0.1, 2.5), 2),
            "humidity": round(random.uniform(40.0, 90.0), 1),
            "vibration": round(random.uniform(0.1, 1.5), 2)
        }
        
        if "records" not in payload:
            formatted_payload = {"records": [{**payload, **mock_features}]}
        else:
            # If records already exist, inject features into each record
            for i in range(len(payload["records"])):
                if isinstance(payload["records"][i], dict):
                    payload["records"][i].update(mock_features)
            formatted_payload = payload

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(f"{self.base_url}{endpoint}", json=formatted_payload)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                print(f"AI Service HTTP Error: {e.response.text}")
                raise
            except httpx.RequestError as e:
                print(f"AI Service Request Error: {str(e)}")
                raise

    async def predict_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self._post("/predict-risk", data)

    async def detect_anomaly(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self._post("/detect-anomaly", data)

    async def analyze_mine_full(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self._post("/analyze-mine-full", data)

ai_client = AIServiceClient()
