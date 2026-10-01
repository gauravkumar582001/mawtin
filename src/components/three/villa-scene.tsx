'use client';
/**
 * Procedural 3D villa (react-three-fiber). No external model or HDR files are downloaded,
 * so it works offline and adds nothing to the asset budget. A listing's own glTF model
 * (Property.model3dUrl) can replace <Villa/> later with drei's useGLTF.
 */
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export interface VillaSceneProps {
  exploded?: boolean;
  dusk?: boolean;
  autoRotate?: boolean;
  interactive?: boolean;
  /** Camera distance multiplier: >1 is further away. */
  zoom?: number;
  className?: string;
}

const C = {
  stone: '#dcc49c',
  plaster: '#f3ece0',
  wood: '#7a4526',
  slat: '#8a5230',
  grass: '#8aa56c',
  paving: '#d9c8a8',
  pool: '#4fa9c0',
  wall: '#e2cfac',
  trunk: '#7d6040',
  leaf: '#4f7d3f',
  glass: '#bfe6f0',
  window: '#2c4750',
};

function Mat({ color, rough = 0.85, emissive, emissiveIntensity = 0 }: { color: string; rough?: number; emissive?: string; emissiveIntensity?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={0.02} emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity} />;
}

function Block({ p, s, color, rough }: { p: [number, number, number]; s: [number, number, number]; color: string; rough?: number }) {
  // Positions are given as the bottom-centre of the block, which is easier to read.
  return (
    <mesh position={[p[0], p[1] + s[1] / 2, p[2]]} castShadow receiveShadow>
      <boxGeometry args={s} />
      <Mat color={color} rough={rough} />
    </mesh>
  );
}

function Window({ p, s, dusk }: { p: [number, number, number]; s: [number, number]; dusk: boolean }) {
  return (
    <mesh position={p}>
      <boxGeometry args={[s[0], s[1], 0.04]} />
      <Mat color={dusk ? '#ffd58a' : C.window} rough={0.2} emissive="#ffb347" emissiveIntensity={dusk ? 1.4 : 0} />
    </mesh>
  );
}

