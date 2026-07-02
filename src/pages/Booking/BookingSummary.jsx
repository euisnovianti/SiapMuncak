import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Shield, Truck, Calendar, Store, MapPin, ArrowRight } from 'lucide-react';

export default function BookingSummary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for Delivery method
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: b } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', id)
          .single();

        if (b) {
          setBooking(b);

          // Get equipment
          const { data: eq } = await supabase
            .from('equipment')
            .select('*')
            .eq('id', b.equipment_id)
            .single();
          setEquipment(eq);

          // Get store
          const { data: st } = await supabase
            .from('stores')
            .select('*')
            .eq('id', b.store_id)
            .single();
          setStore(st);
        }
      } catch (err) {
        console.error('Error fetching booking detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (booking.delivery_method === 'delivery') {
      if (!recipientName || !phone || !address || !city || !postalCode) {
        alert('Lengkapi alamat pengiriman terlebih dahulu.');
        return;
      }

      // Update booking with address details
      const shippingAddress = {
        name: recipientName,
        phone,
        address,
        city,
        postal_code: postalCode
      };

      const { error } = await supabase
        .from('bookings')
        .update({
          shipping_address: shippingAddress
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating shipping address:', error);
        alert('Gagal memperbarui alamat pengiriman.');
        return;
      }
    }

    navigate(`/booking/${id}/payment`);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!booking || !equipment) {
    return (
      <div className="container main-content text-center mt-6">
        <h3>Booking tidak ditemukan.</h3>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="container main-content">
      {/* Stepper */}
      <div className="stepper-container">
        <div className="stepper-line"></div>
        <div className="stepper-line-active" style={{ width: '0%' }}></div>
        
        <div className="step-item active">
          <div className="step-circle">1</div>
          <span className="step-label">Detail Booking</span>
        </div>
        
        <div className="step-item">
          <div className="step-circle">2</div>
          <span className="step-label">Pembayaran DP</span>
        </div>
        
        <div className="step-item">
          <div className="step-circle">3</div>
          <span className="step-label">Konfirmasi</span>
        </div>
      </div>

      <div className="summary-layout mt-6">
        {/* Left Side: Forms */}
        <div className="summary-form-section">
          {booking.delivery_method === 'pickup' ? (
            <div className="glass-card">
              <h3 className="flex items-center gap-2">
                <Store className="text-primary" />
                Titik Pengambilan Toko
              </h3>
              <p className="text-muted mt-2">
                Anda memilih metode <strong>Ambil di Toko</strong>. Silakan ambil alat hiking Anda langsung di lokasi berikut setelah pembayaran terkonfirmasi.
              </p>
              
              <div className="store-address-box mt-4">
                <h4>{store?.name}</h4>
                <div className="store-address-desc mt-2">
                  <MapPin size={16} className="text-primary" />
                  <span>{store?.address} ({store?.city})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card">
              <h3 className="flex items-center gap-2">
                <Truck className="text-primary" />
                Form Alamat Pengiriman
              </h3>
              <p className="text-muted mt-2">
                Lengkapi data penerima di bawah ini untuk pengiriman paket perlengkapan hiking.
              </p>
              
              <form onSubmit={handleNextStep} className="shipping-form mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Nama Penerima</label>
                    <input
                      type="text"
                      className="form-control"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama Lengkap"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor Handphone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0812XXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kelurahan"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Kota</label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Contoh: Bandung"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kode Pos</label>
                    <input
                      type="text"
                      className="form-control"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Kode Pos"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="summary-sidebar">
          <div className="glass-card sticky-sidebar">
            <h3>Ringkasan Sewa</h3>
            
            <div className="sidebar-product-info mt-4">
              <img
                src={equipment.images?.[0] || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80'}
                alt={equipment.name}
              />
              <div>
                <h4>{equipment.name}</h4>
                <span className="badge badge-orange mt-1">{equipment.category}</span>
              </div>
            </div>

            <div className="filter-divider"></div>

            <div className="sidebar-rental-details">
              <div className="detail-row">
                <Calendar size={16} className="text-primary" />
                <div>
                  <div className="font-bold">Durasi Sewa</div>
                  <div className="text-muted text-sm">{booking.start_date} s/d {booking.end_date} ({booking.duration} hari)</div>
                </div>
              </div>
            </div>

            <div className="filter-divider"></div>

            <div className="cost-breakdown-box">
              <div className="cost-row">
                <span>Subtotal ({booking.duration} hari)</span>
                <span>{formatRupiah(equipment.price_per_day * booking.duration)}</span>
              </div>
              {booking.delivery_method === 'delivery' && (
                <div className="cost-row mt-2">
                  <span>Estimasi Ongkir</span>
                  <span>{formatRupiah(booking.shipping_cost)}</span>
                </div>
              )}
              <div className="filter-divider"></div>
              <div className="cost-row total font-bold mt-2">
                <span>Total Biaya</span>
                <span className="text-primary">{formatRupiah(booking.total_price)}</span>
              </div>
              <div className="cost-row dp-required font-bold mt-2 text-warning">
                <span>DP 50% Yang Dibayar Sekarang</span>
                <span>{formatRupiah(booking.total_price * 0.5)}</span>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="btn btn-primary btn-block mt-6"
            >
              Lanjut ke Pembayaran
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .summary-layout {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }

        .summary-form-section {
          flex: 1.8;
        }

        .summary-sidebar {
          flex: 1;
        }

        .sticky-sidebar {
          position: sticky;
          top: 90px;
        }

        /* Store details box */
        .store-address-box {
          background-color: rgba(255,255,255,0.02);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-sm);
          padding: 20px;
        }

        .store-address-desc {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          color: var(--color-text-muted);
        }

        /* Product widget in sidebar */
        .sidebar-product-info {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .sidebar-product-info img {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }

        .sidebar-product-info h4 {
          font-size: 0.95rem;
          color: #fff;
        }

        .sidebar-rental-details .detail-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.9rem;
        }

        .text-sm {
          font-size: 0.78rem;
        }

        .cost-breakdown-box {
          background-color: rgba(0,0,0,0.15);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--color-border);
        }

        .dp-required {
          border-top: 1px dashed var(--color-border);
          padding-top: 8px;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .summary-layout {
            flex-direction: column;
          }
          .summary-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
