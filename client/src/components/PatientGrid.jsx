import { useEffect, useState } from "react";
import VitalTile from "./VitalTile";
import { getSocket } from "../lib/socket";
import PatientDetail from "./PatientDetail";

export default function PatientGrid() {
  const [cfg, setCfg] = useState({ patients: [], thresholds: {} });
  const [selected, setSelected] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE ?? "http://localhost:4000") + "/config")
      .then(r => r.json())
      .then(c => setCfg(c))
      .catch(() => setCfg({ patients: [], thresholds: {} }));
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cfg.patients.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="text-left rounded-2xl bg-black/80 p-3 border border-neutral-800 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          >
            <div className="text-neutral-300 text-sm mb-2">{p.name}</div>
            <div className="grid grid-cols-2 gap-3">
              <VitalTile label="HR (bpm)"   keyName="hr"    stream={socket} thresholds={cfg.thresholds} />
              <VitalTile label="SpO₂ (%)"   keyName="spo2"  stream={socket} thresholds={cfg.thresholds} />
              <VitalTile label="Resp (rpm)" keyName="resp"  stream={socket} thresholds={cfg.thresholds} />
              <VitalTile label="BP Sys"     keyName="bpSys" stream={socket} thresholds={cfg.thresholds} />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <PatientDetail
          patient={selected}
          onClose={() => setSelected(null)}
          thresholds={cfg.thresholds}
        />
      )}
    </>
  );
}

