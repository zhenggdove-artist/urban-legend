/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlantPart } from './types';
import { generatePlantPart } from './services/gemini';
import { PlantPart3D } from './components/PlantPart3D';
import { Bugs } from './components/Bugs';
import { Send, Loader2, Skull } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

export default function App() {
  const [parts, setParts] = useState<PlantPart[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const currentText = inputText.trim();
    setInputText('');
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generatePlantPart(currentText);
      
      // Calculate starting position based on the end of the previous part
      let startX = 0;
      let startY = 0;
      let startZ = 0;
      
      setParts(prev => {
        if (prev.length > 0) {
          const attach = result.attachPoint || 'top';
          if (attach === 'base') {
            // Start near the ground
            startX = (Math.random() - 0.5) * 5;
            startY = 0;
            startZ = (Math.random() - 0.5) * 5;
          } else if (attach === 'random_branch') {
            // Start from a random previous part's endpoint
            const randomPart = prev[Math.floor(Math.random() * prev.length)];
            startX = randomPart.startX + (Number(randomPart.endPoint?.x) || 0) * Math.random();
            startY = randomPart.startY + (Number(randomPart.endPoint?.y) || 0) * Math.random();
            startZ = randomPart.startZ + (Number(randomPart.endPoint?.z) || 0) * Math.random();
          } else {
            // Default: stack on top of the last part
            const lastPart = prev[prev.length - 1];
            startX = lastPart.startX + (Number(lastPart.endPoint?.x) || 0);
            startY = lastPart.startY + (Number(lastPart.endPoint?.y) || 0);
            startZ = lastPart.startZ + (Number(lastPart.endPoint?.z) || 0);
          }
        }

        const newPart: PlantPart = {
          id: Date.now().toString(),
          name: result.name,
          description: result.description,
          stems: result.stems || [],
          fruits: result.fruits || [],
          leaves: result.leaves || [],
          stemColor: result.stemColor,
          textInput: currentText,
          startX,
          startY,
          startZ,
          endPoint: result.endPoint || { x: 0, y: 1, z: 0 },
          attachPoint: result.attachPoint
        };
        
        return [...prev, newPart];
      });

    } catch (err) {
      console.error(err);
      setError('Failed to synthesize DNA. Try again.');
      setInputText(currentText); // restore text
    } finally {
      setIsGenerating(false);
    }
  };

  const currentPlantHeight = parts.length > 0 
    ? Math.max(...parts.map(p => p.startY + (Number(p.endPoint?.y) || 0)))
    : 0;

  return (
    <div className="h-screen w-screen bg-[#050810] text-slate-200 font-sans flex overflow-hidden">
      {/* Left Pane: 3D Plant View */}
      <div className="flex-1 relative bg-[#050810] overflow-hidden flex flex-col">
        <div className="absolute top-6 left-8 z-20 text-white/50 text-sm tracking-[0.2em] font-light pointer-events-none">
          ETHEREAL FLORA SIMULATOR
        </div>
        <div className="absolute bottom-6 left-8 z-20 text-white/30 text-xs tracking-widest pointer-events-none">
          [ DRAG TO ROTATE / SCROLL TO ZOOM ]
        </div>
        
        <Canvas camera={{ position: [20, 20, 20], fov: 50 }} shadows>
          <color attach="background" args={['#050810']} />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[20, 30, 20]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
            shadow-camera-far={100}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          <Environment preset="night" />
          
          {/* Dynamically adjust camera target based on plant height */}
          <OrbitControls target={[0, currentPlantHeight / 2, 0]} />

          {/* Large Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#020408" roughness={0.8} metalness={0.2} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>

          {/* Flying Bugs */}
          <Bugs plantHeight={Math.max(20, currentPlantHeight)} />

          {/* Stacked Plant Parts */}
          {parts.map((part) => (
            <PlantPart3D key={part.id} part={part} />
          ))}

          <ContactShadows position={[0, 0.1, 0]} opacity={0.8} scale={40} blur={2} far={20} />

          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Right Pane: Controls */}
      <div className="w-[400px] flex flex-col bg-[#0a0f1a] border-l border-white/5 z-10 shrink-0 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
            <span className="text-white/60 font-serif italic text-xl">F</span>
          </div>
          <h1 className="text-2xl text-white/90 font-serif tracking-widest font-light">FLORA.AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {parts.length === 0 && (
            <div className="text-white/40 text-sm tracking-wider text-center mt-10 font-light italic">
              Awaiting initial seed sequence...
            </div>
          )}
          {parts.map((part, i) => (
            <div key={part.id} className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
              <div className="text-xs text-white/40 mb-2 tracking-widest uppercase">Sequence {i.toString().padStart(2, '0')}</div>
              <div className="text-white/80 text-sm mb-4 font-light italic">"{part.textInput}"</div>
              <div className="text-white/90 text-xl font-serif mb-2">{part.name}</div>
              <div className="text-white/50 text-sm leading-relaxed font-light">{part.description}</div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 bg-[#0a0f1a]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-white/60 text-xs tracking-[0.2em] uppercase">Cultivate New Growth</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              className="w-full h-32 bg-white/5 rounded-xl border border-white/10 p-4 text-white/90 focus:outline-none focus:border-white/30 focus:bg-white/10 resize-none font-light text-sm transition-all placeholder:text-white/20"
              placeholder="Describe the next evolution..."
            />
            {error && <div className="text-red-400/80 text-sm font-light">{error}</div>}
            <button
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white/90 disabled:text-white/30 py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all border border-white/10 disabled:border-transparent text-sm tracking-widest uppercase font-light mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cultivating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
