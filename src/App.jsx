import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Catalog from './pages/Catalog';
import Detail from './pages/Detail';

// Booking Checkout Flow
import BookingSummary from './pages/Booking/BookingSummary';
import BookingPayment from './pages/Booking/BookingPayment';
import BookingConfirm from './pages/Booking/BookingConfirm';

// Private Pages
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminVendors from './pages/Admin/Vendors';
import AdminBookings from './pages/Admin/Bookings';

export default function App() {
  return (
    <Router>
      <div className="layout-wrapper">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:id" element={<Detail />} />

            {/* Protected Checkout Routes */}
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute allowedRoles={['user', 'vendor', 'admin']}>
                  <BookingSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:id/payment"
              element={
                <ProtectedRoute allowedRoles={['user', 'vendor', 'admin']}>
                  <BookingPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:id/confirmation"
              element={
                <ProtectedRoute allowedRoles={['user', 'vendor', 'admin']}>
                  <BookingConfirm />
                </ProtectedRoute>
              }
            />

            {/* Protected Profile Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['user', 'vendor', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
