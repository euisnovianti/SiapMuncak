import React from 'react';
import { Search, CreditCard, QrCode, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Cari & Pilih Alat',
      desc: 'Jelajahi berbagai pilihan perlengkapan mendaki gunung berkualitas dari toko terdekat di kotamu.',
      icon: <Search className="w-6 h-6 text-forest-600" />,
      bgIcon: 'bg-forest-50'
    },
    {
      number: '02',
      title: 'Bayar DP 50%',
      desc: 'Kunci booking perlengkapanmu dengan membayar uang muka 50% via transfer bank atau QRIS yang praktis.',
      icon: <CreditCard className="w-6 h-6 text-amber-600" />,
      bgIcon: 'bg-amber-50'
    },
    {
      number: '03',
      title: 'Ambil dengan QR',
      desc: 'Kunjungi basecamp/toko vendor pada tanggal sewa dan tunjukkan kode QR untuk serah terima barang instan.',
      icon: <QrCode className="w-6 h-6 text-forest-600 animate-pulse" />,
      bgIcon: 'bg-forest-50'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs bg-forest-50 text-forest-700 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Alur Sewa
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-forest-950 tracking-tight mt-3 mb-4">
            Bagaimana Cara Kerjanya?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Mulai dari pencarian hingga pendakian, kami merancang proses rental yang sangat sederhana dan aman untuk menghemat waktu berharga Anda.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 border-t border-dashed border-forest-200 -translate-y-16 -z-0" />

          {steps.map((step, idx) => (
            <div 
              key={step.number} 
              className="relative z-10 flex flex-col items-center text-center px-4 group"
            >
              {/* Step Number Badge */}
              <span className="absolute -top-4 font-display font-black text-6xl text-forest-100/50 group-hover:text-forest-200/50 transition-colors pointer-events-none">
                {step.number}
              </span>

              {/* Icon Container */}
              <div className={`w-16 h-16 rounded-2xl ${step.bgIcon} flex items-center justify-center mb-6 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 relative z-10 border border-white`}>
                {step.icon}
              </div>

              {/* Text info */}
              <h3 className="font-display font-bold text-lg text-forest-950 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                {step.desc}
              </p>

              {/* Connecting Chevron/Arrow in mobile */}
              {idx < 2 && (
                <div className="md:hidden mt-8 text-forest-300">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
