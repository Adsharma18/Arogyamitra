from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.progress import DashboardStats, WeeklyReport
from bson import ObjectId
from datetime import datetime, timezone, timedelta

class ProgressService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_dashboard_summary(self, user_id: str) -> DashboardStats:
        workouts_col = self.db["workouts"]
        health_col = self.db["health_records"]
        meals_col = self.db["meals"]

        # Total workouts for this user
        total_workouts = await workouts_col.count_documents({"user_id": user_id})

        # Calculate workout streak (consecutive days with at least 1 workout, going back from today)
        streak = 0
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        for i in range(365):  # Max look-back 1 year
            day_start = today - timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            count = await workouts_col.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": day_start, "$lt": day_end}
            })
            if count > 0:
                streak += 1
            else:
                # Allow skipping today if no workout yet; break on any other gap
                if i > 0:
                    break

        # Average calories burned across all workouts
        pipeline_cal = [
            {"$match": {"user_id": user_id, "calories_burned": {"$exists": True}}},
            {"$group": {"_id": None, "avg_cal": {"$avg": "$calories_burned"}}}
        ]
        cal_result = await workouts_col.aggregate(pipeline_cal).to_list(1)
        avg_calories = int(cal_result[0]["avg_cal"]) if cal_result else 0

        # Average daily calories consumed from meals
        pipeline_meals = [
            {"$match": {"user_id": user_id, "total_calories": {"$exists": True}}},
            {"$group": {"_id": None, "avg_cal": {"$avg": "$total_calories"}}}
        ]
        meal_result = await meals_col.aggregate(pipeline_meals).to_list(1)
        avg_consumed = int(meal_result[0]["avg_cal"]) if meal_result else 0

        # Latest health score
        latest_health = await health_col.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        health_score = latest_health.get("health_score", 0) if latest_health else 0

        return DashboardStats(
            workout_streak=streak,
            total_workouts=total_workouts,
            avg_calories_burned=avg_calories,
            avg_daily_calories_consumed=avg_consumed,
            health_score=health_score
        )

    async def get_weekly_report(self, user_id: str) -> dict:
        today = datetime.now(timezone.utc)
        week_start = today - timedelta(days=7)

        workouts_col = self.db["workouts"]
        count = await workouts_col.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": week_start}
        })

        return {
            "summary": f"You completed {count} workout(s) this week. Keep pushing!",
            "workouts_this_week": count
        }
