import React, { useState, useEffect, useRef } from 'react';
import { useWebsiteContent } from '../context/WebsiteContentContext';
import { getMediaBlob } from '../utils/mediaStorage';

export default function SplashScreen({ onFinish }) {
  const { content } = useWebsiteContent();
  const splashData = content?.splashVideo || {};

  // Check if disabled or deleted:
  // Note: if videoUrl is explicitly empty string '', the video was deleted!
  const isDeleted = splashData.videoUrl === '';
  const isEnabled = splashData.enabled !== false && content?.sectionVisibility?.splash !== false && !isDeleted;

  const [isVisible, setIsVisible] = useState(isEnabled);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);
  const finishedRef = useRef(false);

  const durationSec = Number(splashData.durationSeconds) || 10;

  const handleFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 500);
  };

  // Resolve video source: IndexedDB (for uploaded videos) or static/cloud URL
  useEffect(() => {
    if (!isEnabled) {
      if (onFinish) onFinish();
      return;
    }

    let activeBlobUrl = null;
    let isCancelled = false;

    async function loadVideoSource() {
      const rawUrl = splashData.videoUrl;

      // 1. If explicit URL provided that is NOT indexeddb
      if (rawUrl && typeof rawUrl === 'string' && !rawUrl.startsWith('indexeddb://')) {
        if (!isCancelled) {
          // If rawUrl is legacy /video.mp4, use /video.webm so modern browsers decode smoothly
          const cleanUrl = rawUrl === '/video.mp4' ? '/video.webm' : rawUrl;
          setResolvedVideoUrl(cleanUrl);
          setIsReady(true);
        }
        return;
      }

      // 2. Load custom uploaded video from IndexedDB
      try {
        const blob = await getMediaBlob('splash_video');
        if (!isCancelled && blob && blob.size > 0) {
          activeBlobUrl = URL.createObjectURL(blob);
          setResolvedVideoUrl(activeBlobUrl);
          setIsReady(true);
          return;
        }
      } catch (err) {
        console.warn('Could not read video from IndexedDB:', err);
      }

      // 3. Fallback to default official video if not deleted
      if (!isCancelled) {
        if (rawUrl !== '') {
          setResolvedVideoUrl('/video.webm');
        } else {
          setResolvedVideoUrl(null);
        }
        setIsReady(true);
      }
    }

    loadVideoSource();

    return () => {
      isCancelled = true;
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [splashData.videoUrl, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !resolvedVideoUrl) {
      if (isReady && !resolvedVideoUrl && onFinish) {
        onFinish();
      }
      return;
    }

    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video auto-playback deferred or prevented:', err);
        });
      }
    }

    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, (durationSec + 0.6) * 1000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [resolvedVideoUrl, isEnabled, isReady, durationSec]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime || 0;
    const duration = videoRef.current.duration || durationSec;
    if (duration > 0 && duration - current <= 0.6 && !isFadingOut) {
      setIsFadingOut(true);
    }
  };

  if (!isEnabled || !isVisible || (isReady && !resolvedVideoUrl)) return null;

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

      {/* 3D RESPIRE Branding Video */}
      {resolvedVideoUrl && (
        <video
          ref={videoRef}
          key={resolvedVideoUrl}
          autoPlay
          muted
          playsInline
          disablePictureInPicture
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleFinish}
          onError={(err) => {
            console.warn('Video playback encountered an issue, transitioning to website.', err);
            handleFinish();
          }}
          className="respire-branding-video"
        >
          <source src={resolvedVideoUrl} type={resolvedVideoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          {resolvedVideoUrl === '/video.webm' && <source src="/video.mp4" type="video/mp4" />}
          Your browser does not support HTML5 video playback.
        </video>
      )}

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
