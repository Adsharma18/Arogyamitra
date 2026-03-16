import json
from groq import AsyncGroq
from app.config import settings
from typing import Dict, Any

class GroqClient:
    def __init__(self):
        # Initializes using GROQ_API_KEY from environment mapped via settings
        self.api_key = settings.GROQ_API_KEY
        self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None
        self.model = "llama-3.3-70b-versatile"

    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Forces Groq to output structured JSON data parsing the response string natively.
        """
        if not self.client:
            # Fallback mock for development without an API key
            print("WARNING: No GROQ_API_KEY provided. Returning mock data.")
            return {"mock": True, "message": "Add GROQ_API_KEY to .env to enable real AI"}

        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=self.model,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            # Extract and parse the JSON string response
            response_text = chat_completion.choices[0].message.content
            return json.loads(response_text)
            
        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            raise

    async def chat(self, messages: list, tools: list = None) -> Any:
        """
        Standard conversational endpoint for AROMI. Can accept tools for function calling.
        Returns the raw completion choice if tools are provided so caller can parse tool_calls,
        otherwise returns just the content string.
        """
        if not self.client:
            return "Hi there! (I am in offline dev mode. Add GROQ_API_KEY to enable my brain)."

        try:
            kwargs = {
                "messages": messages,
                "model": self.model,
                "temperature": 0.8,
            }
            if tools:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = "auto"
                
            chat_completion = await self.client.chat.completions.create(**kwargs)
            
            if tools:
                return chat_completion.choices[0].message
                
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Chat API Error: {str(e)}")
            raise

groq_client = GroqClient()
