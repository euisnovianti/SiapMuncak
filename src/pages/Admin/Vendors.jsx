import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Store, List, LayoutDashboard, Check, X, ShieldAlert, 
  FileText, LogOut, ArrowRight, ExternalLink 
} from 'lucide-react';
import Modal from '../../components/Modal';

export default function AdminVendors() {
  const navigate = useNavigate();

  const [pendingStores, setPendingStores] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  // Approve dialog states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  
  // Reject dialog states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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

      // Fetch pending stores (is_verified = false)
      const { data: storesList } = await supabase
        .from('stores')
        .select('*')
        .eq('is_verified', false);

      setPendingStores(storesList || []);

      // Fetch user profile mapping
      const { data: allProfiles } = await supabase.from('profiles').select('id, full_name');
      const profMap = {};
      if (allProfiles) {
        allProfiles.forEach(p => { profMap[p.id] = p.full_name; });
      }
      setProfiles(profMap);
    } catch (err) {
      console.error('Error loading admin vendors data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenApprove = (store) => {
    setSelectedStore(store);
    setApproveModalOpen(true);
  };

  const handleOpenReject = (store) => {
    setSelectedStore(store);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleApproveStore = async () => {
    if (!selectedStore) return;
    try {
      // 1. Update stores.is_verified = true
      const { error: storeErr } = await supabase
        .from('stores')
        .update({ is_verified: true })
        .eq('id', selectedStore.id);

      if (storeErr) throw storeErr;

      // 2. Update profiles.role = 'vendor'
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ role: 'vendor' })
        .eq('id', selectedStore.owner_id);

      if (profileErr) throw profileErr;

      setApproveModalOpen(false);
      fetchAdminData();
      alert(`Toko "${selectedStore.name}" telah disetujui. Akun pemilik telah diupdate menjadi Vendor.`);
    } catch (err) {
      console.error('Error approving store:', err);
      alert('Gagal menyetujui toko.');
    }
  };

  const handleRejectStore = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      // 1. Update stores with rejection reason
      const { error: storeErr } = await supabase
        .from('stores')
        .update({ 
          rejection_reason: rejectionReason || 'Dokumen KTP kurang jelas atau data tidak sesuai.'
        })
        .eq('id', selectedStore.id);

      if (storeErr) throw storeErr;

      // 2. Update profiles.is_vendor = false
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ is_vendor: false })
        .eq('id', selectedStore.owner_id);

      if (profileErr) throw profileErr;

      setRejectModalOpen(false);
      fetchAdminData();
      alert(`Permohonan toko "${selectedStore.name}" telah ditolak.`);
    } catch (err) {
      console.error('Error rejecting store:', err);
      alert('Gagal menolak permohonan.');
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
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
            <Link to="/admin/vendors" className="admin-menu-link active">
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
        <header className="admin-header mb-6">
          <h2>Verifikasi Vendor</h2>
          <p className="text-muted">Proses persetujuan pendaftaran toko outdoor baru.</p>
        </header>

        {/* Vendors Table */}
        <section className="glass-card mt-6">
          <h3>Permohonan Pending ({pendingStores.length})</h3>
          
          <div className="admin-table-container mt-4">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Pemilik</th>
                  <th>Nama Toko</th>
                  <th>Kota Pilot</th>
                  <th>Alamat Fisik</th>
                  <th>Dokumen Pendukung</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingStores.map((store) => (
                  <tr key={store.id}>
                    <td className="font-bold">{profiles[store.owner_id] || 'Loading...'}</td>
                    <td>{store.name}</td>
                    <td>
                      <span className="badge badge-orange">{store.city}</span>
                    </td>
                    <td>{store.address}</td>
                    <td>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert('KTP Terverifikasi (Simulasi)'); }} className="flex items-center gap-1 text-primary text-sm font-bold">
                        <FileText size={14} /> Lihat KTP <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenApprove(store)}
                          className="btn btn-success btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleOpenReject(store)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingStores.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">Tidak ada permohonan verifikasi pending.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* --- MODAL: APPROVE TOKO --- */}
      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Persetujuan Gerai Vendor">
        <div className="text-center">
          <Check className="text-success mb-2" size={48} />
          <h3>Setujui Toko "{selectedStore?.name}"?</h3>
          <p className="text-muted text-sm mt-2">
            Toko ini akan langsung aktif di katalog publik dan pemilik dapat mulai mengunggah alat sewa.
          </p>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setApproveModalOpen(false)} className="btn btn-secondary flex-grow">
              Batal
            </button>
            <button onClick={handleApproveStore} className="btn btn-success flex-grow">
              Ya, Setujui
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL: REJECT TOKO --- */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Penolakan Permohonan Toko">
        <form onSubmit={handleRejectStore}>
          <div className="text-center">
            <X className="text-danger mb-2" size={48} />
            <h3>Tolak Permohonan "{selectedStore?.name}"?</h3>
            <p className="text-muted text-sm mt-1">Status toko akan diset ditolak dan diubah kembali menjadi user biasa.</p>
          </div>

          <div className="form-group mt-4">
            <label className="form-label">Alasan Penolakan (Wajib/Opsional)</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Contoh: Foto KTP blur / Alamat toko fisik tidak valid..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-4 mt-6">
            <button type="button" onClick={() => setRejectModalOpen(false)} className="btn btn-secondary flex-grow">
              Batal
            </button>
            <button type="submit" className="btn btn-danger flex-grow">
              Tolak Permohonan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
