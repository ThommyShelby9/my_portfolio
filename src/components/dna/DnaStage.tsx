'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from '@/i18n/navigation';
import { particleBudget } from '@/lib/dna/budget';
import { DEFAULT_PAGE_SCENE, getDnaScene, subscribeDnaScene } from '@/lib/dna/scene-store';
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
 * The site-wide DNA helix (spec §3.4, §4.2 revised: 3D on every page), mounted once in the layout
 * so it survives client navigation and morphs from one page's shape to the next. A still poster
 * first, then the live particle scene once the browser is idle, when motion is allowed and WebGL
 * works. Any 3D failure goes back to the poster. Pages pick their shape with <DnaScene>.
 */
export function DnaStage() {
  const box = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const state = useRef(1);
  /** Inner pages ease towards this state; null on the home, where the scroll drives `state`. */
  const target = useRef<number | null>(null);
  const focus = useRef(-1);
  const tunnel = useRef({ mix: 0, z: 0 });
  const pathname = usePathname();
  const onHome = pathname === '/';
  const scene = useSyncExternalStore(subscribeDnaScene, getDnaScene, () => DEFAULT_PAGE_SCENE);
  const home = scene.mode === 'home';
  const [mode, setMode] = useState<'poster' | '3d'>('poster');
  const [webgl, setWebgl] = useState(false);
  const [visible, setVisible] = useState(true);
  const [posterMode, setPosterMode] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  // Any 3D failure goes back to the poster, and the traversal space (useless without 3D) closes.
  const fallback = useCallback(() => {
    setReady(false);
    setMode('poster');
    setWebgl(false);
  }, []);

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
        // Automated browsers (tests) render in software: light budget, except for the poster capture.
        saveData: Boolean(nav.connection?.saveData) || (nav.webdriver === true && !isPoster),
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
    setWebgl(true);
    const start = () => setMode('3d');
    if (typeof window.requestIdleCallback === 'function') {
      const id = requestIdleCallback(start, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, []);

  // The traversal space opens on the home as soon as the live helix can run (before idle: it sits
  // below the fold, so nothing jumps), and closes on any other page or after a 3D failure.
  useEffect(() => {
    const root = document.documentElement;
    if (webgl && home) root.dataset.dnaFlight = '1';
    else delete root.dataset.dnaFlight;
  }, [webgl, home]);

  // Inner pages: ease into the page's state. The home leaves the state to DnaTrajectory.
  useEffect(() => {
    if (scene.mode === 'page') {
      target.current = scene.state;
      focus.current = -1;
      tunnel.current = { mix: 0, z: 0 };
    } else {
      target.current = null;
    }
    // Exposed for tests; on the home DnaTrajectory writes it as the scroll moves.
    if (box.current && scene.mode === 'page') {
      box.current.dataset.dnaScene = String(scene.state);
      // Left the home mid-flight: no traversal here.
      delete box.current.dataset.dnaFlying;
      delete box.current.dataset.dnaTunnel;
    }
  }, [scene]);

  // Pause rendering when the tab is hidden (the stage is fixed: always on screen otherwise).
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
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
      data-dna-fixed="true"
      // Inner pages: a quieter helix behind long text (full intensity on the home only).
      data-dna-dim={String(!onHome)}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      {!posterMode && (
        <picture>
          <source media="(max-width: 1023px)" srcSet="/dna/helix-mobile.webp" />
          {/* Raw <img>: decorative, pre-sized poster inside a <picture>; next/image cannot art-direct it. */}
          <img
            src="/dna/helix-desktop.webp"
            alt=""
            data-dna-poster
            className={`absolute inset-0 m-auto h-full w-full object-cover lg:object-contain lg:object-[88%_50%] transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${ready ? 'invisible opacity-0' : ''}`}
          />
        </picture>
      )}
      {mode === '3d' && home && !posterMode && <DnaTrajectory stage={box} state={state} focus={focus} tunnel={tunnel} />}
      {mode === '3d' && count > 0 && (
        <DnaBoundary onError={fallback}>
          <DnaCanvas
            count={count}
            signatures={scene.signatures}
            state={state}
            target={target}
            focus={focus}
            tunnel={tunnel}
            light={mobile || count <= 6000}
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
