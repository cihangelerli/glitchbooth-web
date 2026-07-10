import { motion } from "motion/react";
import { GalleryImage } from "../types";

interface GlitchMarqueeRowProps {
  images: GalleryImage[];
  direction: "left" | "right";
  speed?: number;
  onImageClick?: (img: GalleryImage) => void;
  interactive?: boolean;
  sizeClassName?: string; // Flexible prop to overwrite default box sizing
}

export default function GlitchMarqueeRow({
  images,
  direction,
  speed = 15,
  onImageClick,
  interactive = true,
  sizeClassName,
}: GlitchMarqueeRowProps) {
  const loopImages = [...images, ...images, ...images, ...images];
  const safeCount = images.length || 1;
  const constantVelocityDuration = safeCount * speed;

  return (
    <div className="relative w-full overflow-hidden py-1 border-t border-b border-matrix/10 bg-black flex items-center select-none group">
      <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none" />
      <div className="absolute right-4 top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none" />

      <motion.div
        className="flex space-x-6 pr-6" // Slightly wider item spacing for large assets
        animate={{
          x: direction === "left" ? [0, "-50%"] : ["-50%", 0],
        }}
        transition={{
          ease: "linear",
          duration: constantVelocityDuration,
          repeat: Infinity,
        }}
        whileHover={interactive ? { animationPlayState: "paused" } : undefined}
      >
        {loopImages.map((img, idx) => (
          <div
            key={`${img.id}-${idx}`}
            onClick={() => interactive && onImageClick?.(img)}
            className={`relative shrink-0 border border-[#3b4b37] transition-all duration-300 overflow-hidden bg-[#0e0e0e] shadow-[inset_0_0_25px_rgba(0,0,0,0.95)] ${
              sizeClassName ? sizeClassName : "w-36 h-36 md:w-56 md:h-56"
            } ${
              interactive
                ? "hover:border-[#00ff41] cursor-pointer group/item"
                : "cursor-default pointer-events-none"
            }`}
          >
            {interactive && (
              <>
                <div className="absolute top-1 left-1 bg-black/80 border border-matrix/20 px-1 py-0.5 text-[8px] font-mono text-[#00ff41] opacity-0 group-hover/item:opacity-100 transition-all duration-200 z-10">
                  {img.filename}
                </div>
                <div className="absolute bottom-1 right-1 bg-black/80 border border-magenta/20 px-1 py-0.5 text-[8px] font-mono text-magenta opacity-0 group-hover/item:opacity-100 transition-all duration-200 z-10">
                  GLITCH // {img.glitchLevel}%
                </div>
              </>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-1" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,255,65,0.06)_50%)] bg-[size:100%_4px] pointer-events-none z-1 mix-blend-overlay opacity-80" />

            {interactive && (
              <div className="absolute inset-0 bg-matrix/5 mix-blend-color-dodge opacity-0 group-hover/item:opacity-30 transition-opacity duration-300 z-2" />
            )}

            <img
              src={img.url}
              alt={img.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover grayscale contrast-[1.7] brightness-[0.9] transition-all duration-500 ${
                interactive
                  ? "group-hover/item:scale-105 group-hover/item:contrast-[2.2] group-hover/item:brightness-[1.1]"
                  : ""
              }`}
            />

            {interactive && (
              <>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-matrix opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
              </>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
