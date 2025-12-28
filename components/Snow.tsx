
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const SNOW_COUNT = 2500;
const BOUNDS = 30;

const Snow: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  
  const snowData = useMemo(() => {
    const data = [];
    for (let i = 0; i < SNOW_COUNT; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * BOUNDS * 2,
          Math.random() * BOUNDS * 2,
          (Math.random() - 0.5) * BOUNDS * 2
        ),
        speed: 0.05 + Math.random() * 0.1,
        sway: Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    snowData.forEach((s, i) => {
      s.position.y -= s.speed;
      s.position.x += Math.sin(time + s.phase) * s.sway;
      
      if (s.position.y < -BOUNDS / 2) {
        s.position.y = BOUNDS;
      }

      tempMatrix.makeTranslation(s.position.x, s.position.y, s.position.z);
      meshRef.current?.setMatrixAt(i, tempMatrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SNOW_COUNT]}>
      <sphereGeometry args={[0.04, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
};

export default Snow;
