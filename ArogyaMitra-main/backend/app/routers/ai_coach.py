from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import json
from app.models.chat import ChatRequest, ChatResponse, ChatMessage, ChatHistoryResponse
from app.models.user import UserResponse
from app.routers.users import get_current_user
from app.database import get_db
from app.integrations.groq_client import groq_client
from app.utils.prompts import AROMI_SYSTEM_PROMPT, AROMI_TOOLS
from app.services.progress_service import ProgressService
from app.services.workout_service import WorkoutService
from app.services.nutrition_service import NutritionService
from app.services.health_service import HealthService
from app.models.workout import WorkoutPlanCreate, WorkoutLogCreate
from app.models.nutrition import MealPlanCreate, MealLogCreate
from datetime import datetime, timezone
from typing import List

router = APIRouter(prefix="/ai", tags=["AROMI Coach"])

class AICoachService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.chat_history = db["chat_history"]

    async def get_history(self, user_id: str) -> ChatHistoryResponse:
        record = await self.chat_history.find_one({"user_id": user_id})
        if record:
            record["_id"] = str(record["_id"])
            return ChatHistoryResponse(**record)
        return ChatHistoryResponse(_id="new", user_id=user_id, messages=[])
        
    async def chat(self, user: UserResponse, message: str) -> ChatResponse:
        # Fetch active plans
        workout_plan = await self.db["plans"].find_one({"user_id": user.id}, sort=[("created_at", -1)])
        meal_plan = await self.db["meal_plans"].find_one({"user_id": user.id}, sort=[("created_at", -1)])
        
        active_workout_str = "No active workout plan."
        if workout_plan:
            active_workout_str = f"Goal: {workout_plan.get('goal')}, Days: {workout_plan.get('days_per_week')}, Environment: {workout_plan.get('environment')}"
            
        active_meal_str = "No active meal plan."
        if meal_plan:
            active_meal_str = f"Calories: {meal_plan.get('total_calories_per_day')}, Duration Days: {len(meal_plan.get('days', []))}"

        # Fetch Progress & calculate BMIv
        progress_service = ProgressService(self.db)
        stats = await progress_service.get_dashboard_summary(user.id)
        
        prof = user.profile
        height_cm = prof.height if prof and prof.height else 170
        weight_kg = prof.weight if prof and prof.weight else 70
        bmi = round(weight_kg / ((height_cm / 100) ** 2), 1) if height_cm and weight_kg else "Unknown"
        
        goal_val = ", ".join(prof.goals) if prof and prof.goals else "None"
        activity_val = prof.activity_level if prof and prof.activity_level else "Unknown"
        diet_val = ", ".join(prof.dietary_preferences) if prof and prof.dietary_preferences else "None"
        allergies_val = ", ".join(prof.allergies) if prof and prof.allergies else "None"
        conditions_val = ", ".join(prof.medical_conditions) if prof and prof.medical_conditions else "None"
        
        # Get last workout
        latest_workout = await self.db["workouts"].find_one({"user_id": user.id}, sort=[("created_at", -1)])
        last_workout_str = latest_workout.get("workout_day_name", "None recently") if latest_workout else "Never"

        # Build strict context
        system_msg = AROMI_SYSTEM_PROMPT.format(
            name=user.name, 
            age=user.age, 
            gender=user.gender,
            height=height_cm,
            weight=weight_kg,
            bmi=bmi,
            goal=goal_val,
            activity_level=activity_val,
            diet=diet_val,
            allergies=allergies_val,
            conditions=conditions_val,
            last_workout=last_workout_str,
            streak=stats.workout_streak,
            avg_calories=stats.avg_calories_burned,
            health_score=stats.health_score,
            active_workout_plan=active_workout_str,
            active_meal_plan=active_meal_str
        )
        
        # Hydrate active session
        history = await self.get_history(user.id)
        
        # Construct Groq format array
        messages = [{"role": "system", "content": system_msg}]
        # Limit history context length
        for msg in history.messages[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
            
        # Append latest user interaction
        messages.append({"role": "user", "content": message})
        
        # 1. First Call to Groq (with tools)
        message_obj = await groq_client.chat(messages=messages, tools=AROMI_TOOLS)
        
        if isinstance(message_obj, str):
            reply_content = message_obj # Fallback mock string
        else:
            reply_content = message_obj.content
            tool_calls = getattr(message_obj, "tool_calls", None)
            
            # 2. Handle Tool Calls if AROMI wants to generate a plan
            if tool_calls:
                messages.append(message_obj) # Append assistant's requested tool call
                
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    
                    try:
                        if function_name == "generate_workout_plan":
                            w_svc = WorkoutService(self.db)
                            w_req = WorkoutPlanCreate(**args)
                            await w_svc.generate_plan(user.id, w_req)
                            tool_result = "SUCCESS: The workout plan was generated and saved to the user's dashboard."
                            
                        elif function_name == "generate_nutrition_plan":
                            n_svc = NutritionService(self.db)
                            n_req = MealPlanCreate(**args)
                            await n_svc.generate_plan(user.id, n_req)
                            tool_result = "SUCCESS: The nutrition meal plan was generated and saved to the user's dashboard."
                            
                        elif function_name == "log_workout":
                            log_data = WorkoutLogCreate(
                                workout_day_name="AI Logged Workout",
                                duration_minutes=args.get("duration_minutes", 30),
                                calories_burned=args.get("calories_burned", 200),
                                notes="Logged via AROMI Chat"
                            ).model_dump()
                            log_data["user_id"] = user.id
                            log_data["created_at"] = datetime.now(timezone.utc)
                            await self.db["workouts"].insert_one(log_data)
                            
                            # Force a health score recalculation
                            h_svc = HealthService(self.db)
                            await h_svc.get_health_score(user.id)
                            
                            tool_result = f"SUCCESS: Logged {args.get('duration_minutes')} min workout burning {args.get('calories_burned')} calories. Dashboard updated."
                            
                        elif function_name == "log_meal":
                            log_data = MealLogCreate(
                                meal_type="Logged Snack/Meal",
                                food_name="AI Logged Food",
                                calories=args.get("calories_consumed", 250)
                            ).model_dump()
                            log_data["user_id"] = user.id
                            log_data["created_at"] = datetime.now(timezone.utc)
                            await self.db["meals"].insert_one(log_data)
                            
                            # Force a health score recalculation
                            h_svc = HealthService(self.db)
                            await h_svc.get_health_score(user.id)
                            
                            tool_result = f"SUCCESS: Logged {args.get('calories_consumed')} calories consumed. Dashboard updated."
                            
                        else:
                            tool_result = f"Error: Function {function_name} not found."
                    except Exception as e:
                        tool_result = f"Error executing tool: {str(e)}"
                        
                    # Submit tool result back to Groq
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": tool_result,
                    })
                
                # 3. Second call to Groq to generate the final chat response thanking the user
                final_response_obj = await groq_client.chat(messages=messages)
                reply_content = final_response_obj if isinstance(final_response_obj, str) else final_response_obj.content
                if not reply_content:
                    reply_content = "I have successfully generated and saved your new plan to your dashboard!"
        
        # Save exact context sequentially to db
        new_msgs = [
            {"role": "user", "content": message, "timestamp": datetime.now(timezone.utc)},
            {"role": "assistant", "content": reply_content, "timestamp": datetime.now(timezone.utc)}
        ]
        
        if history.id == "new":
            await self.chat_history.insert_one({"user_id": user.id, "messages": new_msgs})
        else:
            await self.chat_history.update_one(
                {"user_id": user.id}, 
                {"$push": {"messages": {"$each": new_msgs}}}
            )
            
        return ChatResponse(reply=reply_content)

def get_ai_service(db = Depends(get_db)):
    return AICoachService(db.db)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_aromi(
    req: ChatRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AICoachService = Depends(get_ai_service)
):
    return await ai_service.chat(current_user, req.message)

@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AICoachService = Depends(get_ai_service)
):
    return await ai_service.get_history(current_user.id)
