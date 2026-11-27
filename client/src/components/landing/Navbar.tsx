import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onGetStartedClick?: () => void;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGetStartedClick,
  onLoginClick,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/', targetId: 'hero' },
    { label: 'Progression', href: '#scene-multiplies', targetId: 'hero' },
    { label: 'Vision scanner', href: '#scene-scan', targetId: 'hero' },
    { label: 'Clinical correlation', href: '#mind-skin', targetId: 'mind-skin' },
    { label: 'Solace dialogue', href: '#meet-solace', targetId: 'meet-solace' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    e.preventDefault();
    setActiveLink(link.label);
    setMobileMenuOpen(false);

    if (link.href === '/' || link.targetId === 'hero') {
      window.history.pushState({}, '', '/');
      const target = document.getElementById('hero');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const target = document.getElementById(link.targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-all duration-200">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full max-w-6xl mx-auto rounded-xl glass-nav flex items-center justify-between transition-all duration-200 ${
          scrolled ? 'py-2 px-5' : 'py-3 px-6'
        }`}
      >
        {/* --- LEFT: LOGO & WORDMARK --- */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/');
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center space-x-2.5 focus:outline-none"
        >
          {/* Flat Monochromatic Droplet Glyph */}
          <div className="w-7 h-7 rounded-lg bg-[#193653] flex items-center justify-center text-white">
            <svg viewBox="0 0 24 28" className="w-3.5 h-4 overflow-visible" fill="none">
              <path
                d="M12 3 C14.5 7.5, 20 13, 20 18 C20 22.4, 16.4 26, 12 26 C7.6 26, 4 22.4, 4 18 C4 13, 9.5 7.5, 12 3 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-base tracking-tight text-[#193653]">
              Dermora
            </span>
            <span className="text-[10px] font-mono font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
              Clinical
            </span>
          </div>
        </a>

        {/* --- CENTRE: QUIET NAV LINKS (DESKTOP) --- */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'text-[#193653] font-medium bg-slate-100/80'
                    : 'text-[#193653]/70 hover:text-[#193653] hover:bg-slate-100/40'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={onLoginClick}
            className="px-3.5 py-2 text-xs font-medium text-[#193653] hover:bg-slate-100/60 rounded-lg transition-colors cursor-pointer"
          >
            Log in
          </button>

          <button
            onClick={onGetStartedClick}
            className="px-4 py-2 text-xs font-medium text-white bg-[#193653] hover:bg-[#234A70] rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Start scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          className="md:hidden p-1.5 rounded-lg text-[#193653] hover:bg-slate-100/60 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-16 inset-x-4 max-w-sm mx-auto glass-nav rounded-xl p-4 border border-slate-200/80 md:hidden z-50 flex flex-col space-y-3"
          >
            <div className="flex flex-col space-y-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className="px-3 py-2 text-xs font-medium text-[#193653] hover:bg-slate-100/80 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex flex-col space-y-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
                className="w-full py-2 text-xs font-medium text-[#193653] bg-slate-50 hover:bg-slate-100 rounded-lg text-center"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGetStartedClick) onGetStartedClick();
                }}
                className="w-full py-2 text-xs font-medium text-white bg-[#193653] hover:bg-[#234A70] rounded-lg shadow-sm flex items-center justify-center space-x-1"
              >
                <span>Start scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
