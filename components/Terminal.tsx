
import React, { useEffect, useRef } from 'react';
import { GameMessage } from '../types';

interface TerminalProps {
  messages: GameMessage[];
}

export const Terminal: React.FC<TerminalProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-grow p-4 overflow-y-auto terminal-scroll text-lg lg:text-xl space-y-4"
    >
      {messages.map((msg, i) => (
        <div key={i} className={`whitespace-pre-wrap ${
          msg.type === 'player' ? 'text-white' : 
          msg.type === 'system' ? 'text-yellow-400 font-bold' : 
          'text-[#00ff00]'
        }`}>
          {msg.type === 'player' && <span className="mr-2">&gt;</span>}
          {msg.content}
        </div>
      ))}
    </div>
  );
};
