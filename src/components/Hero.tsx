import { useEffect, useState } from "react";
import { Terminal, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onLearnMoreClick: () => void;
  onViewArchiveClick: () => void;
  onRandomizeClick: () => void;
  onClose: () => void; // Added to contract
}

export default function Hero({
  onLearnMoreClick,
  onViewArchiveClick,
  onRandomizeClick,
  onClose,
}: HeroProps) {
  const [blink, setBlink] = useState(true);
  const [glitchTitle, setGlitchTitle] = useState("GLITCH BOOTH");

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const glitches = [
      "GLITCH BOOTH",
      "GL1TCH B00TH",
      "GLITCH BOOTH",
      "GLI_CH BOOTH",
      "GLITCH BOOTH",
      "GLITCH B00TH_",
      "GLITCH BOOTH",
      "G_ITCH BOOTH",
    ];
    const triggerGlitch = () => {
      const duration = Math.floor(Math.random() * 200) + 50;
      const index = Math.floor(Math.random() * glitches.length);
      setGlitchTitle(glitches[index]);
      setTimeout(() => {
        setGlitchTitle("GLITCH BOOTH");
      }, duration);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        triggerGlitch();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[1200px] mx-auto px-4 py-8 md:py-16 text-center select-none z-20">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-3xl bg-black/95 border-2 border-[#00ff41] p-6 md:p-12 glow-border-matrix"
        style={{ borderRadius: "0px" }}
      >
        {/* Brutalist Close Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 text-[#84967e] hover:text-[#00ff41] transition-colors duration-200 p-1 font-mono text-[10px] tracking-wider bg-black border border-transparent hover:border-[#00ff41]/30 cursor-pointer z-30"
          title="CLOSE INTERFACE"
        >
          <span>[ X ]</span>
        </button>

        {/* Terminal Header Info */}
        <div className="flex flex-wrap items-center justify-between text-[9px] md:text-xs font-mono text-[#84967e] mb-6 md:mb-8 border-b border-matrix/10 pb-4 pr-12">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#00ff41] rounded-full animate-ping" />
            <span className="text-[#00ff41] font-bold">
              [ SYSTEM_INITIALIZED // KERNEL_LOADED ]
            </span>
          </div>
          <div className="text-[#00daf8] hidden sm:block">
            LOC_ADDR:{" "}
            <span className="font-bold underline">GLITCHBOOTH.ONLINE</span>
          </div>
        </div>

        {/* Glitch Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#00ff41] tracking-wider mb-6 relative select-all leading-none">
          <span className="relative inline-block glow-text-matrix">
            {glitchTitle}
            <span
              className={`inline-block ml-1 bg-[#00ff41] w-3 h-9 md:w-4 md:h-12 align-middle ${
                blink ? "opacity-100" : "opacity-0"
              }`}
            ></span>
          </span>
        </h1>

        <p className="font-mono text-sm sm:text-base md:text-lg text-[#e2e2e2] leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10 block pr-2">
          A raw, high-contrast digital brutalism experience. Capturing moments
          in the tension between perfect execution and hardware failure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLearnMoreClick();
            }}
            className="w-full bg-[#00ff41] text-black font-mono font-bold text-xs tracking-widest py-3 border-2 border-[#00ff41] hover:bg-black hover:text-[#00ff41] hover:shadow-[0_0_15px_#00ff41] duration-300 transition-all cursor-pointer"
            style={{ borderRadius: "0px" }}
          >
            LEARN_MORE
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewArchiveClick();
            }}
            className="w-full bg-transparent text-[#00ff41] font-mono font-bold text-xs tracking-widest py-3 border-2 border-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] duration-300 transition-all cursor-pointer"
            style={{ borderRadius: "0px" }}
          >
            VIEW_ARCHIVE
          </button>
        </div>

        {/* Hardware Status Trigger */}
        <div className="mt-8 flex flex-wrap items-center justify-center space-x-6 text-[10px] font-mono text-[#84967e] pt-4 border-t border-matrix/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRandomizeClick();
            }}
            className="hover:text-[#00ff41] transition-colors flex items-center space-x-1 uppercase tracking-wider cursor-pointer underline decoration-dotted"
          >
            <Terminal size={12} className="text-[#00ff41]" />
            <span>[ RANDOMIZE_IMAGE_SOURCE ]</span>
          </button>
          <div className="flex items-center space-x-1">
            <ShieldAlert size={12} className="text-magenta" />
            <span className="text-[#ffabf3]">EMULATION: ACTIVE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
