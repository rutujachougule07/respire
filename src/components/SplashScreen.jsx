import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Total animation: 3 seconds (starts fading out at 2.5s, unmounts at 3.0s)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 3000);

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
      className={`respire-circle-splash ${isFadingOut ? 'fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'radial-gradient(circle at center, #0B1910 0%, #050906 45%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.06)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      {/* Deep Gradient Black Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 82, 0.28) 0%, rgba(0, 184, 74, 0.1) 40%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'ambientBreath 3s infinite alternate ease-in-out',
          pointerEvents: 'none',
        }}
      />

      {/* Circular Rotating Stage */}
      <div
        style={{
          position: 'relative',
          width: 'min(85vw, 420px)',
          height: 'min(85vw, 420px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer Glowing Neon Ring 1 - Fast Clockwise Spin */}
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            border: '2px dashed rgba(0, 255, 102, 0.45)',
            boxShadow: '0 0 25px rgba(0, 201, 82, 0.35), inset 0 0 25px rgba(0, 201, 82, 0.2)',
            animation: 'fullCircleRotate 2.6s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Outer Neon Ring 2 - Counter Clockwise Thin Orbit */}
        <div
          style={{
            position: 'absolute',
            inset: '30px',
            borderRadius: '50%',
            border: '1.5px solid rgba(0, 201, 82, 0.25)',
            borderTopColor: '#00FF66',
            borderRightColor: '#00C952',
            boxShadow: '0 0 35px rgba(0, 255, 102, 0.4)',
            animation: 'counterCircleRotate 2.2s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Orbiting Electric Neon Dot 1 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'fullCircleRotate 2.4s linear infinite',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#00FF66',
              boxShadow: '0 0 18px #00FF66, 0 0 32px #00C952',
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* Orbiting Electric Neon Dot 2 (Opposite) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'fullCircleRotate 2.4s linear infinite',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#00C952',
              boxShadow: '0 0 15px #00C952, 0 0 25px #00FF66',
              position: 'absolute',
              bottom: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* 
          CENTRAL ELEMENT: ONLY THE NAME "RESPIRE" IN VIBRANT GREEN 
          SPINNING IN A COMPLETE 360-DEGREE CIRCLE 
        */}
        <div
          className="respire-name-orbit-container"
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'respireCircleSpin 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        >
          <img
            src="/respire_text_transparent.png"
            alt="RESPIRE"
            style={{
              width: 'min(72vw, 320px)',
              height: 'auto',
              maxHeight: '75px',
              objectFit: 'contain',
              filter:
                'drop-shadow(0 0 15px #00FF66) drop-shadow(0 0 35px #00C952) drop-shadow(0 0 55px rgba(0, 201, 82, 0.7))',
              animation: 'respirePulse 1.2s ease-in-out infinite alternate',
            }}
          />
        </div>
      </div>

      {/* Embedded Animations */}
      <style>{`
        /* Full 360-degree circular spin of the RESPIRE name */
        @keyframes respireCircleSpin {
          0% {
            opacity: 0;
            transform: scale(0.3) rotate(-360deg);
            filter: blur(8px);
          }
          30% {
            opacity: 1;
            filter: blur(0px);
          }
          75% {
            transform: scale(1.12) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        /* Continuous 360-degree circle rotation */
        @keyframes fullCircleRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Counter 360-degree circle rotation */
        @keyframes counterCircleRotate {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        /* Glowing green pulse */
        @keyframes respirePulse {
          0% {
            transform: scale(0.98);
            filter: drop-shadow(0 0 12px #00FF66) drop-shadow(0 0 28px #00C952);
          }
          100% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 22px #00FF66) drop-shadow(0 0 45px #00FF66) drop-shadow(0 0 70px rgba(0, 201, 82, 0.85));
          }
        }

        /* Ambient background breathing */
        @keyframes ambientBreath {
          0% {
            opacity: 0.6;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}