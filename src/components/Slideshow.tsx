import { useMemo, useState, useEffect } from "react";
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

interface SizedImage extends GalleryImage {
  aspectRatio?: number;
}

export default function Slideshow({ images, loading }: SlideshowProps) {
  const [sizedImages, setSizedImages] = useState<SizedImage[]>([]);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // 1. Prepare raw source set
  const baseList = useMemo(() => {
    if (!images || images.length === 0) return [];
    const scrambled = [...images].sort(() => Math.random() - 0.5);
    return scrambled.map((img) => ({
      ...img,
      url: img.url.includes("ik.imagekit.io")
        ? `${img.url.split("?")[0]}?tr=w-700,q-75,f-webp`
        : img.url,
    }));
  }, [images]);

  // 2. Pre-calculate natural aspect ratios BEFORE mounting animation track
  useEffect(() => {
    if (baseList.length === 0) {
      setSizedImages([]);
      setIsPreloaded(false);
      return;
    }

    let isMounted = true;
    let selected = [...baseList];
    if (selected.length > 8) selected = selected.slice(0, 8);

    Promise.all(
      selected.map(
        (img) =>
          new Promise<SizedImage>((resolve) => {
            const i = new Image();
            i.onload = () => {
              resolve({
                ...img,
                aspectRatio: i.naturalWidth / i.naturalHeight || 1,
              });
            };
            i.onerror = () => resolve({ ...img, aspectRatio: 1 });
            i.src = img.url;
          }),
      ),
    ).then((results) => {
      if (isMounted) {
        setSizedImages(results);
        setIsPreloaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [baseList]);

  // 3. Build track with locked dimensions
  const loopTrack = useMemo(() => {
    if (sizedImages.length === 0) return [];
    let track = [...sizedImages];
    while (track.length < 6) {
      track = [...track, ...sizedImages];
    }
    return [...track, ...track];
  }, [sizedImages]);

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
        {loading || !isPreloaded || loopTrack.length === 0 ? (
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
                  style={{ aspectRatio: img.aspectRatio }}
                  className="relative shrink-0 h-[65vh] border border-[#3b4b37] bg-[#0c0c0c] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10" />
                  <img
                    src={img.url}
                    alt={img.title}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover block"
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
