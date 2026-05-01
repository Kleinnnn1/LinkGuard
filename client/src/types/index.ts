export type ScanStatus = "safe" | "suspicious" | "malicious" | "unknown";

export type Scan = {
  id?: number;
  url: string;
  status: ScanStatus;
  scannedAt?: string;
};
