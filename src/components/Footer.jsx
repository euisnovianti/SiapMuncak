import React from 'react';
import { useLocation } from 'react-router-dom';
import { Map, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const location = useLocation();

  // Hide footer on admin dashboard pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <Map className="footer-logo-icon" />
            <span>Siap<span className="accent">-</span>Muncak</span>
          </div>
          <p className="footer-desc">
            Penyedia layanan sewa perlengkapan outdoor terpercaya, menghubungkan pendaki dengan toko perlengkapan terbaik di Bandung & Garut.
          </p>
        </div>

        <div className="footer-links-col">
          <h4>Navigasi</h4>
          <ul>
            <li><a href="/">Beranda</a></li>
            <li><a href="/catalog">Katalog Alat</a></li>
            <li><a href="/profile">Akun Saya</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Hubungi Kami</h4>
          <ul className="contact-list">
            <li>
              <MapPin size={16} className="contact-icon" />
              <span>Bandung & Garut, Jawa Barat</span>
            </li>
            <li>
              <Phone size={16} className="contact-icon" />
              <span>+62 812-3456-7890</span>
            </li>
            <li>
              <Mail size={16} className="contact-icon" />
              <span>info@siapmuncak.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} Siap-Muncak. All rights reserved.</p>
          <p className="footer-simulation-badge">Simulasi Pengembangan</p>
        </div>
      </div>

      <style>{`
        .footer {
          background-color: #050B0D;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 60px 0 0 0;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 40px;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
        }

        .footer-logo-icon {
          color: var(--color-primary);
          width: 28px;
          height: 28px;
        }

        .footer-logo .accent {
          color: var(--color-primary);
        }

        .footer-desc {
          max-width: 360px;
          line-height: 1.6;
        }

        .footer-links-col h4, .footer-contact h4 {
          color: #fff;
          font-family: var(--font-heading);
          font-size: 1.1rem;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .footer-links-col ul, .footer-contact ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links-col a:hover {
          color: var(--color-primary);
          padding-left: 4px;
        }

        .contact-list li {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .contact-icon {
          color: var(--color-primary);
          flex-shrink: 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px 0;
          margin-top: 20px;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }

        .footer-simulation-badge {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
          padding: 4px 10px;
          border-radius: 50px;
          border: 1px solid rgba(245, 158, 11, 0.2);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .footer-bottom-content {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
