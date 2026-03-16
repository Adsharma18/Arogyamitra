from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Used to represent MongoDB ObjectIds as strings in Pydantic
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args, **kwargs):
        if not isinstance(v, str):
            raise ValueError("ObjectId must be a string")
        return v

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str
    age: int
    gender: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
class TokenData(BaseModel):
    email: Optional[str] = None

# --- Profile Schemas ---
class UserProfileUpdate(BaseModel):
    height: Optional[float] = None # In cm
    weight: Optional[float] = None # In kg
    goals: Optional[List[str]] = None
    activity_level: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    medical_conditions: Optional[List[str]] = None

class UserPersonalUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    name: str
    age: int
    gender: str
    profile_picture: Optional[str] = None
    profile: Optional[UserProfileUpdate] = None
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "60a7b8f9e1b9b9a4c8a4c8a4",
                "email": "user@example.com",
                "name": "John Doe",
                "age": 28,
                "gender": "Male",
                "created_at": "2023-01-01T00:00:00Z"
            }
        }
