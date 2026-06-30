import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials } from '../data/testimonials';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setActiveIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        ),
      5000
    );

    return () => {
      resetTimeout();
    };
  }, [activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-10 left-10 text-forest-100 opacity-20">
        <MessageSquareQuote className="w-48 h-48 rotate-12" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs bg-forest-50 text-forest-700 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Testimoni Pendaki
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-forest-950 tracking-tight mt-3 mb-4">
            Apa Kata Mereka Tentang Kami?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Ulasan jujur dari rekan-rekan pendaki yang telah mempercayakan kenyamanan dan keamanan mendaki mereka bersama Siap Muncak.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-4xl mx-auto relative px-4 sm:px-12">
          
          {/* Slides Viewport */}
          <div className="overflow-hidden rounded-3xl bg-brand-bg/50 border border-forest-100/50 p-6 sm:p-12 shadow-xl relative min-h-[250px] flex items-center">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                className={`transition-all duration-700 ease-in-out flex flex-col md:flex-row gap-8 items-center text-left ${
                  idx === activeIndex ? 'opacity-100 scale-100' : 'absolute inset-0 opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {/* Avatar Column */}
                <div className="flex-shrink-0 relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md">
                    ★
                  </span>
                </div>

                {/* Content Column */}
                <div className="flex-grow">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-forest-950 text-sm sm:text-base italic font-medium leading-relaxed mb-6">
                    "{t.text}"
                  </p>

                  {/* Author */}
                  <div>
                    <h4 className="font-display font-bold text-base text-forest-900">{t.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 mt-0.5">
                      <span>{t.role}</span>
                      <span>•</span>
                      <span>Asal {t.location}</span>
                      <span>•</span>
                      <span className="bg-forest-100 text-forest-700 px-2 py-0.5 rounded font-medium">Sewa: {t.gear}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 bg-white hover:bg-forest-50 border border-forest-100 text-forest-800 p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all z-10"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 bg-white hover:bg-forest-50 border border-forest-100 text-forest-800 p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all z-10"
            aria-label="Next Review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-8 bg-forest-700 shadow-md' : 'w-2.5 bg-forest-200 hover:bg-forest-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
