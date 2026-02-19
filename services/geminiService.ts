
import { GoogleGenAI } from "@google/genai";
import { GameState, ModuleData, Character } from "../types";

export class DMService {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getDMResponse(gameState: GameState, moduleData: ModuleData, playerInput: string): Promise<string> {
    const activeChar = gameState.party.find(c => c.id === gameState.activeCharacterId);
    
    const partyStats = gameState.party.map(c => {
      const weight = c.inventory.reduce((acc, i) => acc + i.weight, 0);
      const maxWeight = c.stats.STR * 100;
      const isActive = c.id === gameState.activeCharacterId ? "[ACTIVE]" : "";
      return `${c.name} ${isActive} (${c.class} L${c.level}, HP:${c.hp}/${c.maxHp}, AC:${c.ac}, Load:${weight}/${maxWeight}, Spells:${c.spells.join(',')})`;
    }).join(' | ');

    const systemInstruction = `
      You are a legendary 1st Edition AD&D DM (circa 1981).
      Immerse the player in a gritty, high-stakes terminal emulator experience.
      
      Module: ${moduleData.name}
      Current Location: ${gameState.location}
      Location Detail: ${moduleData.locations[gameState.location]}
      Active Character performing action: ${activeChar ? activeChar.name : "None selected"}
      Turn: ${gameState.turnCount}
      
      DM PROTOCOLS:
      1. SENSES: Describe smells (decay, stale beer), sounds (clinking mail, scurrying), and limited sight. Use archaic, sparse language.
      2. MORALE: Monsters check morale (2d6) when their leader dies or half their number is gone. State if they flee or surrender.
      3. COMBAT: Be lethal. Calculate THAC0 vs Descending AC. d20 >= THAC0 - target AC. 
      4. SURPRISE: Roll 1d6 for both sides if appropriate. 1-2 is surprised.
      5. XP/GOLD: Award small amounts of XP (1 XP per 1 GP found) and for monsters killed.
      6. TRAPS/SECRETS: Do not reveal them unless the player 'searches' or 'prods'. 
      7. NO RAILROADING: Let the player make terrible mistakes.
      8. ACTIVE PC: If a PC is 'active', they are the primary target or performer of the action.
      
      PARTY DATA: ${partyStats}
      WANDERING MONSTERS: ${moduleData.wanderingMonsters.roll} from ${JSON.stringify(moduleData.wanderingMonsters.table)}.
      
      OUTPUT: Sparse terminal text. No markdown except basic bold. End responses with a subtle prompt like 'COMMAND?'
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Input: ${playerInput}\nTurn: ${gameState.turnCount}`,
        config: {
          systemInstruction,
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 2500 }
        }
      });
      return response.text || "COMMUNICATION BREAKDOWN...";
    } catch (error) {
      return "FATAL SIGNAL ERROR. REBOOT RECOMMENDED.";
    }
  }
}
