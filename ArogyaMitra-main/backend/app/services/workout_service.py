from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.workout import WorkoutPlanCreate, WorkoutPlanResponse, WorkoutLogCreate, WorkoutLogResponse
from typing import List, Optional
from datetime import datetime, timezone

from app.integrations.groq_client import groq_client
from app.integrations.youtube_client import youtube_client
from app.utils.prompts import WORKOUT_SYSTEM_PROMPT, WORKOUT_GENERATION_PROMPT
from bson import ObjectId

class WorkoutService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.plans_collection = db["plans"]
        self.workouts_collection = db["workouts"]
        self.users_collection = db["users"]

    async def generate_plan(self, user_id: str, plan_in: WorkoutPlanCreate) -> WorkoutPlanResponse:
        # Fetch User Profile
        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        prof = user.get("profile", {}) if user else {}
        
        # Calculate BMI
        height_cm = prof.get("height", 170) or 170
        weight_kg = prof.get("weight", 70) or 70
        bmi = round(weight_kg / ((height_cm / 100) ** 2), 1)
        
        # Prepare constraints
        age = user.get("age", 30) if user else 30
        gender = user.get("gender", "Unknown") if user else "Unknown"
        conditions_list = prof.get("medical_conditions", [])
        conditions_val = ", ".join(conditions_list) if conditions_list else "None"

        # Construct dynamic prompt
        user_prompt = WORKOUT_GENERATION_PROMPT.format(
            goal=plan_in.goal,
            days_per_week=plan_in.days_per_week,
            duration_minutes=plan_in.duration_minutes,
            environment=plan_in.environment,
            difficulty=plan_in.difficulty,
            target_muscle_groups=", ".join(plan_in.target_muscle_groups) if plan_in.target_muscle_groups else "Full Body",
            age=age,
            gender=gender,
            bmi=bmi,
            conditions=conditions_val
        )

        try:
            # 1. Call Groq AI to generate structured workout plan JSON
            ai_plan_raw = await groq_client.generate_json(
                system_prompt=WORKOUT_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            
            # Extract JSON array safely (in case it wraps in a root object depending on prompt variance)
            if "schedule" not in ai_plan_raw and isinstance(ai_plan_raw, list):
                 ai_plan_raw = {"schedule": ai_plan_raw, "goal": plan_in.goal, "days_per_week": plan_in.days_per_week, "difficulty": plan_in.difficulty}

            # Prepare to save to MongoDB
            saved_plan = {
                "user_id": user_id,
                "goal": ai_plan_raw.get("goal", plan_in.goal),
                "days_per_week": ai_plan_raw.get("days_per_week", plan_in.days_per_week),
                "difficulty": ai_plan_raw.get("difficulty", plan_in.difficulty),
                "duration_minutes": ai_plan_raw.get("duration_minutes", plan_in.duration_minutes),
                "environment": ai_plan_raw.get("environment", plan_in.environment),
                "schedule": ai_plan_raw.get("schedule", []),
                "created_at": datetime.now(timezone.utc)
            }

            result = await self.plans_collection.insert_one(saved_plan)
            saved_plan["_id"] = str(result.inserted_id)
            return WorkoutPlanResponse(**saved_plan)
        except Exception as e:
            print(f"Workout Plan Generation Error: {e}")
            raise Exception("Failed to generate workout plan. Please try again.")

    async def get_plans(self, user_id: str) -> List[WorkoutPlanResponse]:
        cursor = self.plans_collection.find({"user_id": user_id})
        plans = await cursor.to_list(length=100)
        for p in plans:
            p["_id"] = str(p["_id"])
        return [WorkoutPlanResponse(**p) for p in plans]
        
    async def log_workout(self, user_id: str, log_in: WorkoutLogCreate) -> dict:
        log_dict = log_in.model_dump()
        log_dict["user_id"] = user_id
        log_dict["created_at"] = datetime.now(timezone.utc)
        result = await self.workouts_collection.insert_one(log_dict)
        return {"id": str(result.inserted_id), "status": "success"}

    async def search_exercise_videos(self, exercise_name: str) -> List[dict]:
        return await youtube_client.search_exercise_videos(exercise_name=exercise_name)
