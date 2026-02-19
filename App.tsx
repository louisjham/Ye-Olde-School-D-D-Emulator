
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { Sidebar } from './components/Sidebar';
import { Mapper } from './components/Mapper';
import { VisualFeed } from './components/VisualFeed';
import { DMService } from './services/geminiService';
import { audioService } from './services/audioService';
import { GameState, GameMessage, Character, CharClass, AbilityScores, ModuleData } from './types';
import { MODULES_REGISTRY, INITIAL_DM_MESSAGE, BASE_THAC0, CLASS_HIT_DIE, SAVING_THROWS_1ST, THIEF_SKILLS_1ST, DICE_ART, ITEM_WEIGHTS, XP_TABLES, LOADING_MESSAGES } from './constants';
import { B2_MODULE } from './modules/b2Data';

const createEmptyMap = () => Array(20).fill(null).map(() => Array(20).fill(' '));

type SetupStep = 'none' | 'generated' | 'confirmed' | 'playing';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [setupStep, setSetupStep] = useState<SetupStep>(() => {
      const saved = localStorage.getItem('dnd_emulator_v5');
      if (saved) {
          const parsed = JSON.parse(saved);
          return (parsed.party && parsed.party.length > 0) ? 'playing' : 'none';
      }
      return 'none';
  });

  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('dnd_emulator_v5');
    if (saved) return JSON.parse(saved);
    return {
      currentModuleId: B2_MODULE.id,
      location: B2_MODULE.startLocation,
      party: [],
      activeCharacterId: null,
      history: [{ type: 'dm', content: INITIAL_DM_MESSAGE(B2_MODULE.name) + "\n\nPRESS 'G' TO GENERATE A NEW PARTY.", timestamp: Date.now() }],
      gold: 150,
      visitedLocations: [B2_MODULE.startLocation],
      inCombat: false,
      mapData: createEmptyMap(),
      turnCount: 0
    };
  });

  const currentModule: ModuleData = MODULES_REGISTRY[state.currentModuleId];

  // Auto-focus input
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, setupStep]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const rollDice = (sides: number, count: number = 1): number => {
    audioService.playDiceRoll();
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  };

  const generateCharacter = (name: string): Character => {
    const stats: AbilityScores = {
      STR: rollDice(6, 3), INT: rollDice(6, 3), WIS: rollDice(6, 3),
      DEX: rollDice(6, 3), CON: rollDice(6, 3), CHA: rollDice(6, 3),
    };

    const classes = Object.values(CharClass);
    const charClass = classes[Math.floor(Math.random() * classes.length)];
    const hp = rollDice(CLASS_HIT_DIE[charClass]);
    
    const initialGear = charClass === CharClass.FIGHTER ? ['Plate Mail', 'Sword', 'Shield'] : 
                       charClass === CharClass.CLERIC ? ['Chain Mail', 'Mace', 'Holy Symbol'] :
                       ['Leather Armor', 'Dagger', 'Large Sack'];

    return {
      id: Math.random().toString(36).substring(2, 11),
      name, class: charClass, level: 1,
      hp, maxHp: hp, ac: charClass === CharClass.FIGHTER ? 2 : (charClass === CharClass.CLERIC ? 4 : 7),
      thac0: BASE_THAC0[charClass], stats,
      inventory: initialGear.map(item => ({ item, weight: ITEM_WEIGHTS[item] || 10 })),
      xp: 0, gold: rollDice(6, 3) * 10,
      saves: SAVING_THROWS_1ST[charClass],
      thiefSkills: charClass === CharClass.THIEF ? THIEF_SKILLS_1ST : undefined,
      spells: charClass === CharClass.MAGIC_USER ? ['Sleep'] : (charClass === CharClass.CLERIC ? ['Cure Light Wounds'] : []),
      maxSpells: (charClass === CharClass.MAGIC_USER || charClass === CharClass.CLERIC) ? 1 : 0
    };
  };

  const calculateDifficulty = (party: Character[]) => {
      const avgHP = party.reduce((sum, c) => sum + c.maxHp, 0) / party.length;
      const hasCleric = party.some(c => c.class === CharClass.CLERIC);
      const avgStr = party.reduce((sum, c) => sum + c.stats.STR, 0) / party.length;

      if (avgHP < 4 || !hasCleric) return "LETHAL (High fatality risk)";
      if (avgStr > 13 && hasCleric) return "MODERATE (Standard challenge)";
      return "CHALLENGING (Caution advised)";
  };

  const getPartyDescription = (party: Character[]) => {
      const classes = party.map(c => c.class);
      const fighters = classes.filter(c => c === CharClass.FIGHTER).length;
      const mages = classes.filter(c => c === CharClass.MAGIC_USER).length;
      const clerics = classes.filter(c => c === CharClass.CLERIC).length;
      const thieves = classes.filter(c => c === CharClass.THIEF).length;

      return `Party consists of ${fighters} Fighter(s), ${clerics} Cleric(s), ${mages} Magic-User(s), and ${thieves} Thief/Thieves.`;
  };

  const handleGenerateParty = useCallback(() => {
    const names = ['THORIN', 'ELSPETH', 'SILAS', 'MORG'];
    const newParty = names.map(n => generateCharacter(n));
    const desc = getPartyDescription(newParty);
    const diff = calculateDifficulty(newParty);

    setState(prev => ({ 
        ...prev, 
        party: newParty, 
        activeCharacterId: newParty[0].id,
        history: [...prev.history, { 
            type: 'system', 
            content: `\nNEW PARTY ASSEMBLED:\n${newParty.map(p => `${p.name} (${p.class} HP:${p.hp})`).join('\n')}\n\nSUMMARY: ${desc}\nESTIMATED DIFFICULTY: ${diff}\n\nPRESS 'G' TO RE-ROLL OR 'K' TO KEEP THIS PARTY.`, 
            timestamp: Date.now() 
        }] 
    }));
    setSetupStep('generated');
  }, []);

  const handleKeepParty = useCallback(() => {
      setState(prev => ({
          ...prev,
          history: [...prev.history, { 
              type: 'system', 
              content: `\nPARTY DATA LOCKED.\n\nPRESS 'S' TO START THE EXPERIENCE.`, 
              timestamp: Date.now() 
          }]
      }));
      setSetupStep('confirmed');
  }, []);

  const handleStartExperience = useCallback(async () => {
      setSetupStep('playing');
      setLoading(true);
      
      const dmService = new DMService();
      // Start at the module hook or starting location
      const introPrompt = `You are starting the adventure. Describe the arrival at ${currentModule.startLocation} and set the scene based on the hook: "${currentModule.hook}"`;
      
      try {
          const response = await dmService.getDMResponse(state, currentModule, introPrompt);
          setLoading(false);
          setState(prev => ({
              ...prev,
              history: [...prev.history, 
                  { type: 'system', content: `\nINITIALIZING MODULE B2: THE KEEP ON THE BORDERLANDS...\nENVIRONMENTAL SENSORS ONLINE.`, timestamp: Date.now() },
                  { type: 'dm', content: response, timestamp: Date.now() }
              ]
          }));
      } catch (err) {
          setLoading(false);
          setState(prev => ({ ...prev, history: [...prev.history, { type: 'system', content: "FATAL INTERFACE LOSS DURING INTRO.", timestamp: Date.now() }] }));
      }
  }, [state, currentModule]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (loading) return;
        const key = e.key.toUpperCase();
        
        if (setupStep === 'none' && key === 'G') {
            e.preventDefault();
            handleGenerateParty();
        } else if (setupStep === 'generated') {
            if (key === 'G') { e.preventDefault(); handleGenerateParty(); }
            if (key === 'K') { e.preventDefault(); handleKeepParty(); }
        } else if (setupStep === 'confirmed' && key === 'S') {
            e.preventDefault(); handleStartExperience();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setupStep, loading, handleGenerateParty, handleKeepParty, handleStartExperience]);

  const awardXP = (amount: number) => {
    setState(prev => ({
        ...prev,
        party: prev.party.map(c => {
            const newXP = c.xp + amount;
            const table = XP_TABLES[c.class];
            let newLevel = c.level;
            if (newXP >= table[c.level]) {
                newLevel += 1;
                const bonusHP = rollDice(CLASS_HIT_DIE[c.class]);
                return { ...c, xp: newXP, level: newLevel, hp: c.hp + bonusHP, maxHp: c.maxHp + bonusHP };
            }
            return { ...c, xp: newXP };
        })
    }));
  };

  const handleCellClick = (x: number, y: number) => {
    const symbols = [' ', '#', '.', 'D', 'S', 'X'];
    const current = state.mapData[y][x];
    const next = symbols[(symbols.indexOf(current) + 1) % symbols.length];
    const newMap = [...state.mapData];
    newMap[y] = [...newMap[y]];
    newMap[y][x] = next;
    setState(prev => ({ ...prev, mapData: newMap }));
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim().toUpperCase();
    if (!val || loading) return;

    if (setupStep === 'none' && val === 'G') {
        setInput('');
        handleGenerateParty();
        return;
    }
    if (setupStep === 'generated') {
        if (val === 'G') { setInput(''); handleGenerateParty(); return; }
        if (val === 'K') { setInput(''); handleKeepParty(); return; }
    }
    if (setupStep === 'confirmed' && val === 'S') {
        setInput('');
        handleStartExperience();
        return;
    }

    if (setupStep !== 'playing') return;

    const playerInput = input.trim();
    const cmd = playerInput.toUpperCase();
    const newHistory = [...state.history, { type: 'player', content: playerInput, timestamp: Date.now() } as GameMessage];
    
    setInput('');
    setState(prev => ({ ...prev, history: newHistory, turnCount: prev.turnCount + 1 }));

    if (cmd.startsWith('SELECT ')) {
        const name = cmd.replace('SELECT ', '').trim();
        const found = state.party.find(p => p.name.toUpperCase() === name);
        if (found) {
            setState(prev => ({ ...prev, activeCharacterId: found.id }));
            return;
        }
    }

    if (cmd.startsWith('ROLL')) {
      const sides = parseInt(cmd.split(' ')[1]) || 20;
      const res = rollDice(sides);
      const art = DICE_ART[sides] || DICE_ART[20];
      setState(prev => ({ ...prev, history: [...newHistory, { type: 'dice', content: art.join('\n') + `\nRESULT: ${res}`, timestamp: Date.now() }] }));
      return;
    }

    if (cmd === 'RESET') {
        localStorage.removeItem('dnd_emulator_v5');
        window.location.reload();
        return;
    }

    setLoading(true);
    const dmService = new DMService();
    try {
      const dmResponse = await dmService.getDMResponse(state, currentModule, playerInput);
      setLoading(false);
      
      let newLoc = state.location;
      for (const locName of Object.keys(currentModule.locations)) {
        if (dmResponse.toLowerCase().includes(locName.toLowerCase())) {
          newLoc = locName;
          break;
        }
      }

      if (dmResponse.toLowerCase().includes('initiative') || dmResponse.toLowerCase().includes('attacks')) {
          audioService.playCombatStab();
          setState(prev => ({ ...prev, inCombat: true }));
      } else if (dmResponse.toLowerCase().includes('flee') || dmResponse.toLowerCase().includes('retreats')) {
          audioService.playFlee();
          setState(prev => ({ ...prev, inCombat: false }));
      } else {
          setState(prev => ({ ...prev, inCombat: false }));
      }

      const xpMatch = dmResponse.match(/(\d+)\s*XP/i);
      if (xpMatch) awardXP(parseInt(xpMatch[1]));

      setState(prev => ({
        ...prev,
        location: newLoc,
        history: [...prev.history, { type: 'dm', content: dmResponse, timestamp: Date.now() }]
      }));
    } catch (err) {
      setLoading(false);
      setState(prev => ({ ...prev, history: [...newHistory, { type: 'system', content: "FATAL INTERFACE LOSS.", timestamp: Date.now() }] }));
    }
  };

  useEffect(() => {
    localStorage.setItem('dnd_emulator_v5', JSON.stringify(state));
  }, [state]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-black text-[#00ff00] overflow-hidden p-2 lg:p-4 gap-4 font-mono">
      <div className="flex-grow flex flex-col border-2 border-[#00ff00] bg-black relative shadow-[0_0_40px_rgba(0,255,0,0.2)]">
        <div className="bg-[#00ff00] text-black px-2 py-1 flex justify-between items-center font-bold text-xs">
          <div className="flex items-center gap-4">
            <span className="animate-pulse">● FEED: ONLINE</span>
            <span>T:{state.turnCount}</span>
            <span>LOC: {state.location.toUpperCase()}</span>
          </div>
          <div>{loading ? loadingMsg : (setupStep === 'playing' ? "READY" : "SYSTEM INITIALIZATION")}</div>
        </div>
        
        <Terminal messages={state.history} />

        <form onSubmit={handleCommand} className="p-4 border-t-2 border-[#00ff00] flex items-center gap-2 bg-[#000800]">
          <span className="text-white font-bold">&gt;</span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            className="flex-grow bg-transparent text-[#00ff00] text-xl focus:outline-none placeholder:opacity-20"
            placeholder={
                setupStep === 'none' ? "PRESS 'G' TO GENERATE PARTY..." :
                setupStep === 'generated' ? "PRESS 'G' TO RE-ROLL OR 'K' TO KEEP..." :
                setupStep === 'confirmed' ? "PRESS 'S' TO START THE EXPERIENCE..." :
                loading ? loadingMsg : "INPUT COMMAND..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </form>
      </div>

      <div className="flex flex-col gap-4 w-full lg:w-96 overflow-y-auto terminal-scroll">
        <VisualFeed location={state.location} inCombat={state.inCombat} />
        <Sidebar state={state} onSelect={(id) => setState(prev => ({...prev, activeCharacterId: id}))} />
        <Mapper grid={state.mapData} onCellClick={handleCellClick} />
        
        <div className="text-[10px] opacity-30 p-2 border border-[#002200]">
            COMMANDS: SELECT [NAME] | ROLL [S] | MAP [S] | RESET
        </div>
      </div>
    </div>
  );
};

export default App;
