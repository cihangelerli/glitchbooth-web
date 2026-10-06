import type { EventConfig } from "../../events/types";

const SLUG = "synthistan2026";

export const synthistan2026: EventConfig = {
  slug: SLUG,
  name: "SYNTHISTAN",
  year: "2026",
  cardTitle: "SYNTHISTAN 2026",
  eventDate: "2026-10-10",
  endDate: "2026-10-10", // Added explicit end date (or specify multi-day e.g., "2026-10-12")
  dateLabel: "October 10th",
  status: "upcoming",
  description: `Synthistan is a gathering focused on synthesizers, electronic instruments, DIY electronics, experimental sound, and creative technology. It brings together makers, musicians, designers, artists, and enthusiasts to share their projects, ideas, and experiments.

The event is centered around hands-on exploration and direct interaction, with a wide range of self-built instruments, unconventional devices, sound machines, and electronic experiments to discover. It provides a space for people to exchange knowledge, demonstrate their work, and explore the possibilities of making and experimenting with sound and technology.`,
  imageKitPath: `/booth_captures/${SLUG}/`,
  logoSrc: "/events_pages/synthistan-2026/synthistan-2026-logo.png",
  instagramUrl: "https://www.instagram.com/synthistan_turkey/",
  instagramLabel: "FOLLOW SYNTHISTAN",
};
