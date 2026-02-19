
import { ModuleData } from '../types';

export const B2_MODULE: ModuleData = {
  id: 'b2',
  name: 'B2: The Keep on the Borderlands',
  hook: 'You stand before the great stone walls of the Keep. The wilder area of the Borderlands stretches out behind you. Cunning and steel are your only hope.',
  startLocation: 'Main Gate',
  locations: {
    'Main Gate': 'Two massive towers flank a heavy drawbridge. Guards in blue plate mail watch from murder holes.',
    'Entry Yard': 'A busy courtyard. A scribe records names. Lackeys take horses to the stables.',
    'Traveler\'s Inn': 'Common room smells of stew and stale beer. Safe rest for 1gp/night.',
    'The Tavern': 'Favorite haunt of mercenaries. 50% chance of finding men-at-arms for hire.',
    'Caves of Chaos': 'A jagged ravine 2 miles from the Keep. Black cave mouths line the canyon walls.',
    'Kobold Lair': 'Cave Area A. Smells of wet dog and decay. Small pits line the corridors.',
    'Orc Lair': 'Cave Area B/C. Proud, aggressive warriors. Watch for the heavy falling net trap.',
    'Goblin Lair': 'Cave Area D. Many small tunnels. The ogre E lives in a nearby cave and helps them for coin.'
  },
  rumors: [
    'A merchant, imprisoned in the caves, will reward his rescuers.',
    'Tribes of different creatures live in different caves.',
    '“Bree-yark” is goblin for “Attack!”',
    'Beware the eater of men!',
    'The bugbears are afraid of dwarves.'
  ],
  wanderingMonsters: {
    roll: '1 in 6 every 3 turns',
    table: [
      { name: 'Kobolds', num: '2d4' },
      { name: 'Orcs', num: '1d6' },
      { name: 'Goblins', num: '2d4' },
      { name: 'Giant Rats', num: '3d6' },
      { name: 'Skeletons', num: '1d6' },
      { name: 'Zombies', num: '1d4' }
    ]
  },
  encounters: 'Key Bosses: Kobold Chieftain (HP 8), Orc Leader (HP 16), Ogre (HP 25, AC 4).'
};
