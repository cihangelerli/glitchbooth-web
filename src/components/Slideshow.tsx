import { useMemo } from "react";
import { GalleryImage } from "../types";

interface SlideshowProps {
  images: GalleryImage[];
  loading: boolean;
}

// IMMUTABLE HARDWARE STYLES: Declared once to prevent runtime layout recalculations
const STATIC_SLIDESHOW_CSS = `
  @keyframes slideshow-axis-forward {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
`;

export default function Slideshow({ images, loading }: SlideshowProps) {
  // Optimize raw source resolutions down to target physical canvas constraints
  const optimizedImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    const scrambled = [...images].sort(() => Math.random() - 0.5);
    return scrambled.map((img) => ({
      ...img,
      url: img.url.includes("ik.imagekit.io")
        ? `${img.url.split("?")[0]}?tr=w-700,q-75,f-webp`
        : img.url,
    }));
  }, [images]);

  // Restrict track node footprint safely to avoid hardware memory leaks
  const loopTrack = useMemo(() => {
    if (optimizedImages.length === 0) return [];
    let track = [...optimizedImages];
    if (track.length > 8) track = track.slice(0, 8);
    while (track.length < 6) {
      track = [...track, ...optimizedImages];
    }
    return [...track, ...track];
  }, [optimizedImages]);

  const movementDuration = loopTrack.length * 3.5;

  return (
    <div className="fixed inset-0 bg-black text-[#00ff41] overflow-hidden flex flex-col justify-between font-mono select-none z-50">
      <style dangerouslySetInnerHTML={{ __html: STATIC_SLIDESHOW_CSS }} />

      {/* Visual Scanline Raster Strip Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none z-20" />

      {/* Top HUD Frame */}
      <div className="w-full bg-black border-b border-[#00ff41]/10 px-8 py-4 flex justify-between items-center z-10 text-[10px] tracking-widest text-[#84967e]">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse" />
          <span className="text-[#00ff41] font-bold">GLITCH BOOTH</span>
        </div>
        <div className="font-bold text-[#00daf8]">[ KIOSK_NODE_ACTIVE ]</div>
      </div>

      {/* Primary Display Vector */}
      <div className="w-full h-[80vh] flex-1 flex items-center justify-center bg-black overflow-hidden relative">
        {loading || loopTrack.length === 0 ? (
          <div className="w-full text-center text-[10px] tracking-widest animate-pulse">
            INITIALIZING_HARDWARE_BUFFER...
          </div>
        ) : (
          <div className="w-full overflow-hidden py-4 flex items-center">
            {/* ONE SINGLE COMPOSITED LAYER FOR THE ENTIRE ROW */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                paddingRight: "1.5rem",
                willChange: "transform",
                transform: "translateZ(0)",
                WebkitTransform: "translateZ(0)",
                animationName: "slideshow-axis-forward",
                animationDuration: `${movementDuration}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            >
              {loopTrack.map((img, idx) => (
                <div
                  key={`kiosk-${img.id}-${idx}`}
                  className="relative shrink-0 w-[65vh] h-[65vh] aspect-square border border-[#3b4b37] bg-[#0c0c0c] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-1" />
                  <img
                    src={img.url}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Border */}
      <div className="w-full bg-black border-t border-[#00ff41]/10 px-8 py-4 flex justify-between items-center z-10 text-[10px] tracking-wider text-[#84967e]">
        <div>GLITCHBOOTH.ONLINE</div>
        <div className="uppercase">POWERED BY DIRTCAKE STUDIO</div>
      </div>
    </div>
  );
}
