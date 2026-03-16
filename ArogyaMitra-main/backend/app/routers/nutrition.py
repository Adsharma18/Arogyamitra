from fastapi import APIRouter, Depends
from typing import List
from app.models.nutrition import MealPlanCreate, MealLogCreate, MealPlanResponse
from app.models.user import UserResponse
from app.services.nutrition_service import NutritionService
from app.routers.users import get_current_user
from app.database import get_db

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

def get_nutrition_service(db = Depends(get_db)):
    return NutritionService(db.db)

@router.post("/generate", response_model=MealPlanResponse)
async def generate_meal_plan(
    plan_in: MealPlanCreate, 
    current_user: UserResponse = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service)
):
    return await nutrition_service.generate_plan(current_user.id, plan_in)

@router.get("/plans", response_model=List[MealPlanResponse])
async def get_nutrition_plans(
    current_user: UserResponse = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service)
):
    return await nutrition_service.get_plans(current_user.id)

@router.get("/today")
async def get_today_meals(
    current_user: UserResponse = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service)
):
    return await nutrition_service.get_today_meals(current_user.id)

@router.post("/log")
async def log_meal(
    log_in: MealLogCreate,
    current_user: UserResponse = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service)
):
    return await nutrition_service.log_meal(current_user.id, log_in)

@router.get("/recipes/search")
async def search_recipes(
    query: str,
    current_user: UserResponse = Depends(get_current_user),
    nutrition_service: NutritionService = Depends(get_nutrition_service)
):
    return await nutrition_service.search_recipes(query)
