import { motion } from 'motion/react';
import { GalleryImage } from '../types';

interface GlitchMarqueeRowProps {
  images: GalleryImage[];
  direction: 'left' | 'right';
  speed?: number;
  onImageClick?: (img: GalleryImage) => void;
  interactive?: boolean;
}

export default function GlitchMarqueeRow({
  images,
  direction,
  speed = 25,
  onImageClick,
  interactive = true,
}: GlitchMarqueeRowProps) {
  // Duplicate the images to ensure seamless infinite looping matching the screen width
  const loopImages = [...images, ...images, ...images, ...images];

  return (
    <div className="relative w-full overflow-hidden py-1 border-t border-b border-matrix/10 bg-black flex items-center select-none group">
      {/* Decorative pointer guidelines */}
      <div className="absolute left-[gutter] top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none" />
      <div className="absolute right-[gutter] top-0 bottom-0 w-[1px] bg-matrix/5 pointer-events-none" />

      <motion.div
        className="flex space-x-4 pr-4"
        animate={{
          x: direction === 'left' ? [0, '-50%'] : ['-50%', 0],
        }}
        transition={{
          ease: 'linear',
          duration: speed,
          repeat: Infinity,
        }}
        // Pause on hover only if interactive
        whileHover={interactive ? { animationPlayState: 'paused' } : undefined}
      >
        {loopImages.map((img, idx) => (
          <div
            key={`${img.id}-${idx}`}
            onClick={() => interactive && onImageClick?.(img)}
            className={`relative w-36 h-36 md:w-56 md:h-56 shrink-0 border border-[#3b4b37] transition-all duration-300 overflow-hidden bg-[#0e0e0e] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] ${
              interactive 
                ? 'hover:border-[#00ff41] cursor-pointer group/item' 
                : 'cursor-default pointer-events-none'
            }`}
          >
            {/* Cyber overlay elements representing diagnostic state only if interactive */}
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

            {/* CRT visual filter overlay on individual images */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-1" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,255,65,0.08)_50%)] bg-[size:100%_4px] pointer-events-none z-1 mix-blend-overlay opacity-80" />

            {/* Glitch raster mask effect when hover is active (only if interactive) */}
            {interactive && (
              <div className="absolute inset-0 bg-matrix/5 mix-blend-color-dodge opacity-0 group-hover/item:opacity-30 transition-opacity duration-300 z-2" />
            )}

            <img
              src={img.url}
              alt={img.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover grayscale contrast-[1.8] brightness-[0.95] transition-all duration-500 ${
                interactive 
                  ? 'group-hover/item:scale-105 group-hover/item:contrast-[2.2] group-hover/item:brightness-[1.1]' 
                  : ''
              }`}
            />

            {/* Simulated frame box line corner tags only if interactive */}
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
