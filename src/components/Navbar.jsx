import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Compass, User, LogOut, Shield, Map, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    setIsOpen(false);
  };

  // Check if we are on the admin page to hide main navbar if necessary
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <Map className="nav-logo-icon" />
          <span>Siap<span className="accent">-</span>Muncak</span>
        </Link>

        {/* Center menu */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li>
            <Link
              to="/catalog"
              className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <Compass size={18} />
              Katalog Alat
            </Link>
          </li>
          
          {profile?.role === 'admin' && (
            <li>
              <Link
                to="/admin"
                className="nav-link admin-indicator"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={18} />
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        {/* Right side actions */}
        <div className={`nav-right ${isOpen ? 'active' : ''}`}>
          {session ? (
            <>
              <Link
                to="/profile"
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                {profile?.full_name || 'Profil Saya'}
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={18} />
                Keluar
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="btn btn-primary btn-sm btn-auth"
              onClick={() => setIsOpen(false)}
            >
              Masuk / Daftar
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: rgba(10, 20, 23, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 100;
          display: flex;
          align-items: center;
          transition: background 0.3s ease;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          z-index: 10;
        }

        .nav-logo-icon {
          color: var(--color-primary);
          width: 28px;
          height: 28px;
        }

        .nav-logo .accent {
          color: var(--color-primary);
        }

        .nav-menu {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          list-style: none;
          gap: 24px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 10;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-muted);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
        }

        .nav-link:hover, .nav-link.active {
          color: #fff;
        }

        .nav-link.active {
          background-color: rgba(255, 255, 255, 0.04);
          color: var(--color-primary);
        }

        .admin-indicator {
          color: var(--color-warning);
          border: 1px dashed rgba(245, 158, 11, 0.3);
        }
        .admin-indicator:hover {
          color: #fff;
          background-color: rgba(245, 158, 11, 0.1);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: var(--border-radius-sm);
        }
        .btn-logout:hover {
          color: var(--color-error);
          background-color: rgba(239, 68, 68, 0.05);
        }

        .btn-auth {
          padding: 8px 18px !important;
          font-size: 0.9rem !important;
        }

        .nav-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          z-index: 10;
        }

        @media (max-width: 900px) {
          .nav-menu {
            position: static;
            transform: none;
          }
        }

        @media (max-width: 768px) {
          .nav-toggle {
            display: block;
          }

          .nav-menu, .nav-right {
            position: fixed;
            left: 0;
            right: 0;
            background: #0A1417;
            flex-direction: column;
            padding: 24px;
            gap: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
          }

          .nav-menu {
            top: 70px;
            transform: translateY(-100%);
            border-bottom: none;
            padding-bottom: 0;
          }

          .nav-right {
            top: calc(70px + 100px); /* rough estimate of menu height */
            transform: translateY(-100%);
          }

          .nav-menu.active, .nav-right.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .nav-menu.active {
            z-index: 9;
          }
          
          .nav-right.active {
            z-index: 8;
            top: 140px; /* Adjust based on actual menu items */
          }

          .nav-link, .btn-logout, .btn-auth {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </nav>
  );
}
