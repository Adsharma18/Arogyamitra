# 🏗️ ArogyaMitra – System Architecture

## AI-Driven Workout Planning, Nutrition Guidance, and Health Coaching Platform

---

## 📐 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React.js + Vite)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Dashboard │ │Workouts  │ │Nutrition │ │Health    │ │AROMI AI  │ │
│  │  Page    │ │  Page    │ │  Page    │ │Assessment│ │ Chatbot  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │             │            │       │
│  ┌────┴─────────────┴────────────┴─────────────┴────────────┴────┐ │
│  │              Zustand State Management + localStorage          │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                              │ Axios HTTP Requests                  │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   NGINX / Reverse   │
                    │      Proxy          │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                     BACKEND (FastAPI + Python)                      │
│  ┌───────────────────────────┴───────────────────────────────────┐ │
│  │                    FastAPI Application                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │ │
│  │  │Auth     │ │Workout  │ │Nutrition│ │Health   │            │ │
│  │  │Router   │ │Router   │ │Router   │ │Router   │            │ │
│  │  └────┬────┘ └────┬────┘ └────┬─────┘ └────┬─────┘            │ │
│  │       │           │           │            │                  │ │
│  │  ┌────┴───────────┴───────────┴────────────┴────────────────┐│ │
│  │  │              SERVICE LAYER (Business Logic)               ││ │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  ││ │
│  │  │  │Workout   │ │Nutrition │ │Analytics │ │AI Coach    │  ││ │
│  │  │  │Service   │ │Service   │ │Service   │ │Service     │  ││ │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  ││ │
│  │  └──────────────────────┬───────────────────────────────────┘│ │
│                         │                                     │ │
│  ┌───────────────────────┴───────────────────────────────────┐│ │
│  │              INTEGRATION LAYER                            ││ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  ││ │
│  │  │Groq AI   │ │YouTube   │ │Spoonacul │ │Google      │  ││ │
│  │  │LLaMA-3.3 │ │Data API  │ │ar API    │ │Calendar API│  ││ │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘  ││ │
│  │  └──────────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│  ┌───────────────────────────┴───────────────────────────────────┐ │
│  │                    MongoDB (Database)                          │ │
│  │  ┌──────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────────┐  │ │
│  │  │Users │ │Workouts  │ │Meals   │ │Health  │ │Chat       │  │ │
│  │  │      │ │& Plans   │ │& Plans │ │Records │ │History    │  │ │
│  │  └──────┘ └──────────┘ └────────┘ └────────┘ └───────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### Request Flow
```
User Action → React Component → Zustand Store → Axios Service
    → FastAPI Router → Service Layer → Integration/DB → Response
    → Zustand Store Update → React Re-render
```

### AI Flow
```
User Request → FastAPI Router → AI Coach Service
    → Context Builder (User Profile + History + Goals)
    → Groq LLaMA-3.3-70B API → Response Parser
    → MongoDB (Save Chat) → Frontend Display
```

### Authentication Flow
```
Register/Login → FastAPI Auth Router → Password Hash (bcrypt)
    → MongoDB User Lookup → JWT Token Generation
    → Access Token (30 min) + Refresh Token (7 days)
    → Frontend localStorage via Zustand persist
```

---

## 🧱 Layer Responsibilities

### 1. Presentation Layer (Frontend - React.js)
- User interface rendering
- Client-side routing (React Router v6)
- State management (Zustand + localStorage persistence)
- Form validation and UX
- API communication (Axios with interceptors)

### 2. API Layer (FastAPI Routers)
- Request validation (Pydantic v2)
- Authentication middleware (JWT)
- Route handling and delegation to services
- Response formatting
- CORS and rate limiting

### 3. Service Layer (Business Logic)
- Core application logic
- Data transformation
- AI prompt construction
- Cross-module coordination
- Caching strategies

### 4. Integration Layer (External APIs)
- Groq LLaMA-3.3-70B: AI generation
- YouTube Data API v3: Exercise videos
- Spoonacular API: Recipes & nutrition
- Google Calendar API: Schedule sync
- Error handling & retry logic

### 5. Data Layer (MongoDB)
- Document storage (Motor async driver)
- Indexing for performance
- Data relationships via ObjectId references
- Aggregation pipelines for analytics

---

## 🔐 Security Architecture

| Layer | Security Measure |
|-------|-----------------|
| **Transport** | HTTPS/TLS encryption |
| **Authentication** | JWT (HS256) with access + refresh tokens |
| **Password** | bcrypt hashing with salt |
| **API** | CORS whitelist, rate limiting |
| **Input** | Pydantic validation, sanitization |
| **Environment** | .env files, never commit secrets |
| **Frontend** | Protected routes, token auto-refresh |

---

## 📡 External API Integration Map

| API | Purpose | Rate Limit | Fallback |
|-----|---------|------------|----------|
| **Groq** | AI generation | 30 RPM (free) | Cached responses |
| **YouTube** | Exercise videos | 10,000 units/day | Static video links |
| **Spoonacular** | Recipes | 150 calls/day (free) | Local recipe cache |
| **Google Calendar** | Schedule sync | 1M queries/day | Manual reminders |

---

## 🐳 Deployment Architecture

```
┌─────────────────────────────────────┐
│         Docker Compose              │
│  ┌─────────────┐ ┌──────────────┐  │
│  │  Frontend    │ │  Backend     │  │
│  │  (Node:18)   │ │  (Python:3.11)│  │
│  │  Port: 5173  │ │  Port: 8000  │  │
│  └──────┬──────┘ └──────┬───────┘  │
│         │               │           │
│  ┌──────┴───────────────┴───────┐  │
│  │       MongoDB 7.0            │  │
│  │       Port: 27017            │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```
