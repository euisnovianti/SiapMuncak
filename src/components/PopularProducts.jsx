import React, { useState, useMemo } from 'react';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import { Sparkles, Filter, X, ChevronRight, Check } from 'lucide-react';

export default function PopularProducts({ selectedCity, onRentProduct }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['Semua', 'Tenda', 'Carrier', 'Sleeping Bag', 'Kompor', 'Sepatu', 'Penerangan'];

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
      const matchCity = !selectedCity || product.city.toLowerCase() === selectedCity.toLowerCase();
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchCity && matchSearch;
    });
  }, [selectedCategory, selectedCity, searchQuery]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleBookFromModal = (product) => {
    onRentProduct(product);
    setSelectedProduct(null);
  };

  return (
    <section id="catalog" className="py-24 bg-brand-bg relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Katalog Pilihan
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-forest-950 tracking-tight">
              Alat Camping & Hiking Terpopuler
            </h2>
            <p className="text-gray-600 text-sm mt-2 max-w-xl">
              Pilih dari ratusan alat mendaki berkualitas yang siap disewa. Difilter berdasarkan standar keamanan tertinggi.
              {selectedCity && (
                <span className="inline-block bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded ml-2">
                  📍 Kota: {selectedCity}
                </span>
              )}
            </p>
          </div>

          {/* Search Box inside catalog */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama alat / brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-forest-100/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-forest-700 text-white shadow-md shadow-forest-700/10'
                  : 'bg-white border border-forest-100/40 text-forest-900/80 hover:bg-forest-50 hover:text-forest-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRent={onRentProduct}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-forest-200 p-8 max-w-lg mx-auto">
            <span className="text-4xl">🎒</span>
            <h3 className="font-display font-bold text-lg text-forest-950 mt-4">Alat Tidak Ditemukan</h3>
            <p className="text-gray-500 text-sm mt-2">
              Maaf, tidak ada perlengkapan mendaki yang cocok dengan kata kunci atau filter yang Anda pilih saat ini.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="mt-6 bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="h-64 md:h-full relative bg-gray-100 min-h-[300px]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-forest-950 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Specs / Description */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded font-semibold">
                      {selectedProduct.vendor}
                    </span>
                    <span className="text-xs text-gray-400">📍 {selectedProduct.city}</span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl md:text-2xl text-forest-950 mb-3">
                    {selectedProduct.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-forest-950 mt-0.5">{selectedProduct.rating}</span>
                    <span className="text-xs text-gray-400">({selectedProduct.reviews} Ulasan)</span>
                  </div>

                  <h4 className="font-semibold text-sm text-forest-900 mb-2">Deskripsi Produk</h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-6">
                    {selectedProduct.description}
                  </p>

                  <h4 className="font-semibold text-sm text-forest-900 mb-2">Keunggulan Sewa</h4>
                  <ul className="text-xs text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-forest-600 flex-shrink-0" /> Alat dicuci steril & dicek berkala
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-forest-600 flex-shrink-0" /> Pengambilan praktis dengan QR Code
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-forest-600 flex-shrink-0" /> Jaminan uang kembali jika alat rusak
                    </li>
                  </ul>
                </div>

                {/* Footer / Booking CTA */}
                <div className="border-t border-forest-50 pt-6 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Harga Sewa</span>
                    <span className="text-lg md:text-xl font-extrabold text-forest-950">{formatRupiah(selectedProduct.pricePerDay)}<span className="text-xs font-normal text-gray-500">/hari</span></span>
                  </div>
                  <button
                    onClick={() => handleBookFromModal(selectedProduct)}
                    className="bg-amber-500 hover:bg-amber-600 text-forest-950 font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-md shadow-amber-500/10 active:scale-95 text-sm"
                  >
                    Sewa Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
