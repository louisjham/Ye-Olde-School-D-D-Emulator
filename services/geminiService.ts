
import { GoogleGenAI } from "@google/genai";
import { GameState, ModuleData, CombatPhase } from "../types";

export class DMService {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getDMResponse(gameState: GameState, moduleData: ModuleData, playerInput: string): Promise<string> {
    const partyStats = gameState.party.map(c => {
      return `${c.name} (${c.class} L${c.level}, HP:${c.hp}/${c.maxHp})`;
    }).join(', ');

    const systemInstruction = `
      You are a legendary 1st Edition AD&D Dungeon Master from the early 1980s.
      Your tone is descriptive, authoritative, and slightly formal—reminiscent of Gary Gygax's writing style.
      
      AD&D 1E RULES TO ENFORCE:
      - 0 HP is DEATH.
      - 1 GP = 1 XP.
      - Light and encumbrance matter.
      - Combat is deadly and often to be avoided through cleverness.

      DM STYLE:
      - SENSES: Describe the chill of the dungeon air, the flicker of torchlight, and the sound of distant, rattling chains.
      - NO TERMINAL TALK: Do not use computer terminology (e.g., "processing," "buffer"). Use fantasy terms (e.g., "The mists of time," "The roll of the fates").
      - FORMATTING: Keep descriptions evocative but concise. Use standard text, not markdown headers.
      - CONSEQUENCES: If the players are reckless, describe their doom with impartial gravity.

      Current Module: ${moduleData.name}
      Current Party: ${partyStats}
      Location: ${gameState.location}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: playerInput,
        config: {
          systemInstruction,
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      return response.text || "The fates are silent...";
    } catch (error) {
      return "An ethereal disturbance blocks your path. (System Error)";
    }
  }
}
