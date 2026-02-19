
import React from 'react';

interface MapperProps {
  grid: string[][];
  onCellClick: (x: number, y: number) => void;
}

export const Mapper: React.FC<MapperProps> = ({ grid, onCellClick }) => {
  return (
    <div className="beveled-border !border-white !outline-[#d4af37] shadow-2xl p-4 bg-white">
      <div className="text-center mb-3">
        <h3 className="pixel-font text-[10px] text-blue-900 border-b-2 border-blue-100 pb-1">TACTICAL CHART v1.0</h3>
      </div>
      <div className="graph-paper p-1 border border-blue-200">
        <div className="grid grid-cols-20 gap-0 border border-blue-300">
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`} 
                onClick={() => onCellClick(x, y)}
                className="w-4 h-4 flex items-center justify-center cursor-pointer hover:bg-blue-50/50 text-[10px] font-bold text-blue-800 border-[0.5px] border-blue-50"
              >
                {cell === ' ' ? '' : cell}
                {cell === '#' && <div className="w-full h-full bg-blue-900/20" />}
                {cell === 'D' && <span className="text-red-700">◫</span>}
                {cell === 'S' && <span className="text-green-700">▤</span>}
                {cell === 'X' && <span className="text-red-600 font-bold">✕</span>}
                {cell === '.' && <span className="opacity-30">·</span>}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[10px] font-bold text-blue-400 italic">
        <span>[D]OOR • [S]ECRET • [X]THREAT</span>
        <span>CARTOGRAPHER: AUTOMATED</span>
      </div>
    </div>
  );
};
