'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { particleBudget } from '@/lib/dna/budget';
import type { Gene } from '@/lib/dna/genes';
import { DnaBoundary } from './DnaBoundary';

const DnaCanvas = dynamic(() => import('./DnaCanvas'), { ssr: false, loading: () => null });
const DnaTrajectory = dynamic(() => import('./DnaTrajectory'), { ssr: false, loading: () => null });

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

type NavigatorHints = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

/**
 * The DNA helix (spec §3.4): a still poster first, then the live particle scene once the browser is
 * idle, when motion is allowed and WebGL works. Any 3D failure goes back to the poster.
 */
interface Props {
  /** Home only: the live helix stays fixed behind the page and follows the scenes (spec §4.1). */
  fixed?: boolean;
  /** Genes of the featured projects, top ring first (scene 03). */
  signatures?: readonly (readonly Gene[])[];
}

export function DnaStage({ fixed = false, signatures }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const state = useRef(1);
  const focus = useRef(-1);
  const [mode, setMode] = useState<'poster' | '3d'>('poster');
  const [visible, setVisible] = useState(true);
  const [posterMode, setPosterMode] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const fallback = useCallback(() => { setReady(false); setMode('poster'); }, []);

  useEffect(() => {
    // Poster mode hides the page around the helix for scripts/dna-poster.mjs. It only exists in a
    // build made with NEXT_PUBLIC_DNA_POSTER=1 (inlined at build time: dead code in production).
    const isPoster =
      process.env.NEXT_PUBLIC_DNA_POSTER === '1' && new URLSearchParams(location.search).get('dna') === 'poster';
    const nav = navigator as NavigatorHints;
    setMobile(matchMedia('(max-width: 1023px)').matches);
    setCount(
      particleBudget({
        width: innerWidth,
        cores: nav.hardwareConcurrency || 4,
        saveData: Boolean(nav.connection?.saveData),
        deviceMemory: nav.deviceMemory,
      }),
    );
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

  // A few degrees of tilt towards a fine pointer; nothing follows the cursor (owner rule 7).
  useEffect(() => {
    if (posterMode || !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const onMove = (e: PointerEvent) => {
      tilt.current = { x: (e.clientY / innerHeight - 0.5) * 0.12, y: (e.clientX / innerWidth - 0.5) * 0.12 };
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  }, [posterMode]);

  const running = mode === '3d' && visible && !posterMode;

  return (
    <div
      ref={box}
      data-dna-stage
      data-dna-state={mode}
      data-dna-ready={String(ready)}
      data-dna-running={String(running)}
      data-dna-fixed={fixed ? 'true' : undefined}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-40 lg:left-auto lg:w-[52vw] lg:opacity-100"
    >
      {!posterMode && (
        <picture>
          <source media="(max-width: 1023px)" srcSet="/dna/helix-mobile.webp" />
          {/* Raw <img>: decorative, pre-sized poster inside a <picture>; next/image cannot art-direct it. */}
          <img
            src="/dna/helix-desktop.webp"
            alt=""
            data-dna-poster
            className={`absolute inset-0 m-auto h-full w-full object-contain transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${ready ? 'invisible opacity-0' : ''}`}
          />
        </picture>
      )}
      {mode === '3d' && fixed && !posterMode && <DnaTrajectory stage={box} state={state} focus={focus} />}
      {mode === '3d' && count > 0 && (
        <DnaBoundary onError={fallback}>
          <DnaCanvas
            count={count}
            signatures={signatures}
            state={state}
            focus={focus}
            frozen={posterMode}
            running={running || posterMode}
            tilt={tilt}
            dpr={mobile ? 1.5 : 2}
            onReady={onReady}
            onLost={fallback}
          />
        </DnaBoundary>
      )}
    </div>
  );
}
