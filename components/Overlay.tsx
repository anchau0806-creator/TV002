
import React, { useRef } from 'react';
import { GestureMode, DecorationImage } from '../types';

interface OverlayProps {
  isLoading: boolean;
  gesture: GestureMode;
  images: DecorationImage[];
  onAddImage: (url: string) => void;
  onRemoveImage: (id: string) => void;
  isCameraEnabled: boolean;
  onToggleCamera: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ 
  isLoading, 
  gesture, 
  images, 
  onAddImage, 
  onRemoveImage,
  isCameraEnabled,
  onToggleCamera
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAddImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-2 md:p-4 select-none">
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 pointer-events-auto">
          <div className="w-16 h-16 border-4 border-red-500 border-t-white rounded-full animate-spin mb-6"></div>
          <h2 className="text-white font-cinzel text-xl tracking-widest animate-pulse uppercase">
            Merry Christmas
          </h2>
          <p className="text-red-500/80 text-[10px] mt-4 uppercase tracking-[0.4em]">
            Initializing Winter Magic...
          </p>
        </div>
      )}

      {/* Header / Title */}
      <header className="text-center transform transition-all duration-700 mt-2">
        <h1 className="text-xl md:text-2xl font-cinzel font-bold bg-gradient-to-b from-white via-red-100 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] tracking-[0.2em] mb-0.5 uppercase">
          Merry Christmas
        </h1>
        <div className="flex items-center justify-center gap-2">
           <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
           <p className="text-white/30 tracking-[0.3em] font-light text-[7px] uppercase italic">
            Celestial Control
          </p>
           <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
        </div>
      </header>

      {/* Middle Right: Image Upload Slots */}
      {!isLoading && (
        <div className="flex gap-2 pointer-events-auto absolute top-1/2 -translate-y-1/2 right-4 flex-col items-center">
          {images.map(img => (
            <div key={img.id} className="relative group w-10 h-10 border border-white/20 rounded-lg overflow-hidden bg-black/40 backdrop-blur-md shadow-lg">
              <img src={img.url} className="w-full h-full object-cover" alt="decoration" />
              <button 
                onClick={() => onRemoveImage(img.id)}
                className="absolute inset-0 flex items-center justify-center bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]"
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < 8 && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 border border-dashed border-white/30 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-white/50 text-lg font-light"
            >
              +
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <span className="text-[6px] text-white/30 uppercase tracking-[0.2em] text-center mt-1">Decor (Max 8)</span>
          
          {/* Camera Toggle Button */}
          <button 
            onClick={onToggleCamera}
            className={`mt-4 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${isCameraEnabled ? 'border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 bg-white/5 text-white/30'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              {isCameraEnabled ? (
                <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
              ) : (
                <path d="M14.384 3.098A.5.5 0 0 1 14.5 3.5V13a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V3.5a.5.5 0 0 1 .5-.5h2.454l.128-.255a.5.5 0 0 1 .447-.245h5.942a.5.5 0 0 1 .447.245l.128.255h2.454zM2 4v9h12V4h-2.546l-.328-.658a1.5 1.5 0 0 0-1.341-.737H6.215a1.5 1.5 0 0 0-1.341.737L4.546 4H2zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
              )}
            </svg>
          </button>
          <span className="text-[6px] text-white/30 uppercase tracking-[0.2em] text-center mt-1">Cam</span>
        </div>
      )}

      {/* Footer & Instruction Banner */}
      <div className="w-full flex flex-col items-center transition-all duration-500 pb-2 md:pb-6 gap-3">
        <div className="w-fit flex flex-col gap-1 items-center text-white/40 text-[7px] md:text-[8px] tracking-[0.25em] uppercase font-light bg-black/60 px-6 py-2 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex flex-wrap justify-center items-center gap-x-4 md:gap-x-8 gap-y-1">
            <span className={`transition-all duration-500 ${gesture === 'OPEN_PALM' ? 'text-red-400 font-bold scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`}>
              Palm: Nebula
            </span>
            <div className={`w-1 h-1 rounded-full transition-colors duration-500 ${gesture === 'NONE' ? 'bg-red-500/20' : 'bg-red-500/60'}`}></div>
            <span className={`transition-all duration-500 ${gesture === 'CLOSED_FIST' ? 'text-red-400 font-bold scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`}>
              Fist: Morph Tree
            </span>
            <div className="w-1 h-1 rounded-full bg-red-500/20 hidden md:block"></div>
            <span className="text-white/70">
              Pinch: Spin Tree
            </span>
          </div>
        </div>

        <a 
          href="https://www.facebook.com/voquochoang82" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto text-[9px] text-yellow-500/50 hover:text-yellow-400 hover:scale-105 transition-all tracking-[0.4em] font-cinzel uppercase"
        >
          Follow FB Hoàng
        </a>
      </div>

    </div>
  );
};

export default Overlay;
