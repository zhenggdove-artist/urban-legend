import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Bugs: React.FC<{ plantHeight: number }> = ({ plantHeight }) => {
  const safeHeight = isNaN(Number(plantHeight)) ? 0 : Number(plantHeight);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Calculate how many bugs based on plant height
  const bugCount = Math.max(0, Math.min(100, 20 + Math.floor(safeHeight * 1.5))) || 20;

  const bugs = useMemo(() => {
    return Array.from({ length: 100 }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        Math.random() * Math.max(15, safeHeight + 10),
        (Math.random() - 0.5) * 30
      ),
      speed: Math.random() * 0.02 + 0.01,
      offset: Math.random() * Math.PI * 2,
      color: new THREE.Color(Math.random() > 0.7 ? '#ff00aa' : (Math.random() > 0.5 ? '#aaff00' : '#00ffff'))
    }));
  }, [plantHeight]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < bugCount; i++) {
      const bug = bugs[i];
      if (!bug) continue;

      // Complex swarming movement
      dummy.position.x = bug.position.x + Math.sin(time * bug.speed * 50 + bug.offset) * 3;
      dummy.position.y = bug.position.y + Math.cos(time * bug.speed * 40 + bug.offset) * 2;
      dummy.position.z = bug.position.z + Math.sin(time * bug.speed * 60 + bug.offset) * 3;
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, bug.color);
    }
    
    meshRef.current.count = bugCount;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 100]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};
