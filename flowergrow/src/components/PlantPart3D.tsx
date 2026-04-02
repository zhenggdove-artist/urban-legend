import React, { useMemo } from 'react';
import { PlantPart, FruitData, LeafData } from '../types';
import { Tube, Sphere, Torus, Cylinder, Cone } from '@react-three/drei';
import * as THREE from 'three';

const GlassMaterial = ({ color }: { color: string }) => (
  <meshPhysicalMaterial
    color={color}
    transmission={0.9}
    opacity={1}
    transparent={true}
    roughness={0.1}
    metalness={0.2}
    ior={1.5}
    thickness={0.5}
    clearcoat={1}
  />
);

const GlowingCore = ({ color, scale = 1 }: { color: string, scale?: number }) => (
  <Sphere args={[0.4 * scale, 32, 32]}>
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={2}
      toneMapped={false}
    />
  </Sphere>
);

const Fruit = ({ data }: { data: FruitData }) => {
  const pos = new THREE.Vector3(Number(data.position?.x) || 0, Number(data.position?.y) || 0, Number(data.position?.z) || 0);
  const dir = new THREE.Vector3(Number(data.direction?.x) || 0, Number(data.direction?.y) || 1, Number(data.direction?.z) || 0);
  if (dir.lengthSq() < 0.001) dir.set(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  const scale = Number(data.scale) || 1;
  const color = data.color || '#ff0000';

  return (
    <group position={pos} rotation={euler} scale={scale}>
      {(data.type === 'balloon_flower' || data.type === 'generic' || data.type === 'none' || !data.type) && (
        <group>
          {/* Main balloon petals */}
          {[...Array(6)].map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
              <Sphere args={[1.2, 32, 16]} scale={[0.6, 0.2, 1]} position={[1.2, 0, 0]} rotation={[0, 0, 0.3]}>
                <GlassMaterial color={color} />
              </Sphere>
              {/* Little golden dots on petals */}
              {[...Array(5)].map((_, j) => (
                <Sphere key={`dot-${j}`} args={[0.08, 8, 8]} position={[1.2 + (Math.random()-0.5)*0.8, 0.2, (Math.random()-0.5)*0.8]}>
                  <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
                </Sphere>
              ))}
            </group>
          ))}
          {/* Giant golden center */}
          <Sphere args={[0.8, 32, 32]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.05} />
          </Sphere>
        </group>
      )}

      {data.type === 'giant_flower' && (
        <group>
          {[...Array(12)].map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 6, 0]}>
              <Sphere args={[1.5, 32, 16]} scale={[0.4, 0.1, 1]} position={[1.5, 0, 0]} rotation={[0, 0, 0.2]}>
                <GlassMaterial color={color} />
              </Sphere>
            </group>
          ))}
          {[...Array(8)].map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 4 + 0.2, 0]}>
              <Sphere args={[1.0, 32, 16]} scale={[0.4, 0.1, 1]} position={[1.0, 0.5, 0]} rotation={[0, 0, 0.5]}>
                <GlassMaterial color="#ffffff" />
              </Sphere>
            </group>
          ))}
          <GlowingCore color="#FFAA00" scale={2.5} />
        </group>
      )}

      {(data.type === 'balloon_flower' || data.type === 'generic' || data.type === 'none' || !data.type) && (
        <group>
          {/* Main balloon petals */}
          {[...Array(6)].map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
              <Sphere args={[1.2, 32, 16]} scale={[0.6, 0.2, 1]} position={[1.2, 0, 0]} rotation={[0, 0, 0.3]}>
                <GlassMaterial color={color} />
              </Sphere>
              {/* Little golden dots on petals */}
              {[...Array(5)].map((_, j) => (
                <Sphere key={`dot-${j}`} args={[0.08, 8, 8]} position={[1.2 + (Math.random()-0.5)*0.8, 0.2, (Math.random()-0.5)*0.8]}>
                  <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
                </Sphere>
              ))}
            </group>
          ))}
          {/* Giant golden center */}
          <Sphere args={[0.8, 32, 32]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.05} />
          </Sphere>
        </group>
      )}

      {data.type === 'lotus_flower' && (
        <group>
          {/* Outer petals */}
          {[...Array(8)].map((_, i) => (
            <group key={`outer-${i}`} rotation={[0, (i * Math.PI) / 4, 0]}>
              <Sphere args={[1.8, 32, 16]} scale={[0.3, 0.05, 1]} position={[1.5, -0.2, 0]} rotation={[0, 0, 0.1]}>
                <GlassMaterial color={color} />
              </Sphere>
            </group>
          ))}
          {/* Inner petals */}
          {[...Array(6)].map((_, i) => (
            <group key={`inner-${i}`} rotation={[0, (i * Math.PI) / 3 + 0.2, 0]}>
              <Sphere args={[1.2, 32, 16]} scale={[0.3, 0.05, 1]} position={[0.8, 0.2, 0]} rotation={[0, 0, 0.4]}>
                <GlassMaterial color="#ffffff" />
              </Sphere>
            </group>
          ))}
          {/* Wires/Stamens */}
          {[...Array(15)].map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.5;
            const height = 1 + Math.random() * 1.5;
            return (
              <Cylinder key={`stamen-${i}`} args={[0.02, 0.02, height, 8]} position={[Math.cos(angle)*radius, height/2, Math.sin(angle)*radius]} rotation={[(Math.random()-0.5)*0.5, 0, (Math.random()-0.5)*0.5]}>
                <meshStandardMaterial color={Math.random() > 0.5 ? "#FFD700" : "#4444ff"} metalness={0.8} roughness={0.2} />
              </Cylinder>
            );
          })}
          <GlowingCore color="#FFD700" scale={0.8} />
        </group>
      )}

      {data.type === 'tubular_flower' && (
        <group>
          {/* Tubular petals radiating outwards */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 16;
            return (
              <group key={i} rotation={[0, angle, 0]}>
                <Cylinder args={[0.1, 0.05, 2, 16]} position={[1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                  <GlassMaterial color={color} />
                </Cylinder>
                <Sphere args={[0.15, 16, 16]} position={[2, 0, 0]}>
                  <GlassMaterial color="#ffffff" />
                </Sphere>
              </group>
            );
          })}
          <GlowingCore color={color} scale={1.5} />
        </group>
      )}

      {data.type === 'jellyfish_flower' && (
        <group>
          {/* Bell */}
          <Sphere args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0.5, 0]}>
            <GlassMaterial color={color} />
          </Sphere>
          {/* Inner glowing core */}
          <GlowingCore color="#ffffff" scale={0.8} />
          {/* Tentacles */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            const radius = 0.8;
            return (
              <group key={i} position={[Math.cos(angle)*radius, 0.5, Math.sin(angle)*radius]}>
                <Cylinder args={[0.03, 0.01, 3, 8]} position={[0, -1.5, 0]} rotation={[(Math.random()-0.5)*0.2, 0, (Math.random()-0.5)*0.2]}>
                  <GlassMaterial color={color} />
                </Cylinder>
              </group>
            );
          })}
        </group>
      )}

      {data.type === 'daisy_flower' && (
        <group>
          {[...Array(12)].map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 6, 0]}>
              <Sphere args={[0.6, 32, 16]} scale={[0.4, 0.1, 1]} position={[0.6, 0, 0]}>
                <GlassMaterial color={color} />
              </Sphere>
            </group>
          ))}
          <Sphere args={[0.3, 32, 32]} position={[0, 0.05, 0]} scale={[1, 0.2, 1]}>
             <meshStandardMaterial color="#FFD700" roughness={0.8} />
          </Sphere>
        </group>
      )}

      {data.type === 'fungus_cap' && (
        <group>
          <Sphere args={[1.5, 32, 32]} scale={[1, 0.4, 1]} position={[0, 0, 0]}>
             <GlassMaterial color={color} />
          </Sphere>
          <Sphere args={[1.4, 32, 32]} scale={[1, 0.1, 1]} position={[0, -0.2, 0]}>
             <meshStandardMaterial color="#222222" roughness={0.9} />
          </Sphere>
          <GlowingCore color={color} scale={0.5} />
        </group>
      )}
    </group>
  );
};

