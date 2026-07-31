"use client";

import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS — matched to the reference splash screen
----------------------------------------------------------------*/
const COLORS = {
  bg: "#FFFFFF",
  tile: "#DCE9FB",
  tileSoft: "#EAF2FC",
  iconTile: "#EAF2FC",
  border: "#FFFFFF",
  blue: "#2F6FED",
  blueDark: "#1D5FE0",
  amber: "#F5A524",
  text: "#0F1115",
  sub: "#5B6068",
  gray: "#9AA1AB",
};

const CANVAS_W = 1200;
const CANVAS_H = 1200;
const CELL = 42;
const GAP = 7;
const COLS = Math.floor(CANVAS_W / (CELL + GAP));
const ROWS = Math.floor(CANVAS_H / (CELL + GAP));

// deterministic pseudo-random so the layout is stable across re-renders
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------------------------------------------------------------
   LOGO SLOT — reserved space for the Virlio favicon / logo file.
----------------------------------------------------------------*/
interface VirlioLogoProps {
  size?: number;
  src?: string;
}

function VirlioLogo({ size = 88, src = "/favicon.ico" }: VirlioLogoProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <Image
        src={src}
        alt="Virlio logo"
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
        onError={() => setFailed(true)}
        priority
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        border: `1.5px dashed ${COLORS.gray}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        color: COLORS.gray,
        background: "rgba(255,255,255,0.6)",
      }}
    >
      <ImageIcon size={size * 0.28} strokeWidth={1.5} />
      <span style={{ fontSize: 10, fontWeight: 500 }}>logo</span>
    </div>
  );
}

/* ---------------------------------------------------------------
   ANIMATED BACKGROUND — grid of soft rounded tiles that breathe
----------------------------------------------------------------*/
interface MouseState {
  x: number;
  y: number;
  active: boolean;
}

function AnimatedGrid({ mouse }: { mouse: MouseState }) {
  const baseTiles = useMemo(() => {
    const arr = [];
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const rnd = seeded(i);
        const rnd2 = seeded(i + 500);
        arr.push({
          key: `${r}-${c}`,
          x: c * (CELL + GAP),
          y: r * (CELL + GAP),
          baseOpacity: Number((0.15 + rnd * 0.5).toFixed(4)),
          duration: `${(3 + rnd * 4).toFixed(3)}s`,
          delay: `${(rnd2 * 5).toFixed(3)}s`,
          accent: i % 23 === 0,
        });
        i++;
      }
    }
    return arr;
  }, []);

  const HOVER_RADIUS = 180;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
    >
      <style>{`
        @keyframes tileBreathe {
          0%, 100% {
            opacity: calc(var(--base-op) * (1 + var(--hover-boost, 0)));
            transform: scale(calc(1 + var(--hover-boost, 0) * 0.45));
          }
          50% {
            opacity: calc(var(--base-op) * (1.9 + var(--hover-boost, 0) * 1.3));
            transform: scale(calc(1.04 + var(--hover-boost, 0) * 0.45));
          }
        }
        .grid-tile {
          animation-name: tileBreathe;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          transform-origin: center;
          transition: --hover-boost 0.2s ease;
        }
      `}</style>
      {baseTiles.map((t) => {
        let boost = 0;
        if (mouse && mouse.active) {
          const cx = t.x + CELL / 2;
          const cy = t.y + CELL / 2;
          const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
          const raw = Math.max(0, 1 - dist / HOVER_RADIUS);
          boost = Number((raw * raw).toFixed(4));
        }
        return (
          <g
            key={t.key}
            className="grid-tile"
            style={{
              "--base-op": t.baseOpacity,
              "--hover-boost": boost,
              animationDuration: t.duration,
              animationDelay: t.delay,
            } as React.CSSProperties}
          >
            <rect
              x={t.x}
              y={t.y}
              width={CELL}
              height={CELL}
              rx={10}
              fill={COLORS.tile}
            />
            {t.accent && (
              <rect x={t.x - 3} y={t.y + 6} width={3} height={CELL - 12} rx={1.5} fill={COLORS.amber} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------------------------------------------
   MAIN SPLASH COMPONENT (FULL SCREEN / FULL BLEED)
----------------------------------------------------------------*/
interface VirlioSplashProps {
  logoSrc?: string;
  showCenterText?: boolean;
  className?: string;
}

export function VirlioSplash({
  logoSrc = "/favicon.ico",
  showCenterText = false,
  className = "",
}: VirlioSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<MouseState>({ x: 0, y: 0, active: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover((h) => ({ ...h, active: false }));
  }, []);

  if (!mounted) {
    return <div className={`w-full h-full bg-white ${className}`} />;
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: COLORS.bg,
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        cursor: "default",
      }}
      className={className}
    >
      <AnimatedGrid mouse={hover} />

      {showCenterText && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: 24,
            textAlign: "center",
          }}
        >
          <VirlioLogo size={88} src={logoSrc} />
          <div
            style={{
              fontWeight: 800,
              fontSize: 34,
              color: COLORS.text,
              letterSpacing: "-0.01em",
              marginTop: 4,
            }}
          >
            Virlio
          </div>
          <div style={{ fontSize: 15, color: COLORS.sub, fontWeight: 500 }}>
            Turn Your Brand Into Viral Content.
          </div>
        </div>
      )}
    </div>
  );
}

export default VirlioSplash;
