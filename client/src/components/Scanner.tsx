import { useState, useRef, useEffect } from "react";
import type { Scan } from "../types";

type Props = {
  onResult: (scan: Scan) => void;
};

export default function Scanner({ onResult }: Props) {
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<unknown>(null);

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = async (targetUrl: string) => {
    if (!targetUrl) return setError("Please enter a URL.");

    let formattedUrl = targetUrl.trim();
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (!isValidUrl(formattedUrl)) return setError("Please enter a valid URL.");

    setError("");
    setScanning(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const data = await response.json();
      if (!response.ok) return setError(data.error || "Something went wrong.");
      onResult({ url: formattedUrl, status: data.status });
      setUrl("");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader-hidden");
      const result = await html5QrCode.scanFile(file, false);
      handleScan(result);
    } catch {
      setError("No QR code found. Try a clearer or higher resolution image.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startCamera = async () => {
    setError("");
    setCameraActive(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-camera-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCamera();
          handleScan(decodedText);
        },
        () => {},
      );
    } catch (err) {
      console.error(err);
      setError("Could not access camera. Please allow camera permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    try {
      const scanner = scannerRef.current as {
        stop: () => Promise<void>;
        clear: () => void;
      };
      if (scanner) {
        await scanner.stop();
        scanner.clear();
      }
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full max-w-xl mb-6">
      <div id="qr-reader-hidden" style={{ display: "none" }} />

      <div
        className="w-full rounded-2xl p-6"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        {!cameraActive && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-4 text-xs transition-all duration-200"
              style={{
                background: "#f3f4f6",
                border: "1px dashed #d1d5db",
                color: "#9ca3af",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.color = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              <span style={{ fontSize: "20px" }}>⬆</span>
              Upload QR Image
            </button>
            <button
              onClick={startCamera}
              className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl py-4 text-xs transition-all duration-200"
              style={{
                background: "#f3f4f6",
                border: "1px dashed #d1d5db",
                color: "#9ca3af",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.color = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              <span style={{ fontSize: "20px" }}>◉</span>
              Use Camera
            </button>
          </div>
        )}

        {cameraActive && (
          <div className="mb-4">
            <div
              id="qr-camera-reader"
              className="w-full rounded-xl overflow-hidden"
              style={{ border: "1px solid #e5e7eb" }}
            />
            <button
              onClick={stopCamera}
              className="w-full mt-3 h-10 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fee2e2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fef2f2";
              }}
            >
              Stop Camera
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {!cameraActive && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
            <span className="text-xs" style={{ color: "#9ca3af" }}>
              or paste URL
            </span>
            <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
          </div>
        )}

        {!cameraActive && (
          <>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleScan(url)}
              placeholder="https://example.com or google.com"
              className="w-full h-11 rounded-lg px-4 text-sm outline-none mb-3"
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                color: "#111827",
              }}
            />

            {error && (
              <p className="text-xs mb-3" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            <button
              onClick={() => handleScan(url)}
              disabled={scanning}
              className="w-full h-11 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: scanning ? "#93c5fd" : "#2563eb",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                if (!scanning) e.currentTarget.style.background = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                if (!scanning) e.currentTarget.style.background = "#2563eb";
              }}
            >
              {scanning ? "Scanning..." : "Scan Now"}
            </button>
          </>
        )}

        {cameraActive && error && (
          <p className="text-xs mt-2" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
