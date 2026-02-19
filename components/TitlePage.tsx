
import React from 'react';
import { HISTORY_CONTEXT, GAMEPLAY_GUIDE, MODULES_REGISTRY, APP_DESCRIPTION } from '../constants';

interface TitlePageProps {
  onStart: (moduleId: string) => void;
}

export const TitlePage: React.FC<TitlePageProps> = ({ onStart }) => {
  const [selectedModule, setSelectedModule] = React.useState('b2');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#111] p-4 lg:p-10 overflow-y-auto pixel-font">
      <div className="max-w-5xl w-full beveled-border bg-[#000080] p-1 shadow-2xl">
        <div className="bg-[#000080] border-2 border-[#d4af37] p-6 lg:p-10">
          
          <div className="text-center mb-8">
            <h2 className="text-[#d4af37] text-[10px] lg:text-[12px] tracking-widest mb-6">
              ADVANCED DUNGEONS & DRAGONS®
            </h2>
            <div className="inline-block border-y-2 border-[#d4af37] py-8 mb-6 px-4 lg:px-12">
              <h1 className="text-3xl lg:text-6xl font-bold text-white tracking-tighter drop-shadow-2xl italic leading-tight">
                1st EDITION <br/> <span className="text-[#d4af37] not-italic">EMULATOR</span>
              </h1>
            </div>
            <p className="text-[10px] text-[#d4af37] italic opacity-80">
              "A SIMULATION OF LEGENDARY HEROISM"
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="parchment p-6 beveled-border shadow-xl transform -rotate-1 flex flex-col h-[400px]">
              <h3 className="text-[12px] font-bold border-b-2 border-black/20 mb-4 pb-2">
                TOME OF KNOWLEDGE
              </h3>
              <div className="overflow-y-auto terminal-scroll pr-2 space-y-6 text-[8px] leading-relaxed text-black">
                <div>
                  <p className="font-bold underline uppercase mb-2">MISSION PROFILE</p>
                  <p className="line-height-pixel">{APP_DESCRIPTION}</p>
                </div>
                
                <div className="border-t border-black/10 pt-4">
                  <p className="font-bold underline uppercase mb-2">THE STARK CONTRAST</p>
                  <div className="line-height-pixel whitespace-pre-wrap italic bg-black/5 p-3">
                    {HISTORY_CONTEXT}
                  </div>
                </div>

                <div className="border-t border-black/10 pt-4 pb-4">
                  <p className="font-bold underline uppercase mb-2">GUIDELINES</p>
                  <div className="line-height-pixel whitespace-pre-wrap">
                    {GAMEPLAY_GUIDE}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-black/40 p-6 border-2 border-[#d4af37] flex-grow flex flex-col">
                <h3 className="text-[#d4af37] text-[10px] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#d4af37] inline-block animate-pulse"></span>
                  PLAYER START-UP
                </h3>
                <div className="text-white/60 text-[8px] mb-8 space-y-4 italic leading-loose">
                  <p>• GENERATE 3D6 ATTRIBUTES IN ORDER.</p>
                  <p>• SELECT ADVENTURE MODULE.</p>
                  <p>• FOOLISHNESS IS FATAL.</p>
                  <p>• GOLD = EXPERIENCE.</p>
                </div>

                <div className="mt-auto space-y-6">
                  <div>
                    <label className="block text-[8px] text-[#d4af37] mb-3">SELECT MODULE:</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-[#000040] border-2 border-[#d4af37] text-white p-3 text-[10px] focus:outline-none appearance-none cursor-pointer pr-10"
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                      >
                        <option value="b2">B2: KEEP ON THE BORDERLANDS</option>
                        <option disabled>B1: IN SEARCH OF THE UNKNOWN</option>
                        <option disabled>S1: TOMB OF HORRORS</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#d4af37]">▼</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => onStart(selectedModule)}
                    className="w-full bg-[#d4af37] text-black font-bold py-5 text-[14px] hover:bg-white transition-all shadow-2xl active:scale-95 border-b-4 border-black italic"
                  >
                    BEGIN ADVENTURE
                  </button>
                </div>
              </div>

              <div className="text-[7px] text-gray-500 text-center opacity-60">
                © 1977-1981 TSR HOBBIES, INC. • GEMINI-3-PRO
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
