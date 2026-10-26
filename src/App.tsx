import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GlitchMarqueeRow from "./components/GlitchMarqueeRow";
import Slideshow from "./components/Slideshow";
import Specs from "./components/Specs";
import StatsDashboard from "./components/StatsDashboard";
import ContactForm from "./components/ContactForm";
import ArchiveView from "./components/ArchiveView";
import DetailsView from "./components/DetailsView";
import { STOCK_GALLERY_IMAGES } from "./data/images";
import { GalleryImage } from "./types";
import EventsPage from "./events/EventsPage";
import EventPage from "./events/EventPage";
import { getEventBySlug } from "./events/registry";
import { getEventCaptureUrl } from "./events/eventCapture";
import type { EventConfig } from "./events/types";
import { timestampFromCaptureId } from "./utils/captureTime";
import { applyPageMeta } from "./utils/pageMeta";

type AppView =
  | "home"
  | "archive"
  | "details"
  | "slideshow"
  | "events"
  | "event"
  | "event-details"
  | "not-found";

type ResolvedRoute =
  | { kind: "home" | "archive" | "slideshow" | "events" | "not-found" }
  | { kind: "details"; captureId: string }
  | { kind: "event"; event: EventConfig }
  | { kind: "event-details"; event: EventConfig; captureId: string };

function resolveRoute(pathname: string): ResolvedRoute {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/") return { kind: "home" };
  if (path === "/archive") return { kind: "archive" };
  if (path === "/slideshow") return { kind: "slideshow" };
  if (path === "/events") return { kind: "events" };

  const mainCapture = path.match(/^\/p\/([^/]+)$/);
  if (mainCapture) return { kind: "details", captureId: mainCapture[1] };

  const eventCapture = path.match(/^\/([^/]+)\/p\/([^/]+)$/);
  if (eventCapture) {
    const event = getEventBySlug(eventCapture[1]);
    return event
      ? { kind: "event-details", event, captureId: eventCapture[2] }
      : { kind: "not-found" };
  }

  const eventLanding = path.match(/^\/([^/]+)$/);
  if (eventLanding) {
    const event = getEventBySlug(eventLanding[1]);
    return event ? { kind: "event", event } : { kind: "not-found" };
  }
  return { kind: "not-found" };
}

const IMAGEKIT_CDN = "https://ik.imagekit.io/w6lsfsw8j";

// Fallback for deep links with no loaded metadata. The ID encodes the capture
// time; "" renders as TIMESTAMP_UNAVAILABLE for non-numeric IDs.
function buildFallbackImage(id: string, url: string): GalleryImage {
  return {
    id,
    url,
    filename: `${id}_color.jpg`,
    title: `CAPTURE_${id}`,
    timestamp: timestampFromCaptureId(id) ?? "",
  };
}

// Real image metadata saved by navigateTo() in the current history entry.
// Survives back/forward and page reload within the same entry.
function getImageFromHistoryState(id: string): GalleryImage | null {
  const state = window.history.state as { image?: GalleryImage } | null;
  return state?.image && state.image.id === id ? state.image : null;
}

