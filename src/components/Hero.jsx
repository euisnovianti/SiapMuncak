import React, { useState } from 'react';
import { Search, MapPin, Calendar, Compass } from 'lucide-react';

export default function Hero({ onSearch }) {
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ city, date });
    }
    // Scroll to catalog section
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = catalogSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image with Dark Forest Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-brand-bg z-0" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in-down">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> #1 Portal Rental Outdoor Indonesia
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white max-w-4xl tracking-tight leading-tight mb-6 animate-fade-in-up">
          Petualangan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Dimulai dari Sini</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
          Sewa alat camping & hiking premium dari toko-toko terpercaya di sekitarmu. Cepat, mudah, dan pastinya <span className="text-white font-semibold">#SiapMuncak!</span>
        </p>

        {/* Search Bar - Glassmorphism */}
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-4xl glass-dark p-4 md:p-6 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-4 items-center mb-16 animate-fade-in-up [animation-delay:400ms]"
        >
          {/* City Selection */}
          <div className="w-full flex items-center gap-3 px-4 py-2 border-b border-white/10 md:border-b-0 md:border-r md:border-white/10">
            <MapPin className="text-amber-500 w-5 h-5 flex-shrink-0" />
            <div className="w-full text-left">
              <label htmlFor="city-select" className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lokasi Kota</label>
              <select
                id="city-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none text-sm font-semibold appearance-none cursor-pointer"
              >
                <option value="" className="bg-forest-950 text-white">Semua Kota</option>
                <option value="Bandung" className="bg-forest-950 text-white">Bandung</option>
                <option value="Bogor" className="bg-forest-950 text-white">Bogor</option>
                <option value="Malang" className="bg-forest-950 text-white">Malang</option>
                <option value="Yogyakarta" className="bg-forest-950 text-white">Yogyakarta</option>
                <option value="Surabaya" className="bg-forest-950 text-white">Surabaya</option>
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="w-full flex items-center gap-3 px-4 py-2 border-b border-white/10 md:border-b-0 md:border-r md:border-white/10">
            <Calendar className="text-amber-500 w-5 h-5 flex-shrink-0" />
            <div className="w-full text-left">
              <label htmlFor="date-select" className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mulai Sewa</label>
              <input
                id="date-select"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-white focus:outline-none text-sm font-semibold cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-forest-950 font-bold px-8 py-3.5 rounded-xl md:rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-300 flex-shrink-0"
          >
            <Search className="w-5 h-5" /> Cari Alat
          </button>
        </form>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 md:gap-16 border-t border-white/10 pt-8 w-full max-w-3xl animate-fade-in-up [animation-delay:600ms]">
          <div className="text-center">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-400">500+</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">Alat Ready</div>
          </div>
          <div className="text-center">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">50+</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">Kota Layanan</div>
          </div>
          <div className="text-center">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">10K+</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">Penyewa Puas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
