// Map event slugs directly to their ImageKit storage paths
export const EVENT_IMAGEKIT_PATHS: Record<string, string> = {
  // Add your event slugs and paths here, for example:

  synthistan2026: "/booth_captures/synthistan2026/",
};

export function getEventPath(slug?: string): string {
  if (!slug) return "/booth_captures/";
  return EVENT_IMAGEKIT_PATHS[slug] ?? "/booth_captures/";
}
