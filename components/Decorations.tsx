
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { TREE_HEIGHT, TREE_RADIUS, NEBULA_RADIUS } from '../constants';
import { HandData, DecorationImage } from '../types';

interface DecorationsProps {
  handData: HandData;
  images: DecorationImage[];
}

const DecorationItem: React.FC<{ url: string; index: number; handData: HandData; count: number }> = ({ url, index, handData, count }) => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16; // Max sharpness for the sprites
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  const targets = useMemo(() => {
    // Tree Pos: Ornaments on the tree surface
    const y = (index / count) * (TREE_HEIGHT * 0.75) - (TREE_HEIGHT / 2) + 1.5;
    const progress = (y + TREE_HEIGHT / 2) / TREE_HEIGHT;
    const radius = (1 - progress) * TREE_RADIUS * 1.05; 
    const angle = index * (Math.PI * 2 / count) + (progress * Math.PI * 3);
    
    const tx = Math.cos(angle) * radius;
    const ty = y;
    const tz = Math.sin(angle) * radius;

    // Nebula Pos: Distributed points in the sphere
    const phi = Math.acos(-1 + (2 * index) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const r = NEBULA_RADIUS * 0.75;
    const nx = r * Math.sin(phi) * Math.cos(theta);
    const ny = r * Math.sin(phi) * Math.sin(theta);
    const nz = r * Math.cos(phi);

    return { tree: [tx, ty, tz], nebula: [nx, ny, nz], phase: Math.random() * Math.PI * 2 };
  }, [index, count]);

  const currentPos = useRef(new THREE.Vector3(...targets.nebula));

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const isTree = handData.gesture === 'CLOSED_FIST';
    const time = state.clock.getElapsedTime();
    
    const target = isTree ? targets.tree : targets.nebula;
    const lerpT = 1 - Math.exp(-3.5 * delta);
    
    // Floating movement in nebula, subtle in tree
    const breathe = Math.sin(time * 1.5 + targets.phase) * (isTree ? 0.05 : 0.25);
    
    currentPos.current.x += (target[0] - currentPos.current.x) * lerpT;
    currentPos.current.y += (target[1] + breathe - currentPos.current.y) * lerpT;
    currentPos.current.z += (target[2] - currentPos.current.z) * lerpT;
    
    meshRef.current.position.copy(currentPos.current);
    meshRef.current.quaternion.copy(state.camera.quaternion); // Always face camera
    
    // SCALE: Tree form (0.7), Nebula form (2.5) - noticeably larger in nebula
    const targetScale = isTree ? 0.7 : 2.5;
    const currentScale = meshRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    meshRef.current.scale.set(nextScale, nextScale, 1);
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide} 
          alphaTest={0.05}
          toneMapped={false} // Keeps original vivid colors without bloom washout
        />
      </mesh>
      {/* Subtle background glow to make the image "pop" */}
      <mesh scale={1.1} position={[0, 0, -0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Decorations: React.FC<DecorationsProps> = ({ handData, images }) => {
  if (images.length === 0) return null;

  return (
    <group>
      {images.map((img, i) => (
        <DecorationItem key={img.id} url={img.url} index={i} count={images.length} handData={handData} />
      ))}
    </group>
  );
};

export default Decorations;
