import { GalleryImage } from "../types";

interface GlitchMarqueeRowProps {
  images: GalleryImage[];
  direction: "left" | "right";
  speed?: number;
  onImageClick?: (img: GalleryImage) => void;
  interactive?: boolean;
}

export default function GlitchMarqueeRow({
  images,
  direction,
  speed = 20,
  onImageClick,
  interactive = true,
}: GlitchMarqueeRowProps) {
  if (!images || images.length === 0) return null;

  // Build a safe horizontal track
  let baseImages = [...images];
  while (baseImages.length < 12) {
    baseImages = [...baseImages, ...images];
  }

  const loopImages = [...baseImages, ...baseImages];
  const dynamicDuration = baseImages.length * speed * 0.4;
  const animId = `main-row-${direction}-${Math.random().toString(36).substring(2, 6)}`;

  return (
    <div className="relative w-full overflow-hidden py-1 border-t border-b border-matrix/10 bg-black flex items-center select-none group">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ${animId} {
          0% { transform: translate3d(${direction === "left" ? "0" : "-50%"}, 0, 0); }
          100% { transform: translate3d(${direction === "left" ? "-50%" : "0"}, 0, 0); }
        }
        .${animId}-track {
          display: flex;
          gap: 1rem;
          animation: ${animId} ${dynamicDuration}s linear infinite;
          will-change: transform;
        }
        .group:hover .${animId}-track {
          animation-play-state: paused;
        }
      `,
        }}
      />

      <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none" />
      <div className="absolute right-4 top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none" />

      <div className={`${animId}-track pr-4`}>
        {loopImages.map((img, idx) => (
          <div
            key={`${img.id}-${idx}`}
            onClick={() => interactive && onImageClick?.(img)}
            className={`relative shrink-0 w-36 h-36 md:w-56 md:h-56 border border-[#3b4b37] bg-[#0e0e0e] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] will-change-transform transform-gpu ${
              interactive
                ? "hover:border-[#00ff41] cursor-pointer group/item transition-all duration-300"
                : "cursor-default"
            }`}
          >
            {/* Structural diagnostics display */}
            {interactive && (
              <>
                <div className="absolute top-1 left-1 bg-black/80 border border-matrix/20 px-1 py-0.5 text-[8px] font-mono text-[#00ff41] opacity-0 group-hover/item:opacity-100 transition-all duration-200 z-10">
                  {img.filename}
                </div>
                <div className="absolute bottom-1 right-1 bg-black/80 border border-matrix/20 px-1 py-0.5 text-[8px] font-mono text-matrix opacity-0 group-hover/item:opacity-100 transition-all duration-200 z-10">
                  GLITCH // 45%
                </div>
              </>
            )}

            {/* Signature Grayscale Overlay Grid Lines */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-1" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,255,65,0.08)_50%)] bg-[size:100%_4px] pointer-events-none z-1 mix-blend-overlay opacity-80" />

            {interactive && (
              <div className="absolute inset-0 bg-matrix/5 mix-blend-color-dodge opacity-0 group-hover/item:opacity-30 transition-opacity duration-300 z-2" />
            )}

            <img
              src={img.url}
              alt={img.title}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover grayscale contrast-[1.8] brightness-[0.95] transition-all duration-500 group-hover/item:scale-105 group-hover/item:contrast-[2.2] group-hover/item:brightness-[1.1]"
            />

            {/* Mechanical Corner Bracket Vectors */}
            {interactive && (
              <>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
