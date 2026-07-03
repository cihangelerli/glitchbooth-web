import { useEffect, useState, useRef } from "react";
import { Cpu, Server, Globe2, CheckCircle, Terminal } from "lucide-react";
import { motion, useInView } from "motion/react";

export default function Specs() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const initialConsoleLines = [
    { text: "Initializing GLITCH_BOOTH system...", delay: 0 },
    { text: "Loading effects: OK", delay: 150 },
    { text: "Camera layer: OK", delay: 350 },
    { text: "Knobs synchronization: OK", delay: 550 },
    {
      text: "Glitch Capture Network: CONNECTED",
      delay: 800,
      status: "CONNECTED",
    },
    {
      text: "Buffer overflow prevention: DISABLED",
      delay: 1100,
      status: "WARN",
    },
    { text: "Finalizing interface...", delay: 1350 },
    { text: "BOOT_SEQUENCE_COMPLETE", delay: 1600, status: "SUCCESS" },
  ];

  const [activeLines, setActiveLines] = useState<typeof initialConsoleLines>(
    [],
  );

  // Trigger loading lines only when visible on screen
  useEffect(() => {
    if (isInView) {
      initialConsoleLines.forEach((line) => {
        setTimeout(() => {
          setActiveLines((prev) => [...prev, line]);
        }, line.delay);
      });
    }
  }, [isInView]);

  return (
    <section
      id="about-section"
      ref={containerRef}
      className="relative w-full max-w-[1200px] mx-auto px-4 py-16 md:py-24 grid-brutalist border-t border-matrix/20 text-left select-none"
    >
      {/* Visual Section Accent Title */}
      <div className="flex items-center space-x-2 mb-12 border-b border-matrix/20 pb-4">
        <div className="bg-[#00ff41] p-1.5 text-black">
          <Cpu size={16} />
        </div>
        <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-widest text-[#00ff41] uppercase">
          SYSTEM_SPECIFICATIONS
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Spec Details & Status Block */}
        <div className="space-y-8">
          {/* HARDWARE CORE */}
          <div className="border-l-2 border-[#00ff41] pl-4 space-y-2">
            <h3 className="font-display text-xs sm:text-sm font-bold text-[#00ff41] tracking-wider flex items-center space-x-2">
              <span>&gt; HARDWARE_CORE</span>
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#b9ccb2] leading-relaxed">
              Bare-metal input modules process raw sensor data and custom logic
              controlled by user manipulates visuals pre-capture at the precise
              amount of physical exposure to the glitch pipeline.
            </p>
          </div>

          {/* STORAGE PIPELINE */}
          <div className="border-l-2 border-[#00ff41] pl-4 space-y-2">
            <h3 className="font-display text-xs sm:text-sm font-bold text-[#00ff41] tracking-wider flex items-center space-x-2">
              <span>&gt; THERMAL_STORAGE_PIPELINE</span>
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#b9ccb2] leading-relaxed">
              Each digital capture is translated into a raw, analog thermal
              receipt print—creating a low-fi, physical urban artifact you can
              hold in your hand.
            </p>
          </div>

          {/* DEPLOYMENT EDGE */}
          <div className="border-l-2 border-[#00ff41] pl-4 space-y-2">
            <h3 className="font-display text-xs sm:text-sm font-bold text-[#00ff41] tracking-wider flex items-center space-x-2">
              <span>&gt; THE_DIGITAL_PHYSICAL_BRIDGE</span>
            </h3>
            <p className="font-mono text-xs sm:text-sm text-[#b9ccb2] leading-relaxed">
              Every physical print includes a direct token link. Scanning it
              instantly hooks you back into the digital archive gallery to view,
              inspect, or download the original high-contrast capture.
            </p>
          </div>

          {/* Status Box block matching design mockup specs */}
          <div className="bg-[#1b1b1b] border border-matrix/20 p-5 font-mono text-xs space-y-2 relative">
            <div className="absolute top-0 right-0 p-1 px-2 text-[9px] bg-[#00ff41]/10 text-[#00ff41] border-l border-b border-matrix/20 font-bold">
              SYS STAT
            </div>
            <div className="flex justify-between border-b border-[#3b4b37]/30 pb-2">
              <span className="text-[#84967e]">Status:</span>
              <span className="text-[#00ff41] font-bold glow-text-matrix flex items-center space-x-1">
                <span>ONLINE</span>
                <span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-ping inline-block" />
              </span>
            </div>
            <div className="flex justify-between border-b border-[#3b4b37]/30 pb-2">
              <span className="text-[#84967e]">Uptime:</span>
              <span className="text-[#00ff41]">99.98%</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#84967e]">Kernel:</span>
              <span className="text-[#00daf8] font-semibold">6.1.21-v8+</span>
            </div>
            <div className="text-[10px] text-[#84967e] pt-2 italic flex items-center">
              <span>ACTIVE_RE-ENCRYPTION_BUFFER</span>
              <span className="w-2 h-3 bg-[#00ff41]/50 ml-1.5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Side: Boot Terminal Window & About Paragraph */}
        <div className="space-y-8">
          {/* CRT emulator terminal window */}
          <div className="bg-black border-2 border-[#3b4b37]/80 overflow-hidden shadow-2xl relative">
            {/* Terminal Header Bar */}
            <div className="bg-[#1b1b1b] border-b-2 border-[#3b4b37]/80 px-4 py-2 flex items-center justify-between font-mono text-[10px] md:text-xs">
              <span className="text-[#00ff41] font-bold flex items-center space-x-2">
                <Terminal size={14} className="text-[#00ff41] animate-pulse" />
                <span>~\GLITCH_BOOTH\SERVER.PY</span>
              </span>
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-matrix/23" />
                <div className="w-2.5 h-2.5 bg-[#fe00fe]/30" />
              </div>
            </div>

            {/* Terminal Console Log Output */}
            <div className="p-4 md:p-6 font-mono text-xs text-[#00ff41] space-y-2 min-h-[220px] bg-gradient-to-b from-[#0a0a0a] to-[#040404]">
              {/* Scanline line overlay inside prompt */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,255,65,0.06)_50%)] bg-[size:100%_4px] pointer-events-none z-1" />

              {/* Streaming lines */}
              {activeLines.map((line, idx) => {
                const timestamp = `[0.${String(idx * 142).padStart(3, "0")}]`;

                let valColor = "text-[#00ff41]";
                if (line.status === "CONNECTED")
                  valColor = "text-[#00daf8] glow-text-cyber";
                if (line.status === "WARN")
                  valColor = "text-magenta font-semibold glow-text-magenta";
                if (line.status === "SUCCESS")
                  valColor = "text-black bg-[#00ff41] px-1 font-bold";

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx}
                    className="flex text-[11px] md:text-xs items-start leading-[1.4]"
                  >
                    <span className="text-[#84967e] shrink-0 mr-3">
                      {timestamp}
                    </span>
                    <span className={`${valColor}`}>{line.text}</span>
                  </motion.div>
                );
              })}

              {/* Live Blinking prompt */}
              {isInView && (
                <div className="flex items-center text-[11px] md:text-xs text-[#84967e] font-semibold pt-2">
                  <span className="mr-3">[LIVE]</span>
                  <span className="text-[#00ff41]">
                    root@glitch_booth:~$&nbsp;
                  </span>
                  <span className="w-2 h-4 bg-[#00ff41] animate-[pulse_0.8s_infinite]" />
                </div>
              )}
            </div>
          </div>

          {/* ABOUT THE BOOTH text blocks exactly matching specs layout */}
          <div className="space-y-4">
            <h4 className="font-display text-[#00ff41] text-xs font-bold tracking-widest uppercase">
              // ABOUT_GLITCH_BOOTH
            </h4>
            <p className="font-mono text-xs sm:text-sm text-[#e2e2e2] leading-relaxed">
              GLITCH BOOTH is an experimental digital installation designed to
              explore the aesthetics of technology in states of distress.
              Gitchbooth doesn't just take photos; it documents the digital
              ghost in the machine in a little urban artifact...
            </p>
            <p className="font-mono text-xs sm:text-sm text-[#e2e2e2] leading-relaxed">
              GLITCH BOOTH is powered by{" "}
              <a
                href="https://dirtcakestudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-[#00ff41] transition-colors"
              >
                Dirtcake Studio
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
