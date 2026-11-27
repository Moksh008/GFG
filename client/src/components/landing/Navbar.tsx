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
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/hero', targetId: 'hero' },
    { label: 'How it Works', href: '#scene-multiplies', targetId: 'hero' },
    { label: 'Features', href: '#scene-scan', targetId: 'hero' },
    { label: 'Science', href: '#mind-skin', targetId: 'mind-skin' },
    { label: 'About', href: '#meet-solace', targetId: 'meet-solace' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    e.preventDefault();
    setActiveLink(link.label);
    setMobileMenuOpen(false);

    // Update browser history/route to /hero when Home is clicked
    if (link.href === '/hero' || link.targetId === 'hero') {
      window.history.pushState({}, '', '/hero');
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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 transition-all duration-300">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`w-full max-w-6xl mx-auto rounded-full glass-nav flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'py-2 px-5 shadow-lg shadow-[#193653]/5' : 'py-3.5 px-6'
        }`}
      >
        {/* --- LEFT: LOGO & WORDMARK --- */}
        <a
          href="/hero"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/hero');
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
        >
          {/* Droplet Logo */}
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] via-[#60A5FA] to-[#93C5FD] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <svg viewBox="0 0 24 28" className="w-4 h-5 overflow-visible" fill="none">
                <path
                  d="M12 2 C15 7, 21 13, 21 18 C21 23, 17 27, 12 27 C7 27, 3 23, 3 18 C3 13, 9 7, 12 2 Z"
                  fill="#FFFFFF"
                />
                <circle cx="9" cy="16" r="2" fill="#93C5FD" opacity="0.8" />
              </svg>
            </div>
          </div>

          {/* Wordmark */}
          <div className="flex items-baseline space-x-1">
            <span className="font-extrabold text-xl tracking-tight text-[#193653]">
              Dermora
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          </div>
        </a>

        {/* --- CENTRE: NAV PILLS (DESKTOP) --- */}
        <div className="hidden md:flex items-center space-x-1 bg-white/40 p-1 rounded-full border border-white/60">
          {navLinks.map((link) => {
            const isActive = activeLink === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-[#193653] bg-white shadow-xs'
                    : 'text-[#193653]/70 hover:text-[#193653] hover:bg-white/50'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={onLoginClick}
            className="px-4 py-2 text-xs font-semibold text-[#193653] hover:text-[#193653]/80 hover:bg-white/40 rounded-full transition-all cursor-pointer"
          >
            Log in
          </button>

          <button
            onClick={onGetStartedClick}
            className="group relative px-5 py-2 text-xs font-bold text-white bg-[#193653] hover:bg-[#234A70] rounded-full shadow-md glow-navy transition-all duration-200 flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          className="md:hidden p-2 rounded-full text-[#193653] hover:bg-white/50 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 inset-x-4 max-w-sm mx-auto glass-nav rounded-3xl p-5 shadow-2xl border border-white/80 md:hidden z-50 flex flex-col space-y-3"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className="px-4 py-2.5 text-sm font-semibold text-[#193653] hover:bg-white/80 rounded-xl transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-[#193653]/10 flex flex-col space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
                className="w-full py-2.5 text-xs font-semibold text-[#193653] bg-white/60 rounded-xl"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGetStartedClick) onGetStartedClick();
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#193653] rounded-xl shadow-md flex items-center justify-center space-x-1"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
