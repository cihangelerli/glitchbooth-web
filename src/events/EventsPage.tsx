import { ArrowLeft } from "lucide-react";
import { getEventsForDirectory, resolveEventStatus } from "./registry";
import { handleLinkClick } from "./navigate";
import type { EventStatus } from "./types";

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  active: {
    label: "ACTIVE",
    badgeClass:
      "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10 shadow-[0_0_10px_rgba(0,255,65,0.25)]",
    dotClass: "bg-[#00ff41] animate-ping",
  },
  upcoming: {
    label: "UPCOMING",
    badgeClass: "border-amber-400/60 text-amber-300 bg-amber-950/30",
    dotClass: "bg-amber-400",
  },
  past: {
    label: "PAST",
    badgeClass: "border-matrix/20 text-[#84967e] bg-black/60",
    dotClass: "bg-[#84967e]",
  },
  cancelled: {
    label: "CANCELLED",
    badgeClass: "border-rose-500/60 text-rose-400 bg-rose-950/30",
    dotClass: "bg-rose-500",
  },
};

export default function EventsPage() {
  const events = getEventsForDirectory();

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 font-mono">
      <a
        href="/"
        onClick={(e) => handleLinkClick(e, "/")}
        className="inline-flex items-center gap-1.5 text-xs text-[#84967e] hover:text-[#00ff41] transition-colors"
      >
        <ArrowLeft size={13} /> [ RETURN_TO_GLITCHBOOTH ]
      </a>
      <div className="mt-6 mb-8 border-b border-matrix/20 pb-6">
        <p className="text-[10px] tracking-[0.2em] text-[#84967e]">
          ~/GLITCH_BOOTH/EVENTS
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-extrabold text-[#00ff41] glow-text-matrix">
          EVENT_DIRECTORY
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const statusKey = resolveEventStatus(event);
          const status = STATUS_CONFIG[statusKey];

          return (
            <a
              key={event.slug}
              href={`/${event.slug}`}
              onClick={(e) => handleLinkClick(e, `/${event.slug}`)}
              className="group block border border-matrix/30 bg-black p-4 hover:border-[#00ff41] hover:shadow-[0_0_18px_rgba(0,255,65,.18)] transition-all relative"
            >
              <div className="aspect-[3/1] bg-[#061008] border border-matrix/10 flex items-center justify-center overflow-hidden p-3 relative">
                <img
                  src={event.logoSrc}
                  alt={`${event.cardTitle} logo`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="mt-4 flex items-start justify-between gap-2">
                <p className="font-display text-xl text-[#00ff41] leading-tight">
                  {event.cardTitle}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest border border-solid shrink-0 ${status.badgeClass}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                  />
                  {status.label}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#84967e]">{event.dateLabel}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
