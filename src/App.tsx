import { useState, useEffect, useMemo } from "react";
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

export default function App() {
  const [imagesPool, setImagesPool] = useState<GalleryImage[]>([]);
  const [hasMoreCaptures, setHasMoreCaptures] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Persistent visibility toggle flag - stays across subcomponent view switching paths
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(true);

  const [currentView, setCurrentView] = useState<
    "home" | "archive" | "details" | "slideshow"
  >(() => {
    const path = window.location.pathname.replace(/\/$/, "");
    if (path === "/slideshow") return "slideshow";
    if (path === "/archive") return "archive";
    if (path.startsWith("/p/")) return "details";
    return "home";
  });

  // Centralized router function that pairs React state updates with window.history
  const navigateTo = (
    view: "home" | "archive" | "details" | "slideshow",
    path: string,
    image: GalleryImage | null = null,
    replace: boolean = false,
  ) => {
    setCurrentView(view);
    setSelectedImage(image);

    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState({ view, id: image?.id }, "", path);
      } else {
        window.history.pushState({ view, id: image?.id }, "", path);
      }
    }

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
      let activePool = STOCK_GALLERY_IMAGES;
      const path = window.location.pathname;

      try {
        const response = await fetch("/api/images");
        const payload = response.ok
          ? await response.json().catch(() => null)
          : null;

        const liveImages = Array.isArray(payload?.images) ? payload.images : [];

        const pool = liveImages.length > 0 ? liveImages : STOCK_GALLERY_IMAGES;

        const randomizedLoad = shuffleArray(pool);
        activePool = randomizedLoad;
        setImagesPool(randomizedLoad);
        setHasMoreCaptures(liveImages.length > 0 && payload?.hasMore === true);
      } catch (err) {
        console.error(
          "ImageKit sync failed, falling back to stock assets:",
          err,
        );
        const fallback = shuffleArray(STOCK_GALLERY_IMAGES);
        activePool = fallback;
        setImagesPool(fallback);
        setHasMoreCaptures(false);
      } finally {
        setLoading(false);
      }

      if (path.startsWith("/p/")) {
        const photoId = path.split("/p/")[1];
        if (photoId) {
          const existingMatch = activePool.find((img) => img.id === photoId);
          if (existingMatch) {
            setSelectedImage(existingMatch);
          } else {
            const deepLinkedImage = {
              id: photoId,
              url: `https://ik.imagekit.io/w6lsfsw8j/booth_captures/${photoId}_color.jpg`,
              filename: `${photoId}_color.jpg`,
              title: `CAPTURE_${photoId}`,
              timestamp: "2026-06-03 00:00:00",
            } as GalleryImage;
            setSelectedImage(deepLinkedImage);
          }
          setCurrentView("details");
        }
      }
    }

    initializeProjectData();
  }, []);

  // Synchronize URL path with React state on mount, image pool updates, and browser popstate navigation
  useEffect(() => {
    const syncViewWithUrl = () => {
      const path = window.location.pathname.replace(/\/$/, ""); // Strip trailing slash

      if (path === "/archive") {
        setCurrentView("archive");
        setSelectedImage(null);
      } else if (path.startsWith("/p/")) {
        const photoId = path.split("/p/")[1];
        if (photoId) {
          const match = imagesPool.find((img) => img.id === photoId);
          if (match) {
            setSelectedImage(match);
          } else {
            // Fallback object while imagesPool loads or if ID is missing from live pool
            setSelectedImage({
              id: photoId,
              url: `https://ik.imagekit.io/w6lsfsw8j/booth_captures/${photoId}_color.jpg`,
              filename: `${photoId}_color.jpg`,
              title: `CAPTURE_${photoId}`,
              timestamp: new Date().toISOString(),
            } as GalleryImage);
          }
          setCurrentView("details");
        }
      } else if (path === "/slideshow") {
        setCurrentView("slideshow");
        setSelectedImage(null);
      } else {
        setCurrentView("home");
        setSelectedImage(null);
      }
    };

    // Run synchronization immediately on load/data hydration
    syncViewWithUrl();

    window.addEventListener("popstate", syncViewWithUrl);
    return () => window.removeEventListener("popstate", syncViewWithUrl);
  }, [imagesPool]);

  const backgroundRows = useMemo(() => {
    const base = imagesPool.length ? imagesPool : STOCK_GALLERY_IMAGES;
    const generateRobustRow = () => {
      let uniqueRowSelection = shuffleArray(base);
      while (uniqueRowSelection.length < 12) {
        uniqueRowSelection = [...uniqueRowSelection, ...shuffleArray(base)];
      }
      return uniqueRowSelection;
    };

    return {
      row1: generateRobustRow(),
      row2: generateRobustRow(),
      row3: generateRobustRow(),
      row4: generateRobustRow(),
    };
  }, [imagesPool]);

  const handleLearnMore = () => {
    const element = document.getElementById("about-section");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleViewHome = () => {
    navigateTo("home", "/");
  };

  const handleViewArchive = () => {
    navigateTo("archive", "/archive");
  };

  const handleSelectImageAndInspect = (img: GalleryImage) => {
    navigateTo("details", `/p/${img.id}`, img);
  };

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

      <Header currentView={currentView} setView={setCurrentView} />

      <main className="pb-16 min-h-[75vh]">
        {loading ? (
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
                images={imagesPool}
                hasMoreCaptures={hasMoreCaptures}
                onImageSelect={handleSelectImageAndInspect}
                onBackToHome={handleViewHome}
                onRandomize={handleRandomizeImages}
              />
            )}

            {currentView === "details" && selectedImage && (
              <DetailsView
                image={selectedImage}
                onBackToArchive={handleViewArchive}
                onBackToHome={handleViewHome}
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
