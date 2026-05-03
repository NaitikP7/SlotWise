import { useState, useEffect } from 'react';

/**
 * SplashScreen — Professional startup/loading screen
 * Shown on initial app load with mlogo centered, accent color animations,
 * then smoothly transitions out.
 */
export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  useEffect(() => {
    // Phase 1: logo fades in (0–600ms)
    const showTimer = setTimeout(() => setPhase('visible'), 100);
    // Phase 2: hold visible (600–1800ms), then begin exit
    const exitTimer = setTimeout(() => setPhase('exit'), 1800);
    // Phase 3: exit animation completes, call onFinish
    const finishTimer = setTimeout(() => onFinish && onFinish(), 2400);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      {/* Subtle radial glow behind logo */}
      <div className="splash-glow" />

      {/* Logo container with scale + fade animation */}
      <div className="splash-logo-wrap">
        <img
          src="/mlogo.png"
          alt="SlotWise"
          className="splash-logo"
        />
      </div>
      {/* Minimal loading indicator */}
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}
