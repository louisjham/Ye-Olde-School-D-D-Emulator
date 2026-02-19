
import React from 'react';
import { HISTORY_CONTEXT, GAMEPLAY_GUIDE, MODULES_REGISTRY } from '../constants';

interface TitlePageProps {
  onStart: (moduleId: string) => void;
}

export const TitlePage: React.FC<TitlePageProps> = ({ onStart }) => {
  const [selectedModule, setSelectedModule] = React.useState('b2');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-[#00ff00] p-4 lg:p-10 font-mono overflow-y-auto">
      <div className="max-w-4xl w-full border-2 border-[#00ff00] bg-black p-6 lg:p-10 shadow-[0_0_50px_rgba(0,255,0,0.3)] relative">
        {/* Retro Header Decorations */}
        <div className="absolute top-2 left-2 text-[10px] opacity-50">VER 4.2.0-GYGAX</div>
        <div className="absolute top-2 right-2 text-[10px] opacity-50">BIT-DEPTH: 8-BIT</div>

        <div className="text-center mb-10">
          <pre className="text-[10px] leading-tight mb-4 inline-block text-left">
{`
   ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄    ▄▄▄     ▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ 
  █  ▄    █       █  ▄    █  █   █   █       █  █       █       █       █
  █ █ █   █▄▄▄▄   █ █ █   █  █▄▄▄█   █    ▄▄▄█  █▄▄▄▄   █▄▄▄▄   █    ▄▄▄█
  █ █▄█   █▄▄▄▄█  █ █▄█   █   ▄▄▄    █   █▄▄▄    ▄▄▄▄█   ▄▄▄▄█  █   █▄▄▄ 
  █       █▄▄▄▄   █       █  █   █   █    ▄▄▄█  █▄▄▄▄   █▄▄▄▄   █    ▄▄▄█
  █   ▄   █       █   ▄   █  █▄▄▄█   █   █▄▄▄   █▄▄▄▄█  █▄▄▄▄█  █   █▄▄▄ 
  █▄▄█ █▄▄█▄▄▄▄▄▄▄█▄▄█ █▄▄█  ▄▄▄▄▄▄▄ █▄▄▄▄▄▄▄█  ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ █▄▄▄▄▄▄▄█
`}
          </pre>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-widest mt-2 animate-pulse">1E D&D EMULATOR</h1>
          <p className="text-sm lg:text-base opacity-70 mt-4 italic">"An authentic simulation of Advanced Dungeons & Dragons, circa 1981."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* History Column */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-[#00ff00] pb-1 inline-block">THE HISTORICAL RECORD</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">
              {HISTORY_CONTEXT}
            </p>
          </section>

          {/* Gameplay Column */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-[#00ff00] pb-1 inline-block">OPERATING PROCEDURES</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">
              {GAMEPLAY_GUIDE}
            </p>
            
            <div className="mt-8 pt-6 border-t border-[#004400]">
              <h3 className="text-lg font-bold mb-4">LOAD EXPEDITION MODULE</h3>
              <div className="space-y-4">
                <select 
                  className="w-full bg-black border-2 border-[#00ff00] text-[#00ff00] p-2 focus:outline-none focus:bg-[#002200]"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <option value="b2">B2: THE KEEP ON THE BORDERLANDS</option>
                  <option disabled>B1: IN SEARCH OF THE UNKNOWN (LOCKED)</option>
                  <option disabled>G1: STEADING OF THE HILL GIANT CHIEF (LOCKED)</option>
                  <option disabled>S1: TOMB OF HORRORS (FATAL ERROR)</option>
                  <option disabled>... MORE TO COME ...</option>
                </select>

                <button 
                  onClick={() => onStart(selectedModule)}
                  className="w-full bg-[#00ff00] text-black font-bold py-4 hover:bg-[#55ff55] transition-colors shadow-[0_0_15px_#00ff00] group"
                >
                  INITIALIZE NEURAL LINK &gt;&gt;
                  <span className="hidden group-hover:inline ml-2 animate-ping">_</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center text-[10px] opacity-30">
          PRODUCED BY T.SR & G.GYGAX INTERFACE PROTOCOL. ALL RIGHTS RESERVED 1979-1981.
        </div>
      </div>
    </div>
  );
};
