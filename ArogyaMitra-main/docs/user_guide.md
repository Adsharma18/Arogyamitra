# ArogyaMitra — User Guide 📖

A complete guide to setting up, running, and using ArogyaMitra on your local machine.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Getting API Keys](#-getting-api-keys)
3. [Installation & Setup](#-installation--setup)
4. [Running the Application](#-running-the-application)
5. [Using the App](#-using-the-app)
6. [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

Before you begin, make sure you have the following installed:

| Software | Version | Download Link |
|---|---|---|
| **Docker Desktop** | Latest | [docker.com/download](https://www.docker.com/products/docker-desktop/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

> **Note:** Docker Desktop must be running before you can launch ArogyaMitra.

---

## 🔑 Getting API Keys

ArogyaMitra uses 3 external services. All of them have **free tiers** that are sufficient for personal use.

### 1. Groq API Key (AI Engine)
- Go to [console.groq.com](https://console.groq.com/)
- Sign up / Log in with your Google or GitHub account.
- Navigate to **API Keys** in the sidebar.
- Click **Create API Key**, copy it, and save it somewhere safe.

### 2. YouTube Data API Key (Exercise Videos)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (or select an existing one).
- Navigate to **APIs & Services** → **Library**.
- Search for **YouTube Data API v3** and click **Enable**.
- Go to **APIs & Services** → **Credentials** → **Create Credentials** → **API Key**.
- Copy the generated key.

### 3. Spoonacular API Key (Recipes & Nutrition)
- Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
- Sign up for a free account.
- Navigate to your **Profile** → **API Key**.
- Copy the key.

---

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/A2-ashish/ArogyaMitra.git
cd ArogyaMitra
```

### Step 2: Configure Environment Variables
```bash
cd backend
```

Create a `.env` file (or edit the existing one) with the following contents:

```env
# Application
PROJECT_NAME="ArogyaMitra API"
API_V1_STR="/api/v1"
SECRET_KEY="your_custom_secret_key_here"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (Docker handles this automatically)
MONGODB_URI="mongodb://localhost:27017"
DATABASE_NAME="arogyamitra"

# AI & External Services
GROQ_API_KEY="paste_your_groq_api_key_here"
YOUTUBE_API_KEY="paste_your_youtube_api_key_here"
SPOONACULAR_API_KEY="paste_your_spoonacular_api_key_here"
```

> ⚠️ **Important:** Replace every `paste_your_..._here` placeholder with your actual API keys from the previous step.

### Step 3: Go back to the project root
```bash
cd ..
```

---

## ▶️ Running the Application

### Option A: Using Docker (Recommended)

From the project root directory:

```bash
docker-compose up --build
```

This single command will:
- ✅ Pull and start a **MongoDB** database
- ✅ Build and start the **FastAPI backend** (Python)
- ✅ Build and start the **React frontend** (Vite)

Wait until you see logs indicating all services are up. Then open your browser:

| Service | URL |
|---|---|
| 🌐 **App (Frontend)** | [http://localhost:5173](http://localhost:5173) |
| ⚡ **API (Backend)** | [http://localhost:8000](http://localhost:8000) |
| 📚 **API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |

To stop the application:
```bash
# Press Ctrl+C in the terminal, then run:
docker-compose down
```

### Option B: Running Without Docker (Development Mode)

**Terminal 1 — Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

> **Note:** When running without Docker, you need MongoDB installed and running locally on port `27017`.

---

## 📱 Using the App

### 1. Create an Account
- Open the app at `http://localhost:5173`.
- Click **Register** and fill in your details (name, email, password, age, gender).
- You'll be redirected to the Dashboard after successful registration.

### 2. Complete Your Profile
- Click on your **profile icon** (top-right) or navigate to the **Profile** page.
- Fill in your health details:
  - **Height & Weight** (used for BMI calculation)
  - **Goals** (e.g., Muscle Gain, Fat Loss)
  - **Activity Level** (Sedentary, Active, etc.)
  - **Medical Conditions** (e.g., Bad Knees, Diabetes — the AI will respect these!)
  - **Dietary Preferences & Allergies** (e.g., Vegan, Peanut allergy)

> 💡 **Tip:** The more profile data you fill, the more personalized your AI-generated plans will be!

### 3. Generate a Workout Plan
- Navigate to the **Workout Hub** from the sidebar.
- Click **Generate Plan**.
- Fill in the form: Goal, Days/Week, Duration, Environment, Difficulty.
- Click **Generate AI Workout** and wait for the AI to build your plan.
- Your plan appears as **collapsible day cards** — click any day to expand and see the exercises.
- Click the **play icon** on any exercise to search for a YouTube tutorial video.

### 4. Generate a Meal Plan
- Navigate to the **Nutrition Hub** from the sidebar.
- Click **Generate Meal Plan**.
- Set your Target Calories, Diet Type, Cuisine, and Allergies.
- Click **Generate Daily Menu** and wait for AI to create your recipes.
- Each day is collapsible — click to expand and see detailed recipes with ingredients and instructions.

### 5. Chat with AROMI (AI Health Coach)
- Click the **floating chat bubble** (bottom-right corner) available on any page.
- AROMI knows your profile, BMI, active plans, streak, and health score.
- **Things you can ask AROMI:**
  - _"Give me a 5-day muscle gain plan for the gym"_ → She will generate and save a new workout plan.
  - _"Create a 7-day vegan meal plan at 1800 calories"_ → She will generate and save a new meal plan.
  - _"I just ran for 30 minutes and burned 300 calories"_ → She will log your workout and update your dashboard stats.
  - _"I had a 500 calorie lunch"_ → She will log your meal.
  - _"I have a shoulder injury, what should I modify?"_ → She will give adjusted advice.

### 6. Quick Log on Dashboard
- On the **Dashboard**, find the **AROMI Quick Log** text box.
- Type a natural language update like: _"Did 45 min yoga today, burned 250 calories"_
- Hit **Log It** — your Dashboard stats (Total Workouts, Streak, Health Score) update instantly!

### 7. Check Your Health Score
- Navigate to the **Health Metrics** page from the sidebar.
- View your dynamically calculated **AI Health Score** (out of 100).
- Read personalized recommendations based on your workout consistency, diet, and BMI.
- You can also calculate your BMI and log vitals on this page.

---

## ❓ Troubleshooting

### "AROMI is not available"
- Make sure your `GROQ_API_KEY` is correctly set in `backend/.env`.
- Restart the backend: `docker-compose restart backend`

### Dashboard shows all zeros
- You need to **log a workout or meal** first (via AROMI chat or Quick Log).
- Generating a plan alone doesn't count as a completed workout.

### Health Score shows 0
- Log at least one workout or meal — the score recalculates automatically after each log.

### Docker build fails
- Make sure **Docker Desktop is running**.
- Try clearing Docker cache: `docker-compose build --no-cache`
- Ensure your `.env` file has no syntax errors (no extra spaces around `=`).

### YouTube videos not opening
- Verify your `YOUTUBE_API_KEY` is valid and the YouTube Data API is enabled in your Google Cloud project.

### Port already in use
- If port `5173`, `8000`, or `27017` is already in use, stop the conflicting process or change the ports in `docker-compose.yml`.

---

## 🔄 Stopping & Restarting

```bash
# Stop all services
docker-compose down

# Restart (without rebuilding)
docker-compose up -d

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f backend
```

---

**Need help?** Open an issue on [GitHub](https://github.com/A2-ashish/ArogyaMitra/issues) or reach out!

**Happy Fitness Journey! 💪🏋️🥗**