export default function App() {
  const [imagesPool, setImagesPool] = useState<GalleryImage[]>([]);
  const [archiveImages, setArchiveImages] = useState<GalleryImage[] | null>(null);
  const [archiveHasMore, setArchiveHasMore] = useState(false);
  const [hasMoreCaptures, setHasMoreCaptures] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Persistent visibility toggle flag - stays across subcomponent view switching paths
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(true);

  const [currentView, setCurrentView] = useState<AppView>(
    () => resolveRoute(window.location.pathname).kind,
  );
  const [activeEvent, setActiveEvent] = useState<EventConfig | null>(() => {
    const route = resolveRoute(window.location.pathname);
    return "event" in route ? route.event : null;
  });

  // Centralized router function that pairs React state updates with window.history
  const navigateTo = useCallback(
    (
      view: AppView,
      path: string,
      image: GalleryImage | null = null,
      replace: boolean = false,
      event: EventConfig | null = null,
    ) => {
      setCurrentView(view);
      setSelectedImage(image);
      setActiveEvent(event);

      if (window.location.pathname !== path) {
        if (replace) {
          window.history.replaceState({ view, id: image?.id, image }, "", path);
        } else {
          window.history.pushState({ view, id: image?.id, image }, "", path);
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const navigateToPath = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shuffleArray = (array: GalleryImage[]): GalleryImage[] => {
    const scrambled = [...array];
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    return scrambled;
  };

  const handleRandomizeImages = () => {
    setImagesPool((prevImages) => shuffleArray(prevImages));
  };

  useEffect(() => {
    async function initializeProjectData() {
      try {
        const response = await fetch("/api/images?limit=100");
        const payload = response.ok
          ? await response.json().catch(() => null)
          : null;

        const liveImages = Array.isArray(payload?.images) ? payload.images : [];
        const pool = liveImages.length > 0 ? liveImages : STOCK_GALLERY_IMAGES;

        setImagesPool(shuffleArray(pool));
        setHasMoreCaptures(liveImages.length > 0 && payload?.hasMore === true);
      } catch (err) {
        console.error(
          "ImageKit sync failed, falling back to stock assets:",
          err,
        );
        setImagesPool(shuffleArray(STOCK_GALLERY_IMAGES));
        setHasMoreCaptures(false);
      } finally {
        setLoading(false);
      }
    }

    initializeProjectData();
  }, []);

  useEffect(() => {
    const syncViewWithUrl = () => {
      const route = resolveRoute(window.location.pathname);

      if (
        route.kind === "archive" ||
        route.kind === "home" ||
        route.kind === "slideshow" ||
        route.kind === "events" ||
        route.kind === "not-found"
      ) {
        setCurrentView(route.kind);
        setSelectedImage(null);
        setActiveEvent(null);
      } else if (route.kind === "details") {
        const photoId = route.captureId;
        const poolMatch = imagesPool.find((img) => img.id === photoId);
        const fromState = getImageFromHistoryState(photoId);

        // Priority: live pool data > saved history data > keep current > bare fallback.
        // "Keep current" stops the pool finishing its load from clobbering an
        // image that already has good metadata.
        setSelectedImage(
          (prev) =>
            poolMatch ??
            fromState ??
            (prev?.id === photoId
              ? prev
              : buildFallbackImage(
                  photoId,
                  `${IMAGEKIT_CDN}/booth_captures/${photoId}_color.jpg`,
                )),
        );
        setCurrentView("details");
        setActiveEvent(null);
      } else if (route.kind === "event") {
        setActiveEvent(route.event);
        setCurrentView("event");
        setSelectedImage(null);
      } else if (route.kind === "event-details") {
        const { event, captureId } = route;
        const fromState = getImageFromHistoryState(captureId);

        setActiveEvent(event);
        setSelectedImage(
          (prev) =>
            fromState ??
            (prev?.id === captureId
              ? prev
              : buildFallbackImage(
                  captureId,
                  getEventCaptureUrl(event, captureId),
                )),
        );
        setCurrentView("event-details");
      }
    };

    syncViewWithUrl();

    window.addEventListener("popstate", syncViewWithUrl);
    return () => window.removeEventListener("popstate", syncViewWithUrl);
  }, [imagesPool]);

  const backgroundRows = useMemo(() => {
    const base = imagesPool.length ? imagesPool : STOCK_GALLERY_IMAGES; // already shuffled
    const PER_ROW = 24;
    const slice = (row: number) =>
      Array.from(
        { length: PER_ROW },
        (_, i) => base[(row * PER_ROW + i) % base.length],
      );
    return { row1: slice(0), row2: slice(1), row3: slice(2), row4: slice(3) };
  }, [imagesPool]);

  const handleLearnMore = () => {
    const element = document.getElementById("about-section");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleViewHome = () => {
    navigateToPath("/");
  };

  const handleViewArchive = () => {
    navigateToPath("/archive");
  };

  const handleSelectImageAndInspect = useCallback(
    (img: GalleryImage) => navigateTo("details", `/p/${img.id}`, img),
    [navigateTo],
  );

  // If the visitor navigated inside the app, go back to where they came from
  // (home marquee, archive, event page). Cold QR arrivals have no app state,
  // so send them to the fallback instead.
  const goBackFromDetails = (fallbackPath: string) => {
    if (window.history.state?.view) {
      window.history.back();
    } else {
      navigateToPath(fallbackPath);
    }
  };

  // Load the full list only when the archive is opened
  useEffect(() => {
    if (currentView !== "archive" || archiveImages !== null) return;
    let cancelled = false;
    fetch("/api/images")
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (cancelled || !Array.isArray(payload?.images)) return;
        if (payload.images.length === 0) return;
        setArchiveImages(payload.images);
        setArchiveHasMore(payload.hasMore === true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentView, archiveImages]);

  useEffect(() => {
    switch (currentView) {
      case "home":
        applyPageMeta({
          title: "GLITCH BOOTH — Experimental Photo Booth",
          description:
            "Glitch Booth is an experimental photo booth installation capturing moments in the tension between perfect execution and hardware failure.",
          path: "/",
        });
        break;
      case "archive":
        applyPageMeta({
          title: "Archive — GLITCH BOOTH",
          description: "Browse captures from the Glitch Booth archive.",
          path: "/archive",
        });
        break;
      case "events":
        applyPageMeta({
          title: "Event Directory — GLITCH BOOTH",
          description: "Events where the Glitch Booth has appeared.",
          path: "/events",
        });
        break;
      case "event":
        if (activeEvent) {
          applyPageMeta({
            title: `${activeEvent.cardTitle} — GLITCH BOOTH`,
            description: activeEvent.description.replace(/\s+/g, " ").slice(0, 160),
            path: `/${activeEvent.slug}`,
          });
        }
        break;
      default:
        // capture pages, slideshow, 404: keep out of the index
        applyPageMeta({
          title: "GLITCH BOOTH",
          description: "Glitch Booth capture.",
          path: window.location.pathname,
          noindex: true,
        });
    }
  }, [currentView, activeEvent]);

  if (currentView === "slideshow") {
    return <Slideshow images={imagesPool} loading={loading} />;
  }

  return (
    <div
      className="relative min-h-screen bg-[#131313] text-[#e2e2e2]"
      id="home"
    >
      <div className="scanlines-overlay" />
      <div className="scanline-moving-bar" />

      <Header
        currentView={currentView}
        setView={(view) => setCurrentView(view as AppView)}
        onNavigateToPath={navigateToPath}
      />

      <main className="pb-16 min-h-[75vh]">
        {currentView === "event" && activeEvent ? (
          <EventPage
            event={activeEvent}
            onImageSelect={(image) =>
              navigateTo(
                "event-details",
                `/${activeEvent.slug}/p/${image.id}`,
                image,
                false,
                activeEvent,
              )
            }
          />
        ) : currentView === "event-details" && activeEvent && selectedImage ? (
          <DetailsView
            image={selectedImage}
            event={activeEvent}
            onBackToArchive={() => goBackFromDetails(`/${activeEvent.slug}`)}
            onBackToHome={handleViewHome}
          />
        ) : currentView === "details" && selectedImage ? (
          <DetailsView
            image={selectedImage}
            onBackToArchive={() => goBackFromDetails("/archive")}
            onBackToHome={handleViewHome}
          />
        ) : currentView === "events" ? (
          <EventsPage />
        ) : currentView === "not-found" ? (
          <div className="min-h-[60vh] flex items-center justify-center font-mono text-sm text-[#84967e]">
            [ ROUTE_NOT_FOUND ]
          </div>
        ) : loading ? (
          <div className="w-full h-[70vh] flex flex-col items-center justify-center font-mono text-[#00ff41] text-xs tracking-widest">
            <div className="flex items-center space-x-2 animate-pulse mb-2">
              <span className="w-2 h-2 bg-[#00ff41] rounded-full" />
              <span>CONNECTING_TO_GLITCH_BOOTH_STORAGE...</span>
            </div>
          </div>
        ) : (
          <>
            {currentView === "home" && (
              <>
                <section
                  id="gallery-section"
                  onClick={() => isHeroVisible && setIsHeroVisible(false)}
                  className="relative w-full min-h-[calc(100vh-80px)] min-h-[550px] md:min-h-[750px] overflow-hidden bg-black flex items-center justify-center border-b border-matrix/20 px-4 py-12"
                >
                  {/* Background Sliding Tapes - Becomes interactive when Hero drops */}
                  <div
                    className={`absolute inset-0 z-0 flex flex-col justify-between py-2 transition-opacity duration-500 ${
                      isHeroVisible
                        ? "opacity-30 md:opacity-35 pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    <GlitchMarqueeRow
                      images={backgroundRows.row1}
                      direction="right"
                      speed={22}
                      interactive={!isHeroVisible}
                      onImageClick={handleSelectImageAndInspect}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row2}
                      direction="left"
                      speed={21}
                      interactive={!isHeroVisible}
                      onImageClick={handleSelectImageAndInspect}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row3}
                      direction="right"
                      speed={23}
                      interactive={!isHeroVisible}
                      onImageClick={handleSelectImageAndInspect}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row4}
                      direction="left"
                      speed={24}
                      interactive={!isHeroVisible}
                      onImageClick={handleSelectImageAndInspect}
                    />
                  </div>

                  {/* Hero Container Box */}
                  {isHeroVisible && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="relative z-10 w-full max-w-3xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.98)] shadow-black/15"
                    >
                      <Hero
                        onLearnMoreClick={handleLearnMore}
                        onViewArchiveClick={handleViewArchive}
                        onRandomizeClick={handleRandomizeImages}
                        onClose={() => setIsHeroVisible(false)}
                      />
                    </div>
                  )}
                </section>

                <Specs />
                <StatsDashboard />
                <ContactForm />
              </>
            )}

            {currentView === "archive" && (
              <ArchiveView
                images={archiveImages ?? imagesPool}
                hasMoreCaptures={archiveImages ? archiveHasMore : hasMoreCaptures}
                onImageSelect={handleSelectImageAndInspect}
                onBackToHome={handleViewHome}
                onRandomize={handleRandomizeImages}
              />
            )}
          </>
        )}
      </main>

      <footer className="w-full border-t border-matrix/20 bg-black py-8 font-mono text-xs text-[#84967e] select-none">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-ping" />
            <span>(C) 2026 GLITCH_BOOTH // STATUS: ONLINE</span>
          </div>
          <div className="text-center sm:text-right uppercase tracking-[0.1em]">
            <span>
              POWERED BY{" "}
              <a
                href="https://dirtcakestudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#00ff41] font-bold transition-colors duration-300 decoration-none"
              >
                DIRTCAKE STUDIO
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
