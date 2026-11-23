import type { EventConfig } from "../../events/types";

// =========================================================================
// EVENT CONFIGURATION TEMPLATE
// 'SLUG' controls both 'slug' and 'imageKitPath' (/booth_captures/<SLUG>/).
// Ensure 'EVENT_SLUG' in server.py matches this exact string.
// Note: api/images.ts and event registry update automatically on build.
// =========================================================================
const SLUG = "icf2026";

export const newEvent: EventConfig = {
  slug: SLUG,
  name: "12TH ISTANBUL COFFEE FESTIVAL 2026",
  year: "2026",
  cardTitle: "12TH ISTANBUL COFFEE FESTIVAL 2026",
  eventDate: "2026-09-10",
  endDate: "2026-09-13",
  dateLabel: "September 10-13",
  status: "past",
  description: "Captures from 12TH ISTANBUL COFFEE FESTIVAL 2026",
  imageKitPath: `/booth_captures/${SLUG}/`,
  instagramUrl: "https://www.instagram.com/istanbulcoffeefestival/",
  instagramLabel: "FOLLOW ISTANBUL COFFEE FESTIVAL",
};
