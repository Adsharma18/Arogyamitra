from fastapi import HTTPException, status
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserCreate, UserLogin, UserResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db["users"]

    async def register_user(self, user_in: UserCreate) -> UserResponse:
        # Build user document
        user_dict = user_in.model_dump()
        raw_password = user_dict.pop("password")
        user_dict["hashed_password"] = get_password_hash(raw_password)
        user_dict["created_at"] = datetime.now(timezone.utc)
        user_dict["profile"] = {}

        try:
            result = await self.users_collection.insert_one(user_dict)
        except DuplicateKeyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )

        created_user = await self.users_collection.find_one({"_id": result.inserted_id})
        created_user["_id"] = str(created_user["_id"])
        return UserResponse(**created_user)

    async def login_user(self, email: str, password: str):
        user = await self.users_collection.find_one({"email": email})
        if not user or not verify_password(password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(subject=user["email"])
        user["_id"] = str(user["_id"])

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(**user)
        }
