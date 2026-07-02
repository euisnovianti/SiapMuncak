import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Star, Calendar, Shield, Truck, Package, MessageSquare, AlertCircle } from 'lucide-react';

export default function Detail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery main photo selection
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking form states
  const [startDate, setStartDate] = useState(searchParams.get('dari') || '');
  const [endDate, setEndDate] = useState(searchParams.get('sampai') || '');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load equipment, store, reviews
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: eq } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', id)
          .single();

        if (eq) {
          setEquipment(eq);

          // Fetch store details
          const { data: st } = await supabase
            .from('stores')
            .select('*')
            .eq('id', eq.store_id)
            .single();
          setStore(st);

          // Fetch reviews
          const { data: revs } = await supabase
            .from('reviews')
            .select('*')
            .eq('equipment_id', eq.id);

          // Join profile details for reviews
          if (revs && revs.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name');
            const profMap = {};
            if (profiles) {
              profiles.forEach((p) => {
                profMap[p.id] = p.full_name;
              });
            }
            const revsWithNames = revs.map((r) => ({
              ...r,
              user_name: profMap[r.user_id] || 'Pendaki Misterius'
            }));
            setReviews(revsWithNames);
          } else {
            setReviews([]);
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Compute duration and costs
  const getDurationDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  const duration = getDurationDays();
  const rentalPrice = equipment ? equipment.price_per_day * duration : 0;
  const shippingCost = deliveryMethod === 'delivery' ? 25000 : 0;
  const totalPrice = rentalPrice + shippingCost;
  const dpAmount = totalPrice * 0.5;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleBookNow = async () => {
    if (!startDate || !endDate) {
      alert('Pilih tanggal mulai dan tanggal selesai sewa terlebih dahulu.');
      return;
    }

    setBookingLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if not authenticated
        const redirectUrl = encodeURIComponent(
          `/catalog/${id}?kota=${searchParams.get('kota') || ''}&dari=${startDate}&sampai=${endDate}`
        );
        navigate(`/auth?redirect=${redirectUrl}`);
        return;
      }

      // Create draft booking with 'pending' status
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert({
          user_id: session.user.id,
          equipment_id: equipment.id,
          store_id: store.id,
          start_date: startDate,
          end_date: endDate,
          duration: duration,
          total_price: totalPrice,
          delivery_method: deliveryMethod,
          shipping_cost: shippingCost,
          payment_method: 'transfer', // default, updated in payment screen
          status: 'pending',
          verification_token: `token-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to booking checkout summary
      navigate(`/booking/${newBooking.id}`);
    } catch (err) {
      console.error('Error creating booking draft:', err);
      alert('Gagal memproses booking. Coba lagi.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container main-content text-center mt-6">
        <h3>Alat tidak ditemukan.</h3>
        <button onClick={() => navigate('/catalog')} className="btn btn-primary mt-4">
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  // Fallback image gallery
  const images = equipment.images && equipment.images.length > 0
    ? equipment.images
    : ['https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80'];

  return (
    <div className="container main-content">
      <div className="detail-layout">
        {/* Left Column */}
        <div className="detail-info-section">
          {/* Back button */}
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm mb-4">
            &larr; Kembali
          </button>

          {/* Photo Gallery */}
          <div className="gallery-container glass-card">
            <div className="gallery-main">
              <img src={images[activeImageIndex]} alt={equipment.name} />
              <span className="gallery-category-badge badge badge-orange">
                {equipment.category}
              </span>
            </div>
            
            {images.length > 1 && (
              <div className="gallery-thumbnails mt-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumb-item ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`thumbnail-${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className="product-details-text glass-card mt-6">
            <h2>{equipment.name}</h2>
            <div className="product-store-meta mt-2">
              <MapPin size={16} className="text-primary" />
              <span>Disediakan oleh <span className="font-bold text-primary">{store?.name}</span> ({store?.city})</span>
            </div>
            <p className="product-desc-body mt-4">{equipment.description}</p>
          </div>

          {/* Specifications */}
          <div className="product-specs glass-card mt-6">
            <h3>Spesifikasi Teknis</h3>
            <ul className="specs-list mt-4">
              <li>
                <span className="spec-label">Kondisi Alat</span>
                <span className="badge badge-success">Sangat Layak</span>
              </li>
              <li>
                <span className="spec-label">Kategori</span>
                <span>{equipment.category}</span>
              </li>
              <li>
                <span className="spec-label">Total Unit Inventaris</span>
                <span>{equipment.total_stock} Unit</span>
              </li>
            </ul>
          </div>

          {/* Reviews List */}
          <div className="product-reviews glass-card mt-6">
            <h3 className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Ulasan Penyewa ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-muted mt-4">Belum ada ulasan untuk alat ini. Jadilah penyewa pertama!</p>
            ) : (
              <div className="reviews-list mt-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item">
                    <div className="review-header">
                      <span className="review-user">{rev.user_name}</span>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className={i < rev.rating ? 'text-warning' : 'text-muted'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="review-comment mt-2">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Card */}
        <div className="detail-booking-sidebar">
          <div className="booking-card glass-card">
            <h3>Sewa Alat Ini</h3>
            <div className="price-tag mt-2">
              <span className="price-amount">{formatRupiah(equipment.price_per_day)}</span>
              <span className="price-unit">/hari</span>
            </div>

            <div className="filter-divider"></div>

            <div className="booking-form mt-4">
              <div className="form-group">
                <label className="form-label">Tanggal Mulai</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Selesai</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Metode Pengambilan</label>
                <div className="radio-options mt-2">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="delivery"
                      className="radio-input"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => setDeliveryMethod('pickup')}
                    />
                    <div className="radio-text">
                      <div className="radio-title"><Shield size={16} /> Ambil di Toko (Pickup)</div>
                      <div className="radio-desc text-muted">Ambil langsung di gerai {store?.name}</div>
                    </div>
                  </label>

                  <label className="radio-label mt-3">
                    <input
                      type="radio"
                      name="delivery"
                      className="radio-input"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => setDeliveryMethod('delivery')}
                    />
                    <div className="radio-text">
                      <div className="radio-title"><Truck size={16} /> Kirim Paket (Delivery)</div>
                      <div className="radio-desc text-muted">Kirim ke alamat Anda (Dummy Ongkir Rp 25.000)</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {duration > 0 && (
              <div className="cost-breakdown mt-4">
                <div className="cost-row">
                  <span>Subtotal Sewa ({duration} hari)</span>
                  <span>{formatRupiah(rentalPrice)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="cost-row mt-2">
                    <span>Estimasi Ongkir</span>
                    <span>{formatRupiah(shippingCost)}</span>
                  </div>
                )}
                <div className="filter-divider"></div>
                <div className="cost-row total font-bold mt-2">
                  <span>Total Harga</span>
                  <span className="text-primary">{formatRupiah(totalPrice)}</span>
                </div>
                <div className="cost-row dp-alert mt-2 text-warning font-bold">
                  <span>DP 50% Sekarang</span>
                  <span>{formatRupiah(dpAmount)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleBookNow}
              className="btn btn-primary btn-block mt-6"
              disabled={bookingLoading || equipment.stok_tersedia <= 0}
            >
              {equipment.stok_tersedia <= 0 
                ? 'Stok Sedang Habis' 
                : bookingLoading 
                  ? 'Sedang Memproses...' 
                  : 'Sewa Sekarang'}
            </button>

            {equipment.stok_tersedia <= 3 && equipment.stok_tersedia > 0 && (
              <div className="stock-alert alert alert-warning mt-4">
                <AlertCircle size={16} />
                <span>Sisa stok menipis! Hanya tinggal {equipment.stok_tersedia} unit.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .detail-layout {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }

        .detail-info-section {
          flex: 1.8;
        }

        .detail-booking-sidebar {
          flex: 1;
          position: sticky;
          top: 90px;
        }

        /* Gallery */
        .gallery-container {
          padding: 16px;
        }

        .gallery-main {
          position: relative;
          width: 100%;
          padding-top: 60%;
          background-color: rgba(0,0,0,0.3);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
        }

        .gallery-main img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-category-badge {
          position: absolute;
          top: 16px;
          right: 16px;
        }

        .gallery-thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }

        .thumb-item {
          width: 80px;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s ease;
          background-color: #000;
        }

        .thumb-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .thumb-item:hover img, .thumb-item.active img {
          opacity: 1;
        }

        .thumb-item.active {
          border-color: var(--color-primary);
        }

        /* Metadata & Details */
        .product-store-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: var(--color-text-muted);
        }

        .product-desc-body {
          color: rgba(255,255,255,0.8);
          font-size: 0.95rem;
          white-space: pre-line;
        }

        /* Specs list */
        .specs-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .specs-list li {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 8px;
        }

        .spec-label {
          color: var(--color-text-muted);
        }

        /* Reviews */
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-item {
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 16px;
        }

        .review-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .review-user {
          font-weight: 700;
          color: #fff;
          font-size: 0.9rem;
        }

        .review-stars {
          color: var(--color-warning);
          display: flex;
          gap: 2px;
        }

        .review-comment {
          font-size: 0.88rem;
          color: var(--color-text-muted);
        }

        /* Booking Card */
        .price-tag {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .price-amount {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--color-primary);
          font-family: var(--font-heading);
        }

        .radio-options {
          display: flex;
          flex-direction: column;
        }

        .radio-options .radio-label {
          align-items: flex-start;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          transition: all 0.2s ease;
        }

        .radio-options .radio-label:hover {
          border-color: var(--color-border-hover);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .radio-options input:checked + .radio-text {
          color: #fff;
        }

        .radio-title {
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .radio-desc {
          font-size: 0.75rem;
          margin-top: 4px;
        }

        .cost-breakdown {
          background-color: rgba(0, 0, 0, 0.15);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--color-border);
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
        }

        .cost-row.total {
          font-size: 1rem;
          color: #fff;
        }

        .dp-alert {
          font-size: 0.9rem;
          border-top: 1px dashed var(--color-border);
          padding-top: 8px;
        }

        .stock-alert {
          padding: 8px 12px;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .detail-layout {
            flex-direction: column;
          }
          .detail-booking-sidebar {
            position: relative;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
