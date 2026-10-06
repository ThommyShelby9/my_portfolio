'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { Gene } from '@/lib/dna/genes';
import { buildLayout } from '@/lib/dna/layout';
import { FRAGMENT, VERTEX } from './shaders';

interface Props {
  count: number;
  signatures?: readonly (readonly Gene[])[];
  frozen: boolean;
  running: boolean;
  tilt: RefObject<{ x: number; y: number }>;
  /** Current state in [1, 5] (src/lib/dna/layout.ts STATE), driven by DnaTrajectory. */
  state: RefObject<number>;
  /** Highlighted group of the current state, -1 for none. */
  focus: RefObject<number>;
  dpr: number;
  onReady: () => void;
  onLost: () => void;
}

const INTRO_SECONDS = 2.4;
// Raw sRGB values: a THREE.Color would be converted to linear and the custom shader never converts
// back, which turned the signal orange into a dark red.
const IVORY = new THREE.Vector3(237 / 255, 234 / 255, 228 / 255);
const SIGNAL = new THREE.Vector3(255 / 255, 90 / 255, 31 / 255);
/** Lean towards the camera once the shapes are horizontal (layers, rings), in radians. */
const LEAN = 0.35;

function Helix({ count, signatures, frozen, tilt, state, focus, onReady }: Omit<Props, 'running' | 'dpr' | 'onLost'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  const start = useRef<number | null>(null);
  const gl = useThree((s) => s.gl);

  const geometry = useMemo(() => {
    const layout = buildLayout({ count, signatures });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(layout.helix, 3));
    g.setAttribute('aCloud', new THREE.BufferAttribute(layout.cloud, 3));
    g.setAttribute('aLayers', new THREE.BufferAttribute(layout.layers, 3));
    g.setAttribute('aSign', new THREE.BufferAttribute(layout.signatures, 3));
    g.setAttribute('aClust', new THREE.BufferAttribute(layout.clusters, 3));
    g.setAttribute('aCalm', new THREE.BufferAttribute(layout.calm, 3));
    g.setAttribute('aRole', new THREE.BufferAttribute(layout.role, 1));
    g.setAttribute('aPair', new THREE.BufferAttribute(layout.pair, 1));
    g.setAttribute('aGroup', new THREE.BufferAttribute(layout.group, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(layout.seed, 1));
    // Shapes move far from the helix: never let frustum culling drop the whole cloud.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [count, signatures]);

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
          uState: { value: 1 },
          uFocus: { value: -1 },
          uSignatures: { value: signatures?.length ?? 3 },
          uPixelRatio: { value: gl.getPixelRatio() },
          uSize: { value: 2.4 },
          uIvory: { value: IVORY },
          uSignal: { value: SIGNAL },
        },
      }),
    [frozen, gl, signatures],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((s, delta) => {
    const u = material.uniforms;
    if (!frozen) {
      if (start.current === null) start.current = s.clock.elapsedTime;
      u.uTime.value += delta;
      u.uIntro.value = Math.min(1, (s.clock.elapsedTime - start.current) / INTRO_SECONDS);
      u.uState.value = state.current;
      u.uFocus.value = focus.current;
    }
    const g = group.current;
    if (g) {
      // Slow spin plus a few degrees of tilt towards the pointer (fine pointers only, see DnaStage).
      current.current.x += (tilt.current.x - current.current.x) * 0.05;
      current.current.y += (tilt.current.y - current.current.y) * 0.05;
      const lean = Math.min(1, Math.max(0, u.uState.value - 1)) * LEAN;
      g.rotation.y = (frozen ? 0.6 : u.uTime.value * 0.12) + current.current.y;
      g.rotation.x = current.current.x + lean;
    }
    if (++frames.current === 2) onReady();
  });

  return (
    <group ref={group} rotation={[0, 0, -0.32]}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

export default function DnaCanvas({ running, dpr, onLost, frozen, ...rest }: Props) {
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
      <Helix frozen={frozen} {...rest} />
    </Canvas>
  );
}
