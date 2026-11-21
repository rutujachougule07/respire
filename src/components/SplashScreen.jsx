import React, { useState, useEffect, useRef } from 'react';

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
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* 100% Pure Clean Video - Zero Text / Zero Overlays */}
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

        /* Mobile / Portrait / Tablet: 100% full width, perfectly centered, never cropped */
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
          }
        }

        .fade-out {
          opacity: 0 !important;
          transform: scale(1.02) !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