const Leaf = ({ data }: { data: LeafData }) => {
  const pos = new THREE.Vector3(Number(data.position?.x) || 0, Number(data.position?.y) || 0, Number(data.position?.z) || 0);
  const dir = new THREE.Vector3(Number(data.direction?.x) || 0, Number(data.direction?.y) || 1, Number(data.direction?.z) || 0);
  if (dir.lengthSq() < 0.001) dir.set(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  const scale = Number(data.scale) || 1;
  const color = data.color || '#00ff00';

  return (
    <group position={pos} rotation={euler} scale={scale}>
      {(data.type === 'glass_leaf' || data.type === 'generic' || data.type === 'none' || !data.type) && (
        <group>
          <Sphere args={[1.5, 32, 16]} scale={[0.5, 0.05, 1]} position={[0, 0, 1.5]} rotation={[0, 0, 0.2]}>
            <GlassMaterial color={color} />
          </Sphere>
        </group>
      )}
      {data.type === 'wire_leaf' && (
        <group>
          {[...Array(3)].map((_, i) => {
             const curve = new THREE.CatmullRomCurve3([
               new THREE.Vector3(0, 0, 0),
               new THREE.Vector3((Math.random()-0.5)*2, Math.random()*2, 1),
               new THREE.Vector3((Math.random()-0.5)*3, Math.random()*3, 2),
               new THREE.Vector3((Math.random()-0.5)*4, Math.random()*4, 3)
             ]);
             return (
               <Tube key={i} args={[curve, 20, 0.02, 8, false]}>
                 <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
               </Tube>
             );
          })}
        </group>
      )}
      {data.type === 'broad' && (
        <Sphere args={[1, 32, 16]} scale={[0.8, 0.1, 1.5]} position={[0, 0, 1.5]}>
          <GlassMaterial color={color} />
        </Sphere>
      )}
      {data.type === 'needle' && (
        <Cone args={[0.1, 3, 16]} position={[0, 1.5, 0]}>
          <GlassMaterial color={color} />
        </Cone>
      )}
      {data.type === 'fern' && (
        <group>
          <Cylinder args={[0.05, 0.05, 3, 8]} position={[0, 1.5, 0]}>
             <GlassMaterial color={color} />
          </Cylinder>
          {[...Array(6)].map((_, i) => (
             <group key={i} position={[0, 0.5 + i * 0.4, 0]}>
                <Sphere args={[0.4, 16, 8]} scale={[1, 0.1, 0.3]} position={[0.4, 0, 0]} rotation={[0, 0, -0.2]}>
                  <GlassMaterial color={color} />
                </Sphere>
                <Sphere args={[0.4, 16, 8]} scale={[1, 0.1, 0.3]} position={[-0.4, 0, 0]} rotation={[0, 0, 0.2]}>
                  <GlassMaterial color={color} />
                </Sphere>
             </group>
          ))}
        </group>
      )}
    </group>
  );
};

export const PlantPart3D: React.FC<{ part: PlantPart }> = ({ part }) => {
  return (
    <group position={[Number(part.startX) || 0, Number(part.startY) || 0, Number(part.startZ) || 0]}>
      {/* Stems */}
      {part.stems.map((stemCurveData, idx) => {
        if (stemCurveData.length < 2) return null;
        const validPoints = stemCurveData
          .map(p => new THREE.Vector3(Number(p?.x) || 0, Number(p?.y) || 0, Number(p?.z) || 0))
          .filter((p, i, arr) => i === 0 || p.distanceToSquared(arr[i - 1]) > 0.0001);
          
        if (validPoints.length < 2) return null;
        
        const curve = new THREE.CatmullRomCurve3(validPoints);
        // Thinner stems for higher complexity to look more delicate
        const radius = Math.max(0.05, 0.2 - (part.stems.length * 0.01));
        return (
          <Tube key={`stem-${idx}`} args={[curve, 64, radius, 12, false]} castShadow receiveShadow>
            <GlassMaterial color={part.stemColor || '#ffffff'} />
          </Tube>
        );
      })}

      {/* Fruits */}
      {part.fruits.map((fruit, idx) => (
        <Fruit key={`fruit-${idx}`} data={fruit} />
      ))}

      {/* Leaves */}
      {part.leaves.map((leaf, idx) => (
        <Leaf key={`leaf-${idx}`} data={leaf} />
      ))}
    </group>
  );
};
