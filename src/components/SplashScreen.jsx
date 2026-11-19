import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 10 seconds total duration
    // Start smooth fade-out at 9.4s, completely unmount at 10.0s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 9400);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 10000);

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
    }, 300);
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
        background: 'radial-gradient(ellipse at center, #08160D 0%, #030604 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.06)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Attractive Luxury Gradient Black Ambient Nebula */}
      <div
        style={{
          position: 'absolute',
          width: 'min(95vw, 950px)',
          height: 'min(95vw, 950px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 82, 0.18) 0%, rgba(0, 184, 74, 0.05) 50%, transparent 75%)',
          filter: 'blur(70px)',
          animation: 'ambientNebula 5s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />

      {/* 
        CIRCULAR ORBIT MOTION STAGE:
        Moves smoothly in a complete 360-degree circular orbit,
        while ALWAYS keeping the text perfectly upright, legible, and forward-facing!
        ZERO side circles, ZERO rings, ZERO dotted lines.
      */}
      <div
        className="respire-orbital-wrapper"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '960px',
          padding: '0 20px',
          animation: 'respireCircularOrbit 4.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
        }}
      >
        {/* Entrance Zoom + Breath Scale */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'respireEntranceZoom 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Ultra-HD Pin-Sharp 2.3K Vectorized Wordmark (100% Clear & Sharp, Never Inverted) */}
          <img
            src="/respire_text_ultra_hd.png"
            alt="RESPIRE"
            style={{
              width: '100%',
              maxWidth: '920px',
              height: 'auto',
              maxHeight: '190px',
              objectFit: 'contain',
              // Razor-sharp drop shadow that accentuates letters without clouding gaps
              filter:
                'drop-shadow(0 0 12px rgba(0, 255, 102, 0.75)) drop-shadow(0 14px 28px rgba(0, 0, 0, 0.95))',
              display: 'block',
              animation: 'textSheenPulse 2.4s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>

      {/* Embedded Animations */}
      <style>{`
        /* 
          Full 360-Degree Circular Orbit Motion:
          The text travels around a complete circle of radius 36px,
          while continuously rotating its counter-angle so it remains
          100% horizontally upright, clear, and razor-sharp!
        */
        @keyframes respireCircularOrbit {
          0% {
            transform: rotate(0deg) translateY(-32px) rotate(0deg) scale(0.97);
          }
          25% {
            transform: rotate(90deg) translateY(-32px) rotate(-90deg) scale(1.03);
          }
          50% {
            transform: rotate(180deg) translateY(-32px) rotate(-180deg) scale(1.06);
          }
          75% {
            transform: rotate(270deg) translateY(-32px) rotate(-270deg) scale(1.03);
          }
          100% {
            transform: rotate(360deg) translateY(-32px) rotate(-360deg) scale(0.97);
          }
        }

        /* Initial 1.2s cinematic zoom entrance */
        @keyframes respireEntranceZoom {
          0% {
            opacity: 0;
            transform: scale(0.4);
            filter: blur(10px);
          }
          60% {
            transform: scale(1.05);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }

        /* Subtle glowing energy pulse on the text */
        @keyframes textSheenPulse {
          0% {
            filter: drop-shadow(0 0 10px rgba(0, 255, 102, 0.65)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.9));
          }
          100% {
            filter: drop-shadow(0 0 22px rgba(0, 255, 102, 0.95)) drop-shadow(0 0 45px rgba(0, 201, 82, 0.55)) drop-shadow(0 18px 36px rgba(0, 0, 0, 0.95));
          }
        }

        /* Ambient background glow breathing */
        @keyframes ambientNebula {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}