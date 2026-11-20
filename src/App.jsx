import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import MembershipPage from './pages/MembershipPage';
import ProgramsPage from './pages/ProgramsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { INITIAL_PLANS } from './components/admin/initialData';
import { subscribeToCollection, deduplicateById } from './services/firestoreService';

function PublicLayout({ children }) {
  return (
    <div className="respire-app" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  const [plans, setPlans] = useState(INITIAL_PLANS);

  // Sync plans live directly from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToCollection('plans', (data) => {
      if (data && data.length > 0) {
        setPlans(deduplicateById(data));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      {isHomePage && <SplashScreen />}
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage plans={plans} />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/services"
          element={
            <PublicLayout>
              <ServicesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/membership"
          element={
            <PublicLayout>
              <MembershipPage plans={plans} />
            </PublicLayout>
          }
        />
        <Route
          path="/programs"
          element={
            <PublicLayout>
              <ProgramsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Protected Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard plans={plans} setPlans={setPlans} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard plans={plans} setPlans={setPlans} />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />
      </Routes>
    </>
  );
}
