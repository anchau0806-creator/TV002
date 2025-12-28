
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { OrbitControls, Environment } from '@react-three/drei';
import Particles from './Particles';
import Snow from './Snow';
import Decorations from './Decorations';
import { HandData, DecorationImage } from '../types';

interface ExperienceProps {
  handData: HandData;
  decorationImages: DecorationImage[];
}

const Experience: React.FC<ExperienceProps> = ({ handData, decorationImages }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 18], fov: 45 }}
      gl={{ antialias: false, stencil: false, depth: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000005']} />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#FFD700" />
      
      <Suspense fallback={null}>
        <Snow />
        <Particles handData={handData} />
        <Decorations handData={handData} images={decorationImages} />
        
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={2.5} 
            radius={0.6}
          />
        </EffectComposer>
        
        <Environment preset="night" />
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={8} 
        maxDistance={35} 
        makeDefault 
      />
    </Canvas>
  );
};

export default Experience;
