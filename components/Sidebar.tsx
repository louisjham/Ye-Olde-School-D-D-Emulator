
import React from 'react';
import { GameState, Character } from '../types';

interface SidebarProps {
  state: GameState;
  onSelect?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onSelect }) => {
  const activeChar = state.party.find(c => c.id === state.activeCharacterId);

  return (
    <div className="w-full border-2 border-[#00ff00] p-4 bg-black font-mono shadow-[inset_0_0_10px_rgba(0,255,0,0.2)]">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-center border-b-2 border-[#00ff00] mb-4 pb-1">
          EXPEDITIONARY UNIT
        </h2>
        {state.party.length === 0 && (
          <div className="text-center py-4 opacity-40 italic animate-pulse">
            [ NO DATA FOUND ]
          </div>
        )}
        <div className="space-y-4">
          {state.party.map((char) => {
            const isActive = char.id === state.activeCharacterId;
            return (
              <div 
                key={char.id} 
                onClick={() => onSelect?.(char.id)}
                className={`border-2 cursor-pointer p-2 transition-all relative ${
                  isActive 
                    ? 'border-[#00ff00] bg-[#001100] shadow-[0_0_15px_rgba(0,255,0,0.4)]' 
                    : 'border-[#003300] bg-black opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00ff00] animate-pulse" />
                )}
                
                <div className="flex justify-between font-bold text-white border-b border-[#003300] mb-2">
                  <span className="truncate pr-2">{char.name.toUpperCase()}</span>
                  <span className="text-[#00ff00] shrink-0">L:{char.level}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[9px] mb-2 text-[#00cc00]">
                  <div className="flex flex-col"><span>STR</span><span className="text-white">{char.stats.STR}</span></div>
                  <div className="flex flex-col"><span>INT</span><span className="text-white">{char.stats.INT}</span></div>
                  <div className="flex flex-col"><span>WIS</span><span className="text-white">{char.stats.WIS}</span></div>
                  <div className="flex flex-col"><span>DEX</span><span className="text-white">{char.stats.DEX}</span></div>
                  <div className="flex flex-col"><span>CON</span><span className="text-white">{char.stats.CON}</span></div>
                  <div className="flex flex-col"><span>CHA</span><span className="text-white">{char.stats.CHA}</span></div>
                </div>

                <div className="text-[10px] space-y-1 border-t border-[#003300] pt-1">
                  <div className="flex justify-between">
                    <span>HEALTH:</span>
                    <span className={char.hp < (char.maxHp / 3) ? "text-red-500 animate-pulse font-bold" : "text-white"}>
                      {char.hp}/{char.maxHp}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#002200]">
                    <div 
                      className="h-full bg-[#00ff00]" 
                      style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>AC / THAC0:</span>
                    <span className="text-white">{char.ac} / {char.thac0}</span>
                  </div>
                </div>

                {isActive && char.spells.length > 0 && (
                  <div className="mt-2 pt-1 border-t border-dashed border-[#004400] text-[8px]">
                    <span className="text-[#008800]">MEMORIZED:</span>
                    <div className="truncate italic text-cyan-400">{char.spells.join(', ')}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs space-y-2 border-t-2 border-[#00ff00] pt-4 bg-[#000800] -mx-4 px-4 pb-2">
        <div className="flex justify-between items-center">
            <span className="opacity-50">LOCATION:</span>
            <span className="text-white text-right">{state.location.toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="opacity-50">PARTY FUND:</span>
            <span className="text-yellow-500 font-bold">{state.gold} GP</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="opacity-50">TIME ELAPSED:</span>
            <span className="text-white">{state.turnCount} TURNS</span>
        </div>
      </div>
    </div>
  );
};
