from fastapi import APIRouter, Depends
from app.models.progress import DashboardStats
from app.models.user import UserResponse
from app.services.progress_service import ProgressService
from app.routers.users import get_current_user
from app.database import get_db

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])

def get_progress_service(db = Depends(get_db)):
    return ProgressService(db.db)

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return await progress_service.get_dashboard_summary(current_user.id)

@router.get("/weekly-report")
async def get_weekly_report(
    current_user: UserResponse = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return await progress_service.get_weekly_report(current_user.id)
