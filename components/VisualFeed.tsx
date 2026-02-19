
import React, { useEffect, useRef, useState } from 'react';

interface VisualFeedProps {
  location: string;
  inCombat: boolean;
}

export const VisualFeed: React.FC<VisualFeedProps> = ({ location, inCombat }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const draw = () => {
      // Background (Dark gray wash)
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Paper grain effect
      for(let i=0; i<100; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
          ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1, 1);
      }

      // Drawing style: Thick white charcoal lines
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,255,255,0.2)';
      
      if (inCombat) {
        // High-contrast monster silhouette
        const time = Date.now() / 300;
        const scale = 1 + Math.sin(time) * 0.05;
        
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width/2, -canvas.height/2);

        // Monstrous head
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.quadraticCurveTo(150, 20, 200, 100);
        ctx.lineTo(180, 140);
        ctx.lineTo(120, 140);
        ctx.closePath();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(130, 80, 5, 0, Math.PI*2);
        ctx.arc(170, 80, 5, 0, Math.PI*2);
        ctx.fill();

        // Teeth
        ctx.beginPath();
        for(let i=0; i<6; i++) {
            ctx.moveTo(130 + (i*10), 110);
            ctx.lineTo(135 + (i*10), 125);
            ctx.lineTo(140 + (i*10), 110);
        }
        ctx.stroke();
        ctx.restore();
      } else {
        // Archway / Corridor sketch
        ctx.beginPath();
        // Foreground arch
        ctx.strokeRect(50, 40, 200, 140);
        // Perspective lines to middle ground
        ctx.moveTo(50, 40); ctx.lineTo(100, 80);
        ctx.moveTo(250, 40); ctx.lineTo(200, 80);
        ctx.moveTo(50, 180); ctx.lineTo(100, 140);
        ctx.moveTo(250, 180); ctx.lineTo(200, 140);
        // Middle arch
        ctx.strokeRect(100, 80, 100, 60);
        ctx.stroke();
        
        // Stones
        ctx.beginPath();
        ctx.strokeRect(60, 50, 30, 15);
        ctx.strokeRect(210, 150, 25, 12);
        ctx.stroke();
      }

      // HUD Frame (Brass corners)
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Top left
      ctx.moveTo(0, 30); ctx.lineTo(0, 0); ctx.lineTo(30, 0);
      // Top right
      ctx.moveTo(270, 0); ctx.lineTo(300, 0); ctx.lineTo(300, 30);
      // Bottom left
      ctx.moveTo(0, 170); ctx.lineTo(0, 200); ctx.lineTo(30, 200);
      // Bottom right
      ctx.moveTo(270, 200); ctx.lineTo(300, 200); ctx.lineTo(300, 170);
      ctx.stroke();

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [inCombat]);

  return (
    <div className="beveled-border !border-[#000080] !outline-[#d4af37] h-52 w-full relative overflow-hidden mb-2 shadow-2xl bg-black">
      <canvas ref={canvasRef} width={300} height={200} className="w-full h-full block image-rendering-auto" />
      <div className="absolute top-2 left-4 text-[#d4af37] pixel-font text-[8px] tracking-widest drop-shadow-md">
        {inCombat ? 'SIGHTING: HOSTILE' : 'SIGHTING: CLEAR'}
      </div>
      <div className="absolute bottom-2 right-4 text-white/40 font-serif italic text-xs">
        {location.toUpperCase()}
      </div>
    </div>
  );
};
