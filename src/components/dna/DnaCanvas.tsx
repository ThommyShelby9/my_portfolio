'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { Gene } from '@/lib/dna/genes';
import { buildLayout, TUNNEL_LENGTH } from '@/lib/dna/layout';
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
  /** Traversal: `mix` in [0, 1] (0 outside, 1 inside the helix), `z` how far the camera flew. */
  tunnel: RefObject<{ mix: number; z: number }>;
  /** Phones and weak devices: a lighter bloom. */
  light: boolean;
  dpr: number;
  onReady: () => void;
  onLost: () => void;
}

const INTRO_SECONDS = 2.4;
// Linear colours: the bloom composer's OutputPass encodes to sRGB at the end.
const IVORY = new THREE.Color('#edeae4');
const SIGNAL = new THREE.Color('#ff5a1f');
/** Lean towards the camera once the shapes are horizontal (layers, rings), in radians. */
const LEAN = 0.35;
/** The helix is framed close; the other shapes (layers, rings, clusters) from further back. */
const CAMERA_Z = 10;
const CAMERA_Z_SHAPES = 13.5;
const FOV = 35;
const TUNNEL_FOV = 70;

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

function Helix({ count, signatures, frozen, tilt, state, focus, tunnel, light, onReady }: Omit<Props, 'running' | 'dpr' | 'onLost'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  const start = useRef<number | null>(null);
  const { gl, scene, camera, size } = useThree();

  const geometry = useMemo(() => {
    const layout = buildLayout({ count, signatures });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(layout.helix, 3));
    g.setAttribute('aCloud', new THREE.BufferAttribute(layout.cloud, 3));
    g.setAttribute('aLayers', new THREE.BufferAttribute(layout.layers, 3));
    g.setAttribute('aSign', new THREE.BufferAttribute(layout.signatures, 3));
    g.setAttribute('aClust', new THREE.BufferAttribute(layout.clusters, 3));
    g.setAttribute('aCalm', new THREE.BufferAttribute(layout.calm, 3));
    g.setAttribute('aTunnel', new THREE.BufferAttribute(layout.tunnel, 3));
    g.setAttribute('aRole', new THREE.BufferAttribute(layout.role, 1));
    g.setAttribute('aPair', new THREE.BufferAttribute(layout.pair, 1));
    g.setAttribute('aGroup', new THREE.BufferAttribute(layout.group, 1));
    g.setAttribute('aAlong', new THREE.BufferAttribute(layout.along, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(layout.seed, 1));
    // Shapes move far from the helix (and the traversal runs 60 units deep): never cull the cloud.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80);
    return g;
  }, [count, signatures]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: frozen ? 1 : 0 },
          uState: { value: 1 },
          uFocus: { value: -1 },
          uSignatures: { value: signatures?.length ?? 3 },
          uTunnel: { value: 0 },
          uTunnelZ: { value: 0 },
          uTunnelLen: { value: TUNNEL_LENGTH },
          uFocalDist: { value: CAMERA_Z },
          uPixelRatio: { value: gl.getPixelRatio() },
          uSize: { value: 1 },
          uIvory: { value: IVORY },
          uSignal: { value: SIGNAL },
        },
      }),
    [frozen, gl, signatures],
  );

  // Bloom: the glow that makes the particles read as light, not as dots.
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), light ? 0.32 : 0.45, 0.42, 0.2));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, light]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.width, size.height]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => composer.dispose(), [composer]);

  // Priority 1: this frame callback renders (through the composer) instead of R3F.
  useFrame((s, delta) => {
    const u = material.uniforms;
    const cam = camera as THREE.PerspectiveCamera;
    const k = frozen ? 0 : tunnel.current.mix;
    if (!frozen) {
      if (start.current === null) start.current = s.clock.elapsedTime;
      u.uTime.value += delta;
      u.uIntro.value = Math.min(1, (s.clock.elapsedTime - start.current) / INTRO_SECONDS);
      u.uState.value = state.current;
      u.uFocus.value = focus.current;
      u.uTunnel.value = k;
      u.uTunnelZ.value = tunnel.current.z;
    }
    current.current.x += (tilt.current.x - current.current.x) * 0.05;
    current.current.y += (tilt.current.y - current.current.y) * 0.05;

    // Desktop composition: the helix sits in the right third, text on the left; centred on phones.
    const aspect = size.width / Math.max(size.height, 1);
    const shapes = Math.min(1, Math.max(0, u.uState.value - 1)) * Math.min(1, Math.max(0, 5 - u.uState.value));
    const distance = mix(CAMERA_Z, CAMERA_Z_SHAPES, shapes);
    const halfWidth = distance * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * aspect;
    const offsetX = aspect > 1.1 ? halfWidth * 0.45 : 0;

    const g = group.current;
    if (g) {
      const lean = Math.min(1, Math.max(0, u.uState.value - 1)) * LEAN;
      const spin = frozen ? 0.6 : u.uTime.value * 0.14;
      // In the traversal the group straightens up so the tunnel runs along the camera axis.
      g.rotation.set(mix(lean, 0, k), mix(spin, 0, k), mix(-0.36, u.uTime.value * 0.12, k));
      g.position.x = mix(offsetX, 0, k);
    }

    // Camera: a few units of parallax with the pointer; it dives to the helix axis in the traversal.
    cam.fov = mix(FOV, TUNNEL_FOV, k);
    cam.position.set(current.current.y * 6 + mix(0, 0.5, k), -current.current.x * 6, mix(distance, 0, k));
    cam.lookAt(mix(current.current.y * 2, 0, k), 0, mix(0, -10, k));
    cam.updateProjectionMatrix();
    u.uFocalDist.value = mix(distance, 6, k);

    composer.render(delta);
    if (++frames.current === 2) onReady();
  }, 1);

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

export default function DnaCanvas({ running, dpr, onLost, frozen, ...rest }: Props) {
  return (
    <Canvas
      dpr={[1, dpr]}
      frameloop={running || frozen ? 'always' : 'never'}
      camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.05, far: 120 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: frozen }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.NoToneMapping;
        scene.background = new THREE.Color('#121211');
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost(); }, { once: true });
      }}
    >
      <Helix frozen={frozen} {...rest} />
    </Canvas>
  );
}
