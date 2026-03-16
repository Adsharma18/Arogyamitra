from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_auth_service(db=Depends(get_db)):
    return AuthService(db.db)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    """
    Register a new user in the system.
    """
    return await auth_service.register_user(user_in)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), auth_service: AuthService = Depends(get_auth_service)):
    """
    Authenticate a user and return a JWT access token.
    Accepts OAuth2 form data (username=email, password).
    """
    return await auth_service.login_user(email=form_data.username, password=form_data.password)
