from fastapi import APIRouter, Depends
from app.models.health import VitalsLogCreate, BMICalculatorRequest, HealthScoreResponse
from app.models.user import UserResponse
from app.services.health_service import HealthService
from app.routers.users import get_current_user
from app.database import get_db

router = APIRouter(prefix="/health", tags=["Health"])

def get_health_service(db = Depends(get_db)):
    return HealthService(db.db)

@router.post("/bmi")
async def calculate_bmi(
    req: BMICalculatorRequest,
    current_user: UserResponse = Depends(get_current_user),
    health_service: HealthService = Depends(get_health_service)
):
    return await health_service.calculate_bmi(req)

@router.post("/vitals")
async def log_vitals(
    vitals_in: VitalsLogCreate,
    current_user: UserResponse = Depends(get_current_user),
    health_service: HealthService = Depends(get_health_service)
):
    return await health_service.log_vitals(current_user.id, vitals_in)

@router.get("/score", response_model=HealthScoreResponse)
async def get_health_score(
    current_user: UserResponse = Depends(get_current_user),
    health_service: HealthService = Depends(get_health_service)
):
    return await health_service.get_health_score(current_user.id)
