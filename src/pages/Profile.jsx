import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CATEGORIES, CITIES } from '../lib/mockData';
import { 
  User, Mail, Phone, Calendar, ShoppingBag, Store, Plus, 
  Edit, Trash, Camera, QrCode, ClipboardCheck, Play, 
  MapPin, CheckCircle, Package, Send, RefreshCw, Star, Trash2
} from 'lucide-react';
import Modal from '../components/Modal';
import jsQR from 'jsqr';

export default function Profile() {
  const navigate = useNavigate();

  // Authentication states
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active tab inside Profile
  const [activeTab, setActiveTab] = useState('orders');

  // Customer states
  const [myBookings, setMyBookings] = useState([]);
  const [equipmentsMap, setEquipmentsMap] = useState({});
  const [storesMap, setStoresMap] = useState({});

  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [reviewEquipmentId, setReviewEquipmentId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Store registration states (Buka Toko)
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeCity, setStoreCity] = useState('Bandung');
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  // Vendor Equipment states (Kelola Alat)
  const [vendorEquipments, setVendorEquipments] = useState([]);
  const [eqModalOpen, setEqModalOpen] = useState(false);
  const [eqEditingId, setEqEditingId] = useState(null); // null means adding
  const [eqName, setEqName] = useState('');
  const [eqDesc, setEqDesc] = useState('');
  const [eqPrice, setEqPrice] = useState('');
  const [eqStock, setEqStock] = useState('');
  const [eqCategory, setEqCategory] = useState('Tenda');
  const [eqImages, setEqImages] = useState([]);
  const [eqUploading, setEqUploading] = useState(false);

  // Vendor Incoming Bookings states (Pesanan Masuk)
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [profilesMap, setProfilesMap] = useState({});
  const [shippingResiMap, setShippingResiMap] = useState({});

  // QR Code Scanner states
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrScannerBookingId, setQrScannerBookingId] = useState('');
  const [manualQrToken, setManualQrToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Fetch initial profile & check session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfileAndStore(session.user.id);
        fetchCustomerData(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfileAndStore(session.user.id);
        fetchCustomerData(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
      stopScanner();
    };
  }, []);

  // Fetch profiles, stores, and equipment lists on tab switches
  useEffect(() => {
    if (session && activeTab === 'manage') {
      fetchVendorEquipment();
    } else if (session && activeTab === 'incoming') {
      fetchIncomingBookings();
    }
  }, [activeTab, session, store]);

  const fetchProfileAndStore = async (userId) => {
    setLoading(true);
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(prof);

      if (prof?.is_vendor) {
        const { data: st } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();
        setStore(st);
      }
    } catch (err) {
      console.error('Error fetching profiles/stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerData = async (userId) => {
    try {
      // Fetch customer's own bookings
      const { data: bookingsList } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      setMyBookings(bookingsList || []);

      // Fetch helper metadata
      const { data: eqList } = await supabase.from('equipment').select('*');
      const eqMap = {};
      if (eqList) {
        eqList.forEach((e) => { eqMap[e.id] = e; });
      }
      setEquipmentsMap(eqMap);

      const { data: stList } = await supabase.from('stores').select('*');
      const stMap = {};
      if (stList) {
        stList.forEach((s) => { stMap[s.id] = s; });
      }
      setStoresMap(stMap);
    } catch (err) {
      console.error('Error loading customer data:', err);
    }
  };

  const fetchVendorEquipment = async () => {
    if (!store) return;
    try {
      const { data } = await supabase
        .from('equipment')
        .select('*')
        .eq('store_id', store.id);
      setVendorEquipments(data || []);
    } catch (err) {
      console.error('Error loading vendor inventory:', err);
    }
  };

  const fetchIncomingBookings = async () => {
    if (!store) return;
    try {
      // Get all bookings related to this store
      const { data: bookingsList } = await supabase
        .from('bookings')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      setIncomingBookings(bookingsList || []);

      // Fetch user profile names
      const { data: usersList } = await supabase.from('profiles').select('id, full_name');
      const uMap = {};
      if (usersList) {
        usersList.forEach((u) => { uMap[u.id] = u.full_name; });
      }
      setProfilesMap(uMap);
    } catch (err) {
      console.error('Error loading incoming bookings:', err);
    }
  };

  // --- ACTION: BUKA TOKO (Fase 2.1) ---
  const handleRegisterStore = async (e) => {
    e.preventDefault();
    setStoreSubmitting(true);
    try {
      // Create store record
      const { data: newStore, error: storeErr } = await supabase
        .from('stores')
        .insert({
          owner_id: session.user.id,
          name: storeName,
          address: storeAddress,
          description: storeDesc,
          city: storeCity,
          is_verified: false // Admin must approve
        })
        .select()
        .single();

      if (storeErr) throw storeErr;

      // Update profile status
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          is_vendor: true
        })
        .eq('id', session.user.id);

      if (profileErr) throw profileErr;

      // Reload
      setStore(newStore);
      setProfile((prev) => ({ ...prev, is_vendor: true }));
      setStoreModalOpen(false);
      alert('Pendaftaran Toko Berhasil! Menunggu proses verifikasi oleh Admin sebelum Anda dapat mengunggah alat sewa.');
    } catch (err) {
      console.error('Error registering store:', err);
      alert('Gagal mendaftarkan toko.');
    } finally {
      setStoreSubmitting(false);
    }
  };

  // --- ACTION: EDIT & ADD EQUIPMENT (Fase 2.2) ---
  const handleOpenAddEq = () => {
    setEqEditingId(null);
    setEqName('');
    setEqDesc('');
    setEqPrice('');
    setEqStock('');
    setEqCategory('Tenda');
    setEqImages([]);
    setEqModalOpen(true);
  };

  const handleOpenEditEq = (eq) => {
    setEqEditingId(eq.id);
    setEqName(eq.name);
    setEqDesc(eq.description);
    setEqPrice(eq.price_per_day);
    setEqStock(eq.total_stock);
    setEqCategory(eq.category);
    setEqImages(eq.images || []);
    setEqModalOpen(true);
  };

  const handleEqPhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length + eqImages.length > 5) {
      alert('Maksimal foto terunggah adalah 5.');
      return;
    }

    setEqUploading(true);
    const uploadedUrls = [...eqImages];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${store.id}-eq-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        // Upload to equipment-photos
        const { error: uploadErr } = await supabase.storage
          .from('equipment-photos')
          .upload(fileName, file);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('equipment-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }
      setEqImages(uploadedUrls);
    } catch (err) {
      console.error('Error uploading product photos:', err);
      alert('Gagal mengunggah foto.');
    } finally {
      setEqUploading(false);
    }
  };

  const handleRemoveEqPhoto = (index) => {
    setEqImages(eqImages.filter((_, i) => i !== index));
  };

  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    if (eqImages.length === 0) {
      alert('Unggah minimal 1 foto produk.');
      return;
    }

    try {
      const eqPayload = {
        name: eqName,
        description: eqDesc,
        price_per_day: Number(eqPrice),
        total_stock: Number(eqStock),
        stok_tersedia: Number(eqStock), // initial equals total
        category: eqCategory,
        images: eqImages,
        store_id: store.id
      };

      if (eqEditingId) {
        // Edit mode
        // Fetch current to adjust stok_tersedia if total_stock is changed
        const { data: current } = await supabase
          .from('equipment')
          .select('total_stock', 'stok_tersedia')
          .eq('id', eqEditingId)
          .single();

        const diff = Number(eqStock) - current.total_stock;
        eqPayload.stok_tersedia = Math.max(0, current.stok_tersedia + diff);

        const { error } = await supabase
          .from('equipment')
          .update(eqPayload)
          .eq('id', eqEditingId);
        
        if (error) throw error;
      } else {
        // Create mode
        const { error } = await supabase
          .from('equipment')
          .insert(eqPayload);
        
        if (error) throw error;
      }

      setEqModalOpen(false);
      fetchVendorEquipment();
    } catch (err) {
      console.error('Error saving equipment:', err);
      alert('Gagal menyimpan peralatan.');
    }
  };

  const handleDeleteEquipment = async (eqId) => {
    if (!window.confirm('Yakin ingin menghapus alat ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', eqId);
      if (error) throw error;
      fetchVendorEquipment();
    } catch (err) {
      console.error('Error deleting equipment:', err);
      alert('Gagal menghapus peralatan.');
    }
  };

  // --- ACTION: PROSES PESANAN MASUK (Fase 2.3) ---
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      // If status is 'selesai', we need to increment stock
      if (newStatus === 'selesai') {
        const { data: b } = await supabase
          .from('bookings')
          .select('equipment_id')
          .eq('id', bookingId)
          .single();
        
        const { data: eq } = await supabase
          .from('equipment')
          .select('stok_tersedia')
          .eq('id', b.equipment_id)
          .single();

        await supabase
          .from('equipment')
          .update({ stok_tersedia: eq.stok_tersedia + 1 })
          .eq('id', b.equipment_id);
      } else if (newStatus === 'diambil') {
        // Taken by user, decrement available stock
        const { data: b } = await supabase
          .from('bookings')
          .select('equipment_id')
          .eq('id', bookingId)
          .single();
        
        const { data: eq } = await supabase
          .from('equipment')
          .select('stok_tersedia')
          .eq('id', b.equipment_id)
          .single();

        await supabase
          .from('equipment')
          .update({ stok_tersedia: Math.max(0, eq.stok_tersedia - 1) })
          .eq('id', b.equipment_id);
      }

      fetchIncomingBookings();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal merubah status.');
    }
  };

  const handleInputResiChange = (bookingId, val) => {
    setShippingResiMap({ ...shippingResiMap, [bookingId]: val });
  };

  const handleSendPackage = async (bookingId) => {
    const resi = shippingResiMap[bookingId];
    if (!resi) {
      alert('Masukkan nomor resi terlebih dahulu.');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'dikirim',
          nomor_resi: resi
        })
        .eq('id', bookingId);

      if (error) throw error;

      fetchIncomingBookings();
    } catch (err) {
      console.error('Error sending package:', err);
      alert('Gagal mengirim paket.');
    }
  };

  // --- ACTION: QR CODE SCANNER & VERIFICATION ---
  const handleOpenQRScanner = (bookingId) => {
    setQrScannerBookingId(bookingId);
    setQrModalOpen(true);
    setScanning(true);
    setManualQrToken('');
    setTimeout(startScanner, 100);
  };

  const startScanner = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', true);
      videoRef.current.play();
      requestAnimationFrame(scanQRCodeTick);
    } catch (err) {
      console.warn('Camera blocked or unavailable:', err);
      // Let scanning state stay, manual fallback will work
    }
  };

  const scanQRCodeTick = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code) {
        try {
          const parsed = JSON.parse(code.data);
          if (parsed.booking_id && parsed.verification_token) {
            verifyQRToken(parsed.booking_id, parsed.verification_token);
            return;
          }
        } catch (e) {
          console.warn('QR Code scan error:', e);
        }
      }
    }

    if (scanning) {
      animationFrameRef.current = requestAnimationFrame(scanQRCodeTick);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const verifyQRToken = async (bookingId, token) => {
    stopScanner();
    setQrModalOpen(false);

    if (String(bookingId) !== String(qrScannerBookingId)) {
      alert('QR Code tidak valid. QR Code ini untuk transaksi booking lain.');
      return;
    }

    try {
      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (b && String(b.verification_token) === String(token)) {
        await handleUpdateStatus(bookingId, 'diambil');
        alert('QR Valid — Barang berhasil diserahkan!');
      } else {
        alert('QR tidak valid. Minta penyewa untuk menampilkan QR yang benar.');
      }
    } catch (err) {
      console.error('QR verification failed:', err);
      alert('Proses validasi QR Code gagal.');
    }
  };

  const handleManualTokenSubmit = (e) => {
    e.preventDefault();
    if (!manualQrToken) return;
    // Format could be token-XXXXX or just XXXXX
    const token = manualQrToken.toUpperCase();
    verifyQRToken(qrScannerBookingId, token.startsWith('TOKEN-') ? token : `TOKEN-${token}`);
  };

  // --- ACTION: WRITE REVIEWS (Fase 2.3) ---
  const handleOpenReview = (bookingId, eqId) => {
    setReviewBookingId(bookingId);
    setReviewEquipmentId(eqId);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      // Save review
      const { error: revErr } = await supabase
        .from('reviews')
        .insert({
          booking_id: reviewBookingId,
          user_id: session.user.id,
          equipment_id: reviewEquipmentId,
          rating: reviewRating,
          comment: reviewComment
        });

      if (revErr) throw revErr;

      // Update average rating on equipment
      const { data: eq } = await supabase
        .from('equipment')
        .select('rating, reviews_count')
        .eq('id', reviewEquipmentId)
        .single();

      const newCount = (eq.reviews_count || 0) + 1;
      const newRating = Number((((eq.rating || 4.5) * (eq.reviews_count || 0) + reviewRating) / newCount).toFixed(1));

      await supabase
        .from('equipment')
        .update({
          rating: newRating,
          reviews_count: newCount
        })
        .eq('id', reviewEquipmentId);

      setReviewModalOpen(false);
      fetchCustomerData(session.user.id);
      alert('Terima kasih! Ulasan Anda berhasil disimpan.');
    } catch (err) {
      console.error('Error saving review:', err);
      alert('Gagal menyimpan ulasan.');
    }
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
    <div className="container main-content">
      <div className="profile-layout">
        {/* Sidebar Nav */}
        <aside className="profile-sidebar glass-card">
          <div className="profile-user-card">
            <div className="avatar-placeholder">
              <User size={32} />
            </div>
            <h4>{profile?.full_name}</h4>
            <span className="badge badge-muted mt-1">{profile?.role.toUpperCase()}</span>
          </div>

          <div className="filter-divider"></div>

          <ul className="profile-menu">
            <li>
              <button
                className={`profile-menu-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag size={18} />
                Pesanan Saya
              </button>
            </li>
            
            {profile?.is_vendor && (
              <>
                <li className="menu-header">VENDOR PANEL</li>
                {store?.is_verified ? (
                  <>
                    <li>
                      <button
                        className={`profile-menu-btn ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                      >
                        <RefreshCw size={18} />
                        Kelola Alat
                      </button>
                    </li>
                    <li>
                      <button
                        className={`profile-menu-btn ${activeTab === 'incoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('incoming')}
                      >
                        <Package size={18} />
                        Pesanan Masuk
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <div className="unverified-badge text-warning text-sm">
                      <Store size={16} />
                      Menunggu Verifikasi Toko
                    </div>
                  </li>
                )}
              </>
            )}
          </ul>
        </aside>

        {/* Content Section */}
        <main className="profile-content">
          {/* Tab: Orders (Pesanan Saya) */}
          {activeTab === 'orders' && (
            <div className="orders-panel">
              <h2 className="panel-title">Riwayat Penyewaan</h2>
              
              {/* Promo Banner Buka Toko */}
              {!profile?.is_vendor && (
                <div className="store-promo-banner glass-card mt-4">
                  <div className="promo-illustration">
                    <Store className="promo-store-icon" />
                  </div>
                  <div className="promo-text-col">
                    <h3>Punya alat hiking nganggur?</h3>
                    <p className="text-muted mt-1">
                      Buka Toko dan mulai sewakan! Dapatkan penghasilan tambahan dengan menyewakan tenda, carrier, atau sleeping bag Anda ke komunitas pendaki.
                    </p>
                    <button onClick={() => setStoreModalOpen(true)} className="btn btn-primary btn-sm mt-3">
                      Buka Toko Sekarang
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting verification info */}
              {profile?.is_vendor && !store?.is_verified && (
                <div className="alert alert-warning mt-4">
                  <Store size={24} className="flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Pendaftaran Toko Berhasil!</h4>
                    <p className="text-sm mt-1">
                      Toko Anda (<strong>{store?.name}</strong>) sedang dalam proses verifikasi oleh Admin sebelum Anda dapat mengunggah alat sewa. Silakan menunggu.
                    </p>
                  </div>
                </div>
              )}

              {/* Bookings List */}
              {myBookings.length === 0 ? (
                <div className="empty-panel glass-card mt-4">
                  <ShoppingBag size={48} className="text-muted" />
                  <h3>Belum Ada Transaksi</h3>
                  <p className="text-muted mt-2">Anda belum melakukan booking alat outdoor apapun.</p>
                  <button onClick={() => navigate('/catalog')} className="btn btn-primary mt-4">Jelajahi Katalog</button>
                </div>
              ) : (
                <div className="bookings-list-container mt-4">
                  {myBookings.map((b) => {
                    const eq = equipmentsMap[b.equipment_id];
                    const st = storesMap[b.store_id];
                    return (
                      <div key={b.id} className="booking-card-row glass-card">
                        <div className="booking-row-header flex justify-between">
                          <span className="text-muted text-sm">ID: {b.id.substring(0, 8)}</span>
                          <span className={`badge ${
                            b.status === 'selesai' ? 'badge-success' :
                            b.status === 'dibatalkan' ? 'badge-danger' :
                            b.status === 'menunggu_konfirmasi' ? 'badge-warning' : 'badge-orange'
                          }`}>
                            {b.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="booking-row-body mt-3">
                          <img
                            src={eq?.images?.[0] || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80'}
                            alt={eq?.name}
                            className="row-img"
                          />
                          <div className="row-info">
                            <h4>{eq?.name}</h4>
                            <div className="text-sm text-muted mt-1">Disediakan oleh: {st?.name}</div>
                            <div className="text-sm mt-1">
                              <strong>Tanggal Sewa:</strong> {b.start_date} s/d {b.end_date} ({b.duration} hari)
                            </div>
                            <div className="text-sm mt-1">
                              <strong>Metode:</strong> {b.delivery_method.toUpperCase()}
                            </div>
                            {b.delivery_method === 'delivery' && b.nomor_resi && (
                              <div className="text-sm text-success mt-1">
                                <strong>No Resi:</strong> {b.nomor_resi}
                              </div>
                            )}
                          </div>
                          <div className="row-price text-right">
                            <span className="text-muted text-sm">Total Bayar:</span>
                            <span className="price font-bold text-primary block">{formatRupiah(b.total_price)}</span>
                          </div>
                        </div>

                        {/* Review trigger */}
                        {b.status === 'selesai' && (
                          <div className="booking-row-footer mt-4 text-right">
                            <button
                              onClick={() => handleOpenReview(b.id, b.equipment_id)}
                              className="btn btn-primary btn-sm btn-outline"
                            >
                              <Star size={14} /> Tulis Ulasan
                            </button>
                          </div>
                        )}

                        {/* Verification token display for pickup */}
                        {b.status === 'siap_diambil' && b.delivery_method === 'pickup' && (
                          <div className="booking-row-footer alert alert-info mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <QrCode size={18} />
                              <span className="text-sm">Tunjukkan QR Code di halaman konfirmasi atau sebutkan Token: <strong>{b.verification_token}</strong></span>
                            </div>
                            <Link to={`/booking/${b.id}/confirmation`} className="btn btn-primary btn-sm">Lihat QR</Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Kelola Alat (Vendor Inventory) */}
          {activeTab === 'manage' && store?.is_verified && (
            <div className="manage-panel">
              <div className="flex justify-between items-center mb-4">
                <h2>Kelola Inventaris Alat</h2>
                <button onClick={handleOpenAddEq} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Tambah Alat Baru
                </button>
              </div>

              {vendorEquipments.length === 0 ? (
                <div className="empty-panel glass-card">
                  <Store size={48} className="text-muted" />
                  <h3>Belum Ada Inventaris</h3>
                  <p className="text-muted mt-2">Anda belum mengunggah peralatan outdoor untuk disewakan.</p>
                  <button onClick={handleOpenAddEq} className="btn btn-primary mt-4">Tambah Alat Pertama</button>
                </div>
              ) : (
                <div className="inventory-grid mt-4">
                  {vendorEquipments.map((eq) => (
                    <div key={eq.id} className="inventory-card glass-card">
                      <div className="inv-img-frame">
                        <img src={eq.images?.[0] || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80'} alt={eq.name} />
                      </div>
                      <div className="inv-info mt-3">
                        <span className="badge badge-muted">{eq.category}</span>
                        <h4 className="mt-2">{eq.name}</h4>
                        <div className="text-primary font-bold mt-1">{formatRupiah(eq.price_per_day)}/hari</div>
                        <div className="text-muted text-sm mt-1">Stok Total: {eq.total_stock} | Tersedia: {eq.stok_tersedia}</div>
                      </div>
                      <div className="inv-actions mt-4 flex gap-2">
                        <button onClick={() => handleOpenEditEq(eq)} className="btn btn-secondary btn-sm flex-grow">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeleteEquipment(eq.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Pesanan Masuk (Vendor incoming orders) */}
          {activeTab === 'incoming' && store?.is_verified && (
            <div className="incoming-panel">
              <h2>Pesanan Masuk</h2>
              
              {incomingBookings.length === 0 ? (
                <div className="empty-panel glass-card mt-4">
                  <Package size={48} className="text-muted" />
                  <h3>Belum Ada Pesanan</h3>
                  <p className="text-muted mt-2">Toko Anda belum menerima order persewaan.</p>
                </div>
              ) : (
                <div className="incoming-list mt-4">
                  {incomingBookings.map((b) => {
                    const eq = equipmentsMap[b.equipment_id];
                    const userName = profilesMap[b.user_id] || 'Customer';
                    return (
                      <div key={b.id} className="incoming-card-row glass-card">
                        <div className="incoming-row-header flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-sm">Penyewa: {userName}</span>
                            <span className="text-muted text-sm">| ID Booking: {b.id.substring(0, 8)}</span>
                          </div>
                          <span className={`badge ${
                            b.status === 'selesai' ? 'badge-success' :
                            b.status === 'dibatalkan' ? 'badge-danger' :
                            b.status === 'menunggu_konfirmasi' ? 'badge-warning' : 'badge-orange'
                          }`}>
                            {b.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="incoming-row-body mt-3">
                          <div className="row-text">
                            <h4>{eq?.name}</h4>
                            <div className="text-sm mt-1">
                              <strong>Tanggal Sewa:</strong> {b.start_date} s/d {b.end_date} ({b.duration} hari)
                            </div>
                            <div className="text-sm mt-1">
                              <strong>Total Bayar:</strong> {formatRupiah(b.total_price)}
                            </div>
                            <div className="text-sm mt-1">
                              <strong>Metode Pengambilan:</strong> {b.delivery_method.toUpperCase()}
                            </div>
                            {b.delivery_method === 'delivery' && (
                              <div className="shipping-address-summary mt-2 text-sm">
                                <strong>Alamat Kirim:</strong> {b.shipping_address?.name} - {b.shipping_address?.phone}<br/>
                                {b.shipping_address?.address}, {b.shipping_address?.city}, {b.shipping_address?.postal_code}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons based on status */}
                          <div className="row-action-col text-right">
                            {b.status === 'menunggu_konfirmasi' && (
                              <div className="flex flex-col gap-2 items-end">
                                {b.payment_proof_url && (
                                  <a href={b.payment_proof_url} target="_blank" rel="noopener noreferrer" className="proof-link text-sm flex items-center gap-1 mb-2 text-primary font-bold">
                                    Lihat Bukti Transfer <ExternalLink size={14} />
                                  </a>
                                )}
                                
                                <button
                                  onClick={() => handleUpdateStatus(b.id, 'dikonfirmasi')}
                                  className="btn btn-success btn-sm"
                                >
                                  Konfirmasi Pembayaran
                                </button>
                              </div>
                            )}

                            {b.status === 'dikonfirmasi' && (
                              <>
                                {b.delivery_method === 'pickup' ? (
                                  <button
                                    onClick={() => handleUpdateStatus(b.id, 'siap_diambil')}
                                    className="btn btn-primary btn-sm"
                                  >
                                    <Package size={14} /> Siapkan Barang
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateStatus(b.id, 'diproses')}
                                    className="btn btn-primary btn-sm"
                                  >
                                    <Package size={14} /> Proses Paket
                                  </button>
                                )}
                              </>
                            )}

                            {b.status === 'siap_diambil' && b.delivery_method === 'pickup' && (
                              <button
                                onClick={() => handleOpenQRScanner(b.id)}
                                className="btn btn-primary btn-sm"
                              >
                                <QrCode size={14} /> Scan QR Pelanggan
                              </button>
                            )}

                            {b.status === 'diproses' && b.delivery_method === 'delivery' && (
                              <div className="flex gap-2 items-center justify-end">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  style={{ maxWidth: '200px' }}
                                  placeholder="Input Nomor Resi"
                                  value={shippingResiMap[b.id] || ''}
                                  onChange={(e) => handleInputResiChange(b.id, e.target.value)}
                                />
                                <button
                                  onClick={() => handleSendPackage(b.id)}
                                  className="btn btn-primary btn-sm"
                                >
                                  <Send size={14} /> Kirim Paket
                                </button>
                              </div>
                            )}

                            {(b.status === 'diambil' || b.status === 'dikirim') && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'selesai')}
                                className="btn btn-success btn-sm"
                              >
                                <ClipboardCheck size={14} /> Selesai (Dikembalikan)
                              </button>
                            )}

                            {b.status === 'selesai' && (
                              <span className="text-success font-bold flex items-center gap-1 justify-end">
                                <CheckCircle size={16} /> Transaksi Selesai
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL: BUKA TOKO (Fase 2.1) --- */}
      <Modal isOpen={storeModalOpen} onClose={() => setStoreModalOpen(false)} title="Pendaftaran Gerai Vendor">
        <form onSubmit={handleRegisterStore}>
          <div className="form-group">
            <label className="form-label">Nama Toko</label>
            <input
              type="text"
              className="form-control"
              placeholder="Contoh: Eiger Bandung Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Singkat Toko</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Jelaskan jenis perlengkapan outdoor yang disewakan..."
              value={storeDesc}
              onChange={(e) => setStoreDesc(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Kota Operasional</label>
            <select
              className="form-control"
              value={storeCity}
              onChange={(e) => setStoreCity(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Fisik Toko</label>
            <input
              type="text"
              className="form-control"
              placeholder="Masukkan alamat lengkap toko fisik"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block mt-4"
            disabled={storeSubmitting}
          >
            {storeSubmitting ? 'Mendaftarkan Toko...' : 'Daftar Sebagai Vendor'}
          </button>
        </form>
      </Modal>

      {/* --- MODAL: TAMBAH / EDIT ALAT (Fase 2.2) --- */}
      <Modal isOpen={eqModalOpen} onClose={() => setEqModalOpen(false)} title={eqEditingId ? 'Edit Alat Hiking' : 'Tambah Alat Hiking Baru'}>
        <form onSubmit={handleSaveEquipment}>
          <div className="form-group">
            <label className="form-label">Nama Alat</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nama Lengkap Alat"
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Lengkap Alat</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Jelaskan spesifikasi dan kelebihan alat..."
              value={eqDesc}
              onChange={(e) => setEqDesc(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Harga Sewa / Hari</label>
              <input
                type="number"
                className="form-control"
                placeholder="Rupiah"
                value={eqPrice}
                onChange={(e) => setEqPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah Total Stok</label>
              <input
                type="number"
                className="form-control"
                placeholder="Pcs"
                value={eqStock}
                onChange={(e) => setEqStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kategori Alat</label>
            <select
              className="form-control"
              value={eqCategory}
              onChange={(e) => setEqCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Unggah Foto Alat (Maks 5)</label>
            <input
              type="file"
              multiple
              className="form-control"
              accept="image/*"
              onChange={handleEqPhotoUpload}
              disabled={eqImages.length >= 5 || eqUploading}
            />
            {eqUploading && <p className="text-sm mt-1 text-primary">Sedang mengunggah foto...</p>}
            
            <div className="uploaded-thumbnails mt-3">
              {eqImages.map((url, idx) => (
                <div key={idx} className="thumb-preview">
                  <img src={url} alt={`preview-${idx}`} />
                  <button type="button" onClick={() => handleRemoveEqPhoto(idx)} className="btn-remove-thumb">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block mt-4"
          >
            Simpan Alat
          </button>
        </form>
      </Modal>

      {/* --- MODAL: WRITE REVIEWS (Fase 2.3) --- */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Tulis Ulasan Alat">
        <form onSubmit={handleSaveReview}>
          <div className="form-group">
            <label className="form-label">Rating Bintang (1 - 5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="star-rating-btn"
                  style={{ color: star <= reviewRating ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
                >
                  <Star fill={star <= reviewRating ? 'currentColor' : 'none'} size={28} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Komentar & Ulasan</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Ceritakan pengalaman Anda menyewa alat ini..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block mt-4"
          >
            Kirim Ulasan
          </button>
        </form>
      </Modal>

      {/* --- MODAL: QR CODE SCANNER (Fase 2.3) --- */}
      <Modal isOpen={qrModalOpen} onClose={stopScanner} title="Scan QR Code Pelanggan">
        <div className="qr-scanner-box text-center">
          <p className="text-muted text-sm mb-4">Arahkan kamera ke QR Code transaksi penyewa.</p>
          
          <div className="video-viewport">
            <video ref={videoRef} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Manual Input Fallback */}
          <div className="filter-divider"></div>
          
          <form onSubmit={handleManualTokenSubmit} className="manual-token-form mt-4">
            <label className="form-label">Atau Masukkan Token Verifikasi Manual</label>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: TOKEN-XXXX"
                value={manualQrToken}
                onChange={(e) => setManualQrToken(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Verifikasi
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
