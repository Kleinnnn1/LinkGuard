import type { Scan, ScanStatus } from "../types";

type Props = {
  scan: Scan;
};

const statusConfig: Record<
  ScanStatus,
  { label: string; bg: string; border: string; color: string; icon: string }
> = {
  safe: {
    label: "Safe",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#15803d",
    icon: "✓",
  },
  suspicious: {
    label: "Suspicious",
    bg: "#fffbeb",
    border: "#fde68a",
    color: "#b45309",
    icon: "⚠",
  },
  malicious: {
    label: "Malicious",
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#dc2626",
    icon: "✕",
  },
  unknown: {
    label: "Unknown",
    bg: "#f9fafb",
    border: "#e5e7eb",
    color: "#6b7280",
    icon: "?",
  },
};

export default function ScanResult({ scan }: Props) {
  const config = statusConfig[scan.status];

  return (
    <div className="w-full max-w-xl mb-6">
      <div
        className="w-full rounded-2xl p-5"
        style={{ background: config.bg, border: `1px solid ${config.border}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-semibold"
              style={{ color: config.color }}
            >
              {config.icon} {config.label}
            </span>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: config.border, color: config.color }}
          >
            Google Safe Browsing
          </span>
        </div>
        <p
          className="text-xs truncate"
          style={{ color: config.color, opacity: 0.7 }}
        >
          {scan.url}
        </p>
      </div>
    </div>
  );
}
