import { synthistan2026 } from "../events_pages/synthistan-2026/event.config";
import type { EventStatus } from "./types";

export const EVENTS = [synthistan2026] as const;

const RESERVED_SLUGS = new Set(["archive", "slideshow", "events", "p", "api"]);

function assertValidRegistry() {
  const seen = new Set<string>();
  for (const event of EVENTS) {
    const slug = event.slug.toLowerCase();
    if (RESERVED_SLUGS.has(slug)) {
      throw new Error(`Event slug "${event.slug}" is reserved.`);
    }
    if (seen.has(slug)) {
      throw new Error(`Duplicate event slug "${event.slug}".`);
    }
    seen.add(slug);
  }
}

assertValidRegistry();

export function getEventBySlug(slug?: string) {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return EVENTS.find((event) => event.slug.toLowerCase() === normalized);
}

const statusOrder: Record<EventStatus, number> = {
  active: 0,
  upcoming: 1,
  past: 2,
  cancelled: 3,
};

export function getEventsForDirectory() {
  return [...EVENTS].sort((a, b) => {
    const statusDifference = statusOrder[a.status] - statusOrder[b.status];
    if (statusDifference !== 0) return statusDifference;
    const direction = a.status === "past" ? -1 : 1;
    return direction * a.eventDate.localeCompare(b.eventDate);
  });
}
