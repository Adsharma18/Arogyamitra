from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    workout_streak: int
    total_workouts: int
    avg_calories_burned: int
    avg_daily_calories_consumed: int
    health_score: int

class WeightHistoryPoint(BaseModel):
    date: datetime
    weight_kg: float

class WeeklyReport(BaseModel):
    week_start: datetime
    week_end: datetime
    summary_text: str
    workouts_completed: int
    calories_balance: str
    achievements_unlocked: List[str]
