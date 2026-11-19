import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Membership from './components/Membership';
import Programs from './components/Programs';
import FitnessTracking from './components/FitnessTracking';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './components/admin/AdminDashboard';
import { INITIAL_PLANS } from './components/admin/initialData';

function loadPlans() {
  try {
    const raw = localStorage.getItem('rf_official_plans_v2');
    return raw ? JSON.parse(raw) : INITIAL_PLANS;
  } catch {
    return INITIAL_PLANS;
  }
}

export default function App() {
  const [adminSession, setAdminSession] = useState(null);
  const [plans, setPlans] = useState(loadPlans);

  useEffect(() => {
    try {
      localStorage.setItem('rf_official_plans_v2', JSON.stringify(plans));
    } catch {
      // ignore storage errors
    }
  }, [plans]);

  const handleAdminLogin = (info) => {
    setAdminSession(info);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (adminSession) {
    return (
      <AdminDashboard
        adminInfo={adminSession}
        onLogout={handleAdminLogout}
        plans={plans}
        setPlans={setPlans}
      />
    );
  }

  return (
    <div className="respire-app" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      {/* Sticky & Responsive White + Green Gradient Navbar */}
      <Navbar />

      {/* Main Single Page Sections */}
      <main>
        <Hero />
        <About />
        <Services />
        <Membership plans={plans} />
        <Programs />
        <FitnessTracking />
        <WhyChooseUs />
        <Contact />
      </main>

      {/* Gradient Black Footer with Admin Login */}
      <Footer onAdminLogin={handleAdminLogin} />

      {/* Instant WhatsApp Quick Button */}
      <WhatsAppButton />
    </div>
  );
}
