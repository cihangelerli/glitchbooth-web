import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GlitchMarqueeRow from "./components/GlitchMarqueeRow";
import Specs from "./components/Specs";
import ContactForm from "./components/ContactForm";
import ArchiveView from "./components/ArchiveView";
import DetailsView from "./components/DetailsView";
import { STOCK_GALLERY_IMAGES, getRandomizedImages } from "./data/images";
import { GalleryImage } from "./types";

export default function App() {
  const [imagesPool, setImagesPool] =
    useState<GalleryImage[]>(STOCK_GALLERY_IMAGES);
  const [currentView, setCurrentView] = useState<
    "home" | "archive" | "details"
  >("home");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Shuffles images pool to simulate immediate dynamic ImageKit asset lookups or random seeds
  const handleRandomizeImages = () => {
    const randomized = getRandomizedImages(STOCK_GALLERY_IMAGES.length);
    setImagesPool(randomized);
  };

  // Pre-seed randomization on mount to keep layouts feeling fresh
  useEffect(() => {
    // 1. Run your original layout randomization
    handleRandomizeImages();

    // 2. Check if the user arrived via a direct QR code link (/p/id)
    const path = window.location.pathname; // Capture everything after localhost:3000
    if (path.startsWith("/p/")) {
      const photoId = path.split("/p/")[1];

      if (photoId) {
        // 3. Reconstruct a target object matching your local image details configuration
        const deepLinkedImage = {
          id: photoId,
          // Replace 'glitchbooth_id' below with your real ImageKit ID when ready
          url: `https://ik.imagekit.io/w6lsfsw8j/booth_captures/${photoId}_color.jpg`,
          name: `${photoId}_color.jpg`,
          title: `CAPTURE_${photoId}`,
          date: "2026-06-03",
        };

        // 4. Force React to instantly skip the landing page and render the capture deck
        setSelectedImage(deepLinkedImage as any);
        setCurrentView("details");
      }
    }
  }, []);

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

  // Elegant 4-row slicing to fill the background gallery on load
  const row1Images = imagesPool.slice(0, 4);
  const row2Images = imagesPool.slice(4, 8);
  const row3Images = imagesPool.slice(8, 11);
  const row4Images = imagesPool.slice(11, 14);

  return (
    <div
      className="relative min-h-screen bg-[#131313] text-[#e2e2e2]"
      id="home"
    >
      {/* Invisible screen scanline strip overlay */}
      <div className="scanlines-overlay" />

      {/* Global moving horizontal CRT beam */}
      <div className="scanline-moving-bar" />

      {/* Dynamic Header */}
      <Header currentView={currentView} setView={setCurrentView} />

      <main className="pb-16 min-h-[75vh]">
        {currentView === "home" && (
          <>
            {/* Centered screen-filling landing gallery backdrop containing slow-moving carousels */}
            <section
              id="gallery-section"
              className="relative w-full min-h-[calc(100vh-80px)] min-h-[550px] md:min-h-[750px] overflow-hidden bg-black flex items-center justify-center border-b border-matrix/20 px-4 py-12"
            >
              {/* BACKSTAGE: 4 rows of marquee imagery - extremely slow-moving and non-interactive */}
              <div className="absolute inset-0 z-0 flex flex-col justify-between py-2 opacity-30 md:opacity-35 select-none pointer-events-none">
                <GlitchMarqueeRow
                  images={row1Images.length ? row1Images : STOCK_GALLERY_IMAGES}
                  direction="right"
                  speed={95}
                  interactive={false}
                />
                <GlitchMarqueeRow
                  images={row2Images.length ? row2Images : STOCK_GALLERY_IMAGES}
                  direction="left"
                  speed={85}
                  interactive={false}
                />
                <GlitchMarqueeRow
                  images={row3Images.length ? row3Images : STOCK_GALLERY_IMAGES}
                  direction="right"
                  speed={105}
                  interactive={false}
                />
                <GlitchMarqueeRow
                  images={row4Images.length ? row4Images : STOCK_GALLERY_IMAGES}
                  direction="left"
                  speed={90}
                  interactive={false}
                />
              </div>

              {/* CORE FOCUS: Centered brutalist dashboard with blurred black shadow shield */}
              <div className="relative z-10 w-full max-w-3xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.98)] shadow-black/15">
                <Hero
                  onLearnMoreClick={handleLearnMore}
                  onViewArchiveClick={handleViewArchive}
                  onRandomizeClick={handleRandomizeImages}
                />
              </div>
            </section>

            {/* Section: Specifications */}
            <Specs />

            {/* Section: Communication channel form */}
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
      </main>

      {/* Styled Brutalist Footer */}
      <footer className="w-full border-t border-matrix/20 bg-black py-8 font-mono text-xs text-[#84967e] select-none">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-ping" />
            <span>(C) 2026 GLITCH_BOOTH // STATUS: ONLINE</span>
          </div>
          <div className="text-center sm:text-right uppercase tracking-[0.1em]">
            <span>
              POWERED BY{" "}
              <strong className="text-white hover:text-[#00ff41] transition-colors duration-300">
                DIRTCAKE STUDIO
              </strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
