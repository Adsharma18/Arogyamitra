from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.models.user import UserResponse, UserProfileUpdate, UserPersonalUpdate
from app.database import get_db
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/users", tags=["Users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    user["_id"] = str(user["_id"])
    return UserResponse(**user)


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_personal_info(
    personal_data: UserPersonalUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update the user's personal information (name, age, gender).
    """
    update_dict = personal_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        return current_user
        
    await db.db.users.update_one(
        {"email": current_user.email},
        {"$set": update_dict}
    )
    
    updated_user = await db.db.users.find_one({"email": current_user.email})
    updated_user["_id"] = str(updated_user["_id"])
    return UserResponse(**updated_user)

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate, 
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update the user's health and fitness profile.
    """
    update_dict = {f"profile.{k}": v for k, v in profile_data.model_dump(exclude_unset=True).items()}
    
    if not update_dict:
        return current_user
        
    await db.db.users.update_one(
        {"email": current_user.email},
        {"$set": update_dict}
    )
    
    updated_user = await db.db.users.find_one({"email": current_user.email})
    updated_user["_id"] = str(updated_user["_id"])
    return UserResponse(**updated_user)

