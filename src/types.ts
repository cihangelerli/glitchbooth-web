export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  timestamp: string; // ISO string from ImageKit API
  filename: string; // Replaces legacy "name"
  date?: string; // YYYY-MM-DD string for legacy components
  shutter?: string; // Present on stock assets
  iso?: string; // Present on stock assets
  glitchLevel?: number; // Present on stock assets
  qrCodeUrl?: string;
}

export interface SystemLog {
  timestamp: string;
  message: string;
  status: "OK" | "ERROR" | "INFO" | "CONNECTED" | "DISABLED";
}
