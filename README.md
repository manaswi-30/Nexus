\# Nexus-Traffic-

Hybrid AI Traffic Management System using Reinforcement Learning, FastAPI and React.

\# 🚦 NEXUS - Hybrid AI Traffic Orchestration System



> \*\*An intelligent traffic management platform that combines Reinforcement Learning with rule-based decision making to optimize traffic flow across multiple connected intersections.\*\*



!\[Python](https://img.shields.io/badge/Python-3.11-blue)

!\[FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)

!\[React](https://img.shields.io/badge/React-Frontend-61DAFB)

!\[SQLite](https://img.shields.io/badge/SQLite-Database-blue)

!\[Stable%20Baselines3](https://img.shields.io/badge/RL-DQN-orange)



\---



\# 📖 Overview



NEXUS is a hybrid AI-powered traffic management system designed to demonstrate how intelligent traffic signal control can improve urban mobility.



Traditional traffic lights operate on fixed timing schedules and cannot effectively adapt to changing traffic conditions. NEXUS addresses this by combining a trained \*\*Deep Q-Network (DQN)\*\* with deterministic traffic control rules to dynamically manage signal phases across a network of connected intersections.



Rather than relying solely on artificial intelligence, NEXUS follows a \*\*hybrid architecture\*\*, where Reinforcement Learning optimizes normal traffic flow while rule-based logic handles critical scenarios such as emergency vehicles, pedestrian demand, and public transport priority.



\---



\# ✨ Features



\- 🚦 Reinforcement Learning based adaptive traffic signal control

\- 🧠 Hybrid AI + Rule-based decision architecture

\- 🚑 Emergency corridor pre-emption

\- 🚌 Public transport (bus) priority

\- 🚶 Pedestrian-aware signal management

\- 🌦 Weather-adaptive traffic simulation

\- 🚧 Incident detection

\- 📊 Real-time traffic dashboard

\- 🤖 Officer Ray AI traffic assistant

\- 🔐 Role-based authentication

\- 🌱 Environmental analytics (CO₂ \& fuel savings)

\- 📡 REST APIs with FastAPI

\- ⚡ Real-time updates using WebSockets



\---



\# 🏗 System Architecture



```

&#x20;               Traffic Simulation

&#x20;                       │

&#x20;                       ▼

&#x20;       ┌──────────────────────────────────┐

&#x20;       │      Hybrid Decision Engine       │

&#x20;       └──────────────────────────────────┘

&#x20;               │                    │

&#x20;               ▼                    ▼

&#x20;     Rule-Based Controller      DQN Model

&#x20;               │                    │

&#x20;               └──────────┬─────────┘

&#x20;                          ▼

&#x20;                Traffic Signal Decision

&#x20;                          │

&#x20;                          ▼

&#x20;                 FastAPI Backend

&#x20;                          │

&#x20;       ┌──────────────────┴──────────────────┐

&#x20;       ▼                                     ▼

&#x20;React Dashboard                     Officer Ray AI

```



\---



\# 🧠 Reinforcement Learning



The adaptive traffic controller is built using a \*\*Deep Q-Network (DQN)\*\* trained with Stable-Baselines3.



The agent learns optimal traffic signal decisions by observing:



\- Lane queue lengths

\- Traffic density

\- Current traffic phase

\- Phase duration

\- Neighbouring intersection state



The objective is to reduce congestion by minimizing queue lengths and waiting time while maintaining efficient traffic flow.



\---



\# ⚙ Hybrid Decision Architecture



NEXUS combines machine learning with deterministic traffic engineering rules.



\### Normal Traffic



The DQN predicts the most suitable traffic signal phase based on the current traffic state.



\### Priority Scenarios



Special situations are handled explicitly through rule-based logic:



\- Emergency vehicle pre-emption

\- Bus priority

\- Pedestrian crossing requests

\- Minimum green time enforcement

\- Weather-aware traffic behaviour



This hybrid approach improves both safety and explainability.



\---



\# 💻 Technology Stack



\## Backend



\- FastAPI

\- Python

\- SQLite

\- Stable-Baselines3

\- NumPy

\- WebSockets



\## Frontend



\- React

\- Vite



\## AI



\- Deep Q-Network (DQN)

\- Reinforcement Learning

\- Groq LLM Integration (Officer Ray)



\---



\# 📡 REST APIs



FastAPI automatically generates interactive API documentation.



Major API modules include:



\- Authentication

\- Traffic Monitoring

\- Weather Updates

\- Emergency Management

\- Emissions Analytics

\- Metrics

\- AI Chat

\- Sensor Updates



Swagger UI:



```

http://localhost:8000/docs

```



\---



\# 🚀 Running the Project



\## Backend



```bash

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

```



\## Frontend



```bash

cd frontend

npm install

npm run dev

```



Alternatively,



```

start\_nexus.bat

```



starts both frontend and backend.



\---



\# 📸 Screenshots



> \*(Screenshots will be added soon.)\*



\- Login

\- Dashboard

\- Officer Ray

\- Swagger API

\- Emergency Corridor



\---



\# 🎥 Demo



A demonstration video of the project will be added here.



\---



\# 📂 Project Structure



```

backend/

frontend/

models/

scripts/

.github/

```



\---



\# 🌍 Future Improvements



\- Integration with live traffic cameras

\- YOLO-based vehicle detection

\- SUMO traffic simulator integration

\- Multi-agent Reinforcement Learning

\- Cloud deployment

\- Predictive congestion forecasting



\---



\# 👩‍💻 Author



\*\*Manaswi Patibandla\*\*



\---



\# 📄 License



This project is intended for educational and portfolio purposes.

