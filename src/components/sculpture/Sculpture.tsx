'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { strandOffsets, strandPath, strandRadius, type RibbonParams } from './mobius';

interface Props {
  params: RibbonParams;
  frozen: boolean;
  running: boolean;
  progress: RefObject<number>;
  tilt: RefObject<{ x: number; y: number }>;
  dpr: number;
  onReady: () => void;
  onLost: () => void;
}

// The ring is about 4.8 units wide; keep at least this much visible on both axes.
const MIN_VISIBLE = 5.4;
const MIN_DISTANCE = 11;

/** Pulls the camera back so the ring fits stages that are narrower than tall. */
function FitCamera() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  useEffect(() => {
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const aspect = size.width / Math.max(size.height, 1);
    const zForWidth = MIN_VISIBLE / (k * aspect);
    const zForHeight = MIN_VISIBLE / k;
    camera.position.z = Math.max(MIN_DISTANCE, zForWidth, zForHeight);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Ribbon({
  params, frozen, progress, tilt, onReady,
}: Pick<Props, 'params' | 'frozen' | 'progress' | 'tilt' | 'onReady'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
  const idle = useRef(0);
  const frames = useRef(0);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xd8c196, metalness: 1, roughness: 0.24, clearcoat: 0.7, clearcoatRoughness: 0.2,
      }),
    [],
  );
  const geometries = useMemo(
    () =>
      strandOffsets(params).map((offset) => {
        const points = strandPath(params, offset).map(([x, y, z]) => new THREE.Vector3(x, y, z));
        const curve = new THREE.CatmullRomCurve3(points, true);
        return new THREE.TubeGeometry(curve, points.length, strandRadius(params, offset), 10, true);
      }),
    [params],
  );
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, 0.1); // a pause/resume must not snap the pose
    const p = progress.current ?? 0;
    const target = tilt.current ?? { x: 0, y: 0 };
    const k = 1 - Math.exp(-delta * 3);
    current.current.x += (target.x - current.current.x) * k;
    current.current.y += (target.y - current.current.y) * k;
    if (!frozen) idle.current += delta * 0.12;
    group.current.rotation.set(0.35 + current.current.x + p * 0.55, idle.current + current.current.y + p * 0.9, 0.1);
    // Signal once the scene has really drawn (the second tick renders right after this callback).
    frames.current += 1;
    if (frames.current === 2) onReady();
  });

  return (
    <group ref={group}>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={material} />
      ))}
    </group>
  );
}

export default function Sculpture({ params, frozen, running, progress, tilt, dpr, onReady, onLost }: Props) {
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: frozen }}
      camera={{ fov: 32, position: [0, 0, MIN_DISTANCE], near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onLost();
        });
      }}
    >
      <FitCamera />
      <Environment />
      <directionalLight color={0xffe3b0} intensity={2.2} position={[4, 5, 6]} />
      <directionalLight color={0x9fb4ff} intensity={0.6} position={[-6, -2, -4]} />
      <Ribbon params={params} frozen={frozen} progress={progress} tilt={tilt} onReady={onReady} />
    </Canvas>
  );
}
