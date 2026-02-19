
import React, { useEffect, useRef, useState } from 'react';
import { GameMessage } from '../types';
import { audioService } from '../services/audioService';

interface TerminalProps {
  messages: GameMessage[];
}

const TypewriterText: React.FC<{ text: string; type: string; isFirstMessage: boolean }> = ({ text, type, isFirstMessage }) => {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Skip typewriter for the very first system message to ensure instant visibility
    if (isFirstMessage) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    let i = 0;
    setDisplayed('');
    setIsDone(false);

    const interval = text.length > 300 ? 5 : 15;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(prev => prev + text.charAt(i));
        if (i % 6 === 0) audioService.playTyping();
        i++;
      } else {
        setIsDone(true);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text, isFirstMessage]);

  return (
    <div className={`whitespace-pre-wrap pixel-font text-[12px] lg:text-[15px] line-height-pixel mb-10 tracking-wide transition-opacity duration-500 ${type === 'player' ? 'text-[#8b4513] font-bold border-b-2 border-[#8b4513]/10 pb-4' :
        type === 'system' ? 'text-blue-900 border-l-8 border-blue-900 pl-6 py-4 bg-blue-900/5 my-6' :
          type === 'dice' ? 'bg-black/10 p-6 border-2 border-black/20 text-gray-700 text-[11px] italic mb-8' :
            'text-black'
      }`}>
      {type === 'player' && <span className="mr-4 text-[#d4af37] font-black">{'>>>'}</span>}
      {displayed}
      {!isDone && <span className="inline-block w-4 h-5 bg-black/60 ml-2 align-middle animate-pulse" />}
    </div>
  );
};

export const Terminal: React.FC<TerminalProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative flex-grow overflow-hidden flex flex-col bg-[#fdf5e6]">
      {/* Texture Overlay for Terminal */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] z-10" />

      <div
        ref={scrollRef}
        className="flex-grow p-10 lg:p-14 overflow-y-auto terminal-scroll scroll-smooth relative z-0"
      >
        <div className="text-center mb-16 border-b-4 border-black/10 pb-8">
          <h2 className="text-[14px] lg:text-[16px] tracking-[0.6em] text-black/80 font-bold uppercase drop-shadow-sm">
            --- ADVENTURE CHRONICLE ---
          </h2>
        </div>

        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const isFirstMessage = i === 0;
          const useTypewriter = isLast && msg.type !== 'player';

          if (useTypewriter) {
            return (
              <TypewriterText
                key={i + msg.timestamp}
                text={msg.content}
                type={msg.type}
                isFirstMessage={isFirstMessage}
              />
            );
          }

          return (
            <div key={i} className={`whitespace-pre-wrap pixel-font text-[12px] lg:text-[15px] line-height-pixel mb-10 tracking-wide ${msg.type === 'player' ? 'text-[#8b4513] font-bold border-b-2 border-[#8b4513]/10 pb-4' :
                msg.type === 'system' ? 'text-blue-900 border-l-8 border-blue-900 pl-6 py-4 bg-blue-900/5 my-6' :
                  msg.type === 'dice' ? 'bg-black/10 p-6 border-2 border-black/20 text-gray-700 text-[11px] italic mb-8' :
                    'text-black'
              }`}>
              {msg.type === 'player' && <span className="mr-4 text-[#d4af37] font-black">{'>>>'}</span>}
              {msg.content}
            </div>
          );
        })}

        {/* Spacer for bottom hint overlay */}
        <div className="h-32 shrink-0" />
      </div>

      {/* Visibility Gradients */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#fdf5e6] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fdf5e6] via-[#fdf5e6]/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};