function Palm({ p, h = 3.4 }: { p: [number, number, number]; h?: number }) {
  const leaves = useMemo(() => Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2), []);
  return (
    <group position={p}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, h, 8]} />
        <Mat color={C.trunk} />
      </mesh>
      {leaves.map((a, i) => (
        <group key={i} position={[0, h, 0]} rotation={[0, a, 0]}>
          <mesh position={[0.8, -0.18, 0]} rotation={[0, 0, -0.38 - (i % 2) * 0.18]} scale={[0.95, 0.06, 0.26]} castShadow>
            <sphereGeometry args={[1, 10, 6]} />
            <meshStandardMaterial color={C.leaf} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Villa({ exploded, dusk }: { exploded: boolean; dusk: boolean }) {
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.001, dt); // frame-rate independent easing
    if (g1.current) g1.current.position.y = THREE.MathUtils.lerp(g1.current.position.y, exploded ? 0.8 : 0, k);
    if (g2.current) g2.current.position.y = THREE.MathUtils.lerp(g2.current.position.y, exploded ? 2.9 : 0, k);
  });

  const slats = useMemo(() => Array.from({ length: 9 }, (_, i) => -0.5 + i * 0.125), []);

  return (
    <group position={[0, -1.6, 0]}>
      {/* Plot */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[14, 0.2, 10.5]} />
        <Mat color={C.grass} />
      </mesh>
      <mesh position={[0, 0.005, 4.3]} receiveShadow>
        <boxGeometry args={[14, 0.02, 1.9]} />
        <Mat color={C.paving} />
      </mesh>
      <mesh position={[2.1, 0.02, 3.0]} receiveShadow>
        <boxGeometry args={[4.8, 0.03, 2.6]} />
        <Mat color="#e8dcc6" />
      </mesh>
      <mesh position={[2.1, 0.04, 3.0]}>
        <boxGeometry args={[3.8, 0.03, 1.7]} />
        <meshStandardMaterial color={C.pool} roughness={0.1} metalness={0.1} emissive="#39d0e6" emissiveIntensity={dusk ? 0.9 : 0.05} />
      </mesh>
      {/* Boundary wall */}
      <Block p={[0, 0, 5.15]} s={[14, 0.55, 0.22]} color={C.wall} />
      <Block p={[-6.9, 0, 0]} s={[0.22, 0.55, 10.5]} color={C.wall} />

      {/* Ground floor */}
      <group ref={g1}>
        <Block p={[-2.4, 0, -0.25]} s={[3.25, 2.3, 3.75]} color={C.stone} />
        <Block p={[1.75, 0, 0]} s={[5, 2.3, 4.25]} color={C.plaster} />
        <Window p={[0.6, 1.15, 2.14]} s={[1.6, 1.3]} dusk={dusk} />
        <Window p={[3.0, 1.15, 2.14]} s={[1.6, 1.3]} dusk={dusk} />
        {/* Teak slats on the stone tower */}
        {slats.map((x, i) => (
          <mesh key={i} position={[-2.4 + x, 1.95, 1.62]} castShadow>
            <boxGeometry args={[0.07, 3.7, 0.12]} />
            <Mat color={C.slat} rough={0.7} />
          </mesh>
        ))}
      </group>

      {/* Upper floor */}
      <group ref={g2}>
        <Block p={[-2.4, 2.3, -0.25]} s={[3.25, 2.4, 3.75]} color={C.stone} />
        <Block p={[2.4, 2.3, -0.7]} s={[3.75, 2.15, 2.85]} color={C.plaster} />
        <Window p={[2.4, 3.4, 0.74]} s={[2.6, 1.1]} dusk={dusk} />
        <mesh position={[1.75, 2.65, 2.08]}>
          <boxGeometry args={[5, 0.7, 0.05]} />
          <meshStandardMaterial color={C.glass} transparent opacity={0.38} roughness={0.05} />
        </mesh>
        <RoundedBox args={[6.4, 0.24, 4.3]} radius={0.05} position={[1.45, 4.57, -0.1]} castShadow>
          <Mat color={C.wood} rough={0.6} />
        </RoundedBox>
      </group>

      <Palm p={[-5.4, 0, 3.0]} h={3.8} />
      <Palm p={[5.4, 0, -3.6]} h={3.2} />
      <Palm p={[-5.0, 0, -3.6]} h={2.8} />
    </group>
  );
}

function Lights({ dusk }: { dusk: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.01, dt);
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(sun.current.intensity, dusk ? 0.35 : 2.4, k);
      sun.current.color.lerp(new THREE.Color(dusk ? '#ff9a5a' : '#fff4e2'), k);
    }
    if (amb.current) amb.current.intensity = THREE.MathUtils.lerp(amb.current.intensity, dusk ? 0.18 : 0.55, k);
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(hemi.current.intensity, dusk ? 0.25 : 0.8, k);
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.55} />
      <hemisphereLight ref={hemi} args={['#dff1f5', '#8a7a5a', 0.8]} />
      <directionalLight
        ref={sun}
        position={[8, 12, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
}

export default function VillaScene({ exploded = false, dusk = false, autoRotate = true, interactive = true, zoom = 1, className }: VillaSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stop rendering when the canvas is off screen.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className={className} style={{ touchAction: interactive ? 'pan-y' : 'auto' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [11 * zoom, 7.5 * zoom, 12 * zoom], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Lights dusk={dusk} />
        <Villa exploded={exploded} dusk={dusk} />
        <ContactShadows position={[0, -1.72, 0]} opacity={0.35} scale={22} blur={2.4} far={6} />
        <OrbitControls
          enabled={interactive}
          enablePan={false}
          enableZoom={interactive}
          minDistance={10}
          maxDistance={28}
          minPolarAngle={0.35}
          maxPolarAngle={1.35}
          autoRotate={autoRotate && !reduce}
          autoRotateSpeed={0.8}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
