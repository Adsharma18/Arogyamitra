from fastapi import APIRouter, Depends
from typing import List
from app.models.workout import WorkoutPlanCreate, WorkoutPlanResponse, WorkoutLogCreate
from app.models.user import UserResponse
from app.services.workout_service import WorkoutService
from app.routers.users import get_current_user
from app.database import get_db

router = APIRouter(prefix="/workouts", tags=["Workouts"])

def get_workout_service(db = Depends(get_db)):
    return WorkoutService(db.db)

@router.post("/generate", response_model=WorkoutPlanResponse)
async def generate_workout_plan(
    plan_in: WorkoutPlanCreate, 
    current_user: UserResponse = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    return await workout_service.generate_plan(current_user.id, plan_in)

@router.get("/plans", response_model=List[WorkoutPlanResponse])
async def get_workout_plans(
    current_user: UserResponse = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    return await workout_service.get_plans(current_user.id)

@router.post("/log")
async def log_workout(
    log_in: WorkoutLogCreate,
    current_user: UserResponse = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    return await workout_service.log_workout(current_user.id, log_in)

@router.get("/videos/{exercise}")
async def get_exercise_videos(
    exercise: str,
    current_user: UserResponse = Depends(get_current_user),
    workout_service: WorkoutService = Depends(get_workout_service)
):
    return await workout_service.search_exercise_videos(exercise)
