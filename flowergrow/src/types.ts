export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FruitData {
  position: Point3D;
  direction: Point3D;
  type: 'eyeball' | 'mouth' | 'glowing_orb' | 'generic' | 'fungus_cap' | 'giant_flower';
  color: string;
  scale: number;
}

export interface LeafData {
  position: Point3D;
  direction: Point3D;
  type: 'fern' | 'broad' | 'needle';
  color: string;
  scale: number;
}

export interface PlantPart {
  id: string;
  name: string;
  description: string;
  textInput: string;
  
  // Organic Data
  stems: Point3D[][];
  fruits: FruitData[];
  leaves: LeafData[];
  stemColor: string;
  
  // Connection points
  startX: number;
  startY: number;
  startZ: number;
  endPoint: Point3D; // Relative to start, where the next part attaches
  attachPoint?: string;
}
