import { ArrowLeft } from "lucide-react";
import { getEventsForDirectory } from "./registry";

export default function EventsPage() {
  const events = getEventsForDirectory();

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 font-mono">
      <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#84967e] hover:text-[#00ff41] transition-colors">
        <ArrowLeft size={13} /> [ RETURN_TO_GLITCHBOOTH ]
      </a>
      <div className="mt-6 mb-8 border-b border-matrix/20 pb-6">
        <p className="text-[10px] tracking-[0.2em] text-[#84967e]">~/GLITCH_BOOTH/EVENTS</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-extrabold text-[#00ff41] glow-text-matrix">
          EVENT_DIRECTORY
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <a key={event.slug} href={`/${event.slug}`} className="group block border border-matrix/30 bg-black p-4 hover:border-[#00ff41] hover:shadow-[0_0_18px_rgba(0,255,65,.18)] transition-all">
            <div className="aspect-[3/1] bg-[#061008] border border-matrix/10 flex items-center justify-center overflow-hidden p-3">
              <img src={event.logoSrc} alt={`${event.cardTitle} logo`} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="mt-4 font-display text-xl text-[#00ff41]">{event.cardTitle}</p>
            <p className="mt-1 text-xs text-[#84967e]">{event.dateLabel}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
