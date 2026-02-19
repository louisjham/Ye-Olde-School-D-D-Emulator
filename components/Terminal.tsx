
import React, { useEffect, useRef, useState } from 'react';
import { GameMessage } from '../types';

interface TerminalProps {
  messages: GameMessage[];
}

export const Terminal: React.FC<TerminalProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    if (scrollRef.current && isAtBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  return (
    <div className="relative flex-grow flex flex-col overflow-hidden">
      {/* Scroll indicator for history */}
      {!isAtBottom && (
        <div className="absolute bottom-4 right-8 bg-[#00ff00] text-black px-2 py-1 text-xs font-bold animate-bounce z-10 shadow-lg">
          ↓ NEW MESSAGES BELOW ↓
        </div>
      )}
      
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-grow p-4 overflow-y-auto terminal-scroll text-lg lg:text-xl space-y-4 pt-8"
      >
        <div className="text-[10px] opacity-20 border-b border-[#004400] pb-2 mb-4">
          --- START OF SESSION HISTORY BUFFER ---
        </div>
        
        {messages.map((msg, i) => (
          <div key={i} className={`whitespace-pre-wrap ${
            msg.type === 'player' ? 'text-white' : 
            msg.type === 'system' ? 'text-yellow-400 font-bold' : 
            msg.type === 'dice' ? 'text-cyan-400' :
            'text-[#00ff00]'
          }`}>
            {msg.type === 'player' && <span className="mr-2 text-[#00ff00]">&gt;</span>}
            {msg.content}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </div>
  );
};
