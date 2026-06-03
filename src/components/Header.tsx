import { useState } from 'react';
import { Menu, X, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentView: 'home' | 'archive' | 'details';
  setView: (v: 'home' | 'archive' | 'details') => void;
}

export default function Header({ currentView, setView }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'GALLERY', target: 'archive' },
    { label: 'ABOUT', target: 'about-section' },
    { label: 'CONNECT', target: 'connect-section' },
  ];

  const handleNavClick = (target: string) => {
    setIsOpen(false);
    if (target === 'archive') {
      setView('archive');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // It's a landing page section scroll
      if (currentView !== 'home') {
        setView('home');
        setTimeout(() => {
          const element = document.getElementById(target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      } else {
        const element = document.getElementById(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const handleLogoClick = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131313]/90 backdrop-blur-md border-b border-matrix/20 pr-4 md:px-8 py-4 select-none">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center space-x-2 cursor-pointer group"
          id="brand-logo"
        >
          <span className="text-[#00ff41] font-display text-lg font-bold tracking-tight glow-text-matrix">
            &gt; GLITCH_BOOTH
          </span>
          <span className="w-2.5 h-4.5 bg-[#00ff41] animate-[pulse_1s_infinite] inline-block opacity-80" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-12">
          {navItems.map((item) => {
            const isActive = (item.target === 'archive' && currentView === 'archive');
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.target)}
                className={`text-xs font-mono tracking-[0.15em] transition-all duration-300 relative py-1 group cursor-pointer ${
                  isActive ? 'text-[#00ff41] shadow-sm' : 'text-[#b9ccb2] hover:text-[#00ff41]'
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 h-[1.5px] bg-[#00ff41] transition-all duration-300 ${
                  isActive ? 'w-full shadow-[0_0_8px_#00ff41]' : 'w-0 group-hover:w-full group-hover:shadow-[0_0_8px_#00ff41]'
                }`} />
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-matrix/20 text-[#00ff41] hover:text-black hover:bg-[#00ff41] hover:shadow-[0_0_12px_rgba(0,255,65,0.4)] transition-all duration-300 flex items-center justify-center cursor-pointer"
            style={{ borderRadius: '0px' }}
            title="Instagram"
          >
            <Instagram size={16} />
          </a>
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center space-x-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-matrix/20 text-[#00ff41] flex items-center justify-center"
            style={{ borderRadius: '0px' }}
          >
            <Instagram size={15} />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 border border-matrix/20 text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors cursor-pointer"
            style={{ borderRadius: '0px' }}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Collapsible) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-[#0e0e0e] border-b border-matrix/30 mt-4 overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-6 font-mono text-sm">
              {navItems.map((item, index) => (
                <motion.button
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  key={item.label}
                  onClick={() => handleNavClick(item.target)}
                  className="text-left py-2 border-b border-matrix/5 text-[#b9ccb2] hover:text-[#00ff41] hover:pl-2 transition-all duration-300 flex items-center"
                >
                  <span className="text-[#00ff41] mr-2">&gt;</span>
                  {item.label}
                </motion.button>
              ))}
              <div className="pt-2 text-[10px] text-matrix/40 tracking-wider">
                CORE_REVISION_V1.02_LOADED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
