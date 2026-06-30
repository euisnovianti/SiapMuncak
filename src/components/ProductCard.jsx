import React from 'react';
import { Star, ShieldAlert } from 'lucide-react';

export default function ProductCard({ product, onRent, onSelect }) {
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="bg-white rounded-2xl border border-forest-100/40 shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-forest-200">
      {/* Product Image Wrapper */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-forest-950/80 text-amber-400 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {product.category}
        </span>

        {/* City Tag */}
        <span className="absolute top-3 right-3 bg-white/90 text-forest-950 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-semibold">
          📍 {product.city}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Vendor Info */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-forest-600 font-semibold uppercase tracking-wider">{product.vendor}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-forest-950">{product.rating}</span>
              <span className="text-[9px] text-gray-400">({product.reviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="font-display font-bold text-base text-forest-950 hover:text-forest-700 transition-colors cursor-pointer mb-2 line-clamp-1"
            onClick={() => onSelect(product)}
          >
            {product.name}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Price and CTA */}
        <div className="border-t border-forest-50 pt-4 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="block text-[9px] text-gray-400 uppercase tracking-widest font-bold">Harga Sewa</span>
              <span className="text-sm sm:text-base font-extrabold text-forest-900">{formatRupiah(product.pricePerDay)}<span className="text-[10px] font-medium text-gray-400">/hari</span></span>
            </div>
            <button
              onClick={() => onRent(product)}
              className="bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95"
            >
              Sewa Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
