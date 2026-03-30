# ArogyaMitra: AI-Driven Health & Fitness Platform 🚀

**ArogyaMitra** is a comprehensive, intelligent health platform that curates bespoke workout plans, precise macro-tracked meal plans, and provides a stateful conversational AI health coach — **AROMI** — powered by **Groq LLaMA-3.3-70B**.

Designed with a modern, responsive **Vite + React** glassmorphism frontend and backed by an asynchronous **FastAPI + MongoDB** architecture. Fully containerized with **Docker Compose**.

![Aesthetic](https://img.shields.io/badge/UI-Glassmorphism-blue?style=for-the-badge) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3-orange?style=for-the-badge)

---

## 🌟 Core Features

### 🏋️ Intelligent Workout Routines
- Generate hyper-specific strength, cardio, and endurance **7-day workout splits** via AI.
- Plans are **profile-aware**: the AI considers your BMI, medical conditions (e.g., "Bad Knees"), and fitness level to generate safe, tailored exercises.
- Includes **YouTube video tutorial links** for every exercise via the YouTube Data API.
- **Collapsible day-by-day accordion UI** for clean, organized viewing of multi-day plans.

### 🥗 Precision Meal Planning
- Input macros, allergies, caloric targets, and cuisine preferences to generate a **full multi-day meal plan** with recipes, ingredients, and instructions.
- Your **profile allergies are automatically merged** with any form input, ensuring the AI never suggests unsafe foods.
- Each meal card displays detailed macronutrient breakdowns (Protein, Carbs, Fat).

### 🤖 AROMI — The AI Health Coach
- A persistent, **tool-calling AI chat agent** powered by Groq LLaMA-3.3-70B.
- AROMI is context-aware: she knows your BMI, workout streak, health score, active plans, and medical conditions.
- **Tool Integration**: AROMI can directly:
  - Generate and save new workout plans to your dashboard.
  - Generate and save new meal plans to your dashboard.
  - Log completed workouts (incrementing your streak and stats).
  - Log consumed meals (tracking your calorie intake).
- Globally accessible from any page via a floating chat button (mounted at the layout level with Zustand state management).

### 📊 Dynamic Dashboard & Health Tracking
- **Real-time Dashboard** displaying Total Workouts, Avg Calories Burned, Workout Streak, and dynamic Health Score.
- **Natural Language Quick Log**: Type updates like _"I ran 5 miles today"_ directly on the Dashboard. AROMI processes it in the background, logs the activity, and updates your stats instantly.
- **Dynamic Health Score Algorithm**: Calculated based on workout consistency (streak), dietary habits, total engagement, and BMI — not hardcoded.
- Health score recalculates automatically whenever you log a workout or meal.

### 👤 Profile-Aware AI Generation
- All AI-generated plans factor in your saved profile data:
  - **Age, Gender, BMI** (auto-calculated from height/weight)
  - **Medical Conditions** (e.g., injuries, chronic conditions)
  - **Dietary Preferences & Allergies** (auto-merged with form inputs)
- This means the AI adapts exercises and meals to your specific health constraints without you needing to re-enter information each time.

### 🏥 Health Metrics Hub
- Calculate BMI with category classification (Underweight, Normal, Overweight, Obese).
- Log vitals (blood pressure, heart rate, etc.).
- View your dynamically calculated AI Health Score with personalized recommendations.

---

## 🏗️ Technical Architecture

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| TailwindCSS v4 | Utility-first Styling |
| Zustand | Global State Management |
| React Router v7 | Client-side Routing |
| Axios | HTTP Client with JWT Interceptors |
| Lucide React | Icon Library |
| React Hot Toast | Notification System |

### Backend
| Technology | Purpose |
|---|---|
| Python / FastAPI | Async REST API Framework |
| Motor | Async MongoDB Driver |
| Pydantic v2 | Schema Validation & Serialization |
| PyJWT | JWT Authentication |
| Passlib (bcrypt) | Password Hashing |

### External Integrations
| Service | Purpose |
|---|---|
| Groq Cloud (LLaMA-3.3-70B) | AI Model for plan generation, coaching, and tool-calling |
| YouTube Data API v3 | Exercise video tutorial search |
| Spoonacular API | Recipe and nutrition data |

### Infrastructure
- Fully containerized with **Docker Compose** (MongoDB, FastAPI Backend, Vite Frontend).
- MongoDB data persisted via Docker volumes.

---

## 📁 Project Structure

```
ArogyaMitra/
├── docker-compose.yml          # Orchestrates all services
├── backend/
│   ├── Dockerfile
│   ├── .env                    # API keys & secrets
│   ├── requirements.txt
│   ├── main.py                 # FastAPI entry point
│   └── app/
│       ├── config.py           # Environment configuration
│       ├── database.py         # MongoDB connection
│       ├── integrations/       # External API clients
│       │   ├── groq_client.py      # Groq LLaMA integration
│       │   ├── youtube_client.py   # YouTube Data API
│       │   └── spoonacular_client.py # Spoonacular API
│       ├── models/             # Pydantic schemas
│       │   ├── user.py, workout.py, nutrition.py
│       │   ├── health.py, chat.py, progress.py
│       ├── routers/            # API route handlers
│       │   ├── auth.py, users.py, workouts.py
│       │   ├── nutrition.py, health.py, progress.py
│       │   └── ai_coach.py     # AROMI chat + tool execution
│       ├── services/           # Business logic
│       │   ├── auth_service.py, workout_service.py
│       │   ├── nutrition_service.py, health_service.py
│       │   └── progress_service.py
│       └── utils/
│           └── prompts.py      # All AI system prompts & tool schemas
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.jsx             # Root with routing
        ├── api/client.js       # Axios instance with JWT
        ├── store/              # Zustand stores
        │   ├── useAuthStore.js
        │   └── useAromiStore.js
        ├── components/         # Reusable UI components
        │   ├── Sidebar.jsx, ProtectedRoute.jsx
        │   └── AromiChatbot.jsx
        └── pages/              # Page-level components
            ├── Auth/ (Login, Register)
            ├── Dashboard/
            ├── Workouts/WorkoutHub.jsx
            ├── Nutrition/NutritionHub.jsx
            ├── Health/HealthHub.jsx
            ├── Profile/ & Settings/
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- API Keys (all free tiers available):
  - `GROQ_API_KEY` — [Groq Cloud Console](https://console.groq.com/)
  - `YOUTUBE_API_KEY` — [Google Cloud Console](https://console.cloud.google.com/)
  - `SPOONACULAR_API_KEY` — [Spoonacular Developer Portal](https://spoonacular.com/food-api)

### 2. Clone & Configure
```bash
git clone https://github.com/A2-ashish/ArogyaMitra.git
cd ArogyaMitra
```

Create the backend environment file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Launch the Stack
From the project root:
```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8000` |
| Swagger Docs | `http://localhost:8000/docs` |
| MongoDB | `localhost:27017` |

### 4. Local Development (Without Docker)
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | User registration |
| `POST` | `/auth/login` | JWT login |
| `GET` | `/users/me` | Get current user profile |
| `PUT` | `/users/profile` | Update user profile |
| `POST` | `/workouts/generate` | AI-generate a workout plan |
| `GET` | `/workouts/plans` | Fetch all saved workout plans |
| `GET` | `/workouts/videos/{name}` | Search exercise tutorial videos |
| `POST` | `/nutrition/generate` | AI-generate a meal plan |
| `GET` | `/nutrition/plans` | Fetch all saved meal plans |
| `POST` | `/health/bmi` | Calculate BMI |
| `GET` | `/health/score` | Get dynamic AI health score |
| `POST` | `/health/vitals` | Log vitals |
| `GET` | `/progress/dashboard` | Dashboard summary stats |
| `POST` | `/ai/chat` | Chat with AROMI (supports tool-calling) |
| `GET` | `/ai/history` | Fetch AROMI chat history |

---

## 🎨 Design Philosophy

The frontend UX is modeled against premium dark-mode fitness applications featuring:
- **Glassmorphism** techniques with CSS backdrop-blur and semi-transparent layers.
- **Animated gradient orbs** for a dynamic, living background.
- **Strict grid alignments** with responsive breakpoints.
- **Collapsible accordion cards** for multi-day plan viewing.
- **Micro-animations** and hover effects for a premium interactive feel.
- All routes are authenticated and secured via Axios Bearer Token interceptors with Zustand state management.

---

## 🧠 AI Agent Architecture (AROMI)

AROMI operates as a **tool-calling AI agent**, not just a chatbot:

```
User Message → Groq LLaMA-3.3-70B → Tool Decision
                                        ├── generate_workout_plan → WorkoutService → MongoDB
                                        ├── generate_nutrition_plan → NutritionService → MongoDB
                                        ├── log_workout → Workouts Collection → Health Score Recalc
                                        └── log_meal → Meals Collection → Health Score Recalc
                                    → Final Response to User
```

- **Deep Context Injection**: Before every chat, AROMI receives the user's full profile (BMI, streak, health score, active plans, medical conditions).
- **Tool Execution Loop**: Groq returns tool calls → Backend executes them → Results fed back to Groq → Final human-readable response generated.
- **Automatic Health Score Refresh**: Every logged workout/meal triggers a background health score recalculation.

---

## 📄 License

This project is for educational and portfolio purposes.

---

**Built with ❤️ by [Aditi](https://github.com/Adsharma18/Arogyamitra)**
