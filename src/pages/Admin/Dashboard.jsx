import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Users, Store, Calendar, DollarSign, List, ShieldAlert, 
  ChevronRight, LogOut, LayoutDashboard, CheckSquare, Eye 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVendors: 0,
    monthlyBookings: 0,
    totalGMV: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [equipments, setEquipments] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Validate admin session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role !== 'admin') {
          alert('Akses ditolak. Halaman ini hanya untuk Administrator.');
          navigate('/');
          return;
        }

        // Fetch stats
        const { data: allProfiles } = await supabase.from('profiles').select('*');
        const { data: allStores } = await supabase.from('stores').select('*');
        const { data: allBookings } = await supabase.from('bookings').select('*');
        const { data: allEquip } = await supabase.from('equipment').select('*');

        const activeVendorsList = allStores ? allStores.filter(s => s.is_verified) : [];

        // Calculate GMV (sum of total_price for non-cancelled bookings)
        const validBookings = allBookings ? allBookings.filter(b => b.status !== 'dibatalkan') : [];
        const gmv = validBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

        // Calculate monthly bookings (created in current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthly = allBookings ? allBookings.filter(b => {
          const d = new Date(b.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length : 0;

        setStats({
          totalUsers: allProfiles ? allProfiles.length : 0,
          activeVendors: activeVendorsList.length,
          monthlyBookings: monthly,
          totalGMV: gmv
        });

        // Set mapping helpers
        const profMap = {};
        if (allProfiles) {
          allProfiles.forEach(p => { profMap[p.id] = p.full_name; });
        }
        setProfiles(profMap);

        const eqMap = {};
        if (allEquip) {
          allEquip.forEach(e => { eqMap[e.id] = e.name; });
        }
        setEquipments(eqMap);

        // Set recent bookings (last 10)
        if (allBookings) {
          const sorted = [...allBookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentBookings(sorted.slice(0, 10));
        }

        // Generate activity logs
        const logs = [];
        if (allStores) {
          allStores.forEach(s => {
            logs.push({
              id: `log-s-${s.id}`,
              time: s.created_at,
              text: `Pendaftaran toko baru "${s.name}" oleh ${profMap[s.owner_id] || 'Owner'} (${s.city})`,
              badge: s.is_verified ? 'verified' : 'pending'
            });
          });
        }

        if (allBookings) {
          allBookings.forEach(b => {
            logs.push({
              id: `log-b-${b.id}`,
              time: b.created_at,
              text: `Booking dibuat oleh ${profMap[b.user_id] || 'User'} untuk "${eqMap[b.equipment_id] || 'Alat'}"`,
              badge: b.status
            });
          });
        }

        const sortedLogs = logs.sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivityLog(sortedLogs.slice(0, 8));

      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
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

  return (
    <div className="admin-layout">
      {/* Sidebar Gelap */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>Siap<span className="accent">-</span>Muncak</span>
          <span className="admin-sub">ADMINISTRATOR</span>
        </div>

        <ul className="admin-menu">
          <li>
            <Link to="/admin" className="admin-menu-link active">
              <LayoutDashboard size={18} />
              Ringkasan
            </Link>
          </li>
          <li>
            <Link to="/admin/vendors" className="admin-menu-link">
              <Store size={18} />
              Verifikasi Vendor
            </Link>
          </li>
          <li>
            <Link to="/admin/bookings" className="admin-menu-link">
              <List size={18} />
              Semua Transaksi
            </Link>
          </li>
        </ul>

        <div className="admin-sidebar-footer mt-auto">
          <button onClick={handleAdminLogout} className="admin-logout-btn btn btn-danger btn-sm btn-block">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header flex justify-between items-center mb-6">
          <div>
            <h2>Dashboard Ringkasan</h2>
            <p className="text-muted">Selamat datang di panel pengawasan Siap-Muncak.</p>
          </div>
        </header>

        {/* 4 Stats Cards */}
        <section className="admin-stats-grid grid grid-cols-4 gap-4 mt-6">
          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper blue">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-title text-muted text-sm block">Pengguna Terdaftar</span>
              <span className="stat-number font-bold text-xl">{stats.totalUsers}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper green">
              <Store size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-title text-muted text-sm block">Vendor Aktif</span>
              <span className="stat-number font-bold text-xl">{stats.activeVendors}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper orange">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-title text-muted text-sm block">Booking Bulan Ini</span>
              <span className="stat-number font-bold text-xl">{stats.monthlyBookings}</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrapper gold">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-title text-muted text-sm block">Nilai GMV (Simulasi)</span>
              <span className="stat-number font-bold text-lg text-primary">{formatRupiah(stats.totalGMV)}</span>
            </div>
          </div>
        </section>

        {/* Tables section */}
        <div className="admin-double-layout mt-6">
          {/* Recent Bookings */}
          <div className="admin-panel-col glass-card">
            <div className="panel-header mb-4 flex justify-between items-center">
              <h3>Booking Terbaru</h3>
              <Link to="/admin/bookings" className="text-sm text-primary flex items-center gap-1">
                Semua <ChevronRight size={14} />
              </Link>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID Booking</th>
                    <th>Penyewa</th>
                    <th>Alat</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id}>
                      <td className="font-bold text-sm">{b.id.substring(0, 8)}</td>
                      <td>{profiles[b.user_id] || 'Loading...'}</td>
                      <td>{equipments[b.equipment_id] || 'Loading...'}</td>
                      <td className="font-bold text-primary">{formatRupiah(b.total_price)}</td>
                      <td>
                        <span className={`badge ${
                          b.status === 'selesai' ? 'badge-success' :
                          b.status === 'dibatalkan' ? 'badge-danger' :
                          b.status === 'menunggu_konfirmasi' ? 'badge-warning' : 'badge-orange'
                        }`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">Belum ada pemesanan masuk.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="admin-panel-col glass-card">
            <h3>Log Aktivitas</h3>
            <div className="log-list mt-4">
              {activityLog.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-time text-xs text-muted">
                    {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(log.time).toLocaleDateString()}
                  </div>
                  <div className="log-text mt-1 text-sm">{log.text}</div>
                  <span className={`badge mt-1 text-xs ${
                    log.badge === 'verified' || log.badge === 'selesai' ? 'badge-success' :
                    log.badge === 'pending' || log.badge === 'menunggu_konfirmasi' ? 'badge-warning' :
                    log.badge === 'dibatalkan' ? 'badge-danger' : 'badge-orange'
                  }`}>
                    {log.badge}
                  </span>
                </div>
              ))}
              {activityLog.length === 0 && (
                <p className="text-muted text-sm mt-4">Belum ada log aktivitas.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .admin-logo {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .admin-logo .accent {
          color: var(--color-primary);
        }

        .admin-sub {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          letter-spacing: 2px;
          margin-top: 4px;
        }

        /* Stats Icon styling */
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-wrapper {
          padding: 12px;
          border-radius: 12px;
          color: #fff;
        }
        .stat-icon-wrapper.blue { background-color: #2563eb; }
        .stat-icon-wrapper.green { background-color: #10b981; }
        .stat-icon-wrapper.orange { background-color: #f97316; }
        .stat-icon-wrapper.gold { background-color: #eab308; }

        /* Double Layout for dashboards */
        .admin-double-layout {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 24px;
        }

        /* Activity logs */
        .log-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .log-item {
          border-left: 2px solid var(--color-border);
          padding-left: 12px;
          position: relative;
        }
        .log-item::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-primary);
          position: absolute;
          left: -5px;
          top: 6px;
        }

        .text-xs { font-size: 0.72rem; }
        .text-xl { font-size: 1.5rem; }
        .text-lg { font-size: 1.25rem; }
        .block { display: block; }

        @media (max-width: 1024px) {
          .admin-double-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
