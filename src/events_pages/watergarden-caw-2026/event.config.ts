import type { EventConfig } from "../../events/types";

const SLUG = "watergardencaw2026";

export const watergardencaw2026: EventConfig = {
  slug: SLUG,
  name: "Watergarden Art & Comics Weekend",
  year: "2026",
  cardTitle: "WATERGARDEN COMICS & ARTS WEEKEND 2026",
  eventDate: "2026-10-24",
  endDate: "2026-10-25", // Added explicit end date (or specify multi-day e.g., "2026-10-12")
  dateLabel: "October 24th - 25th",
  status: "upcoming",
  description: `Watergarden Art & Comics Weekend is bringing illustrations, comic books, mural art, tabletop card games, collectibles, and cosplay culture straight to Watergarden Istanbul!

Expect two full days packed with workshops, tournaments, artist and publisher booths, contests, and so much more. Come hang out!`,
  imageKitPath: `/booth_captures/${SLUG}/`,
  logoSrc: "/events_pages/watergarden-caw-2026/watergarden-caw-2026-logo.png",
  instagramUrl: "https://www.instagram.com/istcaf/",
  instagramLabel: "FOLLOW ISTCAF",
};
