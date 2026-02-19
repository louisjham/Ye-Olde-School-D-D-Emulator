
import React from 'react';
import { HISTORY_CONTEXT, GAMEPLAY_GUIDE, MODULES_REGISTRY, APP_DESCRIPTION } from '../constants';

interface TitlePageProps {
  onStart: (moduleId: string) => void;
}

export const TitlePage: React.FC<TitlePageProps> = ({ onStart }) => {
  const [selectedModule, setSelectedModule] = React.useState('b2');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-[#00ff00] p-4 lg:p-10 font-mono overflow-y-auto terminal-scroll">
      <div className="max-w-5xl w-full border-2 border-[#00ff00] bg-black p-6 lg:p-10 shadow-[0_0_60px_rgba(0,255,0,0.4)] relative">
        {/* Retro Hardware Labels */}
        <div className="absolute top-2 left-4 text-[10px] opacity-40 font-bold tracking-widest">
          CPU: MOS 6502 // CLOCK: 1.02 MHz // SYSTEM: OS/GYGAX-81
        </div>
        <div className="absolute top-2 right-4 text-[10px] opacity-40 font-bold tracking-widest">
          STATUS: ONLINE // VOLTAGE: NOMINAL
        </div>

        <div className="text-center mb-10 mt-6">
          <pre className="text-[10px] lg:text-[12px] leading-none mb-6 inline-block text-left animate-pulse">
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
          <h1 className="text-4xl lg:text-7xl font-bold tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_#00ff00]">
            AD&D 1E EMULATOR
          </h1>
          <p className="text-xs lg:text-sm opacity-60 italic tracking-wider">
            "THE ORIGINAL EXPERIENCE, RESTORED VIA NEURAL INTERFACE."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <section className="border border-[#004400] p-4 bg-[#000800]">
            <h2 className="text-lg font-bold border-b-2 border-[#00ff00] pb-1 mb-4 flex items-center">
              <span className="mr-2">■</span> LOGICAL_CORE.EXE
            </h2>
            <div className="text-sm leading-relaxed text-justify opacity-90">
              <p className="mb-4 text-[#00ff00] font-bold underline">WHAT IS THIS?</p>
              {APP_DESCRIPTION}
            </div>
            <div className="mt-4 pt-4 border-t border-[#002200]">
              <h3 className="text-sm font-bold text-[#00ff00] mb-2 tracking-tighter">OPERATING PROTOCOL:</h3>
              <ul className="text-[11px] space-y-1 opacity-70">
                <li>• TEXT-BASED INTERFACE (VOICE_LINK_DISABLED)</li>
                <li>• PROCEDURAL WORLD GENERATION</li>
                <li>• PERSISTENT CHARACTER DATA (LOCAL)</li>
              </ul>
            </div>
          </section>

          {/* History/Contrast Section */}
          <section className="border border-[#004400] p-4 bg-[#000800]">
            <h2 className="text-lg font-bold border-b-2 border-[#00ff00] pb-1 mb-4 flex items-center">
              <span className="mr-2">■</span> ARCHIVAL_HISTORY.DAT
            </h2>
            <div className="text-[12px] leading-relaxed whitespace-pre-wrap opacity-90 terminal-scroll max-h-[400px] overflow-y-auto pr-2">
              {HISTORY_CONTEXT}
            </div>
          </section>

          {/* Gameplay/Launch Section */}
          <section className="border border-[#004400] p-4 bg-[#000800] flex flex-col">
            <h2 className="text-lg font-bold border-b-2 border-[#00ff00] pb-1 mb-4 flex items-center">
              <span className="mr-2">■</span> EXPEDITION_INIT.SH
            </h2>
            <div className="text-[12px] leading-relaxed mb-6 opacity-90">
              <p className="text-[#00ff00] font-bold underline mb-2">QUICK-START GUIDE:</p>
              {GAMEPLAY_GUIDE}
            </div>
            
            <div className="mt-auto pt-6 border-t-2 border-[#00ff00]">
              <label className="block text-[10px] font-bold mb-2 tracking-widest text-[#008800]">
                SELECT EXPEDITION MODULE:
              </label>
              <div className="space-y-4">
                <select 
                  className="w-full bg-black border-2 border-[#00ff00] text-[#00ff00] p-3 font-bold focus:outline-none focus:bg-[#002200] appearance-none cursor-pointer"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <option value="b2">B2: THE KEEP ON THE BORDERLANDS</option>
                  <option disabled>B1: IN SEARCH OF THE UNKNOWN (RECOVERY...)</option>
                  <option disabled>G1: STEADING OF THE HILL GIANTS (LOCKED)</option>
                  <option disabled>S1: TOMB OF HORRORS (FATAL_PERMISSION_DENIED)</option>
                  <option disabled>--- MORE TO COME ---</option>
                </select>

                <button 
                  onClick={() => onStart(selectedModule)}
                  className="w-full bg-[#00ff00] text-black font-black py-4 hover:bg-[#55ff55] transition-all shadow-[0_0_20px_rgba(0,255,0,0.5)] group active:scale-95"
                >
                  <span className="group-hover:tracking-[0.3em] transition-all">INITIALIZE NEURAL LINK</span>
                  <span className="ml-2 animate-ping inline-block">_</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 flex justify-between items-center text-[9px] opacity-20 tracking-[0.5em] border-t border-[#004400] pt-4">
          <span>(C) 1979-1981 TSR HOBBIES, INC.</span>
          <span>EST. BANDWIDTH: 300 BAUD</span>
          <span>PROCESSED BY GEMINI-3-PRO</span>
        </div>
      </div>
    </div>
  );
};
