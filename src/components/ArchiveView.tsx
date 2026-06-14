import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  RefreshCw,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { GalleryImage } from "../types";

interface ArchiveViewProps {
  images: GalleryImage[];
  onImageSelect: (img: GalleryImage) => void;
  onBackToHome: () => void;
  onRandomize: () => void;
}

export default function ArchiveView({
  images,
  onImageSelect,
  onBackToHome,
  onRandomize,
}: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "filename">(
    "latest",
  );

  // Cross-Browser Bulletproof Millisecond Parser (Fixes Safari/iOS NaN sorting error)
  const getSafeTime = (img: GalleryImage): number => {
    const rawDate = img.timestamp || (img as any).date;
    if (!rawDate) return 0;

    // If already a Unix millisecond number
    if (typeof rawDate === "number") return rawDate;

    let dateStr = String(rawDate).trim();

    // Convert "YYYY-MM-DD HH:MM:SS" to standard ISO compliance "YYYY-MM-DDTHH:MM:SS"
    if (dateStr.includes(" ") && !dateStr.includes("T")) {
      dateStr = dateStr.replace(" ", "T");
    }

    const parsed = new Date(dateStr).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. Core Filter Engine
  const filteredImages = images.filter((img) => {
    const title = img.title || "";
    const filename = img.filename || (img as any).name || "";
    const shutter = img.shutter || "1/60s";
    const iso = img.iso || "ISO 400";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shutter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iso.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Temporal Filter Computations
    if (dateFilter === "all") return true;

    const imgTime = getSafeTime(img);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    if (dateFilter === "today") {
      return imgTime >= today.getTime();
    }
    if (dateFilter === "week") {
      return imgTime >= oneWeekAgo.getTime();
    }

    return true;
  });

  // 2. Core Sorting Engine (Enforces Clean Sequential Order regardless of input state)
  const sortedAndFilteredImages = [...filteredImages].sort((a, b) => {
    const timeA = getSafeTime(a);
    const timeB = getSafeTime(b);

    if (sortBy === "latest") return timeB - timeA; // High numbers (Newer dates) first
    if (sortBy === "oldest") return timeA - timeB; // Low numbers (Older dates) first
    if (sortBy === "filename") {
      return (a.filename || "").localeCompare(b.filename || "");
    }
    return 0;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 select-none">
      {/* Dynamic Navigation Path & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-matrix/20 pb-6">
        <div className="space-y-1">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-1.5 font-mono text-xs text-[#84967e] hover:text-[#00ff41] transition-colors cursor-pointer group"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>[ RETURN_TO_TERMINAL ]</span>
          </button>

          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#00ff41] flex items-center space-x-2">
            <span className="glow-text-matrix">~/GLITCH_BOOTH/ARCHIVE</span>
            <span className="text-[10px] bg-matrix/10 border border-matrix/20 text-[#00ff41] font-mono px-2 py-0.5 ml-2">
              {sortedAndFilteredImages.length} CAPTURES
            </span>
          </h1>
        </div>

        {/* Dynamic ImageKit shuffle command */}
        <button
          onClick={onRandomize}
          className="font-mono text-xs border border-[#00ff41] px-5 py-2 hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_12px_#00ff41] transition-all bg-transparent flex items-center space-x-2 font-bold cursor-pointer"
          style={{ borderRadius: "0px" }}
        >
          <RefreshCw size={13} />
          <span>RE-SEED_IMAGE_LOADER</span>
        </button>
      </div>

      {/* Brutalist Filters Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 font-mono text-xs">
        {/* Search Input Box */}
        <div className="lg:col-span-4 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3b4b37]">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SCAN DB: SEARCH RECORD FIELDS..."
            className="w-full pl-10 pr-4 py-3 bg-black border border-matrix/30 text-white text-xs focus:border-[#00ff41] focus:ring-0 focus:outline-none placeholder:text-[#3b4b37]"
            style={{ borderRadius: "0px" }}
          />
        </div>

        {/* Date Filters Control Block */}
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          <div className="text-[10px] text-[#84967e] flex items-center space-x-1.5 mr-1 shrink-0">
            <Clock size={12} />
            <span>TIMELINE:</span>
          </div>
          {[
            { label: "ALL_TIME", value: "all" },
            { label: "TODAY", value: "today" },
            { label: "7_DAYS_EXP", value: "week" },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => setDateFilter(btn.value as any)}
              className={`px-3 py-1.5 border text-[10px] font-bold transition-all cursor-pointer ${
                dateFilter === btn.value
                  ? "bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                  : "bg-black text-[#84967e] border-matrix/20 hover:border-matrix/50 hover:text-[#00ff41]"
              }`}
              style={{ borderRadius: "0px" }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Sort Controls Block */}
        <div className="lg:col-span-3 flex flex-wrap items-center lg:justify-end gap-2">
          <div className="text-[10px] text-[#84967e] flex items-center space-x-1.5 mr-1 shrink-0">
            <ArrowUpDown size={12} />
            <span>SORT:</span>
          </div>
          {[
            { label: "LATEST", value: "latest" },
            { label: "OLDEST", value: "oldest" },
            { label: "TAG_ID", value: "filename" },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => setSortBy(btn.value as any)}
              className={`px-3 py-1.5 border text-[10px] font-bold transition-all cursor-pointer ${
                sortBy === btn.value
                  ? "bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                  : "bg-black text-[#84967e] border-matrix/20 hover:border-matrix/50 hover:text-[#00ff41]"
              }`}
              style={{ borderRadius: "0px" }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display Grid System */}
      {sortedAndFilteredImages.length === 0 ? (
        <div className="border-2 border-dashed border-[#3b4b37]/40 py-24 text-center font-mono space-y-4">
          <div className="text-[#84967e] text-sm font-bold animate-pulse uppercase">
            [ SCAN_FAULT: NO DATA REGISTRY SIGNALS RETURNED ]
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setDateFilter("all");
              setSortBy("latest");
            }}
            className="text-xs text-[#00ff41] underline cursor-pointer"
          >
            RESET_DATABASE_FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedAndFilteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => onImageSelect(img)}
              className="group relative border border-[#3b4b37] hover:border-[#00ff41] bg-[#0c0c0c] flex flex-col p-2.5 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
              style={{ borderRadius: "0px" }}
            >
              {/* Outer corner marks */}
              <span className="absolute top-0 left-0 w-1 h-3 bg-[#0a0] opacity-30 group-hover:opacity-100" />
              <span className="absolute top-0 left-0 w-3 h-1 bg-[#0a0] opacity-30 group-hover:opacity-100" />
              <span className="absolute bottom-0 right-0 w-1 h-3 bg-[#0a0] opacity-30 group-hover:opacity-100" />
              <span className="absolute bottom-0 right-0 w-3 h-1 bg-[#0a0] opacity-30 group-hover:opacity-100" />

              {/* CRT Phosphor Screen overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,255,65,0.04)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />

              {/* Dynamic Image Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-black border border-matrix/10">
                <img
                  src={img.url}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Glitch Overlay Indicator */}
                <span className="absolute top-2 left-2 bg-black/80 text-matrix border border-matrix/20 px-1 py-0.5 font-mono text-[8px] z-10">
                  {img.filename}
                </span>
              </div>

              {/* Photo Meta and Specs */}
              <div className="mt-3 font-mono text-[10px] space-y-1 pt-2.5 border-t border-matrix/10">
                <div className="flex justify-between items-center">
                  <span className="text-[#84967e] font-bold uppercase truncate max-w-[130px]">
                    {img.title}
                  </span>
                  <span className="text-cyber text-[9px]">{img.shutter}</span>
                </div>
                <div className="flex justify-between text-[#84967e] text-[9px]">
                  <span>
                    {
                      (
                        img.timestamp ||
                        (img as any).date ||
                        "2026-06-04"
                      ).split(" ")[0]
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
