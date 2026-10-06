import type { EventConfig } from "../../events/types";

// =========================================================================
// EVENT CONFIGURATION TEMPLATE
// 'SLUG' controls both 'slug' and 'imageKitPath' (/booth_captures/<SLUG>/).
// Ensure 'EVENT_SLUG' in server.py matches this exact string.
// =========================================================================
const SLUG = "your-event";

export const newEvent: EventConfig = {
  slug: SLUG,
  name: "YOUR EVENT",
  year: "2026",
  cardTitle: "YOUR EVENT 2026",
  eventDate: "2026-01-01",
  endDate: "2026-01-01",
  dateLabel: "January 1st",
  status: "upcoming",
  description: "Replace with your event description.",
  imageKitPath: `/booth_captures/${SLUG}/`,
  logoSrc: "/events_pages/your-event/logo.png",
  instagramUrl: "https://www.instagram.com/your_account/",
  instagramLabel: "FOLLOW EVENT",
};
