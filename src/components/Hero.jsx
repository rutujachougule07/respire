import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToNext = () => {
    const el = document.getElementById('about');
    if (el) {
      const navHeight = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '28px',
      }}
    >
      {/* 
        Full Screen (100vh) Edge-to-Edge High-Resolution Gym Visual
        Completely unobstructed - ZERO text, ZERO cards.
      */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=90&w=2560&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
      />

      {/* Subtle bottom fade into the white content section below */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '120px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 65%, #FFFFFF 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Minimalist, subtle scroll cue to glide smoothly to the next section */}
      <button
        onClick={scrollToNext}
        aria-label="Scroll to content"
        style={{
          position: 'relative',
          zIndex: 5,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '999px',
          width: '46px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#008A38',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.2s ease, background-color 0.2s ease',
          animation: 'bounceSlow 2.2s infinite ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        }}
      >
        <ChevronDown size={24} />
      </button>

      <style>{`
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}
