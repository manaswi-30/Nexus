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
**Event:** DAKSH AI Hackathon 2026, March 13–15 | SASTRA University
