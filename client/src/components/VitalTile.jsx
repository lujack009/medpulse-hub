import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function VitalTile({ label, keyName, stream, thresholds }) {
  const [data, setData] = useState([]);
  const [last, setLast] = useState(null);
  const connected = useRef(true);

  const outOfRange = (() => {
    if (last == null || !thresholds?.[keyName]) return false;
    const { low, high } = thresholds[keyName];
    return last < low || last > high;
  })();

  useEffect(() => {
    const onVitals = (p) => {
      const v = p?.vitals?.[keyName];
      if (v == null) return;
      setLast(v);
      setData(d => {
        const next = [...d, { t: p.t, v }];
        return next.length > 120 ? next.slice(next.length - 120) : next;
      });
    };
    const onConnect = () => (connected.current = true);
    const onDisconnect = () => (connected.current = false);

    stream.on("vitals", onVitals);
    stream.on("connect", onConnect);
    stream.on("disconnect", onDisconnect);
    return () => {
      stream.off("vitals", onVitals);
      stream.off("connect", onConnect);
      stream.off("disconnect", onDisconnect);
    };
  }, [keyName, stream]);

  return (
    <div
      className={[
        "rounded-2xl p-4 bg-neutral-900 border shadow transition-colors",
        outOfRange
          ? "border-red-500/70 shadow-red-900/30"
          : "border-neutral-800"
      ].join(" ")}
      role="region"
      aria-label={`${label} tile`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-neutral-200 font-medium">{label}</h3>
        <div className="flex items-center gap-2">
          {last != null && (
            <span className="text-xs text-neutral-300 tabular-nums">{last}</span>
          )}
          {!connected.current && (
            <span className="text-xs text-amber-400">live feed paused</span>
          )}
        </div>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="t" hide />
            <YAxis hide />
            <Tooltip />
            <Line type="monotone" dataKey="v" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

