import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronRight, Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const finishedRef = useRef(false);

  const handleFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 700);
  };

  useEffect(() => {
    // Attempt programmatic autoplay with error catch to satisfy all browser security policies
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err?.name === 'AbortError') return;
          console.debug('Autoplay deferred:', err);
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
    
    // Progress calculation for luxury progress bar (0 - 100%)
    if (duration > 0) {
      const pct = Math.min(100, Math.max(0, (current / duration) * 100));
      setProgress(pct);
    }

    // Initiate smooth cinematic dissolve 0.7s before end
    if (duration > 0 && duration - current <= 0.7 && !isFadingOut) {
      setIsFadingOut(true);
    }
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`respire-splash-screen ${isFadingOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: '#030504',
        backgroundImage: `radial-gradient(ellipse at center, rgba(0, 201, 82, 0.22) 0%, rgba(3, 7, 4, 0.85) 55%, #010302 100%), url('/clean_ref_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s ease',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.04)' : 'scale(1)',
        filter: isFadingOut ? 'blur(8px)' : 'none',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Top Floating Luxury Header Bar */}
      <div
        style={{
          position: 'fixed',
          top: '22px',
          left: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000000,
          pointerEvents: 'auto',
        }}
      >
        {/* Luxury Brand Badge: Mahabal Group */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(10, 15, 12, 0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 255, 102, 0.25)',
            padding: '7px 16px',
            borderRadius: '999px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6), inset 0 0 15px rgba(0, 255, 102, 0.08)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#00FF66',
              boxShadow: '0 0 10px #00FF66',
              animation: 'pulseGlow 2s infinite ease-in-out',
            }}
          />
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            A Mahabal Group Venture
          </span>
        </div>

        {/* Right Floating Actions: Sound & Skip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(10, 15, 12, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              padding: '7px 14px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 184, 74, 0.85)';
              e.currentTarget.style.borderColor = '#00FF66';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(10, 15, 12, 0.75)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isMuted ? <VolumeX size={14} color="#94A3B8" /> : <Volume2 size={14} color="#00FF66" />}
            <span style={{ letterSpacing: '0.04em' }}>{isMuted ? 'Unmute' : 'Sound On'}</span>
          </button>

          {/* Luxury Skip Intro Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(0, 201, 82, 0.95) 0%, rgba(0, 138, 55, 0.95) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: '#FFFFFF',
              padding: '7px 18px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0, 184, 74, 0.5), 0 0 20px rgba(0, 255, 102, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 255, 102, 0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 184, 74, 0.5)';
            }}
          >
            <span>Skip Intro</span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Cinematic Theater Letterbox / Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.6) 80%, rgba(0, 0, 0, 0.95) 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Luxury Ambient Emerald Green Breathing Nebula */}
      <div
        style={{
          position: 'absolute',
          width: 'min(96vw, 750px)',
          height: 'min(96vw, 750px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 230, 90, 0.28) 0%, rgba(0, 184, 74, 0.10) 45%, transparent 75%)',
          filter: 'blur(60px)',
          animation: 'respireNebulaPulse 3.8s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Original 10-Second 3D RESPIRE Branding Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
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

      {/* Bottom Luxury Footer Details with Progress Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          paddingBottom: '16px',
        }}
      >
        {/* Subtle Luxury Tagline */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255, 255, 255, 0.72)',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '14px',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          }}
        >
          <Sparkles size={12} color="#00FF66" />
          <span>Sangli’s Premier Luxury Fitness Institution</span>
          <Sparkles size={12} color="#00FF66" />
        </div>

        {/* 10-Second Glowing Emerald Cinema Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '2.5px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00B84A 0%, #00FF66 50%, #00D256 100%)',
              boxShadow: '0 0 14px rgba(0, 255, 102, 0.95), 0 0 6px rgba(0, 255, 102, 0.7)',
              transition: 'width 0.15s linear',
            }}
          />
        </div>
      </div>

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
            transform: scale(0.92);
            opacity: 0.65;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }

        .fade-out {
          opacity: 0 !important;
          transform: scale(1.04) !important;
          filter: blur(8px) !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
