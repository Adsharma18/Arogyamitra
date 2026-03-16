from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.nutrition import MealPlanCreate, MealPlanResponse, MealLogCreate, MealLogResponse
from typing import List
from datetime import datetime, timezone

from app.integrations.groq_client import groq_client
from app.integrations.spoonacular_client import spoonacular_client
from app.utils.prompts import NUTRITION_SYSTEM_PROMPT, NUTRITION_GENERATION_PROMPT
from bson import ObjectId

class NutritionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.plans_collection = db["meal_plans"]
        self.meals_collection = db["meals"]
        self.users_collection = db["users"]

    async def generate_plan(self, user_id: str, plan_in: MealPlanCreate) -> MealPlanResponse:
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
        
        # Merge form allergies with profile allergies safely
        form_allergies = plan_in.allergies or []
        profile_allergies = prof.get("allergies", [])
        merged_allergies = list(set(form_allergies + profile_allergies))
        allergies_val = ", ".join(merged_allergies) if merged_allergies else "None"

        user_prompt = NUTRITION_GENERATION_PROMPT.format(
            target_calories=plan_in.target_calories,
            diet_type=plan_in.diet_type or "standard",
            cuisine=plan_in.cuisine or "Global",
            duration_days=plan_in.duration_days or 7,
            allergies=allergies_val,
            age=age,
            gender=gender,
            bmi=bmi,
            conditions=conditions_val
        )
        
        try:
            # 1. Ask Groq LLaMA to build the plan
            ai_meals_raw = await groq_client.generate_json(
                system_prompt=NUTRITION_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            
            # Extract arrays safely
            days = ai_meals_raw.get("days", [])
            
            # Format and Save
            saved_plan = {
                "user_id": user_id,
                "days": days,
                "total_calories_per_day": plan_in.target_calories,
                "created_at": datetime.now(timezone.utc)
            }
            
            result = await self.plans_collection.insert_one(saved_plan)
            saved_plan["_id"] = str(result.inserted_id)
            return MealPlanResponse(**saved_plan)

        except Exception as e:
            print(f"Nutrition Plan Generation Error: {e}")
            raise Exception("Failed to generate meal plan. Please try again.")

    async def get_plans(self, user_id: str) -> List[MealPlanResponse]:
        cursor = self.plans_collection.find({"user_id": user_id}).sort("created_at", -1)
        plans = await cursor.to_list(length=100)
        for p in plans:
            p["_id"] = str(p["_id"])
        return [MealPlanResponse(**p) for p in plans]

    async def get_today_meals(self, user_id: str) -> dict:
        # Fetch active meal plan for today
        return {"message": "Today's meal fetched"}

    async def log_meal(self, user_id: str, log_in: MealLogCreate) -> dict:
        log_dict = log_in.model_dump()
        log_dict["user_id"] = user_id
        log_dict["created_at"] = datetime.now(timezone.utc)
        result = await self.meals_collection.insert_one(log_dict)
        return {"id": str(result.inserted_id), "status": "logged"}

    async def search_recipes(self, query: str) -> List[dict]:
        return await spoonacular_client.search_recipes_by_macros(target_calories=500, diet=query)
