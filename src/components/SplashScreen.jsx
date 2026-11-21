import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { getMediaBlob } from '../utils/mediaStorage';

export default function SplashScreen({ onFinish }) {
  const { content } = useWebsiteContent();
  const splashData = content?.splashVideo || {};

  // Check if explicitly disabled or deleted by admin
  const isDeleted = splashData.videoUrl === '';
  const isEnabled = splashData.enabled !== false && content?.sectionVisibility?.splash !== false && !isDeleted;

  const [isVisible, setIsVisible] = useState(isEnabled);
  const [isFadingOut, setIsFadingOut] = useState(false);
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
      if (!rawUrl || rawUrl === '/video.webm' || rawUrl === '/video.mp4') {
        // Default official video already playing via direct sources
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

    // Attempt programmatic autoplay with error catch to satisfy all browser security policies
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video auto-playback deferred or prevented:', err);
        });
      }
    }

    // Safety fallback timer (max 15s for custom video or 10.5s for default)
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 15000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [isEnabled, customVideoUrl]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime || 0;
    const duration = videoRef.current.duration || 10;
    if (duration > 0 && duration - current <= 0.6 && !isFadingOut) {
      setIsFadingOut(true);
    }
  };

  if (!isEnabled || !isVisible) return null;

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

      {/* Dynamic Custom or Default 10-Second 3D RESPIRE Branding Video */}
      <video
        ref={videoRef}
        key={customVideoUrl || 'default-branding'}
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
        {customVideoUrl ? (
          <source src={customVideoUrl} type="video/mp4" />
        ) : (
          <>
            <source src="/video.webm" type="video/webm" />
            <source src="/video.mp4" type="video/mp4" />
          </>
        )}
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
      `}</style>
    </div>
  );
}
