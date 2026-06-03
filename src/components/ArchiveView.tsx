import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowLeft, RefreshCw, Grid, FileImage } from 'lucide-react';
import { GalleryImage } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGlitch, setFilterGlitch] = useState<number | null>(null);

  // Filter images based on search query and glitch levels
  const filteredImages = images.filter((img) => {
    const matchesSearch = 
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.shutter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.iso.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterGlitch === null) return matchesSearch;
    if (filterGlitch === 80) return matchesSearch && img.glitchLevel >= 80;
    if (filterGlitch === 50) return matchesSearch && img.glitchLevel >= 50 && img.glitchLevel < 80;
    return matchesSearch && img.glitchLevel < 50;
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
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            <span>[ RETURN_TO_TERMINAL ]</span>
          </button>
          
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#00ff41] flex items-center space-x-2">
            <span className="glow-text-matrix">/GLITCH_BOOTH/ARCHIVE</span>
            <span className="text-[10px] bg-matrix/10 border border-matrix/20 text-[#00ff41] font-mono px-2 py-0.5 ml-2">
              {filteredImages.length} ATOMS
            </span>
          </h1>
        </div>

        {/* Dynamic ImageKit shuffle command */}
        <button
          onClick={onRandomize}
          className="font-mono text-xs border border-[#00ff41] px-5 py-2 hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_12px_#00ff41] transition-all bg-transparent flex items-center space-x-2 font-bold cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          <RefreshCw size={13} />
          <span>RE-SEED_IMAGEKIT_LOADER</span>
        </button>
      </div>

      {/* Database Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        
        {/* Search Panel */}
        <div className="md:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#3b4b37]">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SCAN DB: SEARCH BY FILENAME, TITLE OR SHUTTER..."
            className="w-full pl-10 pr-4 py-3 bg-black border border-matrix/30 text-white font-mono text-xs focus:border-[#00ff41] focus:ring-0 focus:outline-none placeholder:text-[#3b4b37]"
            style={{ borderRadius: '0px' }}
          />
        </div>

        {/* Filter buttons block */}
        <div className="md:col-span-6 flex flex-wrap items-center md:justify-end gap-2 text-xs font-mono">
          <div className="text-[10px] text-[#84967e] flex items-center space-x-1.5 mr-2">
            <SlidersHorizontal size={12} />
            <span>GLITCH_FILTER:</span>
          </div>

          {[
            { label: 'ALL_CHANNELS', value: null },
            { label: 'HIGH_DECAY (>=80%)', value: 80 },
            { label: 'MED_DECAY (50-79%)', value: 50 },
            { label: 'LOW_DECAY (<50%)', value: 30 },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => setFilterGlitch(btn.value)}
              className={`px-3 py-1.5 border text-[10px] font-bold transition-all cursor-pointer ${
                filterGlitch === btn.value
                  ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.3)]'
                  : 'bg-black text-[#84967e] border-matrix/20 hover:border-matrix/50 hover:text-[#00ff41]'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of pictures with high-contrast color restoration effect upon hover */}
      {filteredImages.length === 0 ? (
        <div className="border-2 border-dashed border-[#3b4b37]/40 py-24 text-center font-mono space-y-4">
          <div className="text-[#84967e] text-sm font-bold animate-pulse uppercase">
            [ SCAN_FAULT: NO DATA DECAY SIGNALS CAPTURED ]
          </div>
          <button
            onClick={() => { setSearchQuery(''); setFilterGlitch(null); }}
            className="text-xs text-[#00ff41] underline cursor-pointer"
          >
            RESET_DATABASE_FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => onImageSelect(img)}
              className="group relative border border-[#3b4b37] hover:border-[#00ff41] bg-[#0c0c0c] flex flex-col p-2.5 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
              style={{ borderRadius: '0px' }}
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
                  className="w-full h-full object-cover transition-all duration-500 grayscale contrast-[1.95] group-hover:grayscale-0 group-hover:contrast-125"
                />

                {/* Glitch Overlay Indicator */}
                <span className="absolute top-2 left-2 bg-black/80 text-matrix border border-matrix/20 px-1 py-0.5 font-mono text-[8px] z-10">
                  {img.filename}
                </span>

                <span className="absolute bottom-2 right-2 bg-black/80 text-magenta border border-magenta/20 px-1.5 py-0.5 font-mono text-[8px] tracking-wide z-10 font-bold">
                  DECAY: {img.glitchLevel}%
                </span>
              </div>

              {/* Photo Meta and Specs */}
              <div className="mt-3 font-mono text-[10px] space-y-1 pt-2.5 border-t border-matrix/10">
                <div className="flex justify-between items-center">
                  <span className="text-[#84967e] font-bold uppercase truncate max-w-[130px]">{img.title}</span>
                  <span className="text-cyber text-[9px]">{img.shutter}</span>
                </div>
                <div className="flex justify-between text-[#84967e] text-[9px]">
                  <span>{img.iso}</span>
                  <span>{img.timestamp.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
