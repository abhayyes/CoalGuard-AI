from __future__ import annotations
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, HTTPException, Body, Response
from typing import Dict, Any
from app.services.ai_client import ai_client
import httpx

router = APIRouter()

@router.post("/predict-risk")
async def proxy_predict_risk(payload: Dict[str, Any] = Body(...)):
    try:
        result = await ai_client.predict_risk(payload)
        return result
    except httpx.HTTPStatusError as e:
        return Response(content=e.response.text, status_code=e.response.status_code, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@router.post("/detect-anomaly")
async def proxy_detect_anomaly(payload: Dict[str, Any] = Body(...)):
    try:
        result = await ai_client.detect_anomaly(payload)
        return result
    except httpx.HTTPStatusError as e:
        return Response(content=e.response.text, status_code=e.response.status_code, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@router.post("/analyze-mine-full")
async def proxy_analyze_mine(payload: Dict[str, Any] = Body(...)):
    try:
        result = await ai_client.analyze_mine_full(payload)
        return result
    except httpx.HTTPStatusError as e:
        return Response(content=e.response.text, status_code=e.response.status_code, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
