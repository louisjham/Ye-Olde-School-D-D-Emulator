
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { Sidebar } from './components/Sidebar';
import { Mapper } from './components/Mapper';
import { VisualFeed } from './components/VisualFeed';
import { TitlePage } from './components/TitlePage';
import { DMService } from './services/geminiService';
import { audioService } from './services/audioService';
import { GameState, GameMessage, Character, CharClass, AbilityScores, ModuleData, CombatPhase, CombatState } from './types';
import { MODULES_REGISTRY, INITIAL_DM_MESSAGE, BASE_THAC0, CLASS_HIT_DIE, SAVING_THROWS_1ST, THIEF_SKILLS_1ST, DICE_ART, ITEM_WEIGHTS, XP_TABLES, LOADING_MESSAGES } from './constants';
import { B2_MODULE } from './modules/b2Data';

const createEmptyMap = () => Array(20).fill(null).map(() => Array(20).fill(' '));

type SetupStep = 'none' | 'generated' | 'confirmed' | 'playing';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(() => {
    return localStorage.getItem('dnd_emulator_v5_started') === 'true';
  });
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
      history: [{ type: 'dm', content: INITIAL_DM_MESSAGE(B2_MODULE.name), timestamp: Date.now() }],
      gold: 150,
      visitedLocations: [B2_MODULE.startLocation],
      inCombat: false,
      combatState: { phase: CombatPhase.NONE, round: 0, initiativeSide: 'none', surprise: { party: false, monsters: false } },
      mapData: createEmptyMap(),
      turnCount: 0
    };
  });

  const currentModule: ModuleData = MODULES_REGISTRY[state.currentModuleId];

  useEffect(() => {
    if (isStarted && !loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStarted, loading, setupStep, state.combatState.phase]);

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

  const handleGenerateParty = useCallback(() => {
    const names = ['THORIN', 'ELSPETH', 'SILAS', 'MORG'];
    const newParty = names.map(n => generateCharacter(n));
    setState(prev => ({ 
        ...prev, 
        party: newParty, 
        activeCharacterId: newParty[0].id,
        history: [...prev.history, { 
            type: 'system', 
            content: `\nNEW PARTY ASSEMBLED:\n${newParty.map(p => `${p.name} (${p.class} HP:${p.hp})`).join('\n')}\n\nPRESS 'G' TO RE-ROLL OR 'K' TO KEEP THIS PARTY.`, 
            timestamp: Date.now() 
        }] 
    }));
    setSetupStep('generated');
  }, []);

  const handleKeepParty = useCallback(() => {
      setState(prev => ({
          ...prev,
          history: [...prev.history, { type: 'system', content: `\nPARTY DATA LOCKED.\n\nPRESS 'S' TO START.`, timestamp: Date.now() }]
      }));
      setSetupStep('confirmed');
  }, []);

  const handleStartExperience = useCallback(async () => {
      setSetupStep('playing');
      setLoading(true);
      const dmService = new DMService();
      const introPrompt = `You are starting the adventure. Describe arrival at ${currentModule.startLocation} based on the hook: "${currentModule.hook}"`;
      try {
          const response = await dmService.getDMResponse(state, currentModule, introPrompt);
          setLoading(false);
          setState(prev => ({
              ...prev,
              history: [...prev.history, 
                  { type: 'system', content: `\nINITIALIZING MODULE B2...\nENVIRONMENTAL SENSORS ONLINE.`, timestamp: Date.now() },
                  { type: 'dm', content: response, timestamp: Date.now() }
              ]
          }));
      } catch (err) {
          setLoading(false);
      }
  }, [state, currentModule]);

  const handleLaunch = (moduleId: string) => {
    setIsStarted(true);
    localStorage.setItem('dnd_emulator_v5_started', 'true');
    setState(prev => ({ ...prev, currentModuleId: moduleId }));
  };

  const awardXP = (amount: number) => {
    setState(prev => ({
        ...prev,
        party: prev.party.map(c => {
            const newXP = c.xp + amount;
            const table = XP_TABLES[c.class];
            if (newXP >= table[c.level]) {
                const bonusHP = rollDice(CLASS_HIT_DIE[c.class]);
                return { ...c, xp: newXP, level: c.level + 1, hp: c.hp + bonusHP, maxHp: c.maxHp + bonusHP };
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

  const runCombatPhase = async (manualInput?: string) => {
      const { phase, round, initiativeSide, surprise } = state.combatState;
      let nextPhase = phase;
      let nextRound = round;
      let nextInit = initiativeSide;
      let nextSurprise = surprise;

      if (phase === CombatPhase.SURPRISE) {
          const partyRoll = rollDice(6);
          const monsterRoll = rollDice(6);
          nextSurprise = { party: partyRoll <= 2, monsters: monsterRoll <= 2 };
          
          let msg = `--- SURPRISE CHECK (1-2 ON 1D6) ---\nPARTY ROLL: ${partyRoll} | MONSTER ROLL: ${monsterRoll}\n`;
          if (nextSurprise.party && nextSurprise.monsters) msg += "BOTH SIDES ARE SURPRISED. A STALEMATE UNTIL FOCUS RETURNS.";
          else if (nextSurprise.party) msg += "THE PARTY IS SURPRISED! MONSTERS GET THE UPPER HAND.";
          else if (nextSurprise.monsters) msg += "THE MONSTERS ARE SURPRISED! THE PARTY GAINS AN OPENING.";
          else msg += "NO SURPRISE. PREPARE FOR INITIATIVE.";
          
          setState(prev => ({ 
              ...prev, 
              history: [...prev.history, { type: 'system', content: msg, timestamp: Date.now() }], 
              combatState: { ...prev.combatState, surprise: nextSurprise, phase: CombatPhase.INITIATIVE } 
          }));
          return;
      }

      if (phase === CombatPhase.INITIATIVE) {
          const partyRoll = rollDice(6);
          const monsterRoll = rollDice(6);
          nextInit = partyRoll >= monsterRoll ? 'party' : 'monsters';
          nextPhase = nextInit === 'party' ? CombatPhase.PARTY_TURN : CombatPhase.MONSTER_TURN;
          nextRound++;
          
          let msg = `--- ROUND ${nextRound} INITIATIVE (1D6) ---\nPARTY: ${partyRoll} | MONSTERS: ${monsterRoll}\n${nextInit.toUpperCase()} GOES FIRST.`;
          setState(prev => ({ 
              ...prev, 
              history: [...prev.history, { type: 'system', content: msg, timestamp: Date.now() }], 
              combatState: { ...prev.combatState, phase: nextPhase, round: nextRound, initiativeSide: nextInit } 
          }));
          return;
      }

      setLoading(true);
      const dmService = new DMService();
      try {
          const currentInstruction = phase === CombatPhase.PARTY_TURN 
            ? (manualInput || "The party takes action.")
            : "The monsters take their turn. Roll attacks and resolve damage based on 1e rules.";

          const response = await dmService.getDMResponse(state, currentModule, currentInstruction);
          setLoading(false);
          
          const lowerRes = response.toLowerCase();
          const combatEnded = lowerRes.includes("combat ends") || lowerRes.includes("flee") || lowerRes.includes("victory") || lowerRes.includes("all monsters are dead");

          if (combatEnded) {
              setState(prev => ({ 
                  ...prev, 
                  inCombat: false, 
                  combatState: { ...prev.combatState, phase: CombatPhase.NONE }, 
                  history: [...prev.history, { type: 'dm', content: response, timestamp: Date.now() }] 
              }));
              return;
          }

          let finalPhase = phase;
          if (phase === CombatPhase.PARTY_TURN) {
              finalPhase = nextInit === 'party' ? CombatPhase.MONSTER_TURN : CombatPhase.INITIATIVE;
          } else if (phase === CombatPhase.MONSTER_TURN) {
              finalPhase = nextInit === 'monsters' ? CombatPhase.PARTY_TURN : CombatPhase.INITIATIVE;
          }

          setState(prev => ({ 
              ...prev, 
              combatState: { ...prev.combatState, phase: finalPhase },
              history: [...prev.history, { type: 'dm', content: response, timestamp: Date.now() }] 
          }));
      } catch (e) {
          setLoading(false);
          setState(prev => ({ ...prev, history: [...prev.history, { type: 'system', content: "COMBAT INTERFACE TIMEOUT.", timestamp: Date.now() }] }));
      }
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim().toUpperCase();
    if (!val || loading) return;

    if (setupStep !== 'playing') {
        if (setupStep === 'none' && val === 'G') { setInput(''); handleGenerateParty(); }
        if (setupStep === 'generated' && val === 'G') { setInput(''); handleGenerateParty(); }
        if (setupStep === 'generated' && val === 'K') { setInput(''); handleKeepParty(); }
        if (setupStep === 'confirmed' && val === 'S') { setInput(''); handleStartExperience(); }
        return;
    }

    const playerInput = input.trim();
    const cmd = playerInput.toUpperCase();
    setInput('');

    if (cmd === 'RESET') { 
      localStorage.removeItem('dnd_emulator_v5'); 
      localStorage.removeItem('dnd_emulator_v5_started');
      window.location.reload(); 
      return; 
    }
    if (cmd.startsWith('ROLL')) {
      const sides = parseInt(cmd.split(' ')[1]) || 20;
      const res = rollDice(sides);
      setState(prev => ({ ...prev, history: [...prev.history, { type: 'dice', content: DICE_ART[sides]?.join('\n') || `ROLL D${sides}: ${res}`, timestamp: Date.now() }] }));
      return;
    }

    setState(prev => ({ ...prev, history: [...prev.history, { type: 'player', content: playerInput, timestamp: Date.now() }], turnCount: prev.turnCount + 1 }));

    if (state.inCombat) {
        if (state.combatState.phase === CombatPhase.PARTY_TURN) {
            runCombatPhase(playerInput);
        } else {
            setState(prev => ({ 
                ...prev, 
                history: [...prev.history, { type: 'system', content: `WAITING FOR ${state.combatState.phase.replace('_', ' ')} TO COMPLETE.`, timestamp: Date.now() }] 
            }));
        }
        return;
    }

    setLoading(true);
    const dmService = new DMService();
    try {
      const dmResponse = await dmService.getDMResponse(state, currentModule, playerInput);
      setLoading(false);
      
      let inCombat = state.inCombat;
      let combatState = state.combatState;
      
      if (!inCombat && (dmResponse.toLowerCase().includes('initiative') || dmResponse.toLowerCase().includes('attacks') || dmResponse.toLowerCase().includes('encounter'))) {
          audioService.playCombatStab();
          inCombat = true;
          combatState = { ...combatState, phase: CombatPhase.SURPRISE, round: 0 };
      }

      setState(prev => ({
        ...prev,
        inCombat,
        combatState,
        history: [...prev.history, { type: 'dm', content: dmResponse, timestamp: Date.now() }]
      }));
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem('dnd_emulator_v5', JSON.stringify(state));
    }
  }, [state, isStarted]);

  useEffect(() => {
      const { phase } = state.combatState;
      if (state.inCombat && (phase === CombatPhase.SURPRISE || phase === CombatPhase.INITIATIVE || phase === CombatPhase.MONSTER_TURN)) {
          if (!loading) {
              const timer = setTimeout(() => runCombatPhase(), 1200);
              return () => clearTimeout(timer);
          }
      }
  }, [state.inCombat, state.combatState.phase, loading]);

  if (!isStarted) {
    return <TitlePage onStart={handleLaunch} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-black text-[#00ff00] overflow-hidden p-2 lg:p-4 gap-4 font-mono">
      <div className="flex-grow flex flex-col border-2 border-[#00ff00] bg-black relative shadow-[0_0_40px_rgba(0,255,0,0.2)]">
        <div className="bg-[#00ff00] text-black px-2 py-1 flex justify-between items-center font-bold text-xs">
          <div className="flex items-center gap-4">
            <span className="animate-pulse">● {state.inCombat ? `COMBAT: ROUND ${state.combatState.round}` : 'FEED: EXPLORATION'}</span>
            <span>T:{state.turnCount}</span>
            <span>LOC: {state.location.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => { localStorage.removeItem('dnd_emulator_v5_started'); window.location.reload(); }}
                className="hover:underline text-[10px]"
            >
              [EXIT]
            </button>
            <div>{loading ? loadingMsg : state.combatState.phase !== CombatPhase.NONE ? `PHASE: ${state.combatState.phase}` : "READY"}</div>
          </div>
        </div>
        
        <Terminal messages={state.history} />

        <form onSubmit={handleCommand} className="p-4 border-t-2 border-[#00ff00] flex items-center gap-2 bg-[#000800]">
          <span className="text-white font-bold">&gt;</span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            className="flex-grow bg-transparent text-[#00ff00] text-xl focus:outline-none placeholder:text-[#008800] placeholder:opacity-100"
            placeholder={
                state.inCombat && state.combatState.phase !== CombatPhase.PARTY_TURN ? "PROCESSING ENCOUNTER FLOW..." :
                setupStep === 'none' ? "PRESS 'G' TO GENERATE PARTY..." :
                loading ? loadingMsg : "INPUT COMMAND..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || (state.inCombat && state.combatState.phase !== CombatPhase.PARTY_TURN)}
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
