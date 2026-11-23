import type { EventConfig } from "../../events/types";

// =========================================================================
// EVENT CONFIGURATION TEMPLATE
// 'SLUG' controls both 'slug' and 'imageKitPath' (/booth_captures/<SLUG>/).
// Ensure 'EVENT_SLUG' in server.py matches this exact string.
// Note: api/images.ts and event registry update automatically on build.
// =========================================================================
const SLUG = "icaf2026";

export const newEvent: EventConfig = {
  slug: SLUG,
  name: "ISTANBUL COMICS AND ARTS FESTIVAL 2026",
  year: "2026",
  cardTitle: "ISTANBUL COMICS AND ARTS FESTIVAL 2026",
  eventDate: "2026-06-13",
  endDate: "2026-06-14",
  dateLabel: "June 13 - 14",
  status: "past",
  description: "Captures from ISTANBUL COMICS AND ARTS FESTIVAL 2026",
  imageKitPath: `/booth_captures/${SLUG}/`,
  instagramUrl: "https://www.instagram.com/istcaf/",
  instagramLabel: "FOLLOW ICAF",
};
