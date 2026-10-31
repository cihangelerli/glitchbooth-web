import type { EventConfig } from "../../events/types";

// =========================================================================
// EVENT CONFIGURATION TEMPLATE
// 'SLUG' controls both 'slug' and 'imageKitPath' (/booth_captures/<SLUG>/).
// Ensure 'EVENT_SLUG' in server.py matches this exact string.
// 3. Add this slug to ALLOWED_EVENT_SLUGS in api/images.ts.
// =========================================================================
const SLUG = "testfest";

export const testfest: EventConfig = {
  slug: SLUG,
  name: "TEST FEST",
  year: "2026",
  cardTitle: "TEST FEST",
  eventDate: "2026-01-01",
  endDate: "2028-01-01",
  dateLabel: "forever test environment",
  status: "active",
  description: "this is where the test captures go.",
  imageKitPath: `/booth_captures/${SLUG}/`,
  logoSrc: "/events_pages/testfest/testfest.png",
  instagramUrl: "https://www.instagram.com/gelerli/",
  instagramLabel: "FOLLOW @GELERLI",
};
