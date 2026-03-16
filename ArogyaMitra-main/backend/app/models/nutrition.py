from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RecipeBase(BaseModel):
    title: str
    spoonacular_id: Optional[int] = None
    calories: int
    protein: float
    carbs: float
    fat: float
    instructions: str
    ingredients: List[str]

class Meal(BaseModel):
    meal_type: str # Breakfast, Lunch, Dinner, Snack
    recipe: RecipeBase

class MealPlanCreate(BaseModel):
    target_calories: int
    diet_type: Optional[str] = None # Vegan, Keto, etc.
    allergies: Optional[List[str]] = None
    cuisine: Optional[str] = "Global"
    duration_days: Optional[int] = 7

class MealPlanDay(BaseModel):
    day: int
    meals: List[Meal]
    total_calories: int
    total_protein: float

class MealPlanResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    days: List[MealPlanDay]
    total_calories_per_day: Optional[int] = None
    total_protein_per_day: Optional[float] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True

class MealLogCreate(BaseModel):
    meal_type: str
    food_name: str
    calories: int
    protein: Optional[float] = 0.0
    water_ml: Optional[int] = 0

class MealLogResponse(MealLogCreate):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True
