import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Calendar, ArrowRight, ShieldCheck, Truck, Percent, Store } from 'lucide-react';

export default function Home() {
  const [city, setCity] = useState('Bandung');
  // Set default dates (tomorrow and day after tomorrow) for easy UX
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDate(tomorrow));
  const [endDate, setEndDate] = useState(formatDate(dayAfter));

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/catalog?kota=${city.toLowerCase()}&dari=${startDate}&sampai=${endDate}`);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="hero-badge badge badge-orange">Siap Muncak 2026</span>
            <h1>Persiapkan Pendakian Anda Tanpa Batas</h1>
            <p>
              Sewa perlengkapan gunung premium secara online. Ambil langsung di toko terdekat atau kirim paket langsung ke alamat Anda. Aman, cepat, dan terpercaya.
            </p>
          </div>

          <div className="hero-search-wrapper">
            <form onSubmit={handleSearch} className="search-widget glass-card">
              <h3 className="search-widget-title">Cari Alat Hiking</h3>
              <p className="search-widget-sub">Tentukan lokasi dan tanggal untuk melihat stok tersedia.</p>
              
              <div className="form-group mt-4">
                <label className="form-label">Pilih Kota Operasional</label>
                <div className="input-with-icon">
                  <Search size={18} className="input-icon" />
                  <select
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="Bandung">Bandung</option>
                    <option value="Garut">Garut</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <div className="input-with-icon">
                    <Calendar size={18} className="input-icon" />
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      min={formatDate(new Date())}
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
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block mt-4">
                Cari Alat Sekarang
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section container">
        <div className="section-title text-center">
          <h2>Mengapa Sewa di Siap-Muncak?</h2>
          <p className="text-muted">Kami merancang platform sewa outdoor terlengkap demi kemudahan petualangan Anda.</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="feature-card glass-card">
            <Store className="feature-icon" />
            <h3>Vendor Terverifikasi</h3>
            <p className="text-muted">Semua toko outdoor yang bermitra telah melalui proses seleksi ketat untuk menjamin orisinalitas alat.</p>
          </div>

          <div className="feature-card glass-card">
            <Percent className="feature-icon" />
            <h3>Cukup Bayar DP 50%</h3>
            <p className="text-muted">Amankan booking tenda atau carrier Anda cukup dengan membayar DP 50% secara manual atau QRIS.</p>
          </div>

          <div className="feature-card glass-card">
            <Truck className="feature-icon" />
            <h3>Dua Metode Pengambilan</h3>
            <p className="text-muted">Fleksibel memilih ambil langsung di gerai vendor (pickup) atau kirim via ekspedisi (delivery).</p>
          </div>

          <div className="feature-card glass-card">
            <ShieldCheck className="feature-icon" />
            <h3>Jaminan Kebersihan</h3>
            <p className="text-muted">Peralatan selalu dicuci bersih, disinfeksi, dan dicek kelengkapannya sebelum diserahterimakan.</p>
          </div>
        </div>
      </section>

      <style>{`
        .home-container {
          padding-bottom: 80px;
        }

        .hero-section {
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .hero-text h1 {
          font-size: 3.5rem;
          color: #fff;
          margin-bottom: 24px;
          line-height: 1.15;
          letter-spacing: -1.5px;
        }

        .hero-text p {
          font-size: 1.15rem;
          color: var(--color-text-muted);
          margin-bottom: 40px;
          max-width: 520px;
          line-height: 1.7;
        }

        .hero-badge {
          margin-bottom: 20px;
        }

        .hero-search-wrapper {
          display: flex;
          justify-content: flex-end;
        }

        .search-widget {
          width: 100%;
          max-width: 460px;
          padding: 36px;
        }

        .search-widget-title {
          font-size: 1.5rem;
          color: #fff;
        }

        .search-widget-sub {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-top: 4px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-left: 44px;
        }

        /* Features */
        .features-section {
          padding: 80px 24px;
        }

        .section-title {
          margin-bottom: 48px;
        }

        .section-title h2 {
          font-size: 2.2rem;
          color: #fff;
          margin-bottom: 12px;
        }

        .feature-card {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-primary);
        }

        .feature-icon {
          color: var(--color-primary);
          width: 40px;
          height: 40px;
          padding: 8px;
          border-radius: 8px;
          background-color: rgba(255, 107, 53, 0.1);
        }

        .feature-card h3 {
          font-size: 1.15rem;
          color: #fff;
          font-weight: 600;
        }

        .feature-card p {
          font-size: 0.88rem;
          line-height: 1.6;
        }

        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-text {
            text-align: center;
          }
          .hero-text p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-search-wrapper {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
