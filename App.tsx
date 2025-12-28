
import React, { useState, useCallback } from 'react';
import Experience from './components/Experience';
import HandTracker from './components/HandTracker';
import Overlay from './components/Overlay';
import { HandData, DecorationImage } from './types';

const App: React.FC = () => {
  const [handData, setHandData] = useState<HandData>({ 
    x: 0.5, 
    y: 0.5, 
    gesture: 'NONE',
    isPinching: false,
    pinchX: 0.5
  });
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [images, setImages] = useState<DecorationImage[]>([]);

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
  }, []);

  const handleCameraStatus = useCallback((ready: boolean) => {
    setIsCameraReady(ready);
  }, []);

  const handleModelStatus = useCallback((loaded: boolean) => {
    setIsModelLoaded(loaded);
  }, []);

  const handleAddImage = useCallback((url: string) => {
    if (images.length >= 8) return;
    setImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url }]);
  }, [images]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraEnabled(prev => !prev);
    if (isCameraEnabled) {
      setIsCameraReady(false);
      // Reset hand data to neutral state when camera is off
      setHandData({ x: 0.5, y: 0.5, gesture: 'NONE', isPinching: false, pinchX: 0.5 });
    }
  }, [isCameraEnabled]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene */}
      <Experience handData={handData} decorationImages={images} />

      {/* Hand Tracker */}
      <HandTracker 
        isEnabled={isCameraEnabled}
        onUpdate={handleHandUpdate} 
        onCameraReady={handleCameraStatus}
        onModelLoaded={handleModelStatus}
      />

      {/* UI Overlay */}
      <Overlay 
        isLoading={!isModelLoaded || (isCameraEnabled && !isCameraReady)} 
        gesture={handData.gesture}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        images={images}
        isCameraEnabled={isCameraEnabled}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
};

export default App;
