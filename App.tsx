
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { Sidebar } from './components/Sidebar';
import { Mapper } from './components/Mapper';
import { VisualFeed } from './components/VisualFeed';
import { TitlePage } from './components/TitlePage';
import { DiceVisualizer } from './components/DiceVisualizer';
import { DMService } from './services/geminiService';
import { audioService } from './services/audioService';
import { GameState, GameMessage, Character, CharClass, AbilityScores, ModuleData, CombatPhase, CombatState } from './types';
import { MODULES_REGISTRY, INITIAL_DM_MESSAGE, BASE_THAC0, CLASS_HIT_DIE, SAVING_THROWS_1ST, THIEF_SKILLS_1ST, DICE_ART, ITEM_WEIGHTS, XP_TABLES, LOADING_MESSAGES } from './constants';
import { B2_MODULE } from './modules/b2Data';

const createEmptyMap = () => Array(20).fill(null).map(() => Array(20).fill(' '));

type SetupStep = 'none' | 'generated' | 'confirmed' | 'playing';

interface DiceState {
  rolling: boolean;
  value: number;
  sides: number;
}

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(() => {
    return localStorage.getItem('dnd_emulator_v5_started') === 'true';
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [diceState, setDiceState] = useState<DiceState>({ rolling: false, value: 0, sides: 20 });
  
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
    if (isStarted && !loading && !diceState.rolling && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStarted, loading, setupStep, diceState.rolling]);

  const rollDice = (sides: number, count: number = 1): number => {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  };

  const visualizeRoll = (sides: number, total: number): Promise<void> => {
    return new Promise((resolve) => {
      audioService.playDiceRoll();
      setDiceState({ rolling: true, value: total, sides });
      const resolveOnComplete = () => {
        setDiceState(prev => ({ ...prev, rolling: false }));
        resolve();
      };
      (window as any).diceComplete = resolveOnComplete;
    });
  };

  const generateCharacter = async (name: string): Promise<Character> => {
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

  const handleGenerateParty = useCallback(async () => {
    setLoading(true);
    const names = ['VALERIUS', 'KARA', 'THALOS', 'MYRA'];
    await visualizeRoll(20, rollDice(20));
    const newParty = await Promise.all(names.map(n => generateCharacter(n)));
    setState(prev => ({ 
        ...prev, 
        party: newParty, 
        activeCharacterId: newParty[0].id,
        history: [...prev.history, { 
            type: 'system', 
            content: `PARTY GENERATED:\n${newParty.map(p => `${p.name} THE ${p.class.toUpperCase()} (HP:${p.hp})`).join('\n')}\n\n>>> NEXT STEP: TYPE [K] TO KEEP THIS PARTY OR [G] TO RE-ROLL.`, 
            timestamp: Date.now() 
        }] 
    }));
    setSetupStep('generated');
    setLoading(false);
  }, []);

  const handleKeepParty = useCallback(() => {
      setState(prev => ({
          ...prev,
          history: [...prev.history, { type: 'system', content: `THE DESTINY OF THESE BRAVE SOULS IS SEALED.\n\n>>> COMMAND: TYPE [S] TO BEGIN THE QUEST.`, timestamp: Date.now() }]
      }));
      setSetupStep('confirmed');
  }, []);

  const handleStartExperience = useCallback(async () => {
      setSetupStep('playing');
      setLoading(true);
      const dmService = new DMService();
      const introPrompt = `Begin adventure. ${currentModule.hook}`;
      try {
          const response = await dmService.getDMResponse(state, currentModule, introPrompt);
          setLoading(false);
          setState(prev => ({
              ...prev,
              history: [...prev.history, 
                  { type: 'system', content: `JOURNEYING TO THE BORDERLANDS...`, timestamp: Date.now() },
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

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim().toUpperCase();
    if (!val || loading || diceState.rolling) return;

    if (setupStep !== 'playing') {
        if ((setupStep === 'none' || setupStep === 'generated') && val === 'G') { setInput(''); handleGenerateParty(); }
        if (setupStep === 'generated' && val === 'K') { setInput(''); handleKeepParty(); }
        if (setupStep === 'confirmed' && val === 'S') { setInput(''); handleStartExperience(); }
        return;
    }

    const playerInput = input.trim();
    setInput('');
    setState(prev => ({ ...prev, history: [...prev.history, { type: 'player', content: playerInput, timestamp: Date.now() }], turnCount: prev.turnCount + 1 }));

    setLoading(true);
    const dmService = new DMService();
    try {
      const dmResponse = await dmService.getDMResponse(state, currentModule, playerInput);
      if (playerInput.toLowerCase().includes('attack') || playerInput.toLowerCase().includes('roll')) {
        await visualizeRoll(20, rollDice(20));
      }
      setLoading(false);
      setState(prev => ({
        ...prev,
        history: [...prev.history, { type: 'dm', content: dmResponse, timestamp: Date.now() }]
      }));
    } catch (err) {
      setLoading(false);
    }
  };

  const getActionHint = () => {
    if (loading) return "THE FATES ARE SPINNING...";
    if (setupStep === 'none') return ">>> COMMAND: TYPE [G] TO GENERATE YOUR PARTY";
    if (setupStep === 'generated') return ">>> COMMAND: TYPE [K] TO KEEP OR [G] TO RE-ROLL";
    if (setupStep === 'confirmed') return ">>> COMMAND: TYPE [S] TO START THE CHRONICLE";
    return ">>> COMMAND: DECLARE YOUR ACTION TO THE DUNGEON MASTER";
  };

  if (!isStarted) return <TitlePage onStart={handleLaunch} />;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#050505] overflow-hidden p-2 lg:p-4 gap-4 pixel-font selection:bg-[#d4af37] selection:text-black">
      {diceState.rolling && (
        <DiceVisualizer 
          value={diceState.value} 
          sides={diceState.sides} 
          onComplete={() => (window as any).diceComplete?.()} 
        />
      )}

      {/* Main Narrative Area (Centerpiece) */}
      <div className="flex-[3] flex flex-col beveled-border !border-[#000080] !outline-[#d4af37] bg-[#fdf5e6] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden min-h-0 relative z-10">
        
        {/* Top Header branding */}
        <div className="bg-[#000080] border-b-2 border-[#d4af37] p-3 lg:p-4 flex justify-between items-center shrink-0 z-30">
            <div className="flex items-center gap-4 lg:gap-8 px-2">
                <span className="text-[10px] lg:text-[14px] text-[#d4af37] tracking-[0.3em] font-bold drop-shadow-[0_2px_0_#000] uppercase italic">
                  ADVANCED DUNGEONS & DRAGONS®
                </span>
                <div className="h-6 w-px bg-white/20 hidden lg:block" />
                <span className="text-white/60 text-[8px] lg:text-[11px] font-bold">TURN: {state.turnCount}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[8px] lg:text-[10px] text-white/40 hidden lg:inline tracking-widest">{currentModule.name.toUpperCase()}</span>
                <button 
                    onClick={() => { localStorage.removeItem('dnd_emulator_v5_started'); window.location.reload(); }}
                    className="text-[8px] lg:text-[10px] text-white/50 hover:text-white border border-white/20 px-4 py-1.5 bg-black/40 hover:bg-red-900/40 transition-colors"
                >
                  [EXIT]
                </button>
            </div>
        </div>

        {/* Narrative Engine (Adventure Chronicle) */}
        <div className="flex-grow min-h-0 flex flex-col relative overflow-hidden">
          <Terminal messages={state.history} />
          
          {/* Fading bottom context hint */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16 pointer-events-none z-10 opacity-60" />
          
          {/* Explicit Guidance Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#000080]/90 text-[#d4af37] py-2 px-8 text-[9px] lg:text-[11px] border-2 border-[#d4af37] z-20 shadow-[0_5px_15px_rgba(0,0,0,0.8)] backdrop-blur-sm min-w-[300px] text-center">
            <span className="animate-pulse tracking-wide font-bold">{getActionHint()}</span>
          </div>
        </div>

        {/* Action Entry Bar */}
        <form onSubmit={handleCommand} className="p-4 lg:p-8 bg-[#000020] border-t-2 border-[#d4af37] flex items-center gap-4 shadow-[0_-15px_40px_rgba(0,0,0,0.9)] shrink-0 z-30">
          <span className="text-[#d4af37] text-xl lg:text-3xl animate-pulse drop-shadow-[0_0_10px_#d4af37]">▶</span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            className="flex-grow bg-transparent text-white text-[14px] lg:text-[18px] focus:outline-none placeholder:text-white/10 tracking-[0.1em] font-bold"
            placeholder={loading ? "WAITING FOR FATES..." : "ENTER COMMAND TO DM..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || diceState.rolling}
          />
          <div className="hidden lg:block text-[9px] text-white/30 uppercase tracking-widest bg-white/5 px-3 py-2 border border-white/10">
            [EXECUTE]
          </div>
        </form>
      </div>

      {/* Sidebar Utilities (Status/Map/Feed) */}
      <div className="flex-1 flex flex-col gap-4 min-w-[340px] lg:max-w-[440px] shrink-0 overflow-hidden">
        {/* Visual Oracle */}
        <div className="shrink-0">
          <div className="text-[7px] text-[#d4af37] mb-1 opacity-60 tracking-[0.3em] uppercase">SIGHTING BUFFER</div>
          <VisualFeed location={state.location} inCombat={state.inCombat} />
        </div>
        
        {/* Tactical & Personal Status */}
        <div className="flex-grow overflow-y-auto terminal-scroll pr-2 space-y-4 pb-6">
          <Sidebar state={state} onSelect={(id) => setState(prev => ({...prev, activeCharacterId: id}))} />
          
          <div className="space-y-1">
            <div className="text-[7px] text-[#d4af37] opacity-60 tracking-[0.3em] uppercase">MAP CHRONICLE</div>
            <Mapper grid={state.mapData} onCellClick={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
