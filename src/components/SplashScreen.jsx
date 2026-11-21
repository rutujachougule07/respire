import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { getMediaBlob } from '../utils/mediaStorage';
import { Volume2, VolumeX, ChevronRight } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const { content } = useWebsiteContent();
  const splashData = content?.splashVideo || {};

  // Check if explicitly disabled or deleted by admin
  const isDeleted = splashData.videoUrl === '';
  const isEnabled = splashData.enabled !== false && content?.sectionVisibility?.splash !== false && !isDeleted;

  const [isVisible, setIsVisible] = useState(isEnabled);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [customVideoUrl, setCustomVideoUrl] = useState(null);
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

  // If explicitly disabled or deleted, finish immediately
  useEffect(() => {
    if (!isEnabled) {
      handleFinish();
    }
  }, [isEnabled]);

  // Check for custom uploaded video from IndexedDB or custom URL
  useEffect(() => {
    if (!isEnabled) return;
    let activeBlobUrl = null;
    let isCancelled = false;

    async function checkCustomVideo() {
      const rawUrl = splashData.videoUrl;
      if (!rawUrl || rawUrl === '/trainer_intro.mp4' || rawUrl === '/video.webm' || rawUrl === '/video.mp4') {
        return;
      }

      if (rawUrl.startsWith('indexeddb://')) {
        try {
          const blob = await getMediaBlob('splash_video');
          if (!isCancelled && blob && blob.size > 0) {
            activeBlobUrl = URL.createObjectURL(blob);
            setCustomVideoUrl(activeBlobUrl);
          }
        } catch (e) {
          console.warn('Could not read custom video from IndexedDB:', e);
        }
      } else if (rawUrl.startsWith('http') || rawUrl.startsWith('blob:') || rawUrl.startsWith('/')) {
        if (!isCancelled) {
          setCustomVideoUrl(rawUrl);
        }
      }
    }

    checkCustomVideo();

    return () => {
      isCancelled = true;
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [splashData.videoUrl, isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    // Programmatic autoplay with muted fallback to satisfy all browser security policies
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }

    // Safety fallback timer (24 seconds)
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 24000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [isEnabled, customVideoUrl]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime || 0;
    const duration = videoRef.current.duration || 22;
    if (duration > 0 && duration - current <= 0.6 && !isFadingOut) {
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

  if (!isEnabled || !isVisible) return null;

  // Active source: custom uploaded blob, or valid URL, or default to trainer_intro.mp4
  const rawUrl = splashData.videoUrl;
  const isIndexedDb = typeof rawUrl === 'string' && rawUrl.startsWith('indexeddb://');
  const videoSource = customVideoUrl || (!isIndexedDb && rawUrl ? rawUrl : '/trainer_intro.mp4');

  return (
    <div
      className={`respire-splash-screen ${isFadingOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: '#040705',
        backgroundImage: `radial-gradient(ellipse at center, rgba(0, 201, 82, 0.18) 0%, rgba(4, 9, 6, 0.85) 60%, #010302 100%), url('/clean_ref_bg.jpg')`,
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
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Top Floating Controls Bar */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000000,
          pointerEvents: 'auto',
        }}
      >
        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={toggleSound}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            padding: '8px 14px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 184, 74, 0.85)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="#4ade80" />}
          <span>{isMuted ? 'Tap to Unmute' : 'Sound On'}</span>
        </button>

        {/* Skip Button */}
        <button
          type="button"
          onClick={handleFinish}
          style={{
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
      </div>

      {/* Luxury Ambient Emerald Green Breathing Glow in Background */}
      <div
        style={{
          position: 'absolute',
          width: 'min(95vw, 680px)',
          height: 'min(95vw, 680px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 82, 0.25) 0%, rgba(0, 184, 74, 0.08) 50%, transparent 75%)',
          filter: 'blur(60px)',
          animation: 'respireNebulaPulse 4s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Video Player */}
      <video
        ref={videoRef}
        key={videoSource}
        src={videoSource}
        autoPlay
        muted={isMuted}
        playsInline
        disablePictureInPicture
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        preload="auto"
        onCanPlay={() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleFinish}
        className="respire-branding-video"
      >
        <source src={videoSource} type="video/mp4" />
        <source src="/trainer_intro.mp4" type="video/mp4" />
        <source src="/video.webm" type="video/webm" />
        Your browser does not support HTML5 video playback.
      </video>

      {/* Responsive Styles: Perfect Vertical Frame on Desktop & Mobile */}
      <style>{`
        /* Landscape / Desktop: Centered vertical preview with high-end glass styling */
        @media (min-width: 769px) {
          .respire-branding-video {
            position: relative;
            max-height: 86vh;
            max-width: 90vw;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 20px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 184, 74, 0.35);
            border: 1.5px solid rgba(255, 255, 255, 0.15);
            display: block;
            z-index: 2;
          }
        }

        /* Mobile / Portrait: Edge-to-edge full screen experience */
        @media (max-width: 768px) {
          .respire-branding-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            object-fit: cover;
            display: block;
            z-index: 2;
          }
        }

        @keyframes respireNebulaPulse {
          0% {
            transform: scale(0.92);
            opacity: 0.75;
          }
          100% {
            transform: scale(1.08);
            opacity: 1;
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
