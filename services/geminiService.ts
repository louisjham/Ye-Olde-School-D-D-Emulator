
import { GoogleGenAI } from "@google/genai";
import { GameState, ModuleData, CombatPhase } from "../types";

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

    const combatContext = gameState.inCombat ? `
      COMBAT MODE ACTIVE:
      Phase: ${gameState.combatState.phase}
      Round: ${gameState.combatState.round}
      Initiative Winner: ${gameState.combatState.initiativeSide}
      Surprise Status: Party Surprised? ${gameState.combatState.surprise.party}, Monsters Surprised? ${gameState.combatState.surprise.monsters}
    ` : "Exploration Mode.";

    const systemInstruction = `
      You are a legendary 1st Edition AD&D DM (circa 1981).
      Strictly follow 1st edition rules for all resolution.
      
      Module: ${moduleData.name}
      Location: ${gameState.location}
      ${combatContext}

      AD&D 1E COMBAT RULES:
      1. THAC0: To hit, d20 >= THAC0 - target AC. (e.g. THAC0 20 vs AC 2 requires a roll of 18).
      2. INITIATIVE: 1d6 per side. Highest goes first. Ties are simultaneous.
      3. SURPRISE: 1-2 on 1d6. Surprised side cannot act for segments equal to roll.
      4. MORALE: Checked at 25% or 50% casualties. 2d6 vs Morale (usually 7-9). 
      5. SAVING THROWS: Use provided stats for Poison, Wands, Stone, Breath, Spells.

      DM PROTOCOLS:
      - SENSES: Evocative, sparse descriptions. Focus on gloom, smell of ozone, and metallic tang of blood.
      - COMBAT LOGIC: If it's the MONSTER_TURN, resolve their attacks now. If it's the PARTY_TURN, wait for player input.
      - LEATHALITY: Do not fudge rolls. PCs at 0 HP are dead.
      - SYSTEM: Only output terminal-style text. Sparse. Gritty.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Input: ${playerInput}\nTurn: ${gameState.turnCount}`,
        config: {
          systemInstruction,
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 3000 }
        }
      });
      return response.text || "COMMUNICATION BREAKDOWN...";
    } catch (error) {
      return "FATAL SIGNAL ERROR. REBOOT RECOMMENDED.";
    }
  }
}
