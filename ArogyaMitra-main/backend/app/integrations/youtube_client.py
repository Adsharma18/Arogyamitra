import httpx
from app.config import settings
from typing import List, Dict

class YouTubeClient:
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.base_url = "https://www.googleapis.com/youtube/v3/search"

    async def search_exercise_videos(self, exercise_name: str, max_results: int = 1) -> List[Dict[str, str]]:
        if not self.api_key:
            return [{"title": f"How to {exercise_name}", "url": f"https://www.youtube.com/results?search_query={exercise_name.replace(' ', '+')}"}]

        params = {
            "part": "snippet",
            "q": f"{exercise_name} exercise form tutorial",
            "key": self.api_key,
            "maxResults": max_results,
            "type": "video",
            "videoDuration": "short"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                videos = []
                for item in data.get("items", []):
                    video_id = item["id"]["videoId"]
                    title = item["snippet"]["title"]
                    videos.append({
                        "title": title,
                        "url": f"https://www.youtube.com/watch?v={video_id}"
                    })
                return videos
            except Exception as e:
                print(f"YouTube API Error: {str(e)}")
                return []

youtube_client = YouTubeClient()
