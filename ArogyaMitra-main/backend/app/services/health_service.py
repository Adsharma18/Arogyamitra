from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.health import VitalsLogCreate, VitalsLogResponse, BMICalculatorRequest, HealthScoreResponse
from typing import List
from datetime import datetime, timezone
from app.services.progress_service import ProgressService

class HealthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.health_records = db["health_records"]

    async def calculate_bmi(self, req: BMICalculatorRequest) -> dict:
        height_m = req.height_cm / 100
        bmi = req.weight_kg / (height_m * height_m)
        category = "Normal"
        if bmi < 18.5: category = "Underweight"
        elif bmi >= 25 and bmi < 30: category = "Overweight"
        elif bmi >= 30: category = "Obese"
        
        return {"bmi": round(bmi, 1), "category": category}

    async def log_vitals(self, user_id: str, vitals_in: VitalsLogCreate) -> dict:
        log_dict = vitals_in.model_dump()
        log_dict["user_id"] = user_id
        log_dict["created_at"] = datetime.now(timezone.utc)
        result = await self.health_records.insert_one(log_dict)
        return {"id": str(result.inserted_id), "status": "vitals logged"}

    async def get_health_score(self, user_id: str) -> HealthScoreResponse:
        # Fetch current dashboard progress
        progress_svc = ProgressService(self.db)
        stats = await progress_svc.get_dashboard_summary(user_id)
        
        # Calculate dynamic score (Base = 60)
        base_score = 60
        score_modifiers = 0
        recommendations = []
        
        # 1. Workout Consistency (Streak)
        streak = stats.workout_streak
        if streak >= 7:
            score_modifiers += 20
            recommendations.append("Fantastic! You have a 7+ day active workout streak. Keep up the high intensity.")
        elif streak >= 3:
            score_modifiers += 10
            recommendations.append("Good consistency! Try to hit 7 consecutive days for maximum cardiovascular benefits.")
        elif streak > 0:
            score_modifiers += 5
            recommendations.append("Great start! You've been active recently. Stay consistent tomorrow.")
        else:
            score_modifiers -= 5
            recommendations.append("Your workout streak is currently 0. Start small today with a 15-minute walk or a beginner yoga session.")
            
        # 2. Daily Calorie Consumption
        avg_calories = stats.avg_daily_calories_consumed
        if avg_calories > 0:
            if 1500 <= avg_calories <= 2500:
                score_modifiers += 10
                recommendations.append("Your overall dietary calorie intake is sitting in a healthy average range.")
            elif avg_calories < 1500:
                score_modifiers -= 5
                recommendations.append("You might be undereating your target calories. Make sure you are consuming enough protein and carbs for energy.")
            elif avg_calories > 2500:
                score_modifiers -= 5
                recommendations.append("Your average calorie intake is a bit high. Monitor your portion sizes if fat loss is your objective.")
        else:
            recommendations.append("You haven't logged any meals yet. Ask AROMI to log what you eat to track your macros!")
            
        # 3. Total Engagement
        if stats.total_workouts > 10:
            score_modifiers += 10
        elif stats.total_workouts > 0:
            score_modifiers += 5
            
        final_score = min(max(base_score + score_modifiers, 0), 100) # Clamp between 0 and 100
        
        category = "Analyzing"
        if final_score >= 85:
            category = "Excellent"
        elif final_score >= 70:
            category = "Good"
        elif final_score >= 50:
            category = "Fair"
        else:
            category = "Needs Attention"

        record_to_save = {
            "user_id": user_id,
            "health_score": final_score,
            "category": category,
            "recommendations": recommendations,
            "created_at": datetime.now(timezone.utc)
        }
        await self.health_records.insert_one(record_to_save)

        return HealthScoreResponse(
            score=final_score,
            category=category,
            recommendations=recommendations,
            calculated_at=datetime.now(timezone.utc)
        )
