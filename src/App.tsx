import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GlitchMarqueeRow from "./components/GlitchMarqueeRow";
import Specs from "./components/Specs";
import StatsDashboard from "./components/StatsDashboard";
import ContactForm from "./components/ContactForm";
import ArchiveView from "./components/ArchiveView";
import DetailsView from "./components/DetailsView";
import { STOCK_GALLERY_IMAGES } from "./data/images";
import { GalleryImage } from "./types";

export default function App() {
  const [imagesPool, setImagesPool] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHeroDismissed, setIsHeroDismissed] = useState<boolean>(false);

  // Set initial view state instantly from URL layout
  const [currentView, setCurrentView] = useState<
    "home" | "archive" | "details" | "slideshow"
  >(() => {
    const path = window.location.pathname;
    return path === "/slideshow" || path === "/slideshow/"
      ? "slideshow"
      : "home";
  });

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
      const path = window.location.pathname;
      let activePool = STOCK_GALLERY_IMAGES;

      try {
        const response = await fetch("/api/images");
        if (response.ok) {
          const liveData = await response.json();
          if (liveData && liveData.length > 0) {
            const randomizedLoad = shuffleArray(liveData);
            activePool = randomizedLoad;
            setImagesPool(randomizedLoad);
          }
        }
      } catch (err) {
        console.error(
          "ImageKit sync failed, falling back to stock assets:",
          err,
        );
        setImagesPool(shuffleArray(STOCK_GALLERY_IMAGES));
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
            const cleanId = photoId.replace("_color", "");
            let derivedTimestamp = "2026-06-03 00:00:00";

            const deepLinkedImage = {
              id: photoId,
              url: `https://ik.imagekit.io/w6lsfsw8j/booth_captures/${photoId}_color.jpg`,
              filename: `${photoId}_color.jpg`,
              title: `CAPTURE_${photoId}`,
              timestamp: derivedTimestamp,
            } as GalleryImage;
            setSelectedImage(deepLinkedImage);
          }
          setCurrentView("details");
        }
      }
    }

    initializeProjectData();
  }, []);

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

  // CDN Optimization tuning for massive stretched images
  const slideshowImages = useMemo(() => {
    const base = imagesPool.length ? imagesPool : STOCK_GALLERY_IMAGES;
    let pool = shuffleArray(base);
    while (pool.length < 60) {
      pool = [...pool, ...shuffleArray(base)];
    }
    return pool.slice(0, 80).map((img) => ({
      ...img,
      // Request higher quality (w-900, q-80) since images are physically larger on screen
      url: img.url.includes("ik.imagekit.io")
        ? `${img.url}?tr=w-900,q-80,f-auto`
        : img.url,
    }));
  }, [imagesPool]);

  const handleLearnMore = () => {
    const element = document.getElementById("about-section");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleViewArchive = () => {
    setCurrentView("archive");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectImageAndInspect = (img: GalleryImage) => {
    setSelectedImage(img);
    setCurrentView("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================================
  // LIGHTWEIGHT MASSIVE STRETCHED KIOSK SLIDESHOW VIEW
  // ==========================================================
  if (currentView === "slideshow") {
    return (
      <div className="fixed inset-0 bg-black text-[#00ff41] overflow-hidden flex flex-col justify-between font-mono select-none z-50">
        <div className="scanlines-overlay pointer-events-none" />
        <div className="scanline-moving-bar pointer-events-none" />

        {/* Minimalist Top Identity Bar */}
        <div className="w-full bg-black border-b border-[#00ff41]/20 px-8 py-4 flex justify-between items-center z-10 text-xs tracking-widest text-[#84967e]">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 bg-[#00ff41] rounded-full animate-ping" />
            <span className="text-[#00ff41] font-bold">GLITCH BOOTH</span>
          </div>
          <div className="hidden sm:block font-bold text-[#00daf8]">
            [ KIOSK_NODE_01 // LIVE_FEED ]
          </div>
        </div>

        {/* Center Frame Container - Extended to fill maximum height */}
        <div className="w-full h-[80vh] flex-1 flex items-center justify-center bg-black overflow-hidden relative">
          {loading ? (
            <div className="w-full text-center text-xs animate-pulse tracking-widest">
              BUFFERING_STRETCHED_CDN_STREAM...
            </div>
          ) : (
            <div className="w-full">
              <GlitchMarqueeRow
                images={slideshowImages}
                direction="right"
                speed={16} // Safe movement speed configuration for large frames
                interactive={false}
                sizeClassName="h-[74vh] aspect-square" // Forces images to fill 74% of viewport height perfectly square
              />
            </div>
          )}
        </div>

        {/* Minimalist Bottom Brand Identity Bar */}
        <div className="w-full bg-black border-t border-[#00ff41]/20 px-8 py-4 flex justify-between items-center z-10 text-xs tracking-wider text-[#84967e]">
          <div>GLITCHBOOTH.ONLINE</div>
          <div className="uppercase">POWERED BY DIRTCAKE STUDIO</div>
        </div>
      </div>
    );
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
                  className="relative w-full min-h-[calc(100vh-80px)] min-h-[550px] md:min-h-[750px] overflow-hidden bg-black flex items-center justify-center border-b border-matrix/20"
                >
                  {/* BACKGROUND MARQUEES */}
                  <div
                    className={`absolute inset-0 z-0 flex flex-col justify-between py-2 transition-all duration-700 select-none ${
                      isHeroDismissed
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-30 md:opacity-35 pointer-events-none"
                    }`}
                  >
                    <GlitchMarqueeRow
                      images={backgroundRows.row1}
                      direction="right"
                      speed={22}
                      interactive={isHeroDismissed}
                      onImageClick={handleSelectImageAndInspect}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row2}
                      direction="left"
                      speed={21}
                      interactive={isHeroDismissed}
                      onImageClick={handleSelectImageAndInspect}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row3}
                      direction="right"
                      speed={23}
                      interactive={isHeroDismissed}
                      onImageClick={handleSelectImageAndInspect}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row4}
                      direction="left"
                      speed={24}
                      interactive={isHeroDismissed}
                      onImageClick={handleSelectImageAndInspect}
                    />
                  </div>

                  {/* HERO DASHBOARD OVERLAY INTERCEPTOR */}
                  {!isHeroDismissed && (
                    <div
                      onClick={() => setIsHeroDismissed(true)}
                      className="absolute inset-0 z-20 flex items-center justify-center px-4 py-12 bg-black/20 cursor-pointer"
                    >
                      <div className="w-full max-w-3xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]">
                        <Hero
                          onLearnMoreClick={handleLearnMore}
                          onViewArchiveClick={handleViewArchive}
                          onRandomizeClick={handleRandomizeImages}
                          onClose={() => setIsHeroDismissed(true)}
                        />
                      </div>
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
                onImageSelect={handleSelectImageAndInspect}
                onBackToHome={() => setCurrentView("home")}
                onRandomize={handleRandomizeImages}
              />
            )}

            {currentView === "details" && selectedImage && (
              <DetailsView
                image={selectedImage}
                onBackToArchive={() => setCurrentView("archive")}
                onBackToHome={() => setCurrentView("home")}
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
