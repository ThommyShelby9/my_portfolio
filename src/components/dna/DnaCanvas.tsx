'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { buildLayout } from '@/lib/dna/layout';
import { FRAGMENT, VERTEX } from './shaders';

interface Props {
  count: number;
  frozen: boolean;
  running: boolean;
  tilt: RefObject<{ x: number; y: number }>;
  dpr: number;
  onReady: () => void;
  onLost: () => void;
}

const INTRO_SECONDS = 2.4;
const IVORY = new THREE.Color('#edeae4');
const SIGNAL = new THREE.Color('#ff5a1f');

function Helix({ count, frozen, tilt, onReady }: Pick<Props, 'count' | 'frozen' | 'tilt' | 'onReady'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  const start = useRef<number | null>(null);
  const gl = useThree((s) => s.gl);

  const geometry = useMemo(() => {
    const layout = buildLayout({ count });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(layout.helix, 3));
    g.setAttribute('aCloud', new THREE.BufferAttribute(layout.cloud, 3));
    g.setAttribute('aRole', new THREE.BufferAttribute(layout.role, 1));
    g.setAttribute('aPair', new THREE.BufferAttribute(layout.pair, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(layout.seed, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: frozen ? 1 : 0 },
          uFocus: { value: -1 },
          uPixelRatio: { value: gl.getPixelRatio() },
          uSize: { value: 2.2 },
          uIvory: { value: IVORY },
          uSignal: { value: SIGNAL },
        },
      }),
    [frozen, gl],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    if (!frozen) {
      if (start.current === null) start.current = state.clock.elapsedTime;
      u.uTime.value += delta;
      u.uIntro.value = Math.min(1, (state.clock.elapsedTime - start.current) / INTRO_SECONDS);
    }
    const g = group.current;
    if (g) {
      // Slow spin plus a few degrees of tilt towards the pointer (fine pointers only, see DnaStage).
      current.current.x += (tilt.current.x - current.current.x) * 0.05;
      current.current.y += (tilt.current.y - current.current.y) * 0.05;
      g.rotation.y = (frozen ? 0.6 : u.uTime.value * 0.12) + current.current.y;
      g.rotation.x = current.current.x;
    }
    if (++frames.current === 2) onReady();
  });

  return (
    <group ref={group} rotation={[0, 0, -0.32]}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

export default function DnaCanvas({ count, frozen, running, tilt, dpr, onReady, onLost }: Props) {
  return (
    <Canvas
      dpr={[1, dpr]}
      frameloop={running || frozen ? 'always' : 'never'}
      camera={{ fov: 35, position: [0, 0, 13] }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: frozen }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost(); }, { once: true });
      }}
    >
      <Helix count={count} frozen={frozen} tilt={tilt} onReady={onReady} />
    </Canvas>
  );
}
