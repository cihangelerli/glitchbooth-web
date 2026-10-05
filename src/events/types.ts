export type EventStatus = "upcoming" | "active" | "past";

export interface EventConfig {
  slug: string;
  name: string;
  year: string;
  cardTitle: string;
  eventDate: string;
  dateLabel: string;
  status: EventStatus;
  description: string;
  imageKitPath: string;
  logoSrc: string;
  instagramUrl?: string;
  instagramLabel?: string;
}
