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
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Ribbon({ params, frozen, progress, tilt }: Omit<Props, 'running' | 'dpr'>) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: 0, y: 0 });
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
  useEffect(() => () => {
    geometries.forEach((g) => g.dispose());
    material.dispose();
  }, [geometries, material]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const p = progress.current ?? 0;
    const target = tilt.current ?? { x: 0, y: 0 };
    current.current.x += (target.x - current.current.x) * 0.05;
    current.current.y += (target.y - current.current.y) * 0.05;
    const idle = frozen ? 0 : clock.getElapsedTime() * 0.12;
    group.current.rotation.set(0.35 + current.current.x + p * 0.55, idle + current.current.y + p * 0.9, 0.1);
  });

  return (
    <group ref={group}>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={material} />
      ))}
    </group>
  );
}

export default function Sculpture({ params, frozen, running, progress, tilt, dpr }: Props) {
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: frozen }}
      camera={{ fov: 32, position: [0, 0, 11], near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Environment />
      <directionalLight color={0xffe3b0} intensity={2.2} position={[4, 5, 6]} />
      <directionalLight color={0x9fb4ff} intensity={0.6} position={[-6, -2, -4]} />
      <Ribbon params={params} frozen={frozen} progress={progress} tilt={tilt} />
    </Canvas>
  );
}
