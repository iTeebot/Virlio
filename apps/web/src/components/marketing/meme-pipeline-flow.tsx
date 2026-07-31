"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Wifi,
  Cpu,
  Image as ImageIcon,
  Sparkles,
  Play,
  RefreshCw,
  GripHorizontal,
} from "lucide-react";

/* ---------------------------------------------------------------
   SOCIAL BRAND ICONS
----------------------------------------------------------------*/
function InstagramIcon({ size = 16, color = "#E1306C" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ size = 16, color = "#0A66C2" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function FacebookIcon({ size = 16, color = "#1877F2" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ size = 16, color = "#14161B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ---------------------------------------------------------------
   TOKENS — matched to reference screenshot & Virlio design system:
   solid colors, crisp borders, black display text, blue primary
----------------------------------------------------------------*/
const COLORS = {
  card: "#FFFFFF",
  border: "#E4E9E3",
  text: "#14161B",
  sub: "#8A8F91",
  blue: "#2F6FED",
  amber: "#F5A524",
  green: "#22C55E",
  blackPill: "#14161B",
  skeleton: "#EDEFEC",
};

const TEMPLATES = [
  { id: "cat", name: "Woman Yelling at Cat", emoji: "🙀" },
  { id: "bf", name: "Distracted Boyfriend", emoji: "👀" },
  { id: "buttons", name: "Two Buttons", emoji: "🫵" },
  { id: "drake", name: "Meme Template", emoji: "🙅" },
];

const TONES = ["Playful", "Bold", "Chaotic"];

const HASHTAG_SETS = [
  ["#Virlio", "#ViralMemes", "#GlassGrowth", "#ContentMarketing", "#AI"],
  ["#MemeMarketing", "#BrandVoice", "#GrowthHacks"],
  ["#SocialFirst", "#OnBrandChaos", "#TeebotAI"],
];

const CAPTION_TEMPLATES = [
  (p: string, i: string, t: string) => `The team after their first viral meme gets 10k likes. @${p}Growth`,
  (p: string, i: string, t: string) => `${p}, explained by someone who has never used ${p} (${t.toLowerCase()} version)`,
  (p: string, i: string, t: string) => `${i} teams pretending ${p} was always the plan`,
];

/* ---------------------------------------------------------------
   NODE LAYOUT (fixed sizes, draggable positions)
----------------------------------------------------------------*/
const NODE_SIZE: Record<string, { w: number; h: number }> = {
  business: { w: 260, h: 268 },
  ai: { w: 230, h: 218 },
  template: { w: 250, h: 268 },
  generated: { w: 300, h: 380 },
  instagram: { w: 215, h: 96 },
  linkedin: { w: 215, h: 96 },
  facebook: { w: 215, h: 96 },
  x: { w: 215, h: 96 },
};

const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = {
  business: { x: 20, y: 170 },
  ai: { x: 330, y: 190 },
  template: { x: 610, y: 165 },
  generated: { x: 910, y: 80 },
  instagram: { x: 1270, y: 10 },
  linkedin: { x: 1270, y: 130 },
  facebook: { x: 1270, y: 250 },
  x: { x: 1270, y: 370 },
};

const CANVAS_W = 1520;
const CANVAS_H = 500;

const EDGES = [
  ["business", "ai"],
  ["ai", "template"],
  ["template", "generated"],
  ["generated", "instagram"],
  ["generated", "linkedin"],
  ["generated", "facebook"],
  ["generated", "x"],
];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function edgePath(sx: number, sy: number, tx: number, ty: number) {
  const dx = Math.max(Math.abs(tx - sx) * 0.5, 50);
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
}

/* ---------------------------------------------------------------
   DRAGGABLE NODE WRAPPER
----------------------------------------------------------------*/
interface DraggableNodeProps {
  id: string;
  pos: { x: number; y: number };
  size: { w: number; h: number };
  scale: number;
  onDrag: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

function DraggableNode({ id, pos, size, scale, onDrag, children }: DraggableNodeProps) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = pos.x;
      const origY = pos.y;
      dragRef.current = { startX, startY, origX, origY };

      const handleMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const currentScale = scale > 0 ? scale : 1;
        const dx = (ev.clientX - dragRef.current.startX) / currentScale;
        const dy = (ev.clientY - dragRef.current.startY) / currentScale;
        const nx = clamp(dragRef.current.origX + dx, 0, CANVAS_W - size.w);
        const ny = clamp(dragRef.current.origY + dy, 0, CANVAS_H - size.h);
        onDrag(id, nx, ny);
      };
      const handleUp = () => {
        dragRef.current = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [pos.x, pos.y, id, onDrag, size.w, size.h, scale]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size.w,
        minHeight: size.h,
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        boxShadow: "0 4px 16px rgba(20,22,30,0.06)",
        userSelect: "none",
        zIndex: 2,
      }}
    >
      <div
        onMouseDown={handlePointerDown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 0 0",
          cursor: "grab",
          color: "#C9CDC7",
        }}
        title="Drag to move"
      >
        <GripHorizontal size={14} />
      </div>
      <div style={{ padding: "10px 14px 16px" }}>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
----------------------------------------------------------------*/
function Pill({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        background: bg,
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function NodeHeader({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{label}</span>
      </div>
      {badge}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, color: COLORS.sub, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#FAFBFA",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "7px 9px",
  color: COLORS.text,
  fontSize: 12.5,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

function Skeleton({ w = "100%", h = 8 }: { w?: string; h?: number }) {
  return <div style={{ width: w, height: h, borderRadius: 4, background: COLORS.skeleton }} />;
}

/* ---------------------------------------------------------------
   MAIN HERO COMPONENT
----------------------------------------------------------------*/
export function MemePipelineFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);
  const [industry, setIndustry] = useState("SaaS");
  const [product, setProduct] = useState("Virlio");
  const [tone, setTone] = useState("Playful");
  const [aiStatus, setAiStatus] = useState<"idle" | "running" | "done">("idle");
  const [selectedTemplate, setSelectedTemplate] = useState("buttons");
  const [captionIdx, setCaptionIdx] = useState(0);
  const [hashtagIdx, setHashtagIdx] = useState(0);
  const [posted, setPosted] = useState<Record<string, boolean>>({
    instagram: false,
    linkedin: false,
    facebook: false,
    x: false,
  });
  const [engagement, setEngagement] = useState<Record<string, number>>({});

  // Responsive scaling to fit exact container width on all screen sizes without scrollbars
  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth > 0) {
        const computedScale = Math.min(1, containerWidth / CANVAS_W);
        setScale(computedScale);
      }
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  const handleDrag = useCallback((id: string, x: number, y: number) => {
    setPositions((p) => ({ ...p, [id]: { x, y } }));
  }, []);

  function runAI() {
    setAiStatus("running");
    setTimeout(() => {
      setAiStatus("done");
      setCaptionIdx((i) => (i + 1) % CAPTION_TEMPLATES.length);
    }, 1100);
  }

  function regenerate() {
    setCaptionIdx((i) => (i + 1) % CAPTION_TEMPLATES.length);
    setHashtagIdx((i) => (i + 1) % HASHTAG_SETS.length);
  }

  function togglePost(platform: string) {
    setPosted((p) => {
      const next = !p[platform];
      if (next) {
        setEngagement((e) => ({ ...e, [platform]: Math.floor(Math.random() * 9000) + 400 }));
      }
      return { ...p, [platform]: next };
    });
  }

  const caption = CAPTION_TEMPLATES[captionIdx](product, industry, tone);
  const hashtags = HASHTAG_SETS[hashtagIdx];
  const templateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  const anchor = (id: string, side: "left" | "right") => {
    const p = positions[id];
    const s = NODE_SIZE[id];
    return side === "right"
      ? { x: p.x + s.w, y: p.y + Math.min(s.h, 90) / 2 + 28 }
      : { x: p.x, y: p.y + Math.min(s.h, 90) / 2 + 28 };
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: "transparent",
        width: "100%",
        height: CANVAS_H * scale,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          userSelect: "none",
        }}
      >
        {/* EDGES (Solid color strokes - NO gradients per project rules) */}
        <svg
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1, pointerEvents: "none" }}
        >
          {EDGES.map(([from, to], idx) => {
            const s = anchor(from, "right");
            const t = anchor(to, "left");
            const d = edgePath(s.x, s.y, t.x, t.y);
            return (
              <g key={idx}>
                <path d={d} stroke={COLORS.blue} strokeWidth={1.5} fill="none" opacity={0.4} />
                <circle r={3} fill={COLORS.blue}>
                  <animateMotion dur={`${2.4 + idx * 0.3}s`} repeatCount="indefinite" path={d} />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* NODE: Business Input */}
        <DraggableNode id="business" pos={positions.business} size={NODE_SIZE.business} scale={scale} onDrag={handleDrag}>
          <NodeHeader
            icon={<Wifi size={14} color={COLORS.blue} />}
            label="Virlio"
            badge={<Pill bg="#EAF1FF" color={COLORS.blue}>Brand Profile</Pill>}
          />
          <Field label="INDUSTRY">
            <select style={inputStyle} value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option>SaaS</option>
              <option>Ecommerce</option>
              <option>Fitness</option>
              <option>Food & Bev</option>
            </select>
          </Field>
          <Field label="PRODUCT">
            <input style={inputStyle} value={product} onChange={(e) => setProduct(e.target.value)} />
          </Field>
          <Field label="TONE">
            <div style={{ display: "flex", gap: 6 }}>
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  style={{
                    flex: 1,
                    fontSize: 10.5,
                    padding: "6px 0",
                    borderRadius: 7,
                    border: `1px solid ${tone === t ? COLORS.blue : COLORS.border}`,
                    background: tone === t ? "#EAF1FF" : "#FAFBFA",
                    color: tone === t ? COLORS.blue : COLORS.sub,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Skeleton h={7} />
          <div style={{ marginTop: 6 }}>
            <Skeleton w="70%" h={7} />
          </div>
        </DraggableNode>

        {/* NODE: AI Processing */}
        <DraggableNode id="ai" pos={positions.ai} size={NODE_SIZE.ai} scale={scale} onDrag={handleDrag}>
          <NodeHeader
            icon={<Cpu size={14} color={COLORS.blue} />}
            label="AI Engine"
            badge={<Pill bg={COLORS.blackPill} color="#fff">AI Engine</Pill>}
          />
          <div
            style={{
              background: "#FAFBFA",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: 10,
              fontSize: 11,
              color: COLORS.sub,
              lineHeight: 1.5,
              minHeight: 60,
            }}
          >
            Prompt: Create {tone.toLowerCase()} product meme for &quot;{product}&quot; ({industry})
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 0" }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: aiStatus === "running" ? COLORS.amber : aiStatus === "done" ? COLORS.green : COLORS.blue,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 11, color: COLORS.sub, fontWeight: 500 }}>
              {aiStatus === "idle" ? "Status" : aiStatus === "running" ? "Running…" : "Done"}
            </span>
          </div>
          <button
            type="button"
            onClick={runAI}
            disabled={aiStatus === "running"}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              background: COLORS.blue,
              color: "#fff",
              fontWeight: 600,
              fontSize: 12,
              cursor: aiStatus === "running" ? "default" : "pointer",
              opacity: aiStatus === "running" ? 0.7 : 1,
            }}
          >
            {aiStatus === "running" ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
            {aiStatus === "running" ? "Processing" : "Run AI Engine"}
          </button>
        </DraggableNode>

        {/* NODE: Meme Template */}
        <DraggableNode id="template" pos={positions.template} size={NODE_SIZE.template} scale={scale} onDrag={handleDrag}>
          <NodeHeader icon={<ImageIcon size={14} color={COLORS.blue} />} label="Meme Template" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplate(t.id)}
                style={{
                  border: `1.5px solid ${selectedTemplate === t.id ? COLORS.amber : COLORS.border}`,
                  background: selectedTemplate === t.id ? "#FEF6E7" : "#FAFBFA",
                  borderRadius: 9,
                  padding: "10px 6px",
                  cursor: "pointer",
                  textAlign: "center",
                  color: COLORS.text,
                }}
              >
                <div style={{ fontSize: 22 }}>{t.emoji}</div>
                <div style={{ fontSize: 9.5, marginTop: 4, color: COLORS.sub, fontWeight: 500 }}>{t.name}</div>
                {selectedTemplate === t.id && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, display: "inline-block" }} />
                    <span style={{ fontSize: 9, color: COLORS.green, fontWeight: 600 }}>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </DraggableNode>

        {/* NODE: Generated Meme */}
        <DraggableNode id="generated" pos={positions.generated} size={NODE_SIZE.generated} scale={scale} onDrag={handleDrag}>
          <NodeHeader
            icon={<Sparkles size={14} color={COLORS.blue} />}
            label="Meme Preview"
            badge={
              <div style={{ display: "flex", gap: 6 }}>
                <Pill bg={COLORS.blue} color="#fff">Create a meme</Pill>
                <Pill bg="#FEF3DE" color={COLORS.amber}>Cancel</Pill>
              </div>
            }
          />
          <div
            style={{
              height: 100,
              borderRadius: 9,
              background: "#F5F7F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              marginBottom: 10,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {templateObj.emoji}
          </div>
          <Field label="AI CAPTION">
            <div
              style={{
                fontSize: 11.5,
                lineHeight: 1.4,
                background: "#FAFBFA",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: 8,
                minHeight: 48,
                color: COLORS.text,
              }}
            >
              {caption}
            </div>
          </Field>
          <Field label="AI HASHTAGS">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {hashtags.map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 10,
                    color: COLORS.blue,
                    background: "#EAF1FF",
                    padding: "3px 6px",
                    borderRadius: 6,
                    fontWeight: 500,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </Field>
          <button
            type="button"
            onClick={regenerate}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "7px 0",
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              background: "#FAFBFA",
              color: COLORS.text,
              fontSize: 11.5,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} color={COLORS.blue} />
            Regenerate
          </button>
        </DraggableNode>

        {/* DISTRIBUTION NODES */}
        {[
          { id: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#E1306C" },
          { id: "linkedin", label: "LinkedIn", Icon: LinkedinIcon, color: "#0A66C2" },
          { id: "facebook", label: "Facebook", Icon: FacebookIcon, color: "#1877F2" },
          { id: "x", label: "X", Icon: XIcon, color: "#14161B" },
        ].map(({ id, label, Icon, color }) => (
          <DraggableNode key={id} id={id} pos={positions[id]} size={NODE_SIZE[id]} scale={scale} onDrag={handleDrag}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon size={16} color={color} />
                <span style={{ fontWeight: 600, fontSize: 12.5, color: COLORS.text }}>{label}</span>
              </div>
              {posted[id] && (
                <span style={{ fontSize: 10, color: COLORS.green, fontWeight: 600 }}>
                  {engagement[id]?.toLocaleString()}
                </span>
              )}
            </div>
            <div style={{ margin: "8px 0" }}>
              <Skeleton w="60%" h={6} />
            </div>
            <button
              type="button"
              onClick={() => togglePost(id)}
              style={{
                width: "100%",
                padding: "6px 0",
                borderRadius: 20,
                border: "none",
                fontSize: 10.5,
                fontWeight: 600,
                cursor: "pointer",
                background: posted[id] ? "#E9F9EF" : COLORS.green,
                color: posted[id] ? COLORS.green : "#fff",
              }}
            >
              {posted[id] ? "Posted ✓" : "Live Post"}
            </button>
          </DraggableNode>
        ))}
      </div>
    </div>
  );
}

export default MemePipelineFlow;
