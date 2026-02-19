
import React, { useEffect, useRef } from 'react';

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

    // Retro clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Scanlines
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Procedural abstract "Visual"
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    if (inCombat) {
      // Draw a jagged monster silhouette
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.lineTo(120, 100);
      ctx.lineTo(150, 120);
      ctx.lineTo(180, 80);
      ctx.lineTo(200, 150);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#004400';
      ctx.fill();
      ctx.fillStyle = '#00ff00';
      ctx.fillText("TARGET DETECTED", 110, 180);
    } else {
      // Draw a simple passage/room perspective
      ctx.beginPath();
      ctx.rect(50, 50, 200, 100); // Back wall
      ctx.moveTo(0, 0); ctx.lineTo(50, 50); // Top left
      ctx.moveTo(300, 0); ctx.lineTo(250, 50); // Top right
      ctx.moveTo(0, 200); ctx.lineTo(50, 150); // Bottom left
      ctx.moveTo(300, 200); ctx.lineTo(250, 150); // Bottom right
      ctx.stroke();
      ctx.fillText(location.toUpperCase(), 10, 20);
    }

    // Flicker effect
    if (Math.random() > 0.95) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

  }, [location, inCombat]);

  return (
    <div className="border-2 border-[#00ff00] bg-black h-48 w-full relative overflow-hidden mb-2">
      <canvas ref={canvasRef} width={300} height={200} className="w-full h-full block" />
      <div className="absolute top-1 right-2 text-[8px] animate-pulse">V-FEED: ACTIVE</div>
    </div>
  );
};
