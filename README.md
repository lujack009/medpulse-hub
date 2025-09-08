# MedPulse Patient Hub — **Beta**
![status: beta](https://img.shields.io/badge/status-beta-orange)
![stack](https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20Tailwind%20%7C%20Recharts%20%7C%20Node%20%7C%20Socket.IO-blue)
![license: MIT](https://img.shields.io/badge/license-MIT-green)
![node >=18](https://img.shields.io/badge/node-%3E%3D18-339933)
[![Last commit](https://img.shields.io/github/last-commit/<you>/<repo>)](https://github.com/lujack009/medpulse-hub/commits/main)

Real-time patient vitals dashboard (simulated). Built full-stack with **React + 
Vite + Tailwind + Recharts** on the client and **Node/Express + Socket.IO** on the 
server. Includes live charts, configurable thresholds, and a centralized alert 
model (acknowledge/mute in progress).

> **Beta**: This is an active WIP. The UI, alerts and CSP hardening are being 
iterated. See **Known Issues** & **Roadmap**.

---

## ✨ Highlights

- **Live updates** via Socket.IO (1s tick by default)
- **Multi-patient grid** + waveform detail view
- **Threshold-aware tiles** (warning/critical)
- **Centralized alert model** (ack/Audible alarm; beta)
- **Dev smoketest routes** to demo critical/warning/normalize
- **Accessible UI** (keyboard activation on cards)

---

## 🧱 Tech Stack

- **Frontend:** React 18, Vite, Tailwind, Recharts
- **Backend:** Node 18+, Express, Socket.IO
- **DevX:** Vite HMR, curl-based test routes, Type-safe-ish utilities

---

## 🚀 Quickstart

> Requires **Node 18+**.

```bash
# clone
git clone <your-repo-url> && cd medpulse-hub

# install
npm install
cd client && npm install
cd ../server && npm install
cd ..

# dev: run backend then frontend (2 terminals)
cd server && npm run dev         # starts http://localhost:4000
cd client && npm run dev         # starts http://localhost:5173

Open http://localhost:5173.

🔊 Demo the alert flow (smoketest)

In a terminal (with the server running):
# Hold a critical state for 20s on patient p2
curl "http://localhost:4000/dev/critical/p2?hold=20000"

# (optional) warning state for 10s
curl "http://localhost:4000/dev/warning/p2?hold=10000"

# normalize immediately
curl "http://localhost:4000/dev/normalize/p2"

Audio asset lives at client/public/alerts/alert.mp3. Open 
http://localhost:5173/alerts/alert.mp3 to verify it serves.

🗂️ Structure
medpulse-hub/
├─ client/                  # React app (Vite)
│  ├─ public/
│  │  └─ alerts/alert.mp3   # audible alarm (beta)
│  └─ src/
│     ├─ alerts/AlertProvider.jsx
│     ├─ components/
│     │  ├─ PatientGrid.jsx
│     │  ├─ PatientDetail.jsx
│     │  ├─ WaveformBoard.jsx
│     │  └─ AlertHUD.jsx     # overlay for Enable Sound + Ack (beta)
│     ├─ controllers/AlertController.jsx
│     ├─ hooks/useMetricAlert.js
│     └─ lib/socket.js
└─ server/
   └─ src/index.js          # Express + Socket.IO; /config, /history/:pid, 
/dev/*

⚙️ Config

Client env: client/.env

VITE_API_BASE=http://localhost:4000

Server env:

PORT=4000
TICK_MS=1000

🧪 Dev routes (guarded)

GET /dev/critical/:id?hold=15000
GET /dev/warning/:id?hold=15000
GET /dev/normalize/:id

Wrapped with if (process.env.NODE_ENV !== "production") to avoid exposure in prod.

🐞 Known Issues (Beta)

Autoplay policies can block sound until the first user gesture. Use the AlertHUD 
“Enable Alert Sound” once.

Some environments enforce CSP that blocks eval in dev; allow 'unsafe-eval' in dev 
only, or run without strict CSP while developing.

Acknowledge button surfaces via AlertHUD and detail view; grid tiles show it when 
the card wrapper isn’t a <button> (we use a <div role="button">).

🗺️ Roadmap

✅ Centralized alerting (logic)

🔄 Finalize Ack UX across views

🔊 Reliable audio unlock across browsers (no visible button)

🧯 No-signal detection (already implemented option, disabled by default)

📦 Server hardening + auth + multi-ward support

📈 Historical analytics + export

🧪 CI + lint/format hooks

📸 Screenshots / GIFs

![Dashboard](client/public/media/dashboard.png)
![Critical Flow](client/public/media/critical.gif)

📄 License

MIT — see LICENSE.

