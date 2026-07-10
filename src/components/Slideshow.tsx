import { useMemo } from "react";
import { GalleryImage } from "../types";

interface SlideshowProps {
  images: GalleryImage[];
  loading: boolean;
}

export default function Slideshow({ images, loading }: SlideshowProps) {
  // 1. Optimize texture sizes and force aggressive image caching via query params
  const optimizedImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    // Scramble the deck
    const scrambled = [...images].sort(() => Math.random() - 0.5);

    // Scale down high-res textures to save memory on weak hardware
    return scrambled.map((img) => ({
      ...img,
      url: img.url.includes("ik.imagekit.io")
        ? `${img.url.split("?")[0]}?tr=w-700,q-60,f-webp`
        : img.url,
    }));
  }, [images]);

  // 2. Build a bulletproof padded track sequence so gaps never appear mid-loop
  const loopTrack = useMemo(() => {
    if (optimizedImages.length === 0) return [];
    let track = [...optimizedImages];
    // Fill the rail loop completely to handle wide screens safely
    while (track.length < 16) {
      track = [...track, ...optimizedImages];
    }
    // Duplicate the padded track for a clean 0% to -50% endless animation loop
    return [...track, ...track];
  }, [optimizedImages]);

  // Calculate speed relative to the unique number of layout nodes
  const movementDuration = (loopTrack.length / 2) * 5;
  const uniqueAnimId = "kiosk-marquee-engine";

  return (
    <div className="fixed inset-0 bg-black text-[#00ff41] overflow-hidden flex flex-col justify-between font-mono select-none z-50">
      {/* Native CSS Layering (Bypasses JS layout threads to stop frame drops) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes ${uniqueAnimId} {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .slideshow-gpu-rail {
          display: flex;
          gap: 1.5rem;
          animation: ${uniqueAnimId} ${movementDuration}s linear infinite;
          will-change: transform;
        }
      `,
        }}
      />

      {/* Screen CRT Line Filters */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none z-20" />

      {/* Header Dashboard Bar */}
      <div className="w-full bg-black border-b border-[#00ff41]/10 px-8 py-4 flex justify-between items-center z-10 text-[10px] tracking-widest text-[#84967e]">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse" />
          <span className="text-[#00ff41] font-bold">GLITCH BOOTH</span>
        </div>
        <div className="font-bold text-[#00daf8]">[ KIOSK_NODE_ACTIVE ]</div>
      </div>

      {/* Center Marquee Frame */}
      <div className="w-full h-[80vh] flex-1 flex items-center justify-center bg-black overflow-hidden relative">
        {loading || loopTrack.length === 0 ? (
          <div className="w-full text-center text-[10px] tracking-widest animate-pulse">
            CACHING_HARDWARE_TEXTURES...
          </div>
        ) : (
          <div className="w-full overflow-hidden py-4 flex items-center">
            <div className="slideshow-gpu-rail pr-6">
              {loopTrack.map((img, idx) => (
                <div
                  key={`kiosk-${img.id}-${idx}`}
                  className="relative shrink-0 w-[68vh] h-[68vh] aspect-square border border-[#3b4b37] bg-[#0c0c0c] overflow-hidden transform-gpu"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-1" />
                  <img
                    src={img.url}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    loading="eager" // Pin image to memory instantly
                    decoding="async" // Prevent layout decoding from blocking frames
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding Bar */}
      <div className="w-full bg-black border-t border-[#00ff41]/10 px-8 py-4 flex justify-between items-center z-10 text-[10px] tracking-wider text-[#84967e]">
        <div>GLITCHBOOTH.ONLINE</div>
        <div className="uppercase">POWERED BY DIRTCAKE STUDIO</div>
      </div>
    </div>
  );
}
