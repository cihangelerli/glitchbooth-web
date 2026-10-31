import { synthistan2026 } from "../events_pages/synthistan-2026/event.config";
import { watergardencaw2026 } from "../events_pages/watergarden-caw-2026/event.config";
import { testfest } from "../events_pages/testfest/event.config";
import type { EventConfig, EventStatus } from "./types";

export const EVENTS = [synthistan2026, watergardencaw2026, testfest] as const;

export function resolveEventStatus(event: EventConfig): EventStatus {
  if (event.status === "cancelled") return "cancelled";

  if (event.eventDate) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const startDate = event.eventDate;
    const endDate = event.endDate || event.eventDate;

    if (today >= startDate && today <= endDate) return "active";
    if (today < startDate) return "upcoming";
    if (today > endDate) return "past";
  }

  return event.status || "past";
}

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

export function getEventsForDirectory(): EventConfig[] {
  return [...EVENTS].sort((a, b) => {
    const statusA = resolveEventStatus(a);
    const statusB = resolveEventStatus(b);
    const statusDifference = statusOrder[statusA] - statusOrder[statusB];
    if (statusDifference !== 0) return statusDifference;
    const direction = statusA === "past" ? -1 : 1;
    return direction * a.eventDate.localeCompare(b.eventDate);
  });
}
