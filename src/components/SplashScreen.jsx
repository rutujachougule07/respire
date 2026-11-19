import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out at 1.8s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Completely remove from DOM at 2.3s
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 350);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`respire-splash-screen ${isFadingOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#07090E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.05)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Ambient Radial Green Backlight */}
      <div
        style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 82, 0.22) 0%, rgba(0, 184, 74, 0.08) 45%, transparent 70%)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
          animation: 'pulseAura 2s ease-in-out infinite alternate',
        }}
      />

      {/* Main Logo & Title Presentation Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          padding: '20px',
        }}
      >
        {/* Animated Green "R" Icon (From User Logo Image 2) */}
        <div
          className="splash-logo-wrapper"
          style={{
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/respire_r_logo_transparent.png"
            alt="Respire Logo"
            style={{
              width: '130px',
              height: 'auto',
              maxHeight: '115px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 12px 28px rgba(0, 201, 82, 0.6))',
              animation: 'logoEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />
        </div>

        {/* Animated "RESPIRE" Title (From User Image 1) */}
        <div
          className="splash-title-wrapper"
          style={{
            animation: 'titleEntrance 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards',
            opacity: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <img
            src="/respire_text_transparent.png"
            alt="RESPIRE"
            style={{
              height: '46px',
              width: 'auto',
              maxWidth: '85vw',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 18px rgba(0, 201, 82, 0.45))',
            }}
          />

          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#94A3B8',
              opacity: 0.9,
              marginTop: '4px',
              animation: 'subEntrance 0.8s ease-out 0.5s forwards',
            }}
          >
            A Mahabal Group Venture
          </div>
        </div>

        {/* Minimal High-Tech Energy Progress Bar */}
        <div
          style={{
            width: '160px',
            height: '3px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginTop: '36px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #00C952 0%, #00FF66 50%, #008A37 100%)',
              boxShadow: '0 0 10px #00C952',
              animation: 'loadProgress 1.7s cubic-bezier(0.65, 0, 0.35, 1) forwards',
            }}
          />
        </div>
      </div>

      {/* Embedded Hardware-Accelerated Animations */}
      <style>{`
        @keyframes logoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.6) translateY(-14px);
            filter: drop-shadow(0 0 0 rgba(0, 201, 82, 0));
          }
          60% {
            transform: scale(1.08) translateY(0);
            filter: drop-shadow(0 16px 36px rgba(0, 201, 82, 0.75));
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: drop-shadow(0 12px 28px rgba(0, 201, 82, 0.6));
          }
        }

        @keyframes titleEntrance {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes subEntrance {
          0% {
            opacity: 0;
            letter-spacing: 0.1em;
          }
          100% {
            opacity: 0.9;
            letter-spacing: 0.24em;
          }
        }

        @keyframes pulseAura {
          0% {
            transform: scale(0.92);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes loadProgress {
          0% {
            width: 0%;
          }
          40% {
            width: 55%;
          }
          85% {
            width: 90%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}