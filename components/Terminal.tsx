
import React, { useEffect, useRef, useState } from 'react';
import { GameMessage } from '../types';
import { audioService } from '../services/audioService';

interface TerminalProps {
  messages: GameMessage[];
}

const TypewriterText: React.FC<{ text: string; type: string }> = ({ text, type }) => {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setIsDone(false);

    // Faster typing for longer logs
    const interval = text.length > 200 ? 5 : 15;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(prev => prev + text.charAt(i));
        // Only play typing sound occasionally to avoid being annoying
        if (i % 4 === 0) audioService.playTyping();
        i++;
      } else {
        setIsDone(true);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className={`whitespace-pre-wrap ${
      type === 'player' ? 'text-white' : 
      type === 'system' ? 'text-yellow-400 font-bold' : 
      type === 'dice' ? 'text-cyan-400' :
      'text-[#00ff00]'
    }`}>
      {type === 'player' && <span className="mr-2 text-[#00ff00]">&gt;</span>}
      {displayed}
      {!isDone && <span className="inline-block w-2 h-4 bg-[#00ff00] animate-pulse ml-1 align-middle" />}
    </div>
  );
};

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
    <div className="relative flex-grow flex flex-col overflow-hidden bg-[#000500]">
      {/* Scroll indicator for history */}
      {!isAtBottom && (
        <div className="absolute bottom-4 right-8 bg-[#00ff00] text-black px-2 py-1 text-xs font-bold animate-bounce z-10 shadow-lg border border-black cursor-pointer" onClick={() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }}>
          ↓ NEW DATA BUFFERED ↓
        </div>
      )}
      
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black via-black/50 to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-grow p-4 overflow-y-auto terminal-scroll text-lg lg:text-xl space-y-4 pt-8 pb-10 scroll-smooth"
      >
        <div className="text-[10px] opacity-20 border-b border-[#004400] pb-2 mb-6 tracking-tighter">
          --- AD&D 1E EMULATION INTERFACE // KERNEL: 81.12.02 ---
        </div>
        
        {messages.map((msg, i) => {
          // Only use typewriter for the last message if it's from DM/System/Dice
          const isLast = i === messages.length - 1;
          const useTypewriter = isLast && msg.type !== 'player';

          if (useTypewriter) {
            return <TypewriterText key={i + msg.timestamp} text={msg.content} type={msg.type} />;
          }

          return (
            <div key={i} className={`whitespace-pre-wrap ${
              msg.type === 'player' ? 'text-white' : 
              msg.type === 'system' ? 'text-yellow-400 font-bold' : 
              msg.type === 'dice' ? 'text-cyan-400 font-mono' :
              'text-[#00ff00]'
            }`}>
              {msg.type === 'player' && <span className="mr-2 text-[#00ff00]">&gt;</span>}
              {msg.content}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black via-black/50 to-transparent z-10 pointer-events-none" />
    </div>
  );
};
