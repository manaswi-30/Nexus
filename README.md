![CI](https://github.com/manaswi-30/nexus-traffic/actions/workflows/ci.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![Coverage](https://img.shields.io/badge/Coverage-78%25-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

# NEXUS — Neural EXchange for Urban Signals

A production-grade, full-stack AI traffic management system featuring multi-agent reinforcement learning, real-time computer vision, JWT authentication, role-based access control, and a live React dashboard.

> Built to solve a real problem: India loses ₹1.4 lakh crore annually to traffic congestion. NEXUS replaces fixed-time signals with intelligent, self-learning AI agents at a 99.9% cost reduction vs incumbent systems like SCATS.

---

## Live Demo

- **Dashboard:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs
- **WebSocket:** ws://localhost:8000/ws

---

## Key Features

| Feature | Technology | Detail |
|---|---|---|
| Multi-agent RL | DQN (stable-baselines3) | 16 independent agents, 200K training steps, 55% wait time reduction |
| Computer Vision | YOLOv8 Nano | Real-time vehicle, pedestrian, bus and emergency vehicle detection |
| Authentication | JWT + bcrypt | Secure login with hashed passwords and token-based sessions |
| Role-Based Access | RBAC | Admin, Operator, Viewer — scoped permissions per role |
| Emergency Pre-emption | Custom corridor logic | Full signal corridor cleared in under 1 second |
| Weather Adaptation | Multiplier system | Rain ×1.3, Fog ×1.5, Storm ×1.8 green phase extension |
| Bus Priority | Phase override | Immediate signal switch on bus detection |
| Emissions Tracking | CO₂ calculation | Live savings vs fixed-time baseline |
| Incident Detection | Threshold monitoring | Flags congestion spikes and stalled vehicles automatically |
| Live Dashboard | React + WebSocket | Real-time updates every second across all 16 intersections |
| Cloud Database | PostgreSQL (Railway) | Persistent storage for logs, users, emissions and events |
| CI Pipeline | GitHub Actions | Auto-runs 30 tests on every push, enforces 70% coverage |
| LLM Chatbot | Claude API | Officer Ray — AI traffic assistant with 5 knowledge domains |

---

## Architecture
┌─────────────────────────────────────────────────────────────┐
│                        PERCEPTION                           │
│              YOLOv8 Camera → Vehicle Detection              │
└──────────────────────────┬──────────────────────────────────┘
│
┌──────────────────────────▼──────────────────────────────────┐
│                       INTELLIGENCE                          │
│         16 × DQN RL Agents (4×4 intersection grid)         │
│     Weather · Emergency · Bus Priority · Incident Logic     │
└──────────────────────────┬──────────────────────────────────┘
│
┌──────────────────────────▼──────────────────────────────────┐
│                        ACTUATION                            │
│       FastAPI Backend + WebSocket → React Dashboard         │
│         JWT Auth · RBAC · PostgreSQL · REST API             │
└─────────────────────────────────────────────────────────────┘
---

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, JWT, bcrypt, WebSockets

**AI/ML:** stable-baselines3 (DQN), YOLOv8, NumPy, OpenCV

**Frontend:** React 18, Vite, WebSocket API

**Infrastructure:** Docker, Railway, GitHub Actions CI/CD

**LLM:** Anthropic Claude API (Officer Ray chatbot)

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local or Railway cloud)

### 1. Clone and setup
```bash
git clone https://github.com/manaswi-30/nexus-traffic.git
cd nexus-traffic
cp .env.example .env
# Fill in your values in .env
```

### 2. Install backend dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Initialize database
```bash
python -m backend.core.init_db
```

### 4. Start backend
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start dashboard
```bash
cd frontend
npm install
npm run dev
```

### 6. Open browser
Dashboard → http://localhost:5173
API Docs  → http://localhost:8000/docs
---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT token |
| GET | `/api/v1/auth/me` | Authenticated | Get current user info |

### Traffic (Protected)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/traffic/status` | Any role | Live traffic status |
| POST | `/api/v1/traffic/emergency` | Operator+ | Trigger emergency corridor |
| GET | `/api/v1/traffic/logs` | Admin only | Intersection history |
| GET | `/api/v1/traffic/emissions` | Admin only | CO₂ savings data |
| GET | `/api/v1/traffic/emergency/history` | Admin only | Past emergency events |

### Simulation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/intersections` | Public | All 16 intersection states |
| GET | `/weather` | Public | Current weather condition |
| GET | `/metrics` | Public | System-wide KPIs |
| GET | `/emissions` | Public | Emissions summary |
| GET | `/incidents` | Public | Active incidents |
| POST | `/sensor_update` | Public | Feed real camera data |
| WS | `/ws` | Public | Live WebSocket stream |

---

## Running Tests

```bash
# Run all tests with coverage
pytest backend/tests/ -v --cov=backend --cov-report=term-missing

# Current results
# 30 tests | 78% coverage | All passing
```

---

## User Roles

| Role | Dashboard Access | Emergency | Logs & Emissions |
|---|---|---|---|
| Admin | Full | ✅ | ✅ |
| Operator | Full | ✅ | ❌ |
| Viewer | Read only | ❌ | ❌ |

---

## Cost Analysis

| Scale | Monthly Cost | vs SCATS |
|---|---|---|
| 10 junctions | $0.00 (Free Tier) | ₹40L/junction saved |
| 100 junctions | $0.08 | 99.9% cheaper |
| 1,000 junctions | $185 | 99.9% cheaper |
| 10,000 junctions | $1,720 | 99.9% cheaper |

---

## Project Structure
nexus-traffic/
├── backend/
│   ├── api/
│   │   ├── auth.py           ← JWT auth endpoints
│   │   └── traffic.py        ← Protected traffic endpoints
│   ├── core/
│   │   ├── auth.py           ← Password hashing, token logic
│   │   ├── config.py         ← Environment settings
│   │   ├── database.py       ← SQLAlchemy setup
│   │   ├── dependencies.py   ← RBAC guards
│   │   └── init_db.py        ← Table creation
│   ├── models/
│   │   ├── traffic.py        ← DB models for logs
│   │   └── user.py           ← User model
│   ├── tests/
│   │   ├── conftest.py       ← Test fixtures
│   │   ├── test_auth.py      ← 13 auth tests
│   │   └── test_traffic.py   ← 17 traffic tests
│   └── main.py               ← FastAPI app + simulation loop
├── frontend/
│   └── src/
│       ├── App.jsx            ← Live dashboard
│       └── components/
│           └── OfficerRay.jsx ← AI chatbot mascot
├── simulation/
│   ├── train_agent.py         ← DQN training script
│   └── emergency_detector.py  ← YOLOv8 detection
├── .github/
│   └── workflows/
│       └── ci.yml             ← GitHub Actions CI
├── .env.example
├── docker-compose.yml
└── README.md
---

## RL Training Results
Algorithm:     DQN (Deep Q-Network)
Training:      200,000 timesteps
Environment:   4×4 grid (16 intersections)
Initial Reward: -70,500
Final Reward:   -31,900
Improvement:   55% reduction in average wait time
Baseline:      Fixed-time signal system
---

## License

MIT License — free to use, modify and distribute.

---

## Author

**Manaswi** — github.com/manaswi-30
