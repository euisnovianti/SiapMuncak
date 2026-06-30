import React from 'react';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { vendors } from '../data/vendors';

export default function TopVendors({ onSelectVendor }) {
  return (
    <section id="vendors" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-forest-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1 bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Mitra Terverifikasi
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-forest-950 tracking-tight mb-4">
            Toko Rental Rating Tertinggi
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Kami bermitra dengan vendor peralatan outdoor lokal terbaik untuk menjamin ketersediaan, kebersihan, dan keselamatan peralatan pendakian Anda.
          </p>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {vendors.map((vendor, index) => (
            <div
              key={vendor.id}
              className="bg-brand-bg/40 border border-forest-100/60 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-forest-400 hover:shadow-xl hover:bg-white group flex flex-col justify-between"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div>
                {/* Logo Box */}
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 text-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-forest-600 group-hover:text-white group-hover:rotate-6">
                  {vendor.logo}
                </div>

                {/* Info */}
                <h3 className="font-display font-semibold text-lg text-forest-950 group-hover:text-forest-800 transition-colors">
                  {vendor.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-3 flex items-center gap-1">
                  <span>📍</span> {vendor.city}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {vendor.desc}
                </p>
              </div>

              {/* Rating and Link */}
              <div className="border-t border-forest-100/40 pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-forest-950">{vendor.rating}</span>
                    <span className="text-[10px] text-gray-400">({vendor.reviews})</span>
                  </div>
                  <button 
                    onClick={() => onSelectVendor(vendor.name)}
                    className="text-forest-700 hover:text-forest-900 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-all"
                  >
                    Cari Alat <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
