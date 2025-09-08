import { useAlertManager } from "../alerts/AlertProvider";

export default function AlertHUD() {
  const { alerts, getDerivedLevel, acknowledgePatient, soundEnabled, setSoundEnabled } = useAlertManager();
  const critIds = Object.keys(alerts).filter(id => getDerivedLevel(id) === "critical");

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 rounded-xl bg-black/70 text-white p-3 shadow-xl">
      {!soundEnabled && (
        <button
          onClick={() => setSoundEnabled(true)}
          className="px-3 py-1 text-xs rounded bg-blue-600"
        >
          Enable Alert Sound
        </button>
      )}
      {critIds.length > 0 ? (
        critIds.map(id => (
          <div key={id} className="flex items-center gap-2">
            <span className="text-xs">Patient {id}: CRITICAL</span>
            <button
              onClick={() => acknowledgePatient(id)}
              className="px-2 py-0.5 text-xs rounded bg-neutral-200 text-black"
            >
              Acknowledge
            </button>
          </div>
        ))
      ) : (
        <div className="text-xs text-neutral-300">No critical alerts</div>
      )}
    </div>
  );
}
