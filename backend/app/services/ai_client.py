import httpx
from typing import Any, Dict, Optional
from app.config import settings

class AIServiceClient:
    def __init__(self):
        self.base_url = settings.ai_service_url
        self.timeout = 30.0

    async def _post(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Generic POST to the AI service"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(f"{self.base_url}{endpoint}", json=payload)
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
