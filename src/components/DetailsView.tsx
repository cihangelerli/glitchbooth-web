import { useState, useEffect } from "react";
import { Download, Instagram } from "lucide-react";
import { GalleryImage } from "../types";

interface DetailsViewProps {
  image: GalleryImage;
  onBackToArchive: () => void;
  onBackToHome: () => void;
}

// Robust helper to extract readable dates from both epoch timestamps and legacy strings
function parseDynamicTimestamp(id: string): string {
  if (!id) return "UNKNOWN TIMESTAMP";

  // Clean off any appended format suffixes if they bleed in
  const cleanId = id.replace("_color", "");

  // Format 1: Linux Epoch Milliseconds (e.g., 1780303090604)
  if (/^\d+$/.test(cleanId)) {
    const ms = parseInt(cleanId, 10);
    const date = new Date(ms);
    if (!isNaN(date.getTime())) {
      const readable = date
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toUpperCase();
      const time = date.toTimeString().split(" ")[0];
      return `${readable} // ${time} UTC`;
    }
  }

  // Format 2: Legacy YYYYMMDD_HHMMSS strings
  const parts = cleanId.split("_");
  if (parts.length === 2 && parts[0].length === 8 && parts[1].length === 6) {
    const dateStr = parts[0];
    const timeStr = parts[1];

    const year = dateStr.substring(0, 4);
    const monthNum = parseInt(dateStr.substring(4, 6), 10);
    const day = dateStr.substring(6, 8);

    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    const seconds = timeStr.substring(4, 6);

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${months[monthNum - 1]} ${day}, ${year} // ${hours}:${minutes}:${seconds} UTC`;
    }
  }

  return "LIVE_STREAM // NODE_CONNECTED";
}

