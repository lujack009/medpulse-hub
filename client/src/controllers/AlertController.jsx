import { useEffect, useState } from "react";
import { useMetricAlert } from "../hooks/useMetricAlert";

export default function AlertController({ patientId, stream, thresholds }) {
  const [vals, setVals] = useState({ hr: null, spo2: null, resp: null, bpSys: null 
});

  useEffect(() => {
    if (!stream || !patientId) return;
    const onVitals = (p) => {
      if (!p || p.id !== patientId) return;
      const v = p.vitals ?? p; // supports nested or flat
      setVals({
        hr: v.hr ?? null,
        spo2: v.spo2 ?? null,
        resp: v.resp ?? null,
        bpSys: v.bpSys ?? null,
      });
    };
    stream.on?.("vitals", onVitals);
    return () => {
      stream.off?.("vitals", onVitals);
      stream.removeListener?.("vitals", onVitals);
    };
  }, [stream, patientId]);

  // Report levels centrally (drives audio + ack state)
  useMetricAlert(patientId, "hr", vals.hr, thresholds);
  useMetricAlert(patientId, "spo2", vals.spo2, thresholds);
  useMetricAlert(patientId, "resp", vals.resp, thresholds);
  useMetricAlert(patientId, "bpSys", vals.bpSys, thresholds);

  return null; // logic-only
}

