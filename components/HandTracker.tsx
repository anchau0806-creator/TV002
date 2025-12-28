
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { HandData, GestureMode } from '../types';

interface HandTrackerProps {
  isEnabled: boolean;
  onUpdate: (data: HandData) => void;
  onCameraReady: (ready: boolean) => void;
  onModelLoaded: (loaded: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ isEnabled, onUpdate, onCameraReady, onModelLoaded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number>();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Smoothing and Persistence state
  const smoothedData = useRef<HandData>({
    x: 0.5, y: 0.5, gesture: 'NONE', isPinching: false, pinchX: 0.5
  });
  
  const persistence = useRef({
    count: 0,
    lastDetected: 'NONE' as GestureMode,
    stableGesture: 'NONE' as GestureMode
  });

  // Step 1: Load MediaPipe Model Once
  useEffect(() => {
    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        recognizerRef.current = gestureRecognizer;
        setModelLoaded(true);
        onModelLoaded(true);
      } catch (error) {
        console.error("MediaPipe initialization failed:", error);
      }
    };
    setupMediaPipe();
  }, [onModelLoaded]);

  // Step 2: Handle Camera Lifecycle
  useEffect(() => {
    if (!modelLoaded) return;

    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: 30 }
        });
        currentStream = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          onCameraReady(true);
          detect();
        };
      } catch (err) {
        console.error("Camera access denied:", err);
        onCameraReady(false);
      }
    };

    const stopCamera = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      onCameraReady(false);
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const detect = () => {
      if (videoRef.current && recognizerRef.current && videoRef.current.readyState >= 2) {
        const results = recognizerRef.current.recognizeForVideo(videoRef.current, performance.now());
        
        let rawX = 0.5, rawY = 0.5, rawGesture: GestureMode = 'NONE';
        let rawIsPinching = false, rawPinchX = 0.5;

        if (results.landmarks && results.landmarks.length > 0) {
          const masterLandmarks = results.landmarks[0];
          const masterGestureName = results.gestures?.[0]?.[0]?.categoryName || 'NONE';
          
          rawX = 1 - masterLandmarks[9].x;
          rawY = masterLandmarks[9].y;
          
          if (masterGestureName === 'Open_Palm') rawGesture = 'OPEN_PALM';
          else if (masterGestureName === 'Closed_Fist') rawGesture = 'CLOSED_FIST';

          if (results.landmarks.length > 1) {
            const sL = results.landmarks[1];
            const dist = Math.sqrt(
              Math.pow(sL[4].x - sL[8].x, 2) + 
              Math.pow(sL[4].y - sL[8].y, 2)
            );
            if (dist < 0.05) { 
              rawIsPinching = true;
              rawPinchX = 1 - sL[9].x;
            }
          }
        }

        if (rawGesture === persistence.current.lastDetected) {
          persistence.current.count++;
          if (persistence.current.count >= 8) {
            persistence.current.stableGesture = rawGesture;
          }
        } else {
          persistence.current.lastDetected = rawGesture;
          persistence.current.count = 0;
        }

        const alpha = 0.15;
        smoothedData.current = {
          x: lerp(smoothedData.current.x, rawX, alpha),
          y: lerp(smoothedData.current.y, rawY, alpha),
          gesture: persistence.current.stableGesture,
          isPinching: rawIsPinching,
          pinchX: lerp(smoothedData.current.pinchX, rawPinchX, alpha)
        };

        onUpdate({ ...smoothedData.current });
      }
      requestRef.current = requestAnimationFrame(detect);
    };

    if (isEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isEnabled, modelLoaded, onUpdate, onCameraReady]);

  return (
    <video 
      ref={videoRef} 
      className="absolute top-4 right-4 w-40 h-30 rounded-lg border-2 border-red-500/20 shadow-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 z-50 pointer-events-none scale-x-[-1]"
      muted 
      playsInline
    />
  );
};

export default HandTracker;
