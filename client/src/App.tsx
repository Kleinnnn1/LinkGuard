import { useState, useEffect } from "react";
import Scanner from "./components/Scanner";
import ScanResult from "./components/ScanResult";
import RecentScans from "./components/RecentScans";
import type { Scan } from "./types";

export default function App() {
  const [result, setResult] = useState<Scan | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/scan/history`)
      .then((res) => res.json())
      .then((data) => setScans(data))
      .catch(() => console.error("Failed to fetch scan history"))
      .finally(() => setLoading(false));
  }, []);

  const handleResult = (scan: Scan) => {
    setResult(scan);
    setScans((prev) => [scan, ...prev]);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-16 px-4">
      {/* Header */}
      <div className="w-full max-w-xl flex flex-col items-center mb-10">
        <p
          className="text-xs tracking-widest uppercase mb-4 font-medium"
          style={{ color: "#2563eb" }}
        >
          LinkGuard
        </p>
        <h1
          className="text-3xl font-semibold text-center mb-2"
          style={{ color: "#111827" }}
        >
          Scan. Check. Stay Safe.
        </h1>
        <p className="text-sm text-center" style={{ color: "#9ca3af" }}>
          Upload a QR code, scan with your camera, or paste a URL to check if
          it's safe
        </p>
      </div>

      <Scanner onResult={handleResult} />
      {result && <ScanResult scan={result} />}
      <RecentScans scans={scans} loading={loading} />
    </div>
  );
}
