import { Point3D, FruitData, LeafData } from '../types';
import * as THREE from 'three';

export interface PlantDNA {
  name: string;
  description: string;
  plantType: 'vine' | 'fern' | 'fungus' | 'flower_stalk' | 'bush';
  complexity: number; // 1-10
  growthDirection: { x: number, y: number, z: number };
  stemColor: string;
  leafColor: string;
  fruitColor: string;
  hasLeaves: boolean;
  hasFruits: boolean;
  fruitType: 'balloon_flower' | 'lotus_flower' | 'tubular_flower' | 'jellyfish_flower' | 'daisy_flower' | 'fungus_cap' | 'giant_flower';
  leafType: 'glass_leaf' | 'wire_leaf' | 'fern' | 'broad' | 'needle';
  attachPoint?: 'top' | 'base' | 'random_branch';
  growthStyle?: 'straight' | 'twining' | 'erratic' | 'drooping';
}

export function generateProceduralPlant(dna: PlantDNA): { stems: Point3D[][], fruits: FruitData[], leaves: LeafData[], endPoint: Point3D } {
  const stems: Point3D[][] = [];
  const fruits: FruitData[] = [];
  const leaves: LeafData[] = [];

  const safeDNA = {
    ...dna,
    plantType: dna.plantType || 'vine',
    complexity: Math.min(10, Math.max(1, Number(dna.complexity) || 5)),
    growthDirection: dna.growthDirection || { x: 0, y: 1, z: 0 },
    stemColor: dna.stemColor || '#ffffff',
    leafColor: dna.leafColor || '#00ff00',
    fruitColor: dna.fruitColor || '#ff0000',
    hasLeaves: true, // Force true to ensure leaves are always generated
    hasFruits: true, // Force true to ensure flowers are always generated
    fruitType: dna.fruitType || 'balloon_flower',
    leafType: dna.leafType || 'glass_leaf',
    attachPoint: dna.attachPoint || 'top',
    growthStyle: dna.growthStyle || 'straight',
  };

  const startPt = new THREE.Vector3(0, 0, 0);
  
  const gx = Number(safeDNA.growthDirection?.x) || 0;
  const gy = Number(safeDNA.growthDirection?.y) || 1;
  const gz = Number(safeDNA.growthDirection?.z) || 0;
  
  const dir = new THREE.Vector3(gx, gy, gz).normalize();
  if (isNaN(dir.x) || isNaN(dir.y) || isNaN(dir.z) || dir.lengthSq() === 0) {
    dir.set(0, 1, 0); // fallback
  }

  const length = 10 + safeDNA.complexity * 1.5; // Base length
  let endPt = startPt.clone();

  // Helper to generate a wavy curve
  const generateCurve = (start: THREE.Vector3, direction: THREE.Vector3, len: number, waviness: number, segments: number, style: string = 'straight') => {
    const curve: Point3D[] = [];
    let current = start.clone();
    curve.push({ x: current.x, y: current.y, z: current.z });
    
    const step = len / segments;
    let perp1 = new THREE.Vector3(1, 0, 0).cross(direction).normalize();
    if (perp1.lengthSq() < 0.1) perp1 = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
    const perp2 = direction.clone().cross(perp1).normalize();

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      current.add(direction.clone().multiplyScalar(step));
      
      let pt = current.clone();

      if (style === 'twining') {
        const radius = waviness * 2;
        const angle = t * Math.PI * 10; // 5 coils
        const offset = perp1.clone().multiplyScalar(Math.cos(angle) * radius).add(perp2.clone().multiplyScalar(Math.sin(angle) * radius));
        pt.add(offset);
      } else if (style === 'erratic') {
        const offset = perp1.clone().multiplyScalar((Math.random()-0.5)*waviness*4).add(perp2.clone().multiplyScalar((Math.random()-0.5)*waviness*4));
        pt.add(offset);
      } else {
        // Normal wavy
        const wave1 = Math.sin(t * Math.PI * 4) * waviness * (1 - t);
        const wave2 = Math.cos(t * Math.PI * 3) * waviness * (1 - t);
        const offset = perp1.clone().multiplyScalar(wave1).add(perp2.clone().multiplyScalar(wave2));
        pt.add(offset);
      }
      
      // Add gravity droop if it's growing sideways or drooping
      if (style === 'drooping' || direction.y < 0.2) {
         pt.y -= t * t * len * 0.5; // Droop down
      }

      curve.push({ x: pt.x, y: pt.y, z: pt.z });
    }
    return { curve, end: current };
  };

  if (safeDNA.plantType === 'vine' || safeDNA.plantType === 'flower_stalk') {
    // Single main stem with possible small branches
    const { curve, end } = generateCurve(startPt, dir, length, 2, 20, safeDNA.growthStyle);
    stems.push(curve);
    endPt = end;

    // Leaves along the main stem
    if (safeDNA.hasLeaves) {
      const numLeaves = Math.floor(safeDNA.complexity * 1.5);
      for (let i = 0; i < numLeaves; i++) {
        const t = 0.1 + Math.random() * 0.8;
        const idx = Math.floor(t * curve.length);
        if (idx < curve.length) {
          const p = curve[idx];
          const leafPos = new THREE.Vector3(p.x, p.y, p.z);
          const leafDir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
          leaves.push({ position: leafPos, direction: leafDir, type: safeDNA.leafType, color: safeDNA.leafColor, scale: 0.8 + Math.random() * 0.4 });
        }
      }
    }

    // Branches
    const numBranches = Math.floor(safeDNA.complexity / 2);
    for (let i = 0; i < numBranches; i++) {
      const t = 0.2 + Math.random() * 0.6; // Branch along the middle
      const idx = Math.floor(t * curve.length);
      const branchStart = new THREE.Vector3(curve[idx].x, curve[idx].y, curve[idx].z);
      
      let axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
      if (axis.lengthSq() < 0.001) axis = new THREE.Vector3(0, 1, 0);
      const branchDir = dir.clone().applyAxisAngle(axis, Math.PI / 3).normalize();
      const branchLen = length * 0.4 * Math.random();
      
      const { curve: bCurve, end: bEnd } = generateCurve(branchStart, branchDir, branchLen, 1, 10, safeDNA.growthStyle === 'twining' ? 'straight' : safeDNA.growthStyle);
      stems.push(bCurve);

      if (safeDNA.hasLeaves && Math.random() > 0.1) {
        leaves.push({ position: bEnd, direction: branchDir, type: safeDNA.leafType, color: safeDNA.leafColor, scale: 1 });
      }
      if (safeDNA.hasFruits && Math.random() > 0.2) {
        fruits.push({ position: bEnd, direction: branchDir, type: safeDNA.fruitType, color: safeDNA.fruitColor, scale: 0.8 });
      }
    }

    // Top fruit/flower
    if (safeDNA.hasFruits || safeDNA.plantType === 'flower_stalk') {
       fruits.push({ position: endPt, direction: dir, type: safeDNA.fruitType, color: safeDNA.fruitColor, scale: 1.5 });
    }

  } else if (safeDNA.plantType === 'bush' || safeDNA.plantType === 'fern') {
    // Multiple stems from base
    const numStems = 3 + Math.floor(safeDNA.complexity / 2);
    let highestY = -Infinity;
    
    for (let i = 0; i < numStems; i++) {
      const spreadDir = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (i / numStems) * Math.PI * 2 + Math.random() * 0.5);
      spreadDir.y += 0.5; // Upward bias
      spreadDir.normalize();
      
      const { curve, end } = generateCurve(startPt, spreadDir, length * (0.6 + Math.random() * 0.4), 1.5, 15, safeDNA.growthStyle);
      stems.push(curve);
      
      if (end.y > highestY) {
        highestY = end.y;
        endPt = end;
      }

      // Leaves along the stem for ferns
      if (safeDNA.plantType === 'fern' && safeDNA.hasLeaves) {
        for(let j = 2; j < curve.length - 1; j += 2) {
           const p = curve[j];
           const pDir = new THREE.Vector3(p.x - curve[j-1].x, p.y - curve[j-1].y, p.z - curve[j-1].z).normalize();
           let sideDir1 = pDir.clone().cross(new THREE.Vector3(0,1,0)).normalize();
           if (sideDir1.lengthSq() < 0.001) {
             sideDir1 = pDir.clone().cross(new THREE.Vector3(1,0,0)).normalize();
             if (sideDir1.lengthSq() < 0.001) {
               sideDir1 = new THREE.Vector3(1, 0, 0);
             }
           }
           const sideDir2 = sideDir1.clone().negate();
           
           leaves.push({ position: p, direction: sideDir1, type: 'fern', color: safeDNA.leafColor, scale: 0.5 * (1 - j/curve.length) });
           leaves.push({ position: p, direction: sideDir2, type: 'fern', color: safeDNA.leafColor, scale: 0.5 * (1 - j/curve.length) });
        }
      } else if (safeDNA.hasLeaves) {
        leaves.push({ position: end, direction: spreadDir, type: safeDNA.leafType, color: safeDNA.leafColor, scale: 1.2 });
      }

      if (safeDNA.hasFruits && Math.random() > 0.3) {
        fruits.push({ position: end, direction: spreadDir, type: safeDNA.fruitType, color: safeDNA.fruitColor, scale: 1 });
      }
    }
  } else if (safeDNA.plantType === 'fungus') {
    // Short thick stem, big cap
    const { curve, end } = generateCurve(startPt, dir, length * 0.5, 0.5, 10, safeDNA.growthStyle);
    stems.push(curve);
    endPt = end;

    fruits.push({ position: end, direction: dir, type: safeDNA.fruitType, color: safeDNA.fruitColor, scale: 2 + safeDNA.complexity * 0.2 });
    
    // Maybe smaller fungi around base
    const numSmall = Math.floor(safeDNA.complexity / 3);
    for(let i=0; i<numSmall; i++) {
       const offset = new THREE.Vector3((Math.random()-0.5)*4, 0, (Math.random()-0.5)*4);
       const { curve: sCurve, end: sEnd } = generateCurve(startPt.clone().add(offset), new THREE.Vector3(0,1,0), length * 0.2, 0.2, 5, safeDNA.growthStyle);
       stems.push(sCurve);
       fruits.push({ position: sEnd, direction: new THREE.Vector3(0,1,0), type: safeDNA.fruitType, color: safeDNA.fruitColor, scale: 0.8 });
    }
  } else {
    // Fallback for unknown types
    const { curve, end } = generateCurve(startPt, dir, length, 2, 20, safeDNA.growthStyle);
    stems.push(curve);
    endPt = end;
    if (safeDNA.hasLeaves) {
       leaves.push({ position: end, direction: dir, type: safeDNA.leafType, color: safeDNA.leafColor, scale: 1 });
    }
    if (safeDNA.hasFruits) {
       fruits.push({ position: end, direction: dir, type: safeDNA.fruitType, color: safeDNA.fruitColor, scale: 1 });
    }
  }

  return { stems, fruits, leaves, endPoint: { x: endPt.x, y: endPt.y, z: endPt.z } };
}
