import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Store, List, LayoutDashboard, XCircle, ShieldAlert, 
  Search, SlidersHorizontal, LogOut, ArrowRight 
} from 'lucide-react';
import Modal from '../../components/Modal';

export default function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [stores, setStores] = useState({});
  const [equipments, setEquipments] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Cancel Booking modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
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

      // Fetch all bookings
      const { data: bookingsList } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      setBookings(bookingsList || []);

      // Fetch maps
      const { data: allProfiles } = await supabase.from('profiles').select('id, full_name');
      const profMap = {};
      if (allProfiles) {
        allProfiles.forEach(p => { profMap[p.id] = p.full_name; });
      }
      setProfiles(profMap);

      const { data: allStores } = await supabase.from('stores').select('id, name, city');
      const storeMap = {};
      if (allStores) {
        allStores.forEach(s => { storeMap[s.id] = s; });
      }
      setStores(storeMap);

      const { data: allEquip } = await supabase.from('equipment').select('id, name');
      const eqMap = {};
      if (allEquip) {
        allEquip.forEach(e => { eqMap[e.id] = e.name; });
      }
      setEquipments(eqMap);

    } catch (err) {
      console.error('Error fetching admin bookings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason('');
    setCancelModalOpen(true);
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !cancellationReason) {
      alert('Alasan pembatalan wajib diisi.');
      return;
    }

    setCancelSubmitting(true);
    try {
      // 1. Update booking status and cancellation reason
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({
          status: 'dibatalkan',
          cancellation_reason: cancellationReason
        })
        .eq('id', selectedBooking.id);

      if (bookingErr) throw bookingErr;

      // 2. Increment stock back on equipment (since booking was aborted)
      const { data: eq } = await supabase
        .from('equipment')
        .select('stok_tersedia')
        .eq('id', selectedBooking.equipment_id)
        .single();

      if (eq) {
        const { error: stockErr } = await supabase
          .from('equipment')
          .update({ stok_tersedia: eq.stok_tersedia + 1 })
          .eq('id', selectedBooking.equipment_id);

        if (stockErr) throw stockErr;
      }

      setCancelModalOpen(false);
      fetchAdminData();
      alert('Booking berhasil dibatalkan oleh Admin. Notifikasi pembatalan telah dikirim.');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Gagal membatalkan booking.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Perform filtration
  const filteredBookings = bookings.filter((b) => {
    const store = stores[b.store_id];
    
    // Status filter
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    
    // City filter
    if (cityFilter !== 'all' && store?.city !== cityFilter) return false;

    // Method filter
    if (methodFilter !== 'all' && b.delivery_method !== methodFilter) return false;

    return true;
  });

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
            <Link to="/admin" className="admin-menu-link">
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
            <Link to="/admin/bookings" className="admin-menu-link active">
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
        <header className="admin-header mb-6">
          <h2>Log Semua Transaksi</h2>
          <p className="text-muted">Pantau dan kelola seluruh transaksi penyewaan alat.</p>
        </header>

        {/* Filter Toolbar */}
        <section className="glass-card mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-primary" />
            <span className="font-bold text-sm">Filters:</span>
          </div>

          <div className="filter-select-group">
            <label className="form-label text-xs">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control form-control-sm"
              style={{ minWidth: '150px' }}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="siap_diambil">Siap Diambil</option>
              <option value="diambil">Diambil</option>
              <option value="diproses">Diproses</option>
              <option value="dikirim">Dikirim</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label className="form-label text-xs">Kota</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="form-control form-control-sm"
            >
              <option value="all">Semua Kota</option>
              <option value="Bandung">Bandung</option>
              <option value="Garut">Garut</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label className="form-label text-xs">Metode</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="form-control form-control-sm"
            >
              <option value="all">Semua Metode</option>
              <option value="pickup">Pickup (Toko)</option>
              <option value="delivery">Delivery (Paket)</option>
            </select>
          </div>
        </section>

        {/* Transactions Table */}
        <section className="glass-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Booking</th>
                  <th>Penyewa</th>
                  <th>Vendor / Kota</th>
                  <th>Alat</th>
                  <th>Metode</th>
                  <th>Durasi Sewa</th>
                  <th>Total Bayar</th>
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const store = stores[b.store_id];
                  return (
                    <tr key={b.id}>
                      <td className="font-bold text-sm">{b.id.substring(0, 8)}</td>
                      <td>{profiles[b.user_id] || 'Loading...'}</td>
                      <td>
                        <div>{store?.name || 'Loading...'}</div>
                        <div className="text-muted text-xs">{store?.city}</div>
                      </td>
                      <td>{equipments[b.equipment_id] || 'Loading...'}</td>
                      <td>
                        <span className="badge badge-muted">{b.delivery_method.toUpperCase()}</span>
                      </td>
                      <td className="text-sm">
                        {b.start_date} s/d {b.end_date}<br/>
                        <span className="text-muted text-xs">({b.duration} hari)</span>
                      </td>
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
                      <td className="text-center">
                        {b.status !== 'selesai' && b.status !== 'dibatalkan' ? (
                          <button
                            onClick={() => handleOpenCancel(b)}
                            className="btn btn-danger btn-sm flex items-center gap-1"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          >
                            <XCircle size={14} /> Batalkan
                          </button>
                        ) : (
                          <span className="text-muted text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">Tidak ada transaksi ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* --- MODAL: OVERRIDE / BATALKAN BOOKING --- */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Pembatalan Transaksi Oleh Admin">
        <form onSubmit={handleCancelBooking}>
          <div className="text-center">
            <XCircle className="text-danger mb-2" size={48} />
            <h3>Batalkan Transaksi Booking #{selectedBooking?.id.substring(0, 8)}?</h3>
            <p className="text-muted text-sm mt-1">
              Peralatan yang disewa akan dikembalikan stok-nya dan transaksi diset Dibatalkan.
            </p>
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Alasan Pembatalan (Wajib)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Jelaskan alasan admin membatalkan transaksi ini (misal: penipuan bukti bayar, alat rusak, dll)..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="flex gap-4 mt-6">
            <button type="button" onClick={() => setCancelModalOpen(false)} className="btn btn-secondary flex-grow">
              Batal
            </button>
            <button type="submit" className="btn btn-danger flex-grow" disabled={cancelSubmitting}>
              {cancelSubmitting ? 'Membatalkan...' : 'Batalkan Sekarang'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .filter-select-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-select-group select {
          padding: 6px 12px;
          font-size: 0.85rem;
          min-width: 120px;
        }

        .form-control-sm {
          height: 34px;
        }
      `}</style>
    </div>
  );
}
