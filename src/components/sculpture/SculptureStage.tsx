'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SculptureBoundary } from './SculptureBoundary';
import { DESKTOP_RIBBON, MOBILE_RIBBON } from './mobius';

const Trajectory = dynamic(() => import('./SculptureTrajectory'), { ssr: false, loading: () => null });
const Sculpture = dynamic(() => import('./Sculpture'), { ssr: false, loading: () => null });

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function SculptureStage() {
  const box = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<'poster' | '3d'>('poster');
  const [visible, setVisible] = useState(true);
  // The desktop stage is `position: fixed`, so it always "intersects"; it is really gone
  // once the scroll trajectory has faded it out.
  const [faded, setFaded] = useState(false);
  const [posterMode, setPosterMode] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  // Any 3D failure (chunk, renderer creation, lost context) goes back to the poster.
  const fallback = useCallback(() => { setReady(false); setMode('poster'); }, []);

  // Decide once on mount: 3D only with motion allowed, WebGL present, after the browser is idle.
  useEffect(() => {
    const isPoster = new URLSearchParams(location.search).get('sculpture') === 'poster';
    setMobile(matchMedia('(max-width: 1023px)').matches);
    if (isPoster) {
      document.documentElement.dataset.poster = '1';
      setPosterMode(true);
      setMode('3d');
      return;
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL()) return;
    const start = () => setMode('3d');
    if (typeof window.requestIdleCallback === 'function') {
      const id = requestIdleCallback(start, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Pause rendering when off screen or when the tab is hidden.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setVisible(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; update(); });
    io.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  // Cursor tilt: desktop, fine pointer, motion allowed, not in poster mode.
  useEffect(() => {
    if (posterMode || !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const onMove = (e: PointerEvent) => {
      tilt.current = { x: (e.clientY / innerHeight - 0.5) * 0.4, y: (e.clientX / innerWidth - 0.5) * 0.4 };
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, [posterMode]);

  const onFadedChange = useCallback((f: boolean) => setFaded(f), []);

  const params = mobile ? MOBILE_RIBBON : DESKTOP_RIBBON;
  const running = mode === '3d' && visible && !faded && !posterMode;

  return (
    <div
      ref={box}
      data-sculpture-stage
      data-state={mode}
      data-ready={String(ready)}
      data-running={String(running)}
      aria-hidden="true"
      data-trajectory={posterMode ? 'on' : undefined}
      className="pointer-events-none relative h-[42svh] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-1/2"
    >
      {!posterMode && (
        <picture>
          <source media="(max-width: 1023px)" srcSet="/sculpture/mobius-mobile.webp" />
          {/* Raw <img>: decorative, pre-sized poster inside a <picture>; next/image cannot art-direct it. */}
          <img
            src="/sculpture/mobius-desktop.webp"
            alt=""
            data-sculpture-poster
            className={`absolute inset-0 m-auto h-full w-full object-contain transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${ready ? 'invisible opacity-0' : ''}`}
          />
        </picture>
      )}
      {mode === '3d' && !posterMode && (
        <Trajectory stage={box} progress={progress} onFadedChange={onFadedChange} />
      )}
      {mode === '3d' && (
        <SculptureBoundary onError={fallback}>
          <Sculpture
            params={params}
            frozen={posterMode}
            running={running || posterMode}
            progress={progress}
            tilt={tilt}
            dpr={mobile ? 1.5 : 2}
            onReady={onReady}
            onLost={fallback}
          />
        </SculptureBoundary>
      )}
    </div>
  );
}
