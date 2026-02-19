
import React from 'react';

interface MapperProps {
  grid: string[][];
  onCellClick: (x: number, y: number) => void;
}

export const Mapper: React.FC<MapperProps> = ({ grid, onCellClick }) => {
  return (
    <div className="bg-black border-2 border-[#00ff00] p-2 mt-4 font-mono text-[8px] leading-tight select-none">
      <div className="text-[#00ff00] text-center mb-1 text-[10px] border-b border-[#004400]">MAPPING UNIT V1.0</div>
      <div className="grid grid-cols-20 gap-0">
        {grid.map((row, y) => 
          row.map((cell, x) => (
            <div 
              key={`${x}-${y}`} 
              onClick={() => onCellClick(x, y)}
              className="w-3 h-3 flex items-center justify-center cursor-pointer hover:bg-[#003300] border border-[#001100]"
            >
              {cell === ' ' ? '·' : cell}
            </div>
          ))
        )}
      </div>
      <div className="mt-2 text-[6px] text-gray-500 flex justify-between">
          <span>[CLICK CELL TO CYCLE: . # D S X]</span>
          <span>COORDS: X/Y</span>
      </div>
    </div>
  );
};
