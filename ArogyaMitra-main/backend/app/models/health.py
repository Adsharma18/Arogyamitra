from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class VitalsLogCreate(BaseModel):
    blood_pressure: Optional[str] = None # format "120/80"
    heart_rate: Optional[int] = None
    blood_sugar: Optional[int] = None
    sleep_hours: Optional[float] = None
    notes: Optional[str] = None

class VitalsLogResponse(VitalsLogCreate):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True

class BMICalculatorRequest(BaseModel):
    height_cm: float
    weight_kg: float

class HealthScoreResponse(BaseModel):
    score: int # 0-100
    category: str # Excellent, Good, Fair, Poor
    recommendations: List[str]
    calculated_at: datetime
