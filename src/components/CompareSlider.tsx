import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { compareFileName } from "../utils/cleanCapture";

export interface CompositeResult {
  blob: Blob;
  fileName: string;
}

export interface CompareSliderHandle {
  /** Composite for the current slider position, or null when the original
   *  (fully mutated) image should be used instead. */
  getComposite: () => Promise<CompositeResult | null>;
}

interface CompareSliderProps {
  imageId: string;
  mutatedUrl: string;
  /** null = this capture has no clean pair (old capture) -> no slider. */
  cleanUrl: string | null;
  alt: string;
  /** Classes for the visible (mutated) <img>; keep the page's sizing here. */
  imgClassName?: string;
  onMutatedLoad: () => void;
  onMutatedError: () => void;
}

// The booth uploads the processed photo first and the clean one about a second
// later (also during offline sync, where the capture ID is old but the upload is
// brand new). So a "not found" for the clean file may just mean "not yet": we
// retry a few times, and every retry uses a unique URL so a cached 404 (browser
// or CDN) can never be served back to us. The first attempt keeps the plain,
// cacheable URL so successful loads stay cached for everyone.
const RETRY_DELAYS_MS = [1500, 4000, 8000];
const JPEG_QUALITY = 0.95;

type CleanStatus = "loading" | "ok" | "missing";

const CompareSlider = forwardRef<CompareSliderHandle, CompareSliderProps>(
  function CompareSlider(
    { imageId, mutatedUrl, cleanUrl, alt, imgClassName = "", onMutatedLoad, onMutatedError },
    ref,
  ) {
    const [mix, setMix] = useState(100); // 100 = fully mutated (default), 0 = clean
    const [useCors, setUseCors] = useState(true);
    const [mutatedLoaded, setMutatedLoaded] = useState(false);
    const [cleanStatus, setCleanStatus] = useState<CleanStatus>("loading");
    const [cleanAttempt, setCleanAttempt] = useState(0);
    const [cleanBust, setCleanBust] = useState<string | null>(null);

    const mutatedRef = useRef<HTMLImageElement>(null);
    const cleanRef = useRef<HTMLImageElement>(null);
    const cacheRef = useRef<{ mix: number; blob: Blob } | null>(null);
    const retryTimer = useRef<number | undefined>(undefined);

    const enabled = !!cleanUrl && useCors;
    const showSlider = enabled && mutatedLoaded && cleanStatus === "ok";

    // Mirrors for the imperative handle (which must not go stale).
    const mixRef = useRef(mix);
    const showSliderRef = useRef(showSlider);
    mixRef.current = mix;
    showSliderRef.current = showSlider;

    useEffect(() => () => window.clearTimeout(retryTimer.current), []);

    const cleanSrc = cleanUrl
      ? cleanBust
        ? `${cleanUrl}?r=${cleanBust}` // unique cache key: bypasses any cached 404
        : cleanUrl
      : null;

    const renderComposite = async (mixValue: number): Promise<Blob | null> => {
      const top = mutatedRef.current;
      const base = cleanRef.current;
      if (!top || !base || !top.naturalWidth || !base.naturalWidth) return null;
      try {
        const w = top.naturalWidth;
        const h = top.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(base, 0, 0, w, h);
        if (mixValue > 0) {
          ctx.globalAlpha = mixValue / 100;
          ctx.drawImage(top, 0, 0, w, h);
        }
        return await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY),
        );
      } catch (err) {
        console.error("Composite render failed:", err);
        return null;
      }
    };

    // Pre-render shortly after the slider settles, so the save/share button can
    // hand over a ready blob (mobile Safari dislikes async work before share()).
    useEffect(() => {
      if (!showSlider || mix >= 100) return;
      const timer = window.setTimeout(async () => {
        const blob = await renderComposite(mix);
        if (blob) cacheRef.current = { mix, blob };
      }, 250);
      return () => window.clearTimeout(timer);
    }, [mix, showSlider]);

    useImperativeHandle(ref, () => ({
      async getComposite() {
        const current = mixRef.current;
        if (!showSliderRef.current || current >= 100) return null;
        const cached = cacheRef.current;
        if (cached && cached.mix === current) {
          return { blob: cached.blob, fileName: compareFileName(imageId, current) };
        }
        const blob = await renderComposite(current);
        return blob ? { blob, fileName: compareFileName(imageId, current) } : null;
      },
    }), [imageId]);

    const handleMutatedError = () => {
      // If CORS mode is what broke the main image, fall back to plain loading:
      // the capture still displays, the slider just stays off.
      if (useCors) {
        setUseCors(false);
        return;
      }
      onMutatedError();
    };

    const handleMutatedLoad = () => {
      setMutatedLoaded(true);
      onMutatedLoad();
    };

    const handleCleanError = () => {
      if (cleanAttempt < RETRY_DELAYS_MS.length) {
        retryTimer.current = window.setTimeout(() => {
          setCleanBust(`${Date.now().toString(36)}${cleanAttempt}`);
          setCleanAttempt((n) => n + 1);
        }, RETRY_DELAYS_MS[cleanAttempt]);
      } else {
        setCleanStatus("missing");
      }
    };

    return (
      <div className="w-full">
        <div className="relative w-full">
          {/* Clean layer: sits underneath, loads in the background. */}
          {enabled && cleanSrc && (
            <img
              ref={cleanRef}
              src={cleanSrc}
              alt=""
              aria-hidden="true"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              draggable={false}
              onLoad={() => setCleanStatus("ok")}
              onError={handleCleanError}
              className="absolute inset-0 h-full w-full object-contain pointer-events-none"
            />
          )}

          {/* Mutated layer: on top; its opacity IS the slider. */}
          <img
            ref={mutatedRef}
            src={mutatedUrl}
            alt={alt}
            crossOrigin={useCors ? "anonymous" : undefined}
            referrerPolicy="no-referrer"
            decoding="async"
            onLoad={handleMutatedLoad}
            onError={handleMutatedError}
            style={{ opacity: showSlider ? mix / 100 : 1 }}
            className={`relative block ${imgClassName}`}
          />
        </div>

        {showSlider && (
          <div className="mt-4 font-mono text-[10px] tracking-widest text-[#84967e] select-none">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold text-[#00e639]">&gt; MUTATION_LEVEL</span>
              <span className="font-bold text-white">{mix}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span>CLEAN</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={mix}
                onChange={(e) => setMix(Number(e.target.value))}
                aria-label="Mutation level"
                className="h-6 flex-1 cursor-pointer accent-[#00ff41]"
                style={{ touchAction: "pan-y" }}
              />
              <span className="text-[#00ff41]">GLITCH</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default CompareSlider;
