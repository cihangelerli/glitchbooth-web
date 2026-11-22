import type { EventConfig } from "../../events/types";

// =========================================================================
// EVENT CONFIGURATION TEMPLATE
// 'SLUG' controls both 'slug' and 'imageKitPath' (/booth_captures/<SLUG>/).
// Ensure 'EVENT_SLUG' in server.py matches this exact string.
// Note: api/images.ts and event registry update automatically on build.
// =========================================================================
const SLUG = "gist2026";

export const newEvent: EventConfig = {
  slug: SLUG,
  name: "GAMING ISTANBUL 2026",
  year: "2026",
  cardTitle: "GAMING ISTANBUL 2026",
  eventDate: "2026-09-18",
  endDate: "2026-09-20",
  dateLabel: "September 18-20",
  status: "past",
  description: "GAMING ISTANBUL 2026",
  imageKitPath: `/booth_captures/${SLUG}/`,
  instagramUrl: "https://www.instagram.com/gamingistanbul/",
  instagramLabel: "FOLLOW GAMING ISTANBUL",
};
