import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/mockData';
import { Search, MapPin, Star, SlidersHorizontal, RefreshCcw, Eye } from 'lucide-react';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipments, setEquipments] = useState([]);
  const [stores, setStores] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCity, setSelectedCity] = useState(searchParams.get('kota') || 'bandung');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [startDate, setStartDate] = useState(searchParams.get('dari') || '');
  const [endDate, setEndDate] = useState(searchParams.get('sampai') || '');

  // Sync URL changes with state
  useEffect(() => {
    const kota = searchParams.get('kota');
    if (kota) setSelectedCity(kota.toLowerCase());
    const dari = searchParams.get('dari');
    if (dari) setStartDate(dari);
    const sampai = searchParams.get('sampai');
    if (sampai) setEndDate(sampai);
  }, [searchParams]);

  // Load stores and equipment
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all verified stores
        const { data: storeList } = await supabase
          .from('stores')
          .select('*')
          .eq('is_verified', true);

        const storeMap = {};
        if (storeList) {
          storeList.forEach((store) => {
            storeMap[store.id] = store;
          });
        }
        setStores(storeMap);

        // Fetch equipment
        const { data: eqList } = await supabase
          .from('equipment')
          .select('*');
        
        setEquipments(eqList || []);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(150000);
    const defaults = {
      kota: selectedCity,
      dari: startDate,
      sampai: endDate
    };
    setSearchParams(defaults);
  };

  // Perform client-side filtration based on live state
  const filteredEquipments = equipments.filter((eq) => {
    const store = stores[eq.store_id];
    if (!store) return false;

    // Filter by city
    if (selectedCity && store.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }

    // Filter by price
    if (eq.price_per_day > maxPrice) {
      return false;
    }

    // Filter by category
    if (selectedCategories.length > 0 && !selectedCategories.includes(eq.category)) {
      return false;
    }

    return true;
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Update query params in URL
  const handleCityChange = (e) => {
    const cityVal = e.target.value;
    setSelectedCity(cityVal);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('kota', cityVal);
    setSearchParams(newParams);
  };

  return (
    <div className="catalog-wrapper container main-content">
      <div className="catalog-header">
        <div>
          <h2>Katalog Alat Hiking</h2>
          <p className="text-muted">
            Menampilkan alat outdoor terbaik di kota {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
          </p>
        </div>
        
        <div className="search-params-bar glass-card">
          <div className="param-item">
            <MapPin size={16} className="text-primary" />
            <select value={selectedCity} onChange={handleCityChange} className="param-select">
              <option value="bandung">Bandung</option>
              <option value="garut">Garut</option>
            </select>
          </div>
          {startDate && endDate && (
            <div className="param-dates">
              <span className="date-badge">{startDate}</span>
              <span className="text-muted">sampai</span>
              <span className="date-badge">{endDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="catalog-layout mt-6">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar glass-card">
          <div className="filter-section-header">
            <h3><SlidersHorizontal size={18} /> Filter</h3>
            <button onClick={handleResetFilters} className="btn-reset">
              <RefreshCcw size={14} /> Reset
            </button>
          </div>

          <div className="filter-divider"></div>

          {/* Slider Harga */}
          <div className="filter-group">
            <label className="form-label flex justify-between">
              <span>Harga Maksimal</span>
              <span className="text-primary font-bold">{formatRupiah(maxPrice)}</span>
            </label>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-slider"
            />
            <div className="slider-limits">
              <span>Rp 5rb</span>
              <span>Rp 150rb</span>
            </div>
          </div>

          <div className="filter-divider"></div>

          {/* Checkboxes Kategori */}
          <div className="filter-group">
            <label className="form-label">Kategori Alat</label>
            <div className="checkbox-list">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="product-grid-container">
          {loading ? (
            <div className="catalog-loader">
              <div className="loader"></div>
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="empty-catalog glass-card">
              <Search size={48} className="text-muted" />
              <h3>Alat Tidak Ditemukan</h3>
              <p className="text-muted mt-2">
                Tidak ada perlengkapan hiking yang sesuai dengan filter Anda. Coba reset filter atau ubah pilihan kota.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary mt-4">
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredEquipments.map((eq) => {
                const store = stores[eq.store_id];
                const searchQ = `?kota=${selectedCity}&dari=${startDate}&sampai=${endDate}`;
                return (
                  <div key={eq.id} className="product-card glass-card glass-card-hover">
                    <div className="product-img-wrapper">
                      <img src={eq.images?.[0] || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80'} alt={eq.name} />
                      <span className="product-category-badge badge badge-orange">
                        {eq.category}
                      </span>
                    </div>

                    <div className="product-info">
                      <div className="product-store-city">
                        <MapPin size={12} />
                        <span>{store?.name} ({store?.city})</span>
                      </div>
                      
                      <h3 className="product-title">{eq.name}</h3>

                      <div className="product-meta mt-2">
                        <div className="product-rating">
                          <Star size={14} className="star-icon" fill="currentColor" />
                          <span>{eq.rating || '4.5'} ({eq.reviews_count || 0})</span>
                        </div>
                        <div className="product-stock text-muted">
                          Stok: <span className={eq.stok_tersedia > 0 ? 'text-success font-bold' : 'text-danger'}>
                            {eq.stok_tersedia > 0 ? `${eq.stok_tersedia} pcs` : 'Habis'}
                          </span>
                        </div>
                      </div>

                      <div className="product-footer mt-4">
                        <div className="product-price">
                          <span className="price-num">{formatRupiah(eq.price_per_day)}</span>
                          <span className="price-unit">/hari</span>
                        </div>
                        <Link to={`/catalog/${eq.id}${searchQ}`} className="btn btn-primary btn-sm btn-detail">
                          <Eye size={14} />
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .search-params-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 20px;
        }

        .param-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .param-select {
          background: transparent;
          border: none;
          color: #fff;
          font-weight: 700;
          font-family: var(--font-heading);
          font-size: 1rem;
          cursor: pointer;
          outline: none;
        }

        .param-select option {
          background-color: var(--color-bg-dark);
          color: #fff;
        }

        .param-dates {
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 1px solid var(--color-border);
          padding-left: 16px;
          font-size: 0.85rem;
        }

        .date-badge {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        /* Layout Grid */
        .catalog-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .filters-sidebar {
          width: 280px;
          position: sticky;
          top: 90px;
          flex-shrink: 0;
        }

        .filter-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .filter-section-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
        }

        .btn-reset {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-family: var(--font-sans);
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-reset:hover {
          color: var(--color-primary);
        }

        .filter-divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 16px 0;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          margin-top: 8px;
        }

        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          box-shadow: 0 0 6px rgba(255, 107, 53, 0.5);
          transition: transform 0.1s ease;
        }
        .price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider-limits {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Product grid */
        .product-grid-container {
          flex: 1;
        }

        .catalog-loader {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 0;
        }

        .empty-catalog {
          text-align: center;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Product Card */
        .product-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .product-img-wrapper {
          position: relative;
          width: 100%;
          padding-top: 65%; /* aspect ratio 16:10 */
          background-color: rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .product-img-wrapper img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-img-wrapper img {
          transform: scale(1.08);
        }

        .product-category-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
        }

        .product-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .product-store-city {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .product-title {
          font-size: 1.1rem;
          color: #fff;
          margin-top: 8px;
          line-height: 1.3;
          flex-grow: 1;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-warning);
          font-weight: 600;
        }

        .star-icon {
          color: var(--color-warning);
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--color-border);
          padding-top: 16px;
        }

        .product-price {
          display: flex;
          flex-direction: column;
        }

        .price-num {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-primary);
          line-height: 1;
        }

        .price-unit {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .btn-detail {
          padding: 8px 12px !important;
          font-size: 0.85rem !important;
        }

        @media (max-width: 992px) {
          .catalog-layout {
            flex-direction: column;
          }
          .filters-sidebar {
            width: 100%;
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
