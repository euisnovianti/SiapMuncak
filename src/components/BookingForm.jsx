import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Phone, ShoppingBag, ClipboardList, Info, CheckCircle2 } from 'lucide-react';
import { products } from '../data/products';

export default function BookingForm({ prepopulatedProduct, onBookingSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productId: '',
    startDate: '',
    duration: 1,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  // Handle prepopulation from product card click
  useEffect(() => {
    if (prepopulatedProduct) {
      setFormData((prev) => ({
        ...prev,
        productId: prepopulatedProduct.id
      }));

      // Scroll to booking form automatically
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = bookingSection.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [prepopulatedProduct]);

  // Find active product specs
  const selectedProduct = products.find((p) => p.id === formData.productId);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleStepDuration = (amount) => {
    setFormData((prev) => {
      const nextVal = prev.duration + amount;
      if (nextVal >= 1 && nextVal <= 14) {
        return { ...prev, duration: nextVal };
      }
      return prev;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    else if (formData.name.trim().length < 3) newErrors.name = 'Nama harus minimal 3 karakter';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = 'Alamat email wajib diisi';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Format email tidak valid';

    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Nomor telepon minimal 10 digit';

    if (!formData.productId) newErrors.productId = 'Silakan pilih alat yang ingin disewa';
    if (!formData.startDate) newErrors.startDate = 'Pilih tanggal mulai sewa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Mock API Call delay
    setTimeout(() => {
      setIsSubmitting(false);
      const code = 'SM-' + Math.floor(100000 + Math.random() * 900000);
      setBookingCode(code);
      setShowSuccess(true);
      if (onBookingSuccess) {
        onBookingSuccess();
      }
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        productId: '',
        startDate: '',
        duration: 1,
        notes: ''
      });
    }, 1800);
  };

  // Calculate calculations
  const pricePerDay = selectedProduct ? selectedProduct.pricePerDay : 0;
  const totalPrice = pricePerDay * formData.duration;
  const downPayment = totalPrice * 0.5;

  return (
    <section id="booking" className="py-24 bg-forest-950 text-white relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-forest-800 rounded-full filter blur-3xl opacity-20" />
      <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Left Column */}
          <div className="lg:col-span-5 text-left">
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Form Pemesanan
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-4 mb-6">
              Sewa Perlengkapan Outdoor Tanpa Ribet
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              Lengkapi formulir pemesanan untuk mengamankan alat hiking Anda. Setelah submit, Anda hanya perlu membayar uang muka (DP) 50% untuk mendapatkan Kode Booking dan QR Code penjemputan barang.
            </p>

            {/* Info Cards */}
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-white">Pembayaran DP 50%</h4>
                  <p className="text-xs text-gray-400 mt-1">Pembayaran aman dengan transfer Bank/QRIS. Sisa 50% dilunasi saat pengambilan barang di basecamp toko.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-white">Jaminan Kondisi Alat</h4>
                  <p className="text-xs text-gray-400 mt-1">Seluruh tenda, sleeping bag, dan sepatu dipastikan bersih, harum, steril, dan berfungsi 100%.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Right Column */}
          <div className="lg:col-span-7">
            <div className="glass-dark rounded-3xl p-6 sm:p-10 shadow-2xl relative">
              
              {/* Form Title */}
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-6 text-left border-b border-white/10 pb-4">
                Formulir Penyewaan Alat
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Masukkan nama lengkap sesuai KTP"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                        errors.name ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-white/10 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  {errors.name && <span className="text-[10px] text-red-400 mt-1 block">{errors.name}</span>}
                </div>

                {/* Contact: Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="contoh@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                          errors.email ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-white/10 focus:border-amber-500'
                        }`}
                      />
                    </div>
                    {errors.email && <span className="text-[10px] text-red-400 mt-1 block">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">No. WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0812xxxxxx"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                          errors.phone ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-white/10 focus:border-amber-500'
                        }`}
                      />
                    </div>
                    {errors.phone && <span className="text-[10px] text-red-400 mt-1 block">{errors.phone}</span>}
                  </div>
                </div>

                {/* Equipment Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Pilih Alat Mendaki</label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      name="productId"
                      value={formData.productId}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none appearance-none cursor-pointer transition-colors [color-scheme:dark] ${
                        errors.productId ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-white/10 focus:border-amber-500'
                      }`}
                    >
                      <option value="" className="bg-forest-950 text-white">-- Klik untuk Memilih Alat --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-forest-950 text-white">
                          {p.name} - ({p.vendor} | {p.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.productId && <span className="text-[10px] text-red-400 mt-1 block">{errors.productId}</span>}
                </div>

                {/* Date and Stepper Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Mulai Sewa</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none [color-scheme:dark] transition-colors ${
                          errors.startDate ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-white/10 focus:border-amber-500'
                        }`}
                      />
                    </div>
                    {errors.startDate && <span className="text-[10px] text-red-400 mt-1 block">{errors.startDate}</span>}
                  </div>

                  {/* Stepper Duration */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Durasi Sewa (Hari)</label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden h-[46px]">
                      <button
                        type="button"
                        onClick={() => handleStepDuration(-1)}
                        className="w-12 h-full hover:bg-white/10 text-white font-bold flex items-center justify-center transition-colors border-r border-white/10"
                      >
                        -
                      </button>
                      <span className="flex-grow text-center text-sm font-bold">{formData.duration} Hari</span>
                      <button
                        type="button"
                        onClick={() => handleStepDuration(1)}
                        className="w-12 h-full hover:bg-white/10 text-white font-bold flex items-center justify-center transition-colors border-l border-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Catatan Tambahan (Opsional)</label>
                  <div className="relative">
                    <ClipboardList className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      name="notes"
                      rows="2"
                      placeholder="Contoh: Ukuran sepatu 42, butuh matras tambahan, dll."
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Invoice Calculation Summary */}
                {selectedProduct && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 animate-fade-in-up">
                    <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider mb-3">Rincian Estimasi Biaya</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Harga Alat</span>
                        <span>{formatRupiah(pricePerDay)} / hari</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Durasi Sewa</span>
                        <span>{formData.duration} Hari</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-semibold">
                        <span className="text-gray-300">Total Biaya</span>
                        <span>{formatRupiah(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-xs font-bold text-amber-300 mt-2">
                        <span>Wajib DP 50%</span>
                        <span>{formatRupiah(downPayment)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-forest-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/15 active:scale-98 transition-all flex items-center justify-center gap-2 mt-4 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-forest-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses Pemesanan...
                    </>
                  ) : (
                    'Ajukan Sewa & Kunci Booking'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Toast overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-forest-950 p-6 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full text-center relative animate-fade-in-up">
            <CheckCircle2 className="w-16 h-16 text-forest-600 mx-auto mb-6 animate-float" />
            <h3 className="font-display font-extrabold text-2xl text-forest-950 mb-2">Pemesanan Diajukan!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Pengajuan sewa Anda berhasil terkirim. Silakan bayar DP 50% untuk mengamankan stok barang Anda.
            </p>

            <div className="bg-brand-bg rounded-2xl p-4 border border-forest-100 mb-6 text-left">
              <div className="flex justify-between border-b border-forest-50 pb-2 mb-2 text-xs">
                <span className="text-gray-400 font-medium">Kode Booking</span>
                <span className="font-bold text-forest-950 font-mono text-sm tracking-wider">{bookingCode}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-medium">Jumlah DP (50%)</span>
                <span className="font-bold text-forest-950">{formatRupiah(selectedProduct ? selectedProduct.pricePerDay * formData.duration * 0.5 : 0)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm"
              >
                Kembali ke Beranda
              </button>
              <p className="text-[10px] text-gray-400">
                Detail invoice pembayaran QRIS & kode QR pengambilan telah dikirimkan ke email Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
