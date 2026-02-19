
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MODULES_REGISTRY } from '../constants';
import { audioService } from '../services/audioService';

interface TitlePageProps {
  onStart: (moduleId: string) => void;
}

// ─── Star field data (generated once) ────────────────────────────────────────
interface Star {
  x: number; y: number;
  size: number;
  brightness: number;
  phase: number;      // random phase for twinkling
  driftX: number;     // slow horizontal drift per frame
}

function generateStars(count: number, w: number, h: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() < 0.15 ? 2 : 1,
    brightness: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.08,
  }));
}

// ─── Module catalogue ────────────────────────────────────────────────────────
const MODULE_LIST = [
  { id: 'b2', label: 'B2: KEEP ON THE BORDERLANDS', active: true },
  { id: 'b1', label: 'B1: IN SEARCH OF THE UNKNOWN', active: false },
  { id: 's1', label: 'S1: TOMB OF HORRORS', active: false },
];

// ─── Component ───────────────────────────────────────────────────────────────
export const TitlePage: React.FC<TitlePageProps> = ({ onStart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [selectedIdx, setSelectedIdx] = useState(0);   // module selector index (only idx=0 active)
  const [audioStarted, setAudioStarted] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);
  const [marqueeOffset, setMarqueeOffset] = useState(0);
  const [hasSave, setHasSave] = useState(false);
  const [exitFade, setExitFade] = useState(false); // triggered on launch

  // Detect existing save
  useEffect(() => {
    const saved = localStorage.getItem('dnd_emulator_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasSave(!!(parsed.party && parsed.party.length > 0));
      } catch { /* ignore */ }
    }
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setBlinkOn(b => !b), 530);
    return () => clearInterval(id);
  }, []);

  // Marquee scroll (module list drifts left ~0.4px/frame @ 60fps)
  useEffect(() => {
    const id = setInterval(() => {
      setMarqueeOffset(o => (o + 0.4) % 600);
    }, 16);
    return () => clearInterval(id);
  }, []);

  // ─── Canvas render loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Regenerate stars when viewport changes
      starsRef.current = generateStars(220, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const draw = (ts: number) => {
      timeRef.current = ts;
      const W = canvas.width;
      const H = canvas.height;
      const mx = mouseRef.current.x / W - 0.5; // -0.5 … 0.5
      const my = mouseRef.current.y / H - 0.5;

      // ── Background ────────────────────────────────────────────────────────
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // ── Stars ─────────────────────────────────────────────────────────────
      starsRef.current.forEach(s => {
        // Parallax with mouse (deeper stars → more offset)
        const px = s.x + mx * 30 * s.size + s.driftX * (ts / 16);
        const py = s.y + my * 20 * s.size;
        const twinkle = s.brightness * (0.6 + 0.4 * Math.sin(ts * 0.002 + s.phase));
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fillRect((px + W) % W, (py + H) % H, s.size, s.size);
      });

      // ── Gold decorative border frame ───────────────────────────────────────
      const bm = 18; // margin
      const grad = ctx.createLinearGradient(bm, bm, W - bm, H - bm);
      grad.addColorStop(0, '#a07828');
      grad.addColorStop(0.3, '#d4af37');
      grad.addColorStop(0.5, '#f5e070');
      grad.addColorStop(0.7, '#d4af37');
      grad.addColorStop(1, '#a07828');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.strokeRect(bm, bm, W - bm * 2, H - bm * 2);
      // Inner thin border
      ctx.strokeStyle = 'rgba(212,175,55,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bm + 6, bm + 6, W - (bm + 6) * 2, H - (bm + 6) * 2);

      // Corner "rivets"
      const corners = [[bm, bm], [W - bm, bm], [bm, H - bm], [W - bm, H - bm]];
      ctx.fillStyle = '#d4af37';
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Title: "ADVANCED DUNGEONS & DRAGONS®" ─────────────────────────────
      // Parallax: slow floating on mouse X, slow oscillation in Y
      const titleY = H * 0.28 + my * 18 + Math.sin(ts * 0.0008) * 6;
      const shimmer = 0.75 + 0.25 * Math.sin(ts * 0.0015);

      // Outer glow pass (blurred)
      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#d4af37';
      ctx.globalAlpha = shimmer * 0.5;
      const titleFontSize = Math.min(Math.floor(W / 22), 46);
      ctx.font = `bold ${titleFontSize}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5e070';
      ctx.fillText('ADVANCED DUNGEONS', W / 2 + mx * 12, titleY);
      ctx.fillText('& DRAGONS\u00AE', W / 2 + mx * 12, titleY + titleFontSize * 1.4);
      ctx.restore();

      // Crisp fill pass
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#d4af37';
      ctx.font = `bold ${titleFontSize}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(212,175,55,${shimmer})`;
      ctx.fillText('ADVANCED DUNGEONS', W / 2 + mx * 12, titleY);
      ctx.fillText('& DRAGONS\u00AE', W / 2 + mx * 12, titleY + titleFontSize * 1.4);
      ctx.restore();

      // ── Slim gold rule separator ───────────────────────────────────────────
      const sepY = titleY + titleFontSize * 1.4 + 18;
      const sepW = Math.min(520, W * 0.55);
      const sepGrad = ctx.createLinearGradient(W / 2 - sepW / 2, 0, W / 2 + sepW / 2, 0);
      sepGrad.addColorStop(0, 'transparent');
      sepGrad.addColorStop(0.2, '#d4af37');
      sepGrad.addColorStop(0.5, '#f5e070');
      sepGrad.addColorStop(0.8, '#d4af37');
      sepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sepGrad;
      ctx.fillRect(W / 2 - sepW / 2, sepY, sepW, 2);

      // ── Subtitle: "YE OLDE SCHOOL EMULATOR" ──────────────────────────────
      // Slightly different parallax speed (depth layer 2)
      const sub1Y = sepY + 30 + my * 10 + Math.sin(ts * 0.0011 + 1.2) * 4;
      const subSize = Math.min(Math.floor(W / 38), 22);

      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255,255,255,0.4)';
      ctx.font = `${subSize}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(220,220,220,0.85)';
      ctx.fillText('YE OLDE SCHOOL', W / 2 + mx * 6, sub1Y);
      ctx.restore();

      const sub2Y = sub1Y + subSize * 1.6;
      const sub2Size = Math.min(Math.floor(W / 28), 30);
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#d4af37';
      ctx.font = `bold ${sub2Size}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d4af37';
      ctx.fillText('EMULATOR', W / 2 + mx * 6, sub2Y);
      ctx.restore();

      // ── Decorative diamond ─────────────────────────────────────────────────
      const diamY = sub2Y + 30;
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#d4af37';
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(W / 2, diamY);
      ctx.lineTo(W / 2 + 8, diamY + 8);
      ctx.lineTo(W / 2, diamY + 16);
      ctx.lineTo(W / 2 - 8, diamY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── Scanlines overlay ─────────────────────────────────────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      for (let sy = 0; sy < H; sy += 2) {
        ctx.fillRect(0, sy, W, 1);
      }

      // Subtle flicker (random per-frame darkening)
      if (Math.random() < 0.04) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, 0, W, H);
      }

      // ── CRT vignette ──────────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ─── Mouse parallax tracking ───────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // ─── Keyboard handler ──────────────────────────────────────────────────────
  const triggerLaunch = useCallback((moduleId: string) => {
    if (!audioStarted) {
      audioService.playTheme();
      setAudioStarted(true);
    }
    audioService.stopTheme();
    // Beep flourish on launch
    audioService.beep(659, 0.15, 'square', 0.07);
    setTimeout(() => audioService.beep(784, 0.15, 'square', 0.07), 160);
    setTimeout(() => audioService.beep(1047, 0.4, 'square', 0.08), 320);

    setExitFade(true);
    setTimeout(() => onStart(moduleId), 900);
  }, [audioStarted, onStart]);

  const handleLoad = useCallback(() => {
    // Load simply starts the game — App.tsx already reads from localStorage
    triggerLaunch('b2');
  }, [triggerLaunch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // First keypress starts audio; subsequent trigger launch
        if (!audioStarted) {
          audioService.playTheme();
          setAudioStarted(true);
          return;
        }
        triggerLaunch(MODULE_LIST[0].id);
      }
      if (e.key === 'l' || e.key === 'L') {
        if (hasSave) handleLoad();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [audioStarted, triggerLaunch, hasSave, handleLoad]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      onMouseMove={handleMouseMove}
      onClick={() => {
        if (!audioStarted) {
          audioService.playTheme();
          setAudioStarted(true);
        }
      }}
    >
      {/* Canvas — all visual FX */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* ── HTML overlay ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 md:pb-14 pointer-events-none z-10">

        {/* ── Module marquee ──────────────────────────────────────────────────── */}
        <div className="w-full overflow-hidden mb-6" style={{ height: '2.8rem' }}>
          {/* Static centred module list — marquee is a CSS animation */}
          <div
            className="flex items-center justify-center gap-0 h-full"
            style={{
              animation: 'marquee-scroll 18s linear infinite',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Duplicate to create seamless loop */}
            {[...MODULE_LIST, ...MODULE_LIST].map((mod, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 mx-6"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: mod.active ? '#d4af37' : 'rgba(255,255,255,0.25)',
                }}
              >
                {mod.active && (
                  <span
                    style={{
                      color: '#d4af37',
                      opacity: blinkOn ? 1 : 0,
                      transition: 'opacity 0.1s',
                    }}
                  >
                    ▶
                  </span>
                )}
                {mod.label}
                {!mod.active && (
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '7px',
                      color: '#444',
                      marginLeft: '6px',
                    }}
                  >
                    [LOCKED]
                  </span>
                )}
                {mod.active && (
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '7px',
                      color: '#3a3',
                      marginLeft: '6px',
                    }}
                  >
                    [ACTIVE]
                  </span>
                )}
                <span style={{ color: '#333', marginLeft: '10px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Thin gold rule ───────────────────────────────────────────────────── */}
        <div
          className="mb-6"
          style={{
            width: 'min(480px, 60vw)',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #d4af37 30%, #f5e070 50%, #d4af37 70%, transparent)',
          }}
        />

        {/* ── CTA buttons / key hints ───────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          {/* NEW GAME */}
          <button
            onClick={() => triggerLaunch(MODULE_LIST[0].id)}
            className="group relative overflow-hidden transition-all duration-200 active:scale-95"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '13px',
              letterSpacing: '0.2em',
              color: '#000',
              background: 'linear-gradient(180deg, #f5e070 0%, #d4af37 50%, #a07828 100%)',
              border: '2px solid #f5e070',
              padding: '14px 40px',
              boxShadow: '0 0 20px rgba(212,175,55,0.5), 0 4px 0 #5a3e00',
              cursor: 'pointer',
            }}
          >
            <span className="relative z-10">
              {blinkOn ? '▶ ' : '  '}NEW ADVENTURE
            </span>
            {/* Gold shimmer sweep */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                animation: 'shimmer-sweep 1.2s ease-in-out infinite',
              }}
            />
          </button>

          {/* LOAD GAME — only shown if save exists */}
          {hasSave && (
            <button
              onClick={handleLoad}
              className="transition-all duration-200 active:scale-95 hover:text-white"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: 'rgba(212,175,55,0.7)',
                background: 'transparent',
                border: '1px solid rgba(212,175,55,0.35)',
                padding: '10px 28px',
                cursor: 'pointer',
              }}
            >
              ℹ LOAD CHRONICLE
            </button>
          )}

          {/* Key hint */}
          <p
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              letterSpacing: '0.15em',
              color: audioStarted ? 'rgba(212,175,55,0.55)' : 'rgba(255,255,255,0.35)',
              marginTop: '4px',
            }}
          >
            {audioStarted
              ? 'PRESS ENTER OR SPACE TO BEGIN'
              : 'PRESS ANY KEY TO AWAKEN THE ORACLE'}
          </p>
        </div>

        {/* ── Copyright footer ──────────────────────────────────────────────── */}
        <p
          className="absolute bottom-4"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          © 1977–1981 TSR HOBBIES, INC. · POWERED BY GEMINI · v5.0
        </p>
      </div>

      {/* ── Exit fade overlay ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-50 transition-opacity duration-700"
        style={{ opacity: exitFade ? 1 : 0 }}
      />

      {/* ── Inline keyframe animations ────────────────────────────────────────── */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
