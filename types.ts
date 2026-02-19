
export type AbilityScores = {
  STR: number;
  INT: number;
  WIS: number;
  DEX: number;
  CON: number;
  CHA: number;
};

export enum CharClass {
  FIGHTER = 'Fighter',
  CLERIC = 'Cleric',
  MAGIC_USER = 'Magic-User',
  THIEF = 'Thief'
}

export interface SavingThrows {
  poison: number;
  wands: number;
  stone: number;
  breath: number;
  spells: number;
}

export interface ThiefSkills {
  pickLocks: number;
  findTraps: number;
  moveSilently: number;
  hideInShadows: number;
}

export interface Character {
  id: string;
  name: string;
  class: CharClass;
  level: number;
  hp: number;
  maxHp: number;
  ac: number; 
  thac0: number;
  stats: AbilityScores;
  inventory: { item: string; weight: number }[];
  xp: number;
  gold: number;
  saves: SavingThrows;
  thiefSkills?: ThiefSkills;
  spells: string[];
  maxSpells: number;
}

export interface GameMessage {
  type: 'dm' | 'player' | 'system' | 'dice';
  content: string;
  timestamp: number;
}

export interface ModuleData {
  id: string;
  name: string;
  hook: string;
  startLocation: string;
  locations: Record<string, string>;
  rumors: string[];
  wanderingMonsters: { roll: string; table: { name: string; num: string }[] };
  encounters?: string;
}

export interface GameState {
  currentModuleId: string;
  location: string;
  party: Character[];
  activeCharacterId: string | null;
  history: GameMessage[];
  gold: number;
  visitedLocations: string[];
  inCombat: boolean;
  mapData: string[][]; // 20x20 ASCII grid
  turnCount: number;
}
