import React, { useState } from "react";
import { Send, CheckCircle2, AlertTriangle, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "transmitting" | "success" | "error"
  >("idle");
  const [logLines, setLogLines] = useState<string[]>([]);

  // 1. Converted to async function to handle the live API response sequence
  const handleTransmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("error");
      return;
    }

    setStatus("transmitting");
    setLogLines([
      "ESTABLISHING HANDSHAKE WITH GLITCHBOOTH.ONLINE...",
      "ENCRYPTING DATA_PAYLOAD (AES-256-CTR)...",
      "RESOLVING FORMSPREE UPLINK GATEWAY...",
    ]);

    // 2. Prepare the payload block structure
    const payload = new FormData();
    payload.append("name", name);
    payload.append("email", email);
    payload.append("message", message);

    try {
      // Small artificial spacer so the user can actually read your terminal logs
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLogLines((prev) => [
        ...prev,
        "PACKET_TRANSMISSION: ROUTING TO CORE GATEWAY...",
      ]);

      // 3. Dispatch data directly to your Formspree endpoint
      const response = await fetch("https://formspree.io/f/xqeokaek", {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (response.ok) {
        // Successful response pathway
        setLogLines((prev) => [...prev, "PACKET_TRANSMISSION: SENT_OK (200)"]);
        setLogLines((prev) => [
          ...prev,
          "SYNCHRONIZING TERMINAL OVERFLOW FEED...",
        ]);

        await new Promise((resolve) => setTimeout(resolve, 800));

        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        // Server responded with an error code (e.g. 400 or 500)
        setLogLines((prev) => [
          ...prev,
          "CRITICAL_FAILURE: GATEWAY REJECTED PACKET ATOM",
        ]);
        setStatus("error");
      }
    } catch (error) {
      // Local network dropped or connection blocked
      setLogLines((prev) => [
        ...prev,
        "CRITICAL_FAILURE: UPLINK TIMEOUT DEGRADATION",
      ]);
      setStatus("error");
    }
  };

  return (
    <section
      id="connect-section"
      className="relative w-full max-w-[1200px] mx-auto px-4 py-16 md:py-24 select-none"
    >
      <div
        className="relative max-w-2xl mx-auto border-2 border-matrix p-6 md:p-12 bg-black/95 glow-border-matrix"
        style={{ borderRadius: "0px" }}
      >
        <div className="absolute top-0 right-4 p-1 bg-[#00ff41]/10 text-[#00ff41] border-l border-b border-matrix/20 font-mono text-[9px]">
          SRC_FEED_SYNC: ACTIVE
        </div>

        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#00ff41] mb-4 glow-text-matrix tracking-widest">
            READY_TO_GLITCH?
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#b9ccb2] max-w-md mx-auto leading-relaxed">
            Connect your terminal to our live feed and participate in the global
            digital decay.
          </p>
        </div>

        <form onSubmit={handleTransmit} className="space-y-6 text-left">
          {/* IDENTIFIER // NAME */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] text-[#00ff41] font-bold tracking-wider uppercase">
              &gt; IDENTIFIER // NAME
            </label>
            <input
              type="text"
              name="name" // Identity tag for Formspree dashboard processing
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "transmitting"}
              placeholder="e.g. VISITOR_ALPHA"
              className="w-full bg-[#1b1b1b] border border-matrix/35 focus:border-[#00ff41] text-white p-3 font-mono text-xs focus:ring-0 focus:outline-none transition-all placeholder:text-[#3b4b37]"
              style={{ borderRadius: "0px" }}
              required
            />
          </div>

          {/* COMMS_ADDR // EMAIL */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] text-[#00ff41] font-bold tracking-wider uppercase">
              &gt; COMMS_ADDR // EMAIL
            </label>
            <input
              type="email"
              name="email" // Identity tag for Formspree dashboard processing
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "transmitting"}
              placeholder="e.g. gateway@glitchbooth.online"
              className="w-full bg-[#1b1b1b] border border-matrix/35 focus:border-[#00ff41] text-white p-3 font-mono text-xs focus:ring-0 focus:outline-none transition-all placeholder:text-[#3b4b37]"
              style={{ borderRadius: "0px" }}
              required
            />
          </div>

          {/* DATA_PAYLOAD // MESSAGE */}
          <div className="space-y-2">
            <label className="block font-mono text-[11px] text-[#00ff41] font-bold tracking-wider uppercase">
              &gt; DATA_PAYLOAD // MESSAGE
            </label>
            <textarea
              rows={4}
              name="message" // Identity tag for Formspree dashboard processing
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={status === "transmitting"}
              placeholder="TERMINAL_INPUT_REQUIRED..."
              className="w-full bg-[#1b1b1b] border border-matrix/35 focus:border-[#00ff41] text-white p-3 font-mono text-xs focus:ring-0 focus:outline-none transition-all placeholder:text-[#3b4b37] resize-none"
              style={{ borderRadius: "0px" }}
              required
            />
          </div>

          {/* Controls & Feedback */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-matrix/10">
            <div className="font-mono text-[10px] text-matrix/80 text-[#84967e] flex-1 max-w-sm">
              <AnimatePresence>
                {status === "transmitting" && (
                  <div className="space-y-1 bg-black p-2 border border-matrix/20">
                    <div className="flex items-center text-xs text-[#00ff41] font-bold mb-1">
                      <Terminal size={12} className="animate-spin mr-1.5" />
                      TRANSMITTING PAYLOAD...
                    </div>
                    {logLines.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px]"
                      >
                        {`>> ${log}`}
                      </motion.div>
                    ))}
                  </div>
                )}

                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-[#00ff41]/10 border border-[#00ff41] text-[#00ff41] flex items-start space-x-2"
                  >
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">TRANSMISSION_SUCCESSFUL</div>
                      <div className="text-[9px] text-[#b9ccb2]">
                        Your transmission hash was catalogued in our local CRT
                        registry buffer.
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-950/20 border border-magenta text-magenta flex items-start space-x-2 animate-pulse"
                  >
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">INPUT_VALIDATION_ERROR</div>
                      <div className="text-[9px] text-magenta">
                        Please check your parameters and retry transmission.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={status === "transmitting"}
              className="sm:ml-auto w-full sm:w-auto px-8 py-3 bg-[#00ff41] text-black hover:bg-black hover:text-[#00ff41] border-2 border-[#00ff41] font-mono font-bold text-xs tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_#00ff41] disabled:opacity-50 cursor-pointer"
              style={{ borderRadius: "0px" }}
            >
              TRANSMIT
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
