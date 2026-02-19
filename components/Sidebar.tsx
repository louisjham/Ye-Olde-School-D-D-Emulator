
import React from 'react';
import { GameState, Character, CharClass } from '../types';

interface SidebarProps {
  state: GameState;
  onSelect?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onSelect }) => {
  const calculateSurvivalRating = () => {
    if (state.party.length === 0) return 0;
    const totalHP = state.party.reduce((sum, c) => sum + c.hp, 0);
    const totalMaxHP = state.party.reduce((sum, c) => sum + c.maxHp, 0);
    const hpFactor = totalHP / totalMaxHP;
    const hasCleric = state.party.some(c => c.class === CharClass.CLERIC);
    const hasThief = state.party.some(c => c.class === CharClass.THIEF);
    const avgLevel = state.party.reduce((sum, sumL) => sum + sumL.level, 0) / state.party.length;
    let rating = hpFactor * 70;
    if (hasCleric) rating += 15;
    if (hasThief) rating += 10;
    rating += (avgLevel - 1) * 5;
    return Math.min(100, Math.max(0, Math.round(rating)));
  };

  const survivalRating = calculateSurvivalRating();
  
  const getStatusInfo = (rating: number) => {
    if (rating > 85) return { label: 'OPTIMAL', color: '#00cc00', desc: 'EXPEDITION CAPACITY: MAX' };
    if (rating > 70) return { label: 'STABLE', color: '#00aa00', desc: 'NOMINAL VITAL SIGNS' };
    if (rating > 50) return { label: 'CAUTION', color: '#d4af37', desc: 'RESOURCES DEPLETING' };
    if (rating > 30) return { label: 'CRITICAL', color: '#ff8800', desc: 'IMMINENT FATALITY RISK' };
    return { label: 'TERMINAL', color: '#ff0000', desc: 'PARTY INTEGRITY LOST' };
  };

  const status = getStatusInfo(survivalRating);

  return (
    <div className="w-full flex flex-col gap-4 pixel-font">
      {/* Sidebar Header */}
      <div className="bg-[#000080] border-2 border-[#d4af37] p-2 text-center shadow-lg">
        <h2 className="text-[10px] text-[#d4af37] tracking-[0.2em] font-bold">
          COMMAND CONSOLE
        </h2>
      </div>

      {/* Survival Matrix with Context */}
      {state.party.length > 0 && (
        <div className="bg-[#1a1a1a] border-2 border-[#d4af37] p-4 shadow-inner">
          <div className="flex justify-between items-end mb-2 border-b border-[#d4af37]/30 pb-2">
            <div>
              <span className="text-[7px] text-white/50 block mb-1">VITALITY INDEX</span>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: status.color }}>
                {status.label}
              </span>
            </div>
            <span className="text-[12px] font-bold text-white">{survivalRating}%</span>
          </div>
          
          <div className="w-full h-4 bg-black border border-[#d4af37]/50 p-0.5 mb-2">
            <div 
              className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
              style={{ width: `${survivalRating}%`, backgroundColor: status.color }}
            />
          </div>
          
          <p className="text-[6px] text-white/40 italic leading-tight">
            {status.desc} — (CALC: HP/LEVEL/COMP)
          </p>
        </div>
      )}

      {/* Character Rosters */}
      <div className="space-y-4">
        <div className="text-[8px] text-[#d4af37] border-b border-[#d4af37]/30 pb-1 flex justify-between">
          <span>ACTIVE PERSONNEL</span>
          <span>{state.party.length}/4</span>
        </div>
        
        {state.party.map((char) => {
          const isActive = char.id === state.activeCharacterId;
          return (
            <div 
              key={char.id} 
              onClick={() => onSelect?.(char.id)}
              className={`p-3 cursor-pointer transition-all border-2 relative ${
                isActive 
                  ? 'bg-[#fdf5e6] border-[#d4af37] scale-102 shadow-[0_0_15px_rgba(212,175,55,0.3)] z-10 text-black' 
                  : 'bg-black/20 border-white/10 text-white/60 hover:bg-black/40 hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={`text-[10px] font-bold ${isActive ? 'text-blue-900' : 'text-white'}`}>
                    {char.name}
                  </h3>
                  <span className="text-[6px] uppercase opacity-70">
                    {char.class.toUpperCase()} · LVL {char.level}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[5px] uppercase opacity-50">HEALTH</div>
                  <div className={`text-[9px] font-bold ${char.hp < (char.maxHp / 3) ? "text-red-500 animate-pulse" : ""}`}>
                    {char.hp}/{char.maxHp}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-1 text-center mb-3">
                {Object.entries(char.stats).map(([stat, val]) => (
                  <div key={stat} className={`p-1 border ${isActive ? 'bg-blue-900/5 border-blue-900/10' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-[5px] opacity-60">{stat}</div>
                    <div className="text-[8px] font-bold">{val}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[7px] font-bold border-t border-black/10 pt-2 opacity-80 uppercase">
                <span>AC: {char.ac}</span>
                <span>T0: {char.thac0}</span>
                <span className="text-[#d4af37]">GP: {char.gold}</span>
              </div>

              {isActive && (
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-[#d4af37]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
