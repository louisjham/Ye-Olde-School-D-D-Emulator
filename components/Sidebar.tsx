
import React from 'react';
import { GameState } from '../types';

interface SidebarProps {
  state: GameState;
  onSelect?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onSelect }) => {
  return (
    <div className="w-full border-2 border-[#00ff00] p-4 bg-black font-mono">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-center border-b border-[#00ff00] mb-4">EXPEDITIONARY UNIT</h2>
        {state.party.length === 0 && (
          <div className="text-center py-4 opacity-40 italic">
            [ NO DATA FOUND ]
          </div>
        )}
        <div className="space-y-3">
          {state.party.map((char) => {
            const isActive = char.id === state.activeCharacterId;
            return (
              <div 
                key={char.id} 
                onClick={() => onSelect?.(char.id)}
                className={`border cursor-pointer p-2 transition-all ${
                  isActive ? 'border-[#00ff00] bg-[#002200] shadow-[0_0_10px_rgba(0,255,0,0.5)]' : 'border-[#004400] bg-[#000500] opacity-70'
                }`}
              >
                <div className="flex justify-between font-bold text-white border-b border-[#004400] mb-1">
                  <span>{char.name.toUpperCase()} {isActive ? '*' : ''}</span>
                  <span className="text-[#00ff00]">LVL {char.level}</span>
                </div>
                <div className="text-[10px] grid grid-cols-2 gap-x-2 text-gray-400">
                  <span>CLASS: {char.class}</span>
                  <span>AC: {char.ac}</span>
                  <span className={char.hp < 3 ? "text-red-500 animate-pulse" : ""}>HP: {char.hp}/{char.maxHp}</span>
                  <span>XP: {char.xp}</span>
                </div>
                {isActive && (
                    <div className="mt-1 h-1 bg-[#001100] w-full">
                        <div className="h-full bg-[#00ff00] transition-all" style={{ width: `${Math.min(100, (char.xp / 2000) * 100)}%` }}></div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs space-y-2 border-t border-[#004400] pt-4">
        <div className="flex justify-between">
            <span>LOCATION:</span>
            <span className="text-white">{state.location.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
            <span>TREASURE:</span>
            <span className="text-yellow-500 font-bold">{state.gold} GP</span>
        </div>
      </div>
    </div>
  );
};
