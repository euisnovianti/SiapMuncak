import React, { useState, useEffect } from 'react';
import { Tent, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine active section
      const sections = ['home', 'vendors', 'catalog', 'how-it-works', 'booking', 'testimonials'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // offset for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Beranda', id: 'home' },
    { name: 'Toko Teratas', id: 'vendors' },
    { name: 'Katalog Alat', id: 'catalog' },
    { name: 'Cara Kerja', id: 'how-it-works' },
    { name: 'Sewa Sekarang', id: 'booking' },
    { name: 'Testimoni', id: 'testimonials' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              <Tent className="w-8 h-8 text-forest-600 animate-float" />
              <span className="font-display font-bold text-2xl tracking-tight text-forest-800">
                Siap<span className="text-amber-500">Muncak</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`font-medium transition-colors relative py-1 text-sm ${
                    activeSection === link.id ? 'text-forest-600 font-semibold' : 'text-forest-900/80 hover:text-forest-600'
                  }`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full animate-slide-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop Right CTA */}
            <div className="hidden md:flex items-center gap-4">
              <button className="text-forest-800 hover:text-forest-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                <User className="w-4 h-4" /> Masuk
              </button>
              <button className="bg-amber-500 hover:bg-amber-600 text-forest-950 font-semibold px-5 py-2.5 rounded-full text-sm shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-pulse-glow">
                Buka Toko
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-forest-800 hover:text-forest-600 p-2 transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-in Menu */}
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-forest-950 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl p-6 flex flex-col justify-between md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Tent className="w-6 h-6 text-amber-500" />
                <span className="font-display font-bold text-lg">SiapMuncak</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-left font-medium py-1 transition-colors ${
                    activeSection === link.id ? 'text-amber-400 font-semibold pl-2 border-l-2 border-amber-500' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <button className="text-gray-300 hover:text-white font-medium py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-1.5 transition-colors">
              <User className="w-4 h-4" /> Masuk
            </button>
            <button className="bg-amber-500 hover:bg-amber-600 text-forest-950 font-semibold py-2.5 rounded-lg text-center transition-transform hover:scale-[1.02]">
              Buka Toko
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </nav>
    </>
  );
}
