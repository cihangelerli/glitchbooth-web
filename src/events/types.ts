export type EventStatus = "upcoming" | "active" | "past" | "cancelled";

export interface EventConfig {
  slug: string;
  name: string;
  year: string;
  cardTitle: string;
  eventDate: string; // Start date (e.g., "2026-10-17")
  endDate?: string; // Optional end date (e.g., "2026-10-19") for events that are more than one day long
  dateLabel: string; // e.g. "October 17–19"
  status: EventStatus;
  description: string;
  imageKitPath: string;
  logoSrc: string;
  instagramUrl?: string;
  instagramLabel?: string;
}
