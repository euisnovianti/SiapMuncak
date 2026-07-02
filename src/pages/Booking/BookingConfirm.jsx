import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Download, List, QrCode, Truck, MapPin, Phone, User, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

export default function BookingConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [store, setStore] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

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
          
          const { data: eq } = await supabase
            .from('equipment')
            .select('*')
            .eq('id', b.equipment_id)
            .single();
          setEquipment(eq);

          const { data: st } = await supabase
            .from('stores')
            .select('*')
            .eq('id', b.store_id)
            .single();
          setStore(st);

          // Generate QR Code if pickup method
          if (b.delivery_method === 'pickup') {
            const qrData = JSON.stringify({
              booking_id: b.id,
              verification_token: b.verification_token
            });
            const qrUrl = await QRCode.toDataURL(qrData, {
              width: 250,
              margin: 2,
              color: {
                dark: '#0A1417',
                light: '#FFFFFF'
              }
            });
            setQrCodeUrl(qrUrl);
          }
        }
      } catch (err) {
        console.error('Error rendering confirmation details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `sm-booking-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTrackDelivery = () => {
    alert(`Status Pengiriman: Sedang Diproses.\nNomor Resi akan diupdate oleh gerai ${store?.name} setelah paket diserahkan ke ekspedisi.`);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container main-content text-center mt-6">
        <h3>Booking tidak ditemukan.</h3>
        <Link to="/" className="btn btn-primary mt-4">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="container main-content confirmation-wrapper">
      {/* Stepper */}
      <div className="stepper-container">
        <div className="stepper-line"></div>
        <div className="stepper-line-active" style={{ width: '100%' }}></div>
        
        <div className="step-item completed">
          <div className="step-circle">1</div>
          <span className="step-label">Detail Booking</span>
        </div>
        
        <div className="step-item completed">
          <div className="step-circle">2</div>
          <span className="step-label">Pembayaran DP</span>
        </div>
        
        <div className="step-item active">
          <div className="step-circle">3</div>
          <span className="step-label">Konfirmasi</span>
        </div>
      </div>

      <div className="confirmation-card glass-card mt-6">
        {/* Success Animation & Text */}
        <div className="success-header text-center">
          <div className="checkmark-wrapper">
            <CheckCircle2 size={72} className="checkmark-icon" />
          </div>
          <h2 className="mt-4">Booking Berhasil!</h2>
          <p className="text-muted mt-2">
            Pembayaran DP Anda sedang diproses. Silakan pantau status pemesanan di menu profil.
          </p>
        </div>

        <div className="filter-divider"></div>

        {/* Dynamic Branch based on pickup method */}
        {booking.delivery_method === 'pickup' ? (
          <div className="confirm-pickup-section text-center">
            <h3>QR Code Pengambilan Alat</h3>
            <p className="text-muted text-sm mt-1">Tunjukkan QR Code ini ke toko saat pengambilan alat.</p>
            
            {qrCodeUrl && (
              <div className="qr-code-frame mt-4">
                <img src={qrCodeUrl} alt="Booking QR Code" />
              </div>
            )}

            <div className="store-address-confirm mt-4">
              <h4>Ambil di: {store?.name}</h4>
              <div className="flex items-center justify-center gap-2 text-muted text-sm mt-1">
                <MapPin size={14} className="text-primary" />
                <span>{store?.address} ({store?.city})</span>
              </div>
            </div>

            <div className="confirm-actions mt-6">
              <button onClick={handleDownloadQR} className="btn btn-secondary">
                <Download size={18} />
                Download QR
              </button>
              <Link to="/profile?tab=orders" className="btn btn-primary">
                <List size={18} />
                Lihat Pesanan Saya
              </Link>
            </div>
          </div>
        ) : (
          <div className="confirm-delivery-section">
            <h3 className="text-center">Informasi Pengiriman</h3>
            
            <div className="delivery-summary-card mt-4">
              <div className="summary-title">
                <Truck size={18} className="text-primary" />
                <span>Tujuan Pengiriman</span>
              </div>
              
              <div className="summary-fields mt-3">
                <div className="summary-field">
                  <User size={16} className="text-muted" />
                  <span>Nama Penerima: <strong>{booking.shipping_address?.name}</strong></span>
                </div>
                <div className="summary-field mt-2">
                  <Phone size={16} className="text-muted" />
                  <span>No HP: {booking.shipping_address?.phone}</span>
                </div>
                <div className="summary-field mt-2">
                  <MapPin size={16} className="text-muted" />
                  <span>Alamat: {booking.shipping_address?.address}, {booking.shipping_address?.city}, {booking.shipping_address?.postal_code}</span>
                </div>
              </div>
            </div>

            <div className="delivery-status-indicator mt-4 text-center">
              <div className="badge badge-warning">Pesanan Diproses</div>
              <p className="text-muted text-sm mt-2">Pihak vendor sedang menyiapkan perlengkapan outdoor Anda.</p>
            </div>

            <div className="confirm-actions justify-center mt-6">
              <button onClick={handleTrackDelivery} className="btn btn-secondary">
                <ExternalLink size={18} />
                Lacak Status Pengiriman
              </button>
              <Link to="/profile?tab=orders" className="btn btn-primary">
                <List size={18} />
                Lihat Pesanan Saya
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .confirmation-wrapper {
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        .confirmation-card {
          padding: 48px;
        }

        /* Success Animation */
        .checkmark-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
          animation: scaleUp 0.5s ease-out;
        }

        .checkmark-icon {
          animation: pulseCheck 1s infinite alternate;
        }

        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes pulseCheck {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }

        .success-header h2 {
          font-size: 2.2rem;
          color: #fff;
        }

        /* QR Frame */
        .qr-code-frame {
          display: inline-block;
          background-color: #fff;
          padding: 16px;
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-border);
        }

        .qr-code-frame img {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .store-address-confirm {
          background-color: rgba(255,255,255,0.01);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-sm);
          padding: 16px;
          display: inline-block;
          max-width: 420px;
        }

        /* Delivery Card */
        .delivery-summary-card {
          background-color: rgba(255,255,255,0.02);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-sm);
          padding: 20px;
          text-align: left;
        }

        .summary-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #fff;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 8px;
        }

        .summary-field {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
        }

        .summary-field svg {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .confirm-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        @media (max-width: 576px) {
          .confirmation-card {
            padding: 24px;
          }
          .confirm-actions {
            flex-direction: column;
            gap: 12px;
          }
          .confirm-actions button, .confirm-actions a {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
