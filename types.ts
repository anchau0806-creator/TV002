
export type GestureMode = 'OPEN_PALM' | 'CLOSED_FIST' | 'NONE';

export interface HandData {
  x: number;
  y: number;
  gesture: GestureMode;
  isPinching: boolean;
  pinchX: number;
}

export interface ParticleData {
  treePos: [number, number, number];
  nebulaPos: [number, number, number];
  color: [number, number, number];
  size: number;
  phase: number;
}

export interface DecorationImage {
  id: string;
  url: string;
}