export default function DetailsView({
  image,
  onBackToArchive,
  onBackToHome,
}: DetailsViewProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [image]);

  // Programmatic Blob download handler to force file downloading instead of opening a new tab
  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = localUrl;
      downloadLink.download = `${image.filename || image.id + ".jpg"}`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      window.URL.revokeObjectURL(localUrl);
    } catch (err) {
      console.error(
        "Forced streaming failed, falling back to standard tab display:",
        err,
      );
      window.open(image.url, "_blank", "noopener,noreferrer");
    }
  };

  const filePathStr = `~\\GLITCH_BOOTH\\CAPTURES\\${image.filename || image.id + ".JPG"}`;

  // Calculate timestamp dynamically based on the current ID
  const dynamicTimestamp = parseDynamicTimestamp(image.id);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 md:px-6 py-8 select-none font-mono text-[#e2e2e2]">
      {/* 1. Gallery Back Link */}
      <div className="mb-8">
        <button
          onClick={onBackToArchive}
          className="inline-flex items-center space-x-2 text-[#00e639] hover:text-white text-xs font-bold tracking-wider transition-colors duration-200 cursor-pointer group bg-transparent border-0"
        >
          <span className="group-hover:-translate-x-1 duration-200 transition-transform">
            &lt;&lt;
          </span>
          <span>~\GALLERY</span>
        </button>
      </div>

      {/* 2. TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3. LEFT COLUMN (The Image Terminal Window) */}
        <div className="lg:col-span-8">
          <div className="border border-[#00e639] bg-[#0c0c0c] flex flex-col relative shadow-[0_0_20px_rgba(0,230,57,0.05)]">
            <div className="bg-[#00e639] text-black px-4 py-2 flex items-center justify-between font-bold text-xs">
              <span className="truncate tracking-wide font-mono">
                {filePathStr}
              </span>
              <div className="flex items-center space-x-1 text-[11px] shrink-0 font-medium">
                <span className="w-3 h-3 border border-black flex items-center justify-center font-bold text-[8px] leading-none">
                  &#10005;
                </span>
                <span className="w-3 h-3 border border-black flex items-center justify-center font-bold text-[8px] leading-none">
                  &#9633;
                </span>
              </div>
            </div>

            {/* Image viewport */}
            <div className="bg-[#080808] p-4 flex items-center justify-center relative min-h-[350px] md:min-h-[500px]">
              {/* All overlay mesh divs removed */}

              <img
                src={image.url}
                alt={`Glitch Capture ${image.id}`}
                referrerPolicy="no-referrer"
                // Cleaned up classes: removed grayscale, contrast distort, and heavy adjustments
                className="w-full max-h-[560px] object-contain border border-[#00e639]/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
              />
            </div>

            <div className="border-t border-[#00e639]/20 bg-black/90 px-4 py-3 flex flex-row items-center justify-between text-xs text-[#00e639] font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2.5 bg-[#00e639] inline-block animate-pulse shrink-0" />
                <span className="font-bold tracking-widest">
                  [ SYS_READY ] IMAGE_LOADED_OK
                </span>
              </div>
              <div className="text-[11px] opacity-90 truncate pl-2">
                FILE: {image.filename || image.id + ".JPG"}
              </div>
            </div>
          </div>
        </div>

        {/* 4. RIGHT COLUMN (The Sidebar Controls) */}
        <div className="lg:col-span-4 space-y-6">
          {/* METADATA BOX */}
          <div className="border border-[#00e639] bg-black/50 p-6 shadow-[0_0_15px_rgba(0,230,57,0.02)]">
            <h2 className="text-[#00e639] font-extrabold text-lg tracking-widest mb-6 flex items-center space-x-1.5">
              <span>&gt; METADATA</span>
            </h2>

            <div className="space-y-4 font-mono">
              <div className="border-b border-[#00e639]/15 pb-3">
                <span className="text-[#84967e] text-[10px] tracking-widest font-bold uppercase block mb-1">
                  CAPTURE_ID
                </span>
                <span className="text-white text-sm font-extrabold font-mono tracking-wider block">
                  ID: {image.id}
                </span>
              </div>

              <div className="border-b border-[#00e639]/15 pb-3">
                <span className="text-[#84967e] text-[10px] tracking-widest font-bold uppercase block mb-1">
                  TIMESTAMP
                </span>
                <span className="text-white text-xs font-semibold font-mono tracking-wider block">
                  {dynamicTimestamp}
                </span>
              </div>

              <div>
                <span className="text-[#84967e] text-[10px] tracking-widest font-bold uppercase block mb-1">
                  ENCODING
                </span>
                <span className="text-white text-xs font-semibold font-mono tracking-wider block">
                  GLITCH_BUFFER_ALPHA_V2
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Button calling handleDownload logic */}
          <button
            onClick={handleDownload}
            className="w-full bg-[#00e339] text-black font-extrabold text-sm tracking-widest py-4 flex items-center justify-center space-x-2 hover:bg-black hover:text-[#00e339] border border-[#00e339] transition-all duration-300 drop-shadow-[0_4px_10px_rgba(0,227,57,0.15)] cursor-pointer group"
            style={{ borderRadius: "0px" }}
          >
            <Download
              size={15}
              className="text-current transition-transform duration-300 group-hover:translate-y-0.5"
              strokeWidth={2.5}
            />
            <span>DOWNLOAD</span>
          </button>

          <div className="space-y-3">
            <a
              href="https://instagram.com/dirtcakestudio"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-[#00e639]/60 text-[#00e639] hover:text-white hover:border-white hover:bg-[#00e639]/5 font-bold text-xs tracking-widest py-3 px-4 flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
              style={{ borderRadius: "0px" }}
            >
              <Instagram size={14} className="text-current" />
              <span>FOLLOW DIRTCAKE</span>
            </a>

            <a
              href="https://instagram.com/glitchbooth.online"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-[#00e639]/60 text-[#00e639] hover:text-white hover:border-white hover:bg-[#00e639]/5 font-bold text-xs tracking-widest py-3 px-4 flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
              style={{ borderRadius: "0px" }}
            >
              <Instagram size={14} className="text-current" />
              <span>FOLLOW GLITCHBOOTH</span>
            </a>
          </div>

          <div className="bg-[#141414] border border-[#00e639]/15 p-4">
            <span className="text-[#84967e] text-[9px] font-bold tracking-widest uppercase block mb-3 font-mono">
              SYSLOG_FEED:
            </span>
            <div className="space-y-1.5 font-mono text-[10px] text-[#00e639]/80 leading-relaxed">
              <div>[10.1.2] INCOMING_CONNECTION: SUCCESS</div>
              <div>[10.1.2] PARSING_METADATA...</div>
              <div>[10.1.3] APPLY_SCANLINE_OVERLAY: 100%</div>
              <div className="animate-pulse">
                [10.1.4] CACHE_WARM_UP: IMAGEKIT_CDN
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t border-[#00e639]/10 flex flex-wrap items-center justify-between text-[10px] text-[#84967e]">
        <span>LAST_RE-MUTATION: {dynamicTimestamp}</span>
        <span>LOCATION: SERVER_PI_MATRIX_NODE_5</span>
      </div>
    </div>
  );
}
