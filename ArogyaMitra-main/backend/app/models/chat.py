from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatHistoryResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    messages: List[ChatMessage]
    
    class Config:
        populate_by_name = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
