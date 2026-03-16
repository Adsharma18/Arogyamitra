from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None
    
    users = None
    workouts = None
    plans = None
    meals = None
    health_records = None
    chat_history = None

db_instance = Database()

async def connect_to_mongo():
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    
    # Setup Collections
    db_instance.users = db_instance.db["users"]
    db_instance.workouts = db_instance.db["workouts"]
    db_instance.plans = db_instance.db["plans"]
    db_instance.meals = db_instance.db["meals"]
    db_instance.health_records = db_instance.db["health_records"]
    db_instance.chat_history = db_instance.db["chat_history"]
    
    # Create required indexes (basic setup)
    await db_instance.users.create_index("email", unique=True)
    
async def close_mongo_connection():
    if db_instance.client is not None:
        db_instance.client.close()

# Helper to inject into FastAPI Depends
def get_db():
    return db_instance
