import { GoogleGenAI, Type } from "@google/genai";
import { generateProceduralPlant, PlantDNA } from "./procedural";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePlantPart(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `User text: "${text}"\n\nAnalyze this text and generate DNA parameters for a procedural 3D plant part.`,
    config: {
      systemInstruction: `You are a bizarre botanist AI. The user will describe a surreal, ethereal, glass-like plant (ferns, giant flowers, fungi, vines, etc.).
Extract the features and return a JSON object representing the plant's DNA parameters.
CRITICAL: You MUST heavily randomize the growthDirection (can be negative for downwards/sideways), attachPoint, and growthStyle. Do not just build straight up! If the user asks for "roots" or "downward", make y negative. If they ask for "left" or "right", make x negative or positive. If they ask for "twining", use growthStyle: "twining". Make every generation visually distinct!
- name: A creative name for this part (in Traditional Chinese)
- description: How it relates to the user's text (in Traditional Chinese)
- plantType: MUST be one of: 'vine', 'fern', 'fungus', 'flower_stalk', 'bush'
- complexity: integer from 1 (very simple) to 10 (highly complex/dense)
- growthDirection: object with x, y, z (floats between -1.0 and 1.0). y can be strongly negative for roots, x/z for sideways growth.
- stemColor: hex color for the main stem/branches
- leafColor: hex color for leaves
- fruitColor: hex color for fruits/flowers/spores
- hasLeaves: boolean (ALWAYS set to true to ensure leaves/wires are generated)
- hasFruits: boolean (ALWAYS set to true to ensure flowers/fruits are generated)
- fruitType: MUST be one of: 'balloon_flower', 'lotus_flower', 'tubular_flower', 'jellyfish_flower', 'daisy_flower', 'fungus_cap', 'giant_flower' (CRITICAL: You MUST choose one of these specific flower types. Do not use generic or glowing_orb! Use balloon_flower for round pink flowers with gold centers, lotus_flower for complex mechanical/organic flowers, tubular_flower for long thin petals, jellyfish_flower for translucent hanging tentacles)
- leafType: MUST be one of: 'glass_leaf', 'wire_leaf', 'fern', 'broad', 'needle' (CRITICAL: You MUST choose one of these specific leaf types. Use glass_leaf for translucent wavy leaves, wire_leaf for chaotic thin wires)
- attachPoint: MUST be one of: 'top', 'base', 'random_branch' (base for roots/new plants, random_branch for side growth)
- growthStyle: MUST be one of: 'straight', 'twining', 'erratic', 'drooping'`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          plantType: { type: Type.STRING, enum: ['vine', 'fern', 'fungus', 'flower_stalk', 'bush'] },
          complexity: { type: Type.INTEGER },
          growthDirection: { 
            type: Type.OBJECT, 
            properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, z: { type: Type.NUMBER } } 
          },
          stemColor: { type: Type.STRING },
          leafColor: { type: Type.STRING },
          fruitColor: { type: Type.STRING },
          hasLeaves: { type: Type.BOOLEAN },
          hasFruits: { type: Type.BOOLEAN },
          fruitType: { type: Type.STRING, enum: ['balloon_flower', 'lotus_flower', 'tubular_flower', 'jellyfish_flower', 'daisy_flower', 'fungus_cap', 'giant_flower'] },
          leafType: { type: Type.STRING, enum: ['glass_leaf', 'wire_leaf', 'fern', 'broad', 'needle'] },
          attachPoint: { type: Type.STRING, enum: ['top', 'base', 'random_branch'] },
          growthStyle: { type: Type.STRING, enum: ['straight', 'twining', 'erratic', 'drooping'] }
        },
        required: ["name", "description", "plantType", "complexity", "growthDirection", "stemColor", "leafColor", "fruitColor", "hasLeaves", "hasFruits", "fruitType", "leafType", "attachPoint", "growthStyle"]
      }
    }
  });

  const textResponse = response.text || "{}";
  const match = textResponse.match(/\{[\s\S]*\}/);
  const jsonString = match ? match[0] : "{}";
  
  let dna: PlantDNA;
  try {
    dna = JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", textResponse);
    dna = {} as PlantDNA;
  }

  const { stems, fruits, leaves, endPoint } = generateProceduralPlant(dna);

  return {
    name: dna.name || 'Unknown Mutation',
    description: dna.description || 'A bizarre anomaly.',
    stems,
    fruits,
    leaves,
    stemColor: dna.stemColor || '#ffffff',
    endPoint,
    attachPoint: dna.attachPoint || 'top',
    growthStyle: dna.growthStyle || 'straight'
  };
}
