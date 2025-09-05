# MedPulse Patient Hub

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)

A **real-time patient monitoring web app** built with **Express, Socket.IO, and 
React**.  
It simulates ICU vitals (HR, SpO₂, Respiration, BP) and streams them to a modern 
dashboard.

---

## 🖼️ Screenshots
<div align="center">
  <img alt="MedPulse Patient Hub Demo" src="docs/medpulse-demo.gif" width="700" />
  <br/><sub>Live demo (placeholder GIF - replace with real capture)</sub>
</div>
<div align="center">
  <img alt="MedPulse Patient Hub — Dashboard" src="docs/medpulse-dashboard.png" 
width="900" />
  <br/><sub>Dashboard with real-time vitals (simulated)</sub>
  <br/><br/>
  <img alt="MedPulse Patient Hub — Patient Detail" src="docs/medpulse-detail.png" 
width="900" />
  <br/><sub>Patient detail view with combined chart + thresholds</sub>
</div>

*(📌 Placeholder images — add yours into `/docs` folder later)*

---

## 🚀 Quick Demo

### Prereqs
- Node.js **18+**  
- npm **9+**

### Run locally
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev

### In Browser
Open http://localhost:5173

Backend API: http://localhost:4000

###Run with Docker
docker compose up --build

Frontend: http://localhost:5173
Backend: http://localhost:4000

###✨ Features

🔌 Mock vitals generator (HR, SpO₂, Resp, BP)

🔴 Alert states when vitals go out of safe range

📈 Real-time charts (Socket.IO + Recharts)

👤 Patient detail modal with 10-minute history & thresholds

🌑 Dark ICU-inspired UI (Tailwind)

###🧩 Tech Stack

Server: Node.js, Express, Socket.IO

Client: React (Vite), TailwindCSS, Recharts

Packaging: Docker Compose

###⚙️ Config

Server env vars

PORT (default 4000)

TICK_MS (default 1000) → update interval (ms)

MP_MEAN_GAP_MS (default 25000) → avg gap between patient episodes

Client env vars

VITE_API_BASE (default http://localhost:4000)

###🧯 Troubleshooting

Blank screen: check browser console, ensure /config is reachable

No updates: backend must show MedPulse server running on :4000

Port in use: change client port in vite.config.js or kill process

###📌 Portfolio Highlights

End-to-end full-stack build (Express → React)

Real-time WebSocket streaming

Modular mock data generator with patient “profiles”

Recruiter-friendly showcase project

📝 License

MIT — for educational and portfolio use.
