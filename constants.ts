
import { CharClass, SavingThrows, ThiefSkills } from './types';
import { B2_MODULE } from './modules/b2Data';

export const MODULES_REGISTRY = {
  [B2_MODULE.id]: B2_MODULE
};

export const XP_TABLES: Record<CharClass, number[]> = {
  [CharClass.FIGHTER]: [0, 2000, 4000, 8000],
  [CharClass.CLERIC]: [0, 1500, 3000, 6000],
  [CharClass.MAGIC_USER]: [0, 2500, 5000, 10000],
  [CharClass.THIEF]: [0, 1250, 2500, 5000],
};

export const INITIAL_DM_MESSAGE = (moduleName: string) => `--- AD&D 1E OS v4.2 ---
BOOT SEQUENCE COMPLETE.
MODULE: ${moduleName.toUpperCase()}
RULES: ADVANCED 1ST ED PROTOCOLS.
MORALE: ENABLED (2d6 CHECK).
PERMADEATH: ENABLED.

COMMAND: 'GENERATE PARTY' TO START.`;

export const LOADING_MESSAGES = [
  "SIMULATING D20 VECTOR...",
  "CONSULTING GYGAXIAN TABLES...",
  "RANDOMIZING WANDERING MONSTERS...",
  "CALCULATING DESCENDING AC...",
  "ADJUSTING MORALE COEFFICIENTS...",
  "PARSING NATURAL LANGUAGE INTENT...",
  "UPDATING CRYSTAL BALL BUFFER...",
  "FETCHING SECTOR DATA...",
  "RESOLVING MELEE INITIATIVE...",
  "CHECKING FOR SECRET DOORS...",
  "ROLLING VS POISON...",
  "ENCRYPTING TREASURE LOCATIONS...",
  "ACCESSING B2_MAP_DATA...",
  "SYNCING WITH ETHEREAL PLANE..."
];

export const BASE_THAC0 = {
  [CharClass.FIGHTER]: 20,
  [CharClass.CLERIC]: 20,
  [CharClass.MAGIC_USER]: 21,
  [CharClass.THIEF]: 21,
};

export const CLASS_HIT_DIE = {
  [CharClass.FIGHTER]: 10,
  [CharClass.CLERIC]: 8,
  [CharClass.MAGIC_USER]: 4,
  [CharClass.THIEF]: 6,
};

export const ITEM_WEIGHTS: Record<string, number> = {
  'Plate Mail': 500,
  'Chain Mail': 400,
  'Leather Armor': 150,
  'Shield': 100,
  'Sword': 60,
  'Mace': 50,
  'Dagger': 10,
  'Rations (7 days)': 200,
  'Torch (6)': 30,
  'Waterskin': 5,
  'Rope (50ft)': 50,
  'Small Sack': 1,
  'Large Sack': 5
};

export const SAVING_THROWS_1ST: Record<CharClass, SavingThrows> = {
  [CharClass.FIGHTER]: { poison: 14, wands: 16, stone: 15, breath: 17, spells: 17 },
  [CharClass.CLERIC]: { poison: 11, wands: 12, stone: 14, breath: 16, spells: 15 },
  [CharClass.MAGIC_USER]: { poison: 13, wands: 13, stone: 13, breath: 16, spells: 15 },
  [CharClass.THIEF]: { poison: 13, wands: 14, stone: 12, breath: 16, spells: 15 },
};

export const THIEF_SKILLS_1ST: ThiefSkills = {
  pickLocks: 15, findTraps: 10, moveSilently: 20, hideInShadows: 10
};

export const DICE_ART: Record<number, string[]> = {
  20: [
    "   .---.   ",
    "  /     \\  ",
    " |  [20] | ",
    "  \\     /  ",
    "   '---'   "
  ],
  6: [
    " .-------. ",
    " | o   o | ",
    " |   o   | ",
    " | o   o | ",
    " '-------' "
  ]
};
