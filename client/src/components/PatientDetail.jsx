import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getSocket } from "../lib/socket";

export default function PatientDetail({ patient, onClose, thresholds }) {
  const [history, setHistory] = useState([]);
  const socket = getSocket();

  // Load last ~10 minutes from REST
  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE ?? "http://localhost:4000") + `/history/${patient.id}`)
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [patient.id]);

  // Live append from socket
  useEffect(() => {
    const onVitals = (p) => {
      if (p.id !== patient.id) return;
      setHistory(h => {
        const next = [...h, p];
        return next.length > 600 ? next.slice(next.length - 600) : next;
      });
    };
    socket.on("vitals", onVitals);
    return () => socket.off("vitals", onVitals);
  }, [patient.id, socket]);

  const data = useMemo(() => history.map(pt => ({
    t: pt.t,
    hr: pt.vitals.hr,
    spo2: pt.vitals.spo2,
    resp: pt.vitals.resp,
    bpSys: pt.vitals.bpSys,
    bpDia: pt.vitals.bpDia
  })), [history]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-5xl rounded-2xl bg-neutral-950 border border-neutral-800">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold">{patient.name}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700">
            Close
          </button>
        </div>

        <div className="p-4 grid gap-6">
          {/* Combined chart */}
          <div className="h-72 rounded-xl border border-neutral-800 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="t" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hr"    dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="spo2"  dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="resp"  dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bpSys" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bpDia" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Threshold legend */}
          <div className="text-sm text-neutral-300 grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(thresholds || {}).map(([k, v]) => (
              <div key={k} className="rounded-md border border-neutral-800 p-2">
                <div className="uppercase text-xs text-neutral-400">{k}</div>
                <div>low: {v.low} &nbsp; high: {v.high}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

