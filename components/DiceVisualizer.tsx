
import React, { useState, useEffect } from 'react';
import { DICE_ART } from '../constants';

interface DiceVisualizerProps {
  value: number;
  sides: number;
  onComplete: () => void;
}

export const DiceVisualizer: React.FC<DiceVisualizerProps> = ({ value, sides, onComplete }) => {
  const [currentDisplay, setCurrentDisplay] = useState('?');
  const [isSettled, setIsSettled] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let count = 0;
    const maxFrames = 12;
    const interval = setInterval(() => {
      if (count < maxFrames) {
        setCurrentDisplay(Math.floor(Math.random() * sides + 1).toString());
        setFrame(f => f + 1);
        count++;
      } else {
        clearInterval(interval);
        setCurrentDisplay(value.toString());
        setIsSettled(true);
        setTimeout(onComplete, 1500);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [value, sides, onComplete]);

  const diceArt = DICE_ART[sides] || DICE_ART[20] || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pixel-font">
      <div className={`transform transition-all duration-300 ${isSettled ? 'scale-110' : 'animate-bounce'}`}>
        <div className="bg-[#000080] border-4 border-[#d4af37] p-8 shadow-[0_0_50px_#d4af37] flex flex-col items-center">
          <div className="text-[#d4af37] text-[10px] mb-6 tracking-widest uppercase">
            {isSettled ? 'THE FATES HAVE SPOKEN' : 'ROLLING D' + sides + '...'}
          </div>
          
          <div className="relative mb-6">
            <pre className="text-white text-[12px] leading-tight opacity-40">
              {diceArt.join('\n')}
            </pre>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl lg:text-6xl font-bold transition-all ${isSettled ? 'text-[#d4af37] drop-shadow-[0_0_10px_#fff]' : 'text-white'}`}>
                {currentDisplay}
              </span>
            </div>
          </div>

          <div className="h-1 w-full bg-white/10 mt-4">
             <div className="h-full bg-[#d4af37] transition-all duration-[1200ms]" style={{ width: isSettled ? '100%' : '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
