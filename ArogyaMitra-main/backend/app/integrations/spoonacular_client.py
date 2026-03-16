import httpx
from app.config import settings
from typing import List, Dict, Any

class SpoonacularClient:
    def __init__(self):
        self.api_key = settings.SPOONACULAR_API_KEY
        self.base_url = "https://api.spoonacular.com/recipes"

    async def search_recipes_by_macros(self, target_calories: int, diet: str = None) -> List[Dict[str, Any]]:
        """Find meals that fit inside a target calorie chunk"""
        if not self.api_key:
            # Fallback mock
            return [{"title": "Mock Protein Bowl", "calories": target_calories, "protein": 30, "carbs": 40, "fat": 15}]

        params = {
            "apiKey": self.api_key,
            "maxCalories": target_calories + 50,
            "minCalories": target_calories - 50,
            "number": 3,
            "addRecipeNutrition": "true"
        }
        
        if diet:
            params["diet"] = diet

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/complexSearch", params=params)
                response.raise_for_status()
                data = response.json()
                
                recipes = []
                for item in data.get("results", []):
                    nutrients = item.get("nutrition", {}).get("nutrients", [])
                    def get_nutrient(name):
                        for n in nutrients:
                            if n["name"] == name: return n["amount"]
                        return 0

                    recipes.append({
                        "spoonacular_id": item["id"],
                        "title": item["title"],
                        "calories": get_nutrient("Calories"),
                        "protein": get_nutrient("Protein"),
                        "carbs": get_nutrient("Carbohydrates"),
                        "fat": get_nutrient("Fat")
                    })
                return recipes
            except Exception as e:
                print(f"Spoonacular API Error: {str(e)}")
                return []

    async def get_recipe_details(self, recipe_id: int) -> Dict[str, Any]:
        """Get full instructions and ingredients for a specific recipe"""
        if not self.api_key: return {"instructions": "Mock instructions", "ingredients": ["Mock ingredient 1"]}
        
        params = {"apiKey": self.api_key}
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/{recipe_id}/information", params=params)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Spoonacular Detail API Error: {str(e)}")
                return {}

spoonacular_client = SpoonacularClient()
