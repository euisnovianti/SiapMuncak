import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Copy, Upload, QrCode, CheckCircle, ArrowRight } from 'lucide-react';

export default function BookingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transfer');

  // Manual Transfer states
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // QRIS Countdown timer state (15 minutes in seconds = 900)
  const [timeLeft, setTimeLeft] = useState(900);
  const [timerExpired, setTimerExpired] = useState(false);

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
        }
      } catch (err) {
        console.error('Error loading payment info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // QRIS Countdown logic
  useEffect(() => {
    if (activeTab !== 'qris' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1310012345678');
    alert('Nomor Rekening berhasil disalin ke clipboard!');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleManualPaymentSubmit = async () => {
    if (!file) {
      alert('Pilihlah foto bukti transfer terlebih dahulu.');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${id}-proof-${Date.now()}.png`;
      // Upload to Supabase Storage bucket
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update booking status
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({
          status: 'menunggu_konfirmasi',
          payment_proof_url: publicUrl,
          payment_method: 'transfer'
        })
        .eq('id', id);

      if (updateErr) throw updateErr;

      navigate(`/booking/${id}/confirmation`);
    } catch (err) {
      console.error('Error submitting proof:', err);
      alert('Gagal mengirim bukti transfer. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleQRISPaymentSubmit = async () => {
    setUploading(true);
    try {
      // Simulate automatic verification or direct submission
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'menunggu_konfirmasi',
          payment_method: 'qris'
        })
        .eq('id', id);

      if (error) throw error;
      navigate(`/booking/${id}/confirmation`);
    } catch (err) {
      console.error('Error submitting QRIS payment:', err);
      alert('Gagal memproses pembayaran QRIS.');
    } finally {
      setUploading(false);
    }
  };

  const resetQRISTimer = () => {
    setTimeLeft(900);
    setTimerExpired(false);
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

  const dpAmount = booking.total_price * 0.5;

  return (
    <div className="container main-content">
      {/* Stepper */}
      <div className="stepper-container">
        <div className="stepper-line"></div>
        <div className="stepper-line-active" style={{ width: '50%' }}></div>
        
        <div className="step-item completed">
          <div className="step-circle">1</div>
          <span className="step-label">Detail Booking</span>
        </div>
        
        <div className="step-item active">
          <div className="step-circle">2</div>
          <span className="step-label">Pembayaran DP</span>
        </div>
        
        <div className="step-item">
          <div className="step-circle">3</div>
          <span className="step-label">Konfirmasi</span>
        </div>
      </div>

      <div className="payment-layout mt-6">
        <div className="payment-main-section">
          {/* Simulation alert */}
          <div className="alert alert-warning simulation-alert">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
              <h4 className="font-bold">Simulasi Pembayaran</h4>
              <p className="mt-1 text-sm">
                Ini adalah simulasi pembayaran untuk tahap pengembangan. Anda tidak perlu mengirimkan uang sungguhan. Cukup unggah foto/gambar apa saja sebagai bukti transfer, atau klik tombol simulasi di metode QRIS.
              </p>
            </div>
          </div>

          <div className="glass-card mt-4">
            <div className="tab-group">
              <button
                className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                Transfer Manual
              </button>
              <button
                className={`tab-btn ${activeTab === 'qris' ? 'active' : ''}`}
                onClick={() => setActiveTab('qris')}
              >
                QRIS
              </button>
            </div>

            {activeTab === 'transfer' ? (
              <div className="transfer-tab">
                <h3>Informasi Rekening Bank</h3>
                <p className="text-muted mt-2">Kirimkan tepat sebesar nominal DP 50% ke rekening bank di bawah ini.</p>
                
                <div className="bank-account-card mt-4">
                  <div className="bank-logo">MANDIRI</div>
                  <div className="bank-details">
                    <div className="bank-label">Nomor Rekening</div>
                    <div className="bank-value">
                      <span>131-0012-345-678</span>
                      <button onClick={handleCopyAccount} className="btn-copy">
                        <Copy size={16} /> Copy
                      </button>
                    </div>
                    <div className="bank-label mt-2">Atas Nama</div>
                    <div className="bank-value font-bold">PT Siap Muncak Indonesia</div>
                  </div>
                </div>

                <div className="amount-card mt-4">
                  <div className="text-muted">Jumlah Transfer (DP 50%)</div>
                  <div className="amount-value text-primary font-bold">{formatRupiah(dpAmount)}</div>
                </div>

                <div className="upload-section mt-6">
                  <label className="form-label">Unggah Bukti Transfer</label>
                  <div
                    className="drag-drop-zone"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {filePreview ? (
                      <div className="preview-container">
                        <img src={filePreview} alt="Bukti Transfer" className="preview-image" />
                        <p className="text-sm mt-2 text-success">Bukti transfer terpilih! Klik area ini untuk mengubah.</p>
                      </div>
                    ) : (
                      <div className="zone-content">
                        <Upload size={36} className="text-muted mb-2" />
                        <p className="font-bold">Seret & Letakkan gambar bukti transfer di sini</p>
                        <p className="text-muted text-sm mt-1">atau klik untuk memilih file dari komputer Anda (JPG/PNG)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden-file-input"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleManualPaymentSubmit}
                  className="btn btn-primary btn-block mt-6"
                  disabled={uploading || !file}
                >
                  {uploading ? 'Mengunggah Bukti...' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            ) : (
              <div className="qris-tab text-center">
                <h3>Pembayaran QRIS</h3>
                <p className="text-muted mt-2">Scan QR Code di bawah menggunakan aplikasi e-wallet atau mobile banking Anda.</p>

                <div className="qris-qr-container mt-6">
                  {timerExpired ? (
                    <div className="qris-expired">
                      <AlertTriangle size={36} className="text-danger" />
                      <h4 className="mt-2">Waktu Pembayaran Habis</h4>
                      <p className="text-muted text-sm mt-1">QR Code telah kedaluwarsa. Silakan perbarui.</p>
                      <button onClick={resetQRISTimer} className="btn btn-secondary btn-sm mt-4">
                        Perbarui QR
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="qris-qr-frame">
                        {/* Static SVG QR Code to feel extremely premium */}
                        <svg viewBox="0 0 100 100" className="qris-svg">
                          <rect width="100" height="100" fill="#fff" />
                          {/* Outer markers */}
                          <rect x="10" y="10" width="20" height="20" fill="#000" />
                          <rect x="13" y="13" width="14" height="14" fill="#fff" />
                          <rect x="15" y="15" width="10" height="10" fill="#000" />

                          <rect x="70" y="10" width="20" height="20" fill="#000" />
                          <rect x="73" y="13" width="14" height="14" fill="#fff" />
                          <rect x="75" y="15" width="10" height="10" fill="#000" />

                          <rect x="10" y="70" width="20" height="20" fill="#000" />
                          <rect x="13" y="73" width="14" height="14" fill="#fff" />
                          <rect x="15" y="75" width="10" height="10" fill="#000" />
                          
                          {/* Inner dummy pixels */}
                          <rect x="35" y="15" width="5" height="10" fill="#000" />
                          <rect x="45" y="10" width="10" height="5" fill="#000" />
                          <rect x="50" y="20" width="15" height="5" fill="#000" />
                          <rect x="15" y="35" width="5" height="15" fill="#000" />
                          <rect x="25" y="45" width="10" height="5" fill="#000" />
                          <rect x="40" y="40" width="20" height="20" fill="#000" />
                          <rect x="35" y="55" width="15" height="10" fill="#000" />
                          <rect x="65" y="35" width="10" height="15" fill="#000" />
                          <rect x="75" y="50" width="15" height="10" fill="#000" />
                          <rect x="55" y="70" width="10" height="15" fill="#000" />
                          <rect x="70" y="75" width="5" height="10" fill="#000" />
                        </svg>
                      </div>
                      
                      <div className="countdown-timer mt-4">
                        <div className="timer-val">{formatTime(timeLeft)}</div>
                        <div className="text-muted text-sm mt-1">Sisa waktu pembayaran QRIS</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="amount-card mt-6">
                  <div className="text-muted">Total Bayar (DP 50%)</div>
                  <div className="amount-value text-primary font-bold">{formatRupiah(dpAmount)}</div>
                </div>

                <button
                  onClick={handleQRISPaymentSubmit}
                  className="btn btn-primary btn-block mt-6"
                  disabled={uploading || timerExpired}
                >
                  {uploading ? 'Memproses...' : 'Saya Sudah Bayar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side order preview */}
        <div className="payment-sidebar">
          <div className="glass-card">
            <h3>Rincian Pembayaran</h3>
            <div className="sidebar-product-info mt-4">
              <img
                src={equipment.images?.[0] || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80'}
                alt={equipment.name}
              />
              <div>
                <h4>{equipment.name}</h4>
                <div className="text-muted text-sm mt-1">Durasi: {booking.duration} hari</div>
              </div>
            </div>

            <div className="filter-divider"></div>

            <div className="cost-breakdown-box">
              <div className="cost-row">
                <span>Total Biaya</span>
                <span>{formatRupiah(booking.total_price)}</span>
              </div>
              <div className="cost-row mt-2 font-bold text-primary">
                <span>Nilai DP (50%)</span>
                <span>{formatRupiah(dpAmount)}</span>
              </div>
              <div className="cost-row mt-2 text-muted text-sm">
                <span>Sisa Pelunasan (di toko/saat tiba)</span>
                <span>{formatRupiah(booking.total_price - dpAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .payment-layout {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }

        .payment-main-section {
          flex: 1.8;
        }

        .payment-sidebar {
          flex: 1;
        }

        .simulation-alert h4 {
          color: #fbbf24;
        }

        /* Bank Account Card */
        .bank-account-card {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-sm);
          padding: 20px;
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .bank-logo {
          background-color: #1e3a8a;
          color: #fff;
          font-weight: 800;
          font-family: var(--font-heading);
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 1.1rem;
        }

        .bank-details {
          flex: 1;
        }

        .bank-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .bank-value {
          font-size: 1.1rem;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 2px;
        }

        .btn-copy {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .btn-copy:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--color-primary);
        }

        .amount-card {
          background-color: rgba(255, 107, 53, 0.05);
          border: 1px dashed var(--color-primary-hover);
          padding: 16px;
          border-radius: var(--border-radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .amount-value {
          font-size: 1.4rem;
        }

        /* Drag drop zone */
        .drag-drop-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--border-radius-sm);
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.01);
          transition: all 0.25s ease;
        }
        .drag-drop-zone:hover {
          border-color: var(--color-primary);
          background-color: rgba(255, 107, 53, 0.02);
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .preview-image {
          max-height: 200px;
          border-radius: 4px;
          box-shadow: var(--shadow-sm);
        }

        /* QRIS Tab */
        .qris-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }

        .qris-qr-frame {
          width: 200px;
          height: 200px;
          border: 4px solid var(--color-primary);
          border-radius: 12px;
          padding: 8px;
          background-color: #fff;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
        }

        .qris-svg {
          width: 100%;
          height: 100%;
        }

        .countdown-timer {
          text-align: center;
        }

        .timer-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-warning);
          font-family: var(--font-heading);
          letter-spacing: 1px;
        }

        .qris-expired {
          padding: 40px 20px;
        }

        @media (max-width: 768px) {
          .payment-layout {
            flex-direction: column;
          }
          .payment-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
