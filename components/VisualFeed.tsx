
import React, { useEffect, useRef, useState } from 'react';

interface VisualFeedProps {
  location: string;
  inCombat: boolean;
}

export const VisualFeed: React.FC<VisualFeedProps> = ({ location, inCombat }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [telemetry, setTelemetry] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = [...prev, Math.random().toString(16).substring(2, 10).toUpperCase()];
        if (next.length > 5) next.shift();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const draw = () => {
      // Background and Clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Procedural tactical grid
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Main Visuals
      ctx.strokeStyle = inCombat ? '#ff3333' : '#00ff00';
      ctx.lineWidth = 2;
      ctx.font = '10px monospace';
      
      if (inCombat) {
        // Jagged, aggressive monster representation
        const time = Date.now() / 200;
        const wiggle = Math.sin(time) * 5;
        ctx.beginPath();
        ctx.moveTo(100 + wiggle, 140);
        ctx.lineTo(110, 90 - wiggle);
        ctx.lineTo(130 + wiggle, 110);
        ctx.lineTo(150, 70 + wiggle);
        ctx.lineTo(170 - wiggle, 110);
        ctx.lineTo(190, 90 + wiggle);
        ctx.lineTo(200 - wiggle, 140);
        ctx.closePath();
        ctx.stroke();
        
        // Combat target brackets
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(80, 60); ctx.lineTo(100, 60); ctx.moveTo(80, 60); ctx.lineTo(80, 80);
        ctx.moveTo(220, 60); ctx.lineTo(200, 60); ctx.moveTo(220, 60); ctx.lineTo(220, 80);
        ctx.stroke();
        
        ctx.fillStyle = '#ff0000';
        ctx.fillText("!! THREAT DETECTED !!", 100, 170);
      } else {
        // Perspective corridor
        ctx.beginPath();
        ctx.rect(80, 60, 140, 80);
        ctx.moveTo(0, 0); ctx.lineTo(80, 60);
        ctx.moveTo(300, 0); ctx.lineTo(220, 60);
        ctx.moveTo(0, 200); ctx.lineTo(80, 140);
        ctx.moveTo(300, 200); ctx.lineTo(220, 140);
        ctx.stroke();
        
        ctx.fillStyle = '#00ff00';
        ctx.fillText("SYS: " + location.toUpperCase(), 10, 190);
      }

      // Overlays
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, 15);
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`V-PRB // SENSOR_LVL: 0.98 // RNG: ${inCombat ? 'CLOSE' : 'MID'}`, 5, 12);

      // Scanline static
      if (Math.random() > 0.98) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 2);
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [location, inCombat]);

  return (
    <div className="border-2 border-[#00ff00] bg-black h-48 w-full relative overflow-hidden mb-2 group shadow-[0_0_20px_rgba(0,255,0,0.15)]">
      <canvas ref={canvasRef} width={300} height={200} className="w-full h-full block image-rendering-pixelated" />
      
      {/* HUD Telemetry Elements */}
      <div className="absolute top-4 left-2 text-[6px] text-[#00ff00] opacity-50 flex flex-col pointer-events-none">
        {telemetry.map((t, i) => (
          <span key={i}>0x{t}</span>
        ))}
      </div>
      
      <div className="absolute top-1 right-2 text-[8px] text-[#00ff00] animate-pulse pointer-events-none">
        REC ●
      </div>
      
      <div className="absolute bottom-1 right-2 text-[6px] text-[#00ff00] opacity-40 pointer-events-none">
        COORD_Z: {Math.floor(Math.random() * 1000)}
      </div>

      {/* CRT Corner Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
