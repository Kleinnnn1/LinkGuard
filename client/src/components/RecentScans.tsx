import type { Scan, ScanStatus } from "../types";

type Props = {
  scans: Scan[];
  loading: boolean;
};

const statusColors: Record<ScanStatus, { bg: string; color: string }> = {
  safe: { bg: "#dcfce7", color: "#15803d" },
  suspicious: { bg: "#fef3c7", color: "#b45309" },
  malicious: { bg: "#fee2e2", color: "#dc2626" },
  unknown: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function RecentScans({ scans, loading }: Props) {
  if (loading) {
    return (
      <div className="w-full max-w-xl">
        <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
        <p
          className="text-xs tracking-widest uppercase mb-3 font-medium"
          style={{ color: "#9ca3af" }}
        >
          Recent scans
        </p>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "#fff", border: "1px solid #f3f4f6" }}
            >
              <div className="flex flex-col gap-2 w-full mr-4">
                <div
                  className="h-3 rounded"
                  style={{
                    background: "#e5e7eb",
                    width: "50%",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <div
                  className="h-2 rounded"
                  style={{
                    background: "#e5e7eb",
                    width: "75%",
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: "0.2s",
                  }}
                />
              </div>
              <div
                className="h-5 w-16 rounded-full shrink-0"
                style={{
                  background: "#e5e7eb",
                  animation: "pulse 1.5s ease-in-out infinite",
                  animationDelay: "0.4s",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (scans.length === 0) return null;

  return (
    <div className="w-full max-w-xl">
      <p
        className="text-xs tracking-widest uppercase mb-3 font-medium"
        style={{ color: "#9ca3af" }}
      >
        Recent scans
      </p>
      <div className="flex flex-col gap-2">
        {scans.map((scan, i) => {
          const colors = statusColors[scan.status];
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200"
              style={{ background: "#fff", border: "1px solid #f3f4f6" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f3f4f6";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <div className="flex flex-col gap-1 min-w-0 mr-4">
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: "#111827" }}
                >
                  {scan.url}
                </span>
                {scan.scannedAt && (
                  <span className="text-xs" style={{ color: "#9ca3af" }}>
                    {new Date(scan.scannedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <span
                className="text-xs shrink-0 rounded-full px-3 py-1 font-medium"
                style={{ background: colors.bg, color: colors.color }}
              >
                {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
