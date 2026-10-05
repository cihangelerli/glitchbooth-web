import type { EventConfig } from "./types";

const IMAGEKIT_CDN = "https://ik.imagekit.io/w6lsfsw8j";

export function getEventCaptureUrl(event: EventConfig, captureId: string) {
  const cleanCdn = IMAGEKIT_CDN.replace(/\/+$/, "");
  const cleanPath = event.imageKitPath.replace(/^\/+|\/+$/g, "");
  return `${cleanCdn}/${cleanPath}/${captureId}_color.jpg`;
}
