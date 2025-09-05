import PatientGrid from "./components/PatientGrid";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="p-4 border-b border-neutral-800">
        <h1 className="text-xl font-semibold">MedPulse Patient Hub</h1>
        <p className="text-sm text-neutral-400">Real-time patient vitals (simulated) · Click a patient for details</p>
      </header>
      <main className="p-4">
        <PatientGrid />
      </main>
    </div>
  );
}

