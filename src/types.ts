export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  shutter: string;
  iso: string;
  glitchLevel: number;
  qrCodeUrl?: string;
  filename: string;
}

export interface SystemLog {
  timestamp: string;
  message: string;
  status: 'OK' | 'ERROR' | 'INFO' | 'CONNECTED' | 'DISABLED';
}
