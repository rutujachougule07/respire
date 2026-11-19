import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Exactly 10 seconds total duration
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
        background: 'radial-gradient(ellipse at center, #0A1910 0%, #040805 45%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.08)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Deep Attractive Gradient Black Ambient Light Glow */}
      <div
        style={{
          position: 'absolute',
          width: 'min(90vw, 850px)',
          height: 'min(90vw, 850px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 82, 0.25) 0%, rgba(0, 184, 74, 0.08) 50%, transparent 72%)',
          filter: 'blur(60px)',
          animation: 'bgGlowPulse 4s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />

      {/* 
        MAIN CENTER ELEMENT: 
        ONLY THE NAME "RESPIRE" IN VIBRANT GREEN - MASSIVE, PIN-SHARP, 
        AND ROTATING IN A COMPLETE CIRCLE (NO SIDE CIRCLES, NO RINGS)
      */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '920px',
          padding: '0 24px',
          perspective: '1400px',
        }}
      >
        <div
          className="respire-giant-rotating-text"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            animation: 'respireCircleMotion 10s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Ultra-HD Pin-Sharp 2.3K Vectorized Brand Wordmark */}
          <img
            src="/respire_text_ultra_hd.png"
            alt="RESPIRE"
            style={{
              width: '100%',
              maxWidth: '850px',
              height: 'auto',
              maxHeight: '160px',
              objectFit: 'contain',
              // Crisp, solid emerald green shadow with zero blur-fog
              filter:
                'drop-shadow(0 0 20px rgba(0, 255, 102, 0.85)) drop-shadow(0 15px 35px rgba(0, 201, 82, 0.6))',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Subtle Skip Indicator at Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          right: '32px',
          zIndex: 20,
          fontSize: '0.78rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.55)',
          padding: '6px 14px',
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transition: 'all 0.2s ease',
        }}
      >
        Click to Skip ✕
      </div>

      {/* Embedded Animations */}
      <style>{`
        /* 
          10-Second Continuous Circular Animation:
          1. 0s - 2s: Zooms in from 360-degree circular spin into sharp focus
          2. 2s - 8s: Smooth continuous 3D circular rotation (rotateY 360 degrees)
          3. 8s - 10s: Majestic forward glow pulse before revealing the landing page
        */
        @keyframes respireCircleMotion {
          0% {
            opacity: 0;
            transform: scale(0.35) rotate(-360deg);
          }
          15% {
            opacity: 1;
            transform: scale(1.08) rotate(0deg);
          }
          22% {
            transform: scale(1) rotate(0deg) rotateY(0deg);
          }
          45% {
            transform: scale(1.04) rotateY(180deg);
          }
          70% {
            transform: scale(1) rotateY(360deg);
          }
          85% {
            transform: scale(1.06) rotateY(360deg);
          }
          100% {
            opacity: 1;
            transform: scale(1.02) rotateY(360deg);
          }
        }

        /* Ambient deep emerald-black background pulse */
        @keyframes bgGlowPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}