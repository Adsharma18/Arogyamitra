from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.user import PyObjectId

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    weight: Optional[str] = None
    video_url: Optional[str] = None
    notes: Optional[str] = None

class WorkoutPlanCreate(BaseModel):
    goal: str
    days_per_week: int
    difficulty: str
    duration_minutes: int = 30
    environment: str = "Gym"
    target_muscle_groups: Optional[List[str]] = None

class WorkoutDay(BaseModel):
    day_name: str
    focus: str
    exercises: List[Exercise]

class WorkoutPlanResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    goal: str
    days_per_week: int
    difficulty: str
    schedule: List[WorkoutDay]
    created_at: datetime
    
    class Config:
        populate_by_name = True

class WorkoutLogCreate(BaseModel):
    plan_id: Optional[str] = None
    workout_day_name: str
    duration_minutes: int
    calories_burned: Optional[int] = None
    notes: Optional[str] = None

class WorkoutLogResponse(WorkoutLogCreate):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
