
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PARTICLE_COUNT, TREE_HEIGHT, TREE_RADIUS, NEBULA_RADIUS, COLORS, ROTATION_SPEED_BASE } from '../constants';
import { HandData, ParticleData } from '../types';

interface ParticlesProps {
  handData: HandData;
}

const Particles: React.FC<ParticlesProps> = ({ handData }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const containerRef = useRef<THREE.Group>(null);
  
  const currentPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    const starCount = Math.floor(PARTICLE_COUNT * 0.10); // 10% for a dense solid star
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let tx, ty, tz;
      const isStarPart = i < starCount;

      if (isStarPart) {
        // Geometric 5-pointed star
        const starPoints = 5;
        const starAngle = Math.random() * Math.PI * 2;
        const starMod = (starAngle + Math.PI / 2) % (Math.PI * 2 / starPoints);
        const starArmProgress = Math.abs(starMod - (Math.PI / starPoints)) / (Math.PI / starPoints);
        
        const outerR = 0.95;
        const innerR = 0.35;
        const maxStarRadius = THREE.MathUtils.lerp(outerR, innerR, starArmProgress);
        
        // Fill logic: sample volume
        const r = Math.sqrt(Math.random()) * maxStarRadius;
        
        tx = Math.cos(starAngle) * r;
        ty = Math.sin(starAngle) * r + (TREE_HEIGHT / 2) + 0.9;
        tz = (Math.random() - 0.5) * 0.25;
      } else {
        // Volumetric tiered tree
        const y = Math.random() * TREE_HEIGHT;
        const progress = y / TREE_HEIGHT;
        const tierFactor = (Math.sin(progress * Math.PI * 12) * 0.15 + 0.85);
        const radiusAtY = (1 - progress) * TREE_RADIUS * tierFactor;
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = Math.sqrt(Math.random()) * radiusAtY;
        
        tx = Math.cos(angle) * innerRadius;
        ty = y - TREE_HEIGHT / 2;
        tz = Math.sin(angle) * innerRadius;
      }

      // Nebula sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r_neb = NEBULA_RADIUS * Math.pow(Math.random(), 0.6);
      const nx = r_neb * Math.sin(phi) * Math.cos(theta);
      const ny = r_neb * Math.sin(phi) * Math.sin(theta);
      const nz = r_neb * Math.cos(phi);

      let color = COLORS.BODY_WHITE;
      if (isStarPart) {
        color = COLORS.STAR;
      } else {
        const rand = Math.random();
        if (rand < 0.12) {
          color = Math.random() > 0.5 ? COLORS.ORNAMENT_RED : COLORS.ORNAMENT_GREEN;
        } else if (rand < 0.35) {
          color = COLORS.BODY_ICE_BLUE;
        } else {
          color = COLORS.BODY_WHITE;
        }
      }

      data.push({
        treePos: [tx, ty, tz],
        nebulaPos: [nx, ny, nz],
        color: [color.r, color.g, color.b],
        size: isStarPart ? 0.14 : 0.05 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2
      });

      // Initial positions in Nebula
      currentPositions[i * 3] = nx;
      currentPositions[i * 3 + 1] = ny;
      currentPositions[i * 3 + 2] = nz;
    }
    return data;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      tempColor.setRGB(p.color[0], p.color[1], p.color[2]);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [particles]);

  useFrame((state, delta) => {
    if (!meshRef.current || !containerRef.current) return;

    const isTree = handData.gesture === 'CLOSED_FIST';
    const time = state.clock.getElapsedTime();
    const lerpT = 1 - Math.exp(-4.0 * delta);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const target = isTree ? p.treePos : p.nebulaPos;
      const breathe = Math.sin(time * 1.5 + p.phase) * (isTree && i < PARTICLE_COUNT * 0.1 ? 0.03 : 0.08);

      const idx = i * 3;
      currentPositions[idx] += (target[0] - currentPositions[idx]) * lerpT;
      currentPositions[idx + 1] += (target[1] + breathe - currentPositions[idx + 1]) * lerpT;
      currentPositions[idx + 2] += (target[2] - currentPositions[idx + 2]) * lerpT;

      tempMatrix.makeTranslation(currentPositions[idx], currentPositions[idx + 1], currentPositions[idx + 2]);
      meshRef.current.setMatrixAt(i, tempMatrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Handle container rotation logic
    const rotSpeed = 1 - Math.exp(-3.0 * delta);
    if (handData.gesture === 'OPEN_PALM') {
      const targetRotY = (handData.x - 0.5) * Math.PI * 2.0;
      const targetRotX = (handData.y - 0.5) * Math.PI * 0.8;
      containerRef.current.rotation.y += (targetRotY - containerRef.current.rotation.y) * rotSpeed;
      containerRef.current.rotation.x += (targetRotX - containerRef.current.rotation.x) * rotSpeed;
    } else {
      if (handData.isPinching) {
        const pinchTargetY = (handData.pinchX - 0.5) * Math.PI * 5.0;
        containerRef.current.rotation.y += (pinchTargetY - containerRef.current.rotation.y) * rotSpeed;
      } else {
        containerRef.current.rotation.y += ROTATION_SPEED_BASE;
      }
      containerRef.current.rotation.x += (0 - containerRef.current.rotation.x) * rotSpeed; 
    }
  });

  return (
    <group ref={containerRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[0.07, 3, 3]} />
        <meshStandardMaterial 
          emissiveIntensity={2.8} 
          toneMapped={false} 
        />
      </instancedMesh>
    </group>
  );
};

export default Particles;
