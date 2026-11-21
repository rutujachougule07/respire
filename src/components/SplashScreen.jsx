import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef(null);
  const finishedRef = useRef(false);

  const handleFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 600);
  };

  useEffect(() => {
    // Attempt programmatic autoplay with error catch to satisfy all browser security policies
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video auto-playback deferred or prevented:', err);
        });
      }
    }

    // Safety fallback timer (original 3D video is 10.0s)
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 10500);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime || 0;
    const duration = videoRef.current.duration || 10;
    if (duration > 0 && duration - current <= 0.6 && !isFadingOut) {
      setIsFadingOut(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleFinish}
      className={`respire-splash-screen ${isFadingOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: '#050806',
        backgroundImage: `radial-gradient(ellipse at center, rgba(0, 201, 82, 0.15) 0%, rgba(4, 9, 6, 0.75) 50%, #020403 100%), url('/clean_ref_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleFinish();
        }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(0, 184, 74, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '0.82rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 184, 74, 0.45)',
          zIndex: 1000000,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.backgroundColor = '#00D154';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(0, 184, 74, 0.92)';
        }}
      >
        <span>Skip</span>
        <ChevronRight size={15} strokeWidth={2.8} />
      </button>

      {/* Luxury Ambient Emerald Green Breathing Nebula */}
      <div
        style={{
          position: 'absolute',
          width: 'min(95vw, 680px)',
          height: 'min(95vw, 680px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 82, 0.24) 0%, rgba(0, 184, 74, 0.08) 45%, transparent 72%)',
          filter: 'blur(50px)',
          animation: 'respireNebulaPulse 4s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Original 10-Second 3D RESPIRE Branding Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleFinish}
        onError={() => {
          console.warn('Video playback encountered an issue, transitioning to website.');
          handleFinish();
        }}
        className="respire-branding-video"
      >
        <source src="/video.webm" type="video/webm" />
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support HTML5 video playback.
      </video>

      {/* Responsive Styles: Perfect Full-Screen Desktop & Flawless Mobile View */}
      <style>{`
        /* Landscape / Desktop: Full screen edge-to-edge cover */
        @media (min-width: 769px) and (min-aspect-ratio: 1.25) {
          .respire-branding-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            display: block;
            z-index: 2;
          }
        }

        /* Mobile / Portrait / Tablet: 100% full width, perfectly centered, never cropped, seamless feathering */
        @media (max-width: 768px), (max-aspect-ratio: 1.25) {
          .respire-branding-video {
            position: relative;
            width: 100vw;
            max-width: 100vw;
            height: auto;
            max-height: 100vh;
            object-fit: contain;
            display: block;
            z-index: 2;
            -webkit-mask-image: radial-gradient(ellipse 98% 90% at center, black 75%, transparent 100%);
            mask-image: radial-gradient(ellipse 98% 90% at center, black 75%, transparent 100%);
          }
        }

        @keyframes respireNebulaPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        .fade-out {
          opacity: 0 !important;
          transform: scale(1.03) !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
