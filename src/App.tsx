import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GlitchMarqueeRow from "./components/GlitchMarqueeRow";
import Specs from "./components/Specs";
import ContactForm from "./components/ContactForm";
import ArchiveView from "./components/ArchiveView";
import DetailsView from "./components/DetailsView";
import { STOCK_GALLERY_IMAGES } from "./data/images";
import { GalleryImage } from "./types";

export default function App() {
  const [imagesPool, setImagesPool] = useState<GalleryImage[]>([]);
  const [currentView, setCurrentView] = useState<
    "home" | "archive" | "details"
  >("home");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Reusable Fisher-Yates array randomizer
  const shuffleArray = (array: GalleryImage[]): GalleryImage[] => {
    const scrambled = [...array];
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    return scrambled;
  };

  // Shuffles your live image pool on command
  const handleRandomizeImages = () => {
    setImagesPool((prevImages) => shuffleArray(prevImages));
  };

  useEffect(() => {
    async function initializeProjectData() {
      let activePool = STOCK_GALLERY_IMAGES;

      try {
        const response = await fetch("/api/images");
        if (response.ok) {
          const liveData = await response.json();
          if (liveData && liveData.length > 0) {
            // Shuffle immediately on initial load so it never looks stale
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
        // Shuffle stock assets on fallback failure too
        setImagesPool(shuffleArray(STOCK_GALLERY_IMAGES));
      } finally {
        setLoading(false);
      }

      // QR CODE / DEEP LINK INTERCEPTION LOOP
      const path = window.location.pathname;
      if (path.startsWith("/p/")) {
        const photoId = path.split("/p/")[1];

        if (photoId) {
          const existingMatch = activePool.find((img) => img.id === photoId);

          if (existingMatch) {
            setSelectedImage(existingMatch);
          } else {
            const cleanId = photoId.replace("_color", "");
            let derivedTimestamp = "2026-06-03 00:00:00";

            if (/^\d+$/.test(cleanId)) {
              const date = new Date(parseInt(cleanId, 10));
              if (!isNaN(date.getTime())) {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                const hh = String(date.getHours()).padStart(2, "0");
                const min = String(date.getMinutes()).padStart(2, "0");
                const ss = String(date.getSeconds()).padStart(2, "0");
                derivedTimestamp = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
              }
            } else {
              const parts = cleanId.split("_");
              if (
                parts.length === 2 &&
                parts[0].length === 8 &&
                parts[1].length === 6
              ) {
                const d = parts[0];
                const t = parts[1];
                derivedTimestamp = `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)} ${t.substring(0, 2)}:${t.substring(2, 4)}:${t.substring(4, 6)}`;
              }
            }

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

  // DYNAMIC BACKGROUND GENERATOR MATRIX
  // Prevents reshuffling on every component text change, but fills gaps perfectly
  const backgroundRows = useMemo(() => {
    const base = imagesPool.length ? imagesPool : STOCK_GALLERY_IMAGES;

    const generateRobustRow = () => {
      let uniqueRowSelection = shuffleArray(base);

      // If the asset pool size is small, keep merging shuffled variations
      // to ensure the width overflows the screen edge flawlessly
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
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
                  className="relative w-full min-h-[calc(100vh-80px)] min-h-[550px] md:min-h-[750px] overflow-hidden bg-black flex items-center justify-center border-b border-matrix/20 px-4 py-12"
                >
                  {/* BACKGROUND MARQUEES */}
                  <div className="absolute inset-0 z-0 flex flex-col justify-between py-2 opacity-30 md:opacity-35 select-none pointer-events-none">
                    <GlitchMarqueeRow
                      images={backgroundRows.row1}
                      direction="right"
                      speed={22} // 16 seconds pacing per image segment
                      interactive={false}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row2}
                      direction="left"
                      speed={21} // Slightly different to keep rows unsynced
                      interactive={false}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row3}
                      direction="right"
                      speed={23}
                      interactive={false}
                    />
                    <GlitchMarqueeRow
                      images={backgroundRows.row4}
                      direction="left"
                      speed={24}
                      interactive={false}
                    />
                  </div>

                  {/* HERO DASHBOARD */}
                  <div className="relative z-10 w-full max-w-3xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.98)] shadow-black/15">
                    <Hero
                      onLearnMoreClick={handleLearnMore}
                      onViewArchiveClick={handleViewArchive}
                      onRandomizeClick={handleRandomizeImages}
                    />
                  </div>
                </section>

                <Specs />
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
