import { useState, useRef } from "react";
import type { Scan } from "../types";

type Props = {
  onResult: (scan: Scan) => void;
};

export default function Scanner({ onResult }: Props) {
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!isValidUrl(targetUrl))
      return setError("Please enter a valid URL including https://");

    setError("");
    setScanning(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();
      if (!response.ok) return setError(data.error || "Something went wrong.");
      onResult({ url: targetUrl, status: data.status });
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

    const jsQR = (await import("jsqr")).default;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        handleScan(code.data);
      } else {
        setError("No QR code found in the image.");
      }
    };
  };

  return (
    <div className="w-full max-w-xl mb-6">
      <div
        className="w-full rounded-2xl p-6"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        {/* Upload + Camera row */}
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
          <span className="text-xs" style={{ color: "#9ca3af" }}>
            or paste URL
          </span>
          <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleScan(url)}
          placeholder="https://example.com"
          className="w-full h-11 rounded-lg px-4 text-sm outline-none mb-3"
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            color: "#111827",
          }}
        />

        {/* Error */}
        {error && (
          <p className="text-xs mb-3" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {/* Scan Button */}
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
      </div>
    </div>
  );
}
