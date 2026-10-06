import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import type { GalleryImage } from "../types";
import type { EventConfig } from "./types";
import BlinkingCursor from "./BlinkingCursor";

const PAGE_SIZE = 100;

interface EventPageProps {
  event: EventConfig;
  onImageSelect: (image: GalleryImage) => void;
}

export default function EventPage({ event, onImageSelect }: EventPageProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadImages = async (skip: number) => {
    const response = await fetch(
      `/api/images?event=${encodeURIComponent(event.slug)}&skip=${skip}&limit=${PAGE_SIZE}`,
    );
    if (!response.ok) throw new Error("Event gallery unavailable");
    const payload = await response.json();
    const nextImages: GalleryImage[] = Array.isArray(payload?.images)
      ? payload.images
      : [];
    setImages((current) =>
      skip === 0
        ? nextImages
        : [
            ...current,
            ...nextImages.filter(
              (image) => !current.some((item) => item.id === image.id),
            ),
          ],
    );
    setHasMore(payload?.hasMore === true);
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    loadImages(0)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [event.slug]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await loadImages(images.length);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2]">
      <div className="scanlines-overlay" />
      <main className="max-w-[1200px] mx-auto px-4 py-10 md:py-16">
        <a
          href="/events"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#84967e] hover:text-[#00ff41]"
        >
          <ArrowLeft size={13} /> [ ALL_EVENTS ]
        </a>
        <section className="mt-8 border border-matrix/25 bg-black/70 p-6 md:p-12 text-center shadow-[0_0_26px_rgba(0,255,65,.06)]">
          <h1 className="flex flex-wrap items-end justify-center gap-3">
            <img
              src={event.logoSrc}
              alt={event.name}
              className="h-auto w-full max-w-[min(680px,90vw)]"
            />
            <span className="font-display text-4xl font-extrabold text-[#00ff41] md:text-6xl">
              {event.year}
              <BlinkingCursor />
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl whitespace-pre-line font-mono text-sm leading-relaxed text-[#d2dcd0] md:text-base">
            {event.description}
          </p>
        </section>
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between border-b border-matrix/20 pb-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-[#84967e]">
                LIVE_EVENT_ARCHIVE
              </p>
              <h2 className="mt-1 font-display text-2xl text-[#00ff41]">
                CAPTURES
              </h2>
            </div>
            <span className="text-xs text-[#84967e]">
              {images.length} LOADED
            </span>
          </div>
          {loading ? (
            <div className="py-24 text-center text-xs text-[#00ff41] animate-pulse">
              CONNECTING_TO_EVENT_STORAGE...
            </div>
          ) : error && images.length === 0 ? (
            <div className="border border-[#ffabf3]/30 py-16 text-center text-xs text-[#ffabf3]">
              [ EVENT_GALLERY_UNAVAILABLE ]
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => onImageSelect(image)}
                    className="group relative overflow-hidden border border-matrix/25 bg-black text-left hover:border-[#00ff41] transition-colors"
                  >
                    <div className="aspect-square">
                      <img
                        src={image.url}
                        alt={image.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="border-t border-matrix/15 p-3 text-[10px] text-[#84967e] truncate">
                      {image.filename}
                    </div>
                  </button>
                ))}
              </div>
              {images.length === 0 && (
                <div className="border border-matrix/20 py-16 text-center text-xs text-[#84967e]">
                  NO_CAPTURES_YET
                </div>
              )}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 border border-[#00ff41] px-6 py-3 text-xs font-bold text-[#00ff41] hover:bg-[#00ff41] hover:text-black disabled:opacity-50"
                  >
                    {loadingMore && (
                      <LoaderCircle size={14} className="animate-spin" />
                    )}
                    {loadingMore ? "LOADING..." : "LOAD_MORE_CAPTURES"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
