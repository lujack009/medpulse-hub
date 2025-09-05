import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import { makePatient, stepVitals } from "./mock/vitals.js";
import { RingBuffer } from "./services/ringBuffer.js";
import { THRESHOLDS } from "./services/thresholds.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: "*" } });

const TICK_MS = Number(process.env.TICK_MS || 1000);

// server/src/index.js (snippet)
const patients = [
  makePatient("p1", "John Doe",     "stable",  -3000), // slight lead
  makePatient("p2", "Ava Martinez", "postop",   0),
  makePatient("p3", "Samir Shah",   "copdlike", +1500),
  makePatient("p4", "Grace Kim",    "anxious",  +3200),
];


// Per-patient ring buffers
const history = Object.fromEntries(
  patients.map(p => [p.id, new RingBuffer(600)])
);

// Routes
app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/config", (_, res) =>
  res.json({
    tickMs: TICK_MS,
    thresholds: THRESHOLDS,
    patients: patients.map(p => ({ id: p.id, name: p.name }))
  })
);
app.get("/history/:pid", (req, res) => {
  const rb = history[req.params.pid];
  if (!rb) return res.status(404).json({ error: "not found" });
  res.json(rb.toArray());
});

// Socket wiring
io.on("connection", socket => {
  socket.emit("hello", { message: "connected", at: Date.now() });
});

// Tick vitals and broadcast
setInterval(() => {
  const now = Date.now();
  for (const p of patients) {
    const updated = stepVitals(p);
    const payload = {
      t: now,
      id: p.id,
      vitals: {
        hr: updated.hr,
        spo2: updated.spo2,
        resp: updated.resp,
        bpSys: updated.bpSys,
        bpDia: updated.bpDia
      }
    };
    history[p.id].push(payload);
    io.emit("vitals", payload);
  }
}, TICK_MS);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`MedPulse server running on 
:${PORT}`));

