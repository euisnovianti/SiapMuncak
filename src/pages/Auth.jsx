import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Phone, Map, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect away
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirectUser(session.user.id);
      }
    });
  }, []);

  const redirectUser = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        // If there was a redirect query in the URL, go there, otherwise go to home
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect') || '/';
        navigate(redirectTo);
      }
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // Log in flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        if (data.user) {
          await redirectUser(data.user.id);
        }
      } else {
        // Sign up flow
        if (!fullName || !whatsapp) {
          throw new Error('Semua kolom wajib diisi!');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: whatsapp
            }
          }
        });

        if (error) throw error;
        if (data.user) {
          navigate('/');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left split screen */}
      <div className="auth-hero">
        <div className="auth-hero-overlay"></div>
        <div className="auth-hero-content">
          <div className="logo-brand">
            <Map className="hero-logo-icon" />
            <h1>Siap-Muncak</h1>
          </div>
          <p className="hero-tagline">
            Petualangan luar biasa menanti Anda. Persiapkan perlengkapan hiking terbaik tanpa ribet, langsung dari partner tepercaya.
          </p>
          <div className="hero-stats">
            <div className="stat-pill">
              <span className="stat-num">15+</span>
              <span className="stat-lbl">Gunung Jawa Barat</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">500+</span>
              <span className="stat-lbl">Alat Outdoor Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right split screen */}
      <div className="auth-container">
        <div className="auth-card glass-card">
          <div className="tab-group auth-tabs">
            <button
              className={`tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setErrorMsg('');
              }}
            >
              Masuk
            </button>
            <button
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setErrorMsg('');
              }}
            >
              Daftar
            </button>
          </div>

          <h2 className="auth-title">
            {isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun Pendaki'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Masuk untuk mengelola rental dan menjelajah katalog alat hiking.' 
              : 'Daftar sekarang dan nikmati kemudahan booking alat outdoor.'}
          </p>

          {errorMsg && (
            <div className="auth-error alert alert-warning">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form mt-4">
            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Masukkan nama lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Contoh: 081234567890"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block mt-6"
              disabled={loading}
            >
              {loading 
                ? 'Sedang Memproses...' 
                : isLogin 
                  ? 'Masuk' 
                  : 'Daftar Akun'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .auth-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-bg-dark);
        }

        .auth-hero {
          flex: 1.2;
          background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80');
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px;
        }

        .auth-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(10, 20, 23, 0.2) 0%, rgba(10, 20, 23, 0.9) 100%);
        }

        .auth-hero-content {
          position: relative;
          z-index: 2;
          max-width: 580px;
        }

        .logo-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .hero-logo-icon {
          color: var(--color-primary);
          width: 44px;
          height: 44px;
        }

        .logo-brand h1 {
          font-size: 2.5rem;
          color: #fff;
          letter-spacing: -1px;
        }

        .hero-tagline {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .hero-stats {
          display: flex;
          gap: 20px;
        }

        .stat-pill {
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius-sm);
          padding: 12px 20px;
          backdrop-filter: blur(4px);
        }

        .stat-num {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary);
          font-family: var(--font-heading);
        }

        .stat-lbl {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .auth-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background-color: #080E10;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: var(--border-radius-md);
        }

        .auth-tabs {
          margin-bottom: 32px;
        }

        .auth-title {
          font-size: 1.8rem;
          color: #fff;
          margin-bottom: 8px;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          margin-bottom: 24px;
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

        .auth-error {
          padding: 12px 16px;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        @media (max-width: 992px) {
          .auth-wrapper {
            flex-direction: column;
          }
          .auth-hero {
            display: none;
          }
          .auth-container {
            padding: 24px;
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}
