import { memo, useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { GalleryImage } from "../types";
import { thumbUrl } from "../utils/imageUrl";

interface GlitchMarqueeRowProps {
  images: GalleryImage[];
  direction: "left" | "right";
  speed?: number;
  onImageClick?: (img: GalleryImage) => void;
  interactive?: boolean;
}

// One copy of the strip is always between MIN and MAX tiles, however big the
// gallery pool is. MIN keeps it wider than ultra-wide screens.
const MIN_TILES = 20;
const MAX_TILES = 24;

function GlitchMarqueeRow({
  images,
  direction,
  speed = 15,
  onImageClick,
  interactive = true,
}: GlitchMarqueeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const strip = useMemo(() => {
    if (images.length === 0) return [];
    const unique = images.slice(0, MAX_TILES);
    const out = [...unique];
    while (out.length < MIN_TILES) out.push(...unique);
    return out;
  }, [images]);

  // Same pixels-per-second feel as before: `speed` = seconds per tile pair.
  const duration = Math.max(strip.length * speed * 0.5, 20);

  // Pause the animation while the row is scrolled out of view.
  useEffect(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    if (!row || !track || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        track.dataset.offscreen = entry.isIntersecting ? "false" : "true";
      },
      { rootMargin: "100px" },
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  const renderTile = (img: GalleryImage, copy: number, idx: number) => {
    const imageLabel =
      img.filename || (img as any).name || `CAPTURE_${img.id}`;
    const glitchPct =
      img.glitchLevel ??
      (parseInt(img.id.replace(/\D/g, "").slice(-2) || "50", 10) % 35) + 15;

    return (
      <div
        key={`${img.id}-${copy}-${idx}`}
        onClick={() => interactive && onImageClick?.(img)}
        className={`relative w-36 h-36 md:w-56 md:h-56 shrink-0 border border-[#3b4b37] transition-colors duration-300 overflow-hidden bg-[#0e0e0e] ${
          interactive
            ? "hover:border-[#00ff41] cursor-pointer group/item z-30"
            : "cursor-default pointer-events-none"
        }`}
      >
        {interactive && (
          <>
            <div className="absolute top-1 left-1 bg-black/80 border border-matrix/20 px-1 py-0.5 text-[8px] font-mono text-[#00ff41] opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-10">
              {imageLabel}
            </div>
            <div className="absolute bottom-1 right-1 bg-black/80 border border-magenta/20 px-1 py-0.5 text-[8px] font-mono text-magenta opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 z-10">
              GLITCH // {glitchPct}%
            </div>
            <div className="absolute inset-0 bg-matrix/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </>
        )}

        <img
          src={thumbUrl(img.url)}
          alt={img.title || "Glitch Capture"}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          draggable={false}
          width={224}
          height={224}
          className={`w-full h-full object-cover grayscale contrast-[1.8] brightness-[0.95] transition-[transform,filter] duration-500 ${
            interactive
              ? "group-hover/item:scale-105 group-hover/item:contrast-[2.2] group-hover/item:brightness-[1.1]"
              : ""
          }`}
        />

        {interactive && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={rowRef}
      className="marquee-row relative w-full overflow-hidden py-1 border-t border-b border-matrix/10 bg-black flex items-center select-none"
    >
      <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none z-40" />
      <div className="absolute right-4 top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none z-40" />

      {/* ONE scanline overlay per row instead of one per tile */}
      <div className="absolute inset-0 z-40 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,255,65,0.06)_50%)] bg-[size:100%_4px]" />

      <div
        ref={trackRef}
        className="marquee-track"
        data-direction={direction}
        data-interactive={interactive}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {[0, 1].map((copy) =>
          strip.map((img, idx) => renderTile(img, copy, idx)),
        )}
      </div>
    </div>
  );
}

export default memo(GlitchMarqueeRow);
