import React, { useState } from 'react';
import { Tent, Mail, Phone, MapPin, MessageSquare, Send, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
    }, 2000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-forest-950 text-gray-300 pt-16 pb-8 border-t border-forest-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-forest-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              <Tent className="w-8 h-8 text-amber-500" />
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                Siap<span className="text-amber-500">Muncak</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Siap Muncak adalah platform marketplace sewa alat camping dan mendaki gunung terlengkap di Indonesia. Bermitra dengan toko-toko terpercaya untuk memastikan keselamatan petualangan Anda.
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <a href="tel:021123456" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-amber-500" /> (021) 123-4567
              </a>
              <a href="mailto:info@siapmuncak.com" className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-amber-500" /> info@siapmuncak.com
              </a>
              <div className="flex items-start gap-2.5 text-gray-400">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Kec. Coblong, Kota Bandung, Jawa Barat 40135</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 text-left">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-5">Tautan Cepat</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <button onClick={() => scrollToSection('home')} className="hover:text-amber-400 transition-colors">Beranda</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('vendors')} className="hover:text-amber-400 transition-colors">Toko Teratas</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Katalog Alat</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-amber-400 transition-colors">Cara Kerja</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('testimonials')} className="hover:text-amber-400 transition-colors">Testimoni</button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 text-left">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-5">Kategori Alat</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li><button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Tenda Dome</button></li>
              <li><button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Tas Carrier</button></li>
              <li><button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Sleeping Bag</button></li>
              <li><button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Kompor Portable</button></li>
              <li><button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Sepatu Hiking</button></li>
              <li><button onClick={() => scrollToSection('catalog')} className="hover:text-amber-400 transition-colors">Headlamp</button></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="lg:col-span-4 text-left">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-5">Langganan Promo</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
              Dapatkan voucher diskon sewa alat pertama sebesar 15% serta info tips mendaki gunung paling update.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subscribed) setSubscribed(false);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500 transition-colors text-white"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-forest-950 px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center flex-shrink-0"
                aria-label="Subscribe"
              >
                {subscribed ? <Check className="w-4 h-4 text-forest-950" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            {subscribed && (
              <span className="text-[10px] text-amber-400 font-semibold mt-2 block animate-fade-in-up">
                Terima kasih! Email Anda telah terdaftar.
              </span>
            )}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-gray-500">
          <div>
            <p>© {new Date().getFullYear()} Siap Muncak. Semua Hak Cipta Dilindungi.</p>
          </div>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-forest-950 hover:scale-105 transition-all text-gray-400" aria-label="Instagram">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-forest-950 hover:scale-105 transition-all text-gray-400" aria-label="Twitter">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://wa.me" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-forest-950 hover:scale-105 transition-all text-gray-400" aria-label="WhatsApp">
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
