from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
from typing import Any, List, Optional
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class AssistantChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"  # "en" | "hi" | "auto"
    mine_id: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = []


class QueryQuickAction(BaseModel):
    label: str
    action_type: str  # "navigate" | "filter" | "query"
    payload: str


class AssistantChatResponse(BaseModel):
    reply: str
    language: str
    data_context: Optional[Dict[str, Any]] = None
    quick_actions: Optional[List[QueryQuickAction]] = None
