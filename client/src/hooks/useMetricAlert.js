import { useEffect, useMemo } from "react";
import { useAlertManager } from "../alerts/AlertProvider";

// Built-in fallbacks if your /config doesn't set a threshold
const DEFAULTS = {
  hr:    { warnLow: 50, warnHigh: 100, critLow: 40, critHigh: 120 },
  spo2:  { warnLow: 94,              /* no high bound */  critLow: 90 },
  resp:  { warnLow: 10, warnHigh: 20,  critLow: 8,  critHigh: 30 },
  bpSys: { warnLow: 90, warnHigh: 150, critLow: 80, critHigh: 180 },
};

// Accept either {low, high} or {warnLow/warnHigh, critLow/critHigh}
function unifyThresholds(key, incoming) {
  const raw = (incoming && incoming[key]) || {};
  const d = DEFAULTS[key] || {};

  const low  = raw.low;
  const high = raw.high;

  const warnLow  = raw.warnLow  ?? low  ?? d.warnLow;
  const warnHigh = raw.warnHigh ?? high ?? d.warnHigh;
  const critLow  = raw.critLow  ?? low  ?? d.critLow;
  const critHigh = raw.critHigh ?? high ?? d.critHigh;

  return { warnLow, warnHigh, critLow, critHigh };
}

function computeLevel(metricKey, value, thresholds) {
  if (value == null || Number.isNaN(Number(value))) return "normal";
  const v = Number(value);
  const t = unifyThresholds(metricKey, thresholds);

  switch (metricKey) {
    case "hr":
    case "resp":
    case "bpSys": {
      if (t.critLow != null && v <= t.critLow) return "critical";
      if (t.critHigh != null && v >= t.critHigh) return "critical";
      if (t.warnLow != null && v <= t.warnLow) return "warning";
      if (t.warnHigh != null && v >= t.warnHigh) return "warning";
      return "normal";
    }
    case "spo2": {
      // SpO2 is mainly “low is bad”
      if (t.critLow != null && v <= t.critLow) return "critical";
      if (t.warnLow  != null && v <= t.warnLow)  return "warning";
      return "normal";
    }
    default:
      return "normal";
  }
}

export function useMetricAlert(patientId, metricKey, value, thresholds) {
  const { reportMetric, alerts, acknowledgePatient, getDerivedLevel } = useAlertManager();

  const level = useMemo(
    () => computeLevel(metricKey, value, thresholds),
    [metricKey, value, thresholds]
  );

  // Report this metric’s level whenever it changes
  useEffect(() => {
    if (!patientId || !metricKey) return;
    reportMetric(patientId, metricKey, level);
  }, [patientId, metricKey, level, reportMetric]);

  const entry = alerts[patientId];
  const isAcknowledged = Boolean(entry?.acknowledged);
  const patientLevel = getDerivedLevel(patientId);

  return {
    level,                  // this metric's level
    patientLevel,           // max over patient's metrics
    isAcknowledged,         // per-patient
    acknowledge: () => acknowledgePatient(patientId),
  };
}
