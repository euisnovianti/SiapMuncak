import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TopVendors from './components/TopVendors';
import PopularProducts from './components/PopularProducts';
import HowItWorks from './components/HowItWorks';
import BookingForm from './components/BookingForm';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  const [selectedCity, setSelectedCity] = useState('');
  const [rentProduct, setRentProduct] = useState(null);

  const handleHeroSearch = (searchData) => {
    setSelectedCity(searchData.city);
  };

  const handleSelectVendorCity = (cityName) => {
    setSelectedCity(cityName);
    // Scroll to catalog
    const el = document.getElementById('catalog');
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleRentProduct = (product) => {
    setRentProduct(product);
  };

  const handleBookingSuccess = () => {
    // Reset selection after booking success
    setRentProduct(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-forest-950 flex flex-col antialiased">
      {/* Navigation Menu */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-grow">
        <Hero onSearch={handleHeroSearch} />
        
        <TopVendors onSelectVendor={handleSelectVendorCity} />
        
        <PopularProducts 
          selectedCity={selectedCity} 
          onRentProduct={handleRentProduct} 
        />
        
        <HowItWorks />
        
        <BookingForm 
          prepopulatedProduct={rentProduct} 
          onBookingSuccess={handleBookingSuccess} 
        />
        
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
