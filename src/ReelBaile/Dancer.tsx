import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { B } from "./theme";

export type DPose =
  | "idle"
  | "walk"
  | "dance"
  | "frenzy"
  | "tired"
  | "fallen"
  | "plead"
  | "drum"
  | "pipe"
  | "point"
  | "pray"
  | "stop";

export type DMood = "happy" | "crazy" | "neutral" | "worried" | "exhausted" | "shout" | "wink" | "shock";
export type Hat = "none" | "coif" | "cap" | "doctor" | "hood" | "crown";

export type Look = {
  skin: string;
  top: string;
  bottom: string;
  /** long dress / robe instead of breeches */
  dress?: boolean;
  apron?: string;
  hat?: Hat;
  hatColor?: string;
  hair?: "short" | "long" | "bald" | "bun";
  hairColor?: string;
  beard?: boolean;
  shoes?: string;
};

export type DancerProps = Look & {
  pose?: DPose;
  mood?: DMood;
  x: number;
  y: number;
  height?: number;
  facing?: "left" | "right";
  phase?: number;
  /** animation speed multiplier */
  speed?: number;
  opacity?: number;
  /** extra vertical lift in px */
  lift?: number;
  /** red shoes glow (San Vito) */
  glowShoes?: boolean;
  holding?: "scroll" | "none";
};

const LEG = 70;

export const Dancer: React.FC<DancerProps> = (p) => {
  const {
    skin,
    top,
    bottom,
    dress,
    apron,
    hat = "none",
    hatColor = "#FFFFFF",
    hair = "short",
    hairColor = "#5A3418",
    beard,
    shoes = "#3A2416",
    pose = "idle",
    mood = "neutral",
    x,
    y,
    height = 300,
    facing = "right",
    phase = 0,
    speed = 1,
    opacity = 1,
    lift = 0,
    glowShoes,
    holding,
  } = p;
  const frame = (useCurrentFrame() + phase) * speed;
  const id = useId().replace(/:/g, "");

  let legL = 0;
  let legR = 0;
  let armL = 14;
  let armR = -14;
  let bob = 0;
  let tilt = 0;
  let headTilt = 0;
  let spin = 1;
  let sweat = false;

  switch (pose) {
    case "idle":
      bob = Math.sin(frame * 0.12) * 3;
      armL = 12 + Math.sin(frame * 0.12) * 3;
      armR = -12 - Math.sin(frame * 0.12) * 3;
      break;
    case "walk": {
      const c = Math.sin(frame * 0.4);
      legL = c * 26;
      legR = -c * 26;
      armL = -c * 24;
      armR = c * 24;
      bob = -Math.abs(Math.cos(frame * 0.4)) * 6;
      break;
    }
    case "dance": {
      const c = Math.sin(frame * 0.42);
      legL = Math.max(0, c) * 55;
      legR = Math.max(0, -c) * 55;
      armL = 140 + Math.sin(frame * 0.42) * 30;
      armR = -140 + Math.sin(frame * 0.42 + 1.5) * 30;
      bob = -Math.abs(Math.sin(frame * 0.42)) * 26;
      tilt = Math.sin(frame * 0.21) * 10;
      headTilt = Math.sin(frame * 0.42) * 8;
      break;
    }
    case "frenzy": {
      const c = Math.sin(frame * 0.7);
      legL = Math.max(0, c) * 75;
      legR = Math.max(0, -c) * 75;
      armL = 100 + Math.sin(frame * 0.9) * 70;
      armR = -100 + Math.sin(frame * 0.9 + 2) * 70;
      bob = -Math.abs(Math.sin(frame * 0.7)) * 40;
      tilt = Math.sin(frame * 0.35) * 16;
      headTilt = Math.sin(frame * 0.7) * 14;
      spin = Math.cos(frame * 0.12) > -0.2 ? 1 : -1;
      sweat = true;
      break;
    }
    case "tired": {
      const c = Math.sin(frame * 0.16);
      legL = Math.max(0, c) * 18;
      legR = Math.max(0, -c) * 18;
      armL = 8 + c * 6;
      armR = -8 + c * 6;
      bob = 10 + Math.abs(c) * 6;
      tilt = c * 9;
      headTilt = 18 + c * 6;
      sweat = true;
      break;
    }
    case "fallen":
      armL = 100;
      armR = -60;
      legL = 20;
      legR = -10;
      tilt = -88;
      bob = 120;
      headTilt = 10;
      break;
    case "plead":
      legL = 70;
      legR = 70;
      bob = 46;
      armL = 120 + Math.sin(frame * 0.5) * 8;
      armR = -120 - Math.sin(frame * 0.5) * 8;
      headTilt = -8;
      break;
    case "drum":
      armL = 60;
      armR = -40 + Math.max(0, Math.sin(frame * 0.9)) * -50;
      bob = -Math.abs(Math.sin(frame * 0.45)) * 8;
      headTilt = Math.sin(frame * 0.45) * 6;
      break;
    case "pipe":
      armL = 125;
      armR = -125;
      bob = -Math.abs(Math.sin(frame * 0.45)) * 8;
      tilt = Math.sin(frame * 0.2) * 6;
      break;
    case "point":
      armR = -100;
      armL = 10;
      bob = Math.sin(frame * 0.12) * 3;
      break;
    case "pray":
      armL = 150;
      armR = -150;
      headTilt = 10;
      bob = Math.sin(frame * 0.08) * 2;
      break;
    case "stop":
      armR = -95;
      armL = 12;
      break;
  }

  const scale = height / 320;
  const flip = (facing === "left" ? -1 : 1) * spin;
  const dressBottom = 272;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 100 * scale,
        top: y - 320 * scale - lift,
        width: 200 * scale,
        height: 320 * scale,
        opacity,
        scale: `${flip} 1`,
      }}
    >
      <svg
        viewBox="-60 -80 320 420"
        width={320 * scale}
        height={420 * scale}
        style={{ position: "absolute", left: -60 * scale, top: -80 * scale, overflow: "visible" }}
      >
        <defs>
          <clipPath id={`t-${id}`}>
            <rect x={60} y={128} width={80} height={86} rx={24} />
          </clipPath>
        </defs>
        {pose !== "fallen" && (
          <ellipse cx={100} cy={318} rx={56 - Math.min(lift + Math.abs(bob), 100) * 0.2} ry={9} fill="rgba(0,0,0,0.25)" />
        )}
        <g transform={`translate(0 ${bob}) rotate(${tilt} 100 ${pose === "fallen" ? 300 : 240})`}>
          <Arm x={66} y={146} angle={armL} color={top} skin={skin} />
          <Leg x={87} y={222} angle={legL} color={dress ? skin : bottom} shoe={shoes} glow={glowShoes} />
          <Leg x={113} y={222} angle={legR} color={dress ? skin : bottom} shoe={shoes} glow={glowShoes} />
          {dress ? (
            <path
              d={`M 62 150 L 138 150 L ${150 + Math.sin(frame * 0.4) * (pose === "dance" || pose === "frenzy" ? 12 : 2)} ${dressBottom} Q 100 ${dressBottom + 12} ${50 + Math.sin(frame * 0.4 + 1) * (pose === "dance" || pose === "frenzy" ? 12 : 2)} ${dressBottom} Z`}
              fill={bottom}
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={3}
            />
          ) : (
            <rect x={66} y={196} width={68} height={40} rx={12} fill={bottom} />
          )}
          {/* torso */}
          <g clipPath={`url(#t-${id})`}>
            <rect x={60} y={128} width={80} height={86} fill={top} />
            {/* laced bodice / belt */}
            <rect x={60} y={196} width={80} height={10} fill="rgba(0,0,0,0.25)" />
            <path d="M 92 140 L 108 152 M 108 140 L 92 152 M 92 158 L 108 170 M 108 158 L 92 170" stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
          </g>
          {apron && <path d="M 74 200 L 126 200 L 132 262 Q 100 270 68 262 Z" fill={apron} stroke="rgba(0,0,0,0.15)" strokeWidth={2} />}
          <Arm x={134} y={146} angle={armR} color={top} skin={skin} />
          {pose === "drum" && <Tabor />}
          {pose === "pipe" && <Pipe />}
          {holding === "scroll" && (
            <g transform={`rotate(${armR} 134 146)`}>
              <rect x={118} y={198} width={34} height={60} rx={6} fill={B.parchment} stroke={B.parchmentDark} strokeWidth={4} />
              <rect x={114} y={196} width={42} height={8} rx={4} fill={B.parchmentDark} />
            </g>
          )}
          {/* head */}
          <g transform={`rotate(${headTilt} 100 120)`}>
            <rect x={90} y={112} width={20} height={22} fill={skin} />
            {hair === "long" && <path d="M 44 70 Q 40 150 64 150 L 136 150 Q 160 150 156 70 Z" fill={hairColor} />}
            <circle cx={100} cy={72} r={56} fill={skin} />
            <circle cx={100} cy={72} r={56} fill="none" stroke="rgba(0,0,0,0.16)" strokeWidth={3} />
            <HairAndHat hair={hair} hairColor={hairColor} hat={hat} hatColor={hatColor} />
            {beard && <path d="M 56 84 Q 60 132 100 134 Q 140 132 144 84 Q 130 114 100 116 Q 70 114 56 84 Z" fill={hairColor} />}
            <circle cx={70} cy={92} r={9} fill="#FF7A7A" opacity={mood === "exhausted" ? 0.15 : 0.4} />
            <circle cx={130} cy={92} r={9} fill="#FF7A7A" opacity={mood === "exhausted" ? 0.15 : 0.4} />
            <Face mood={mood} frame={frame} />
            {sweat && (
              <g fill="#8FD3FF" stroke="#2C7FB8" strokeWidth={2}>
                <path d={`M 150 ${40 + ((frame * 3) % 40)} q 6 10 0 14 q -6 -4 0 -14 Z`} />
                <path d={`M 48 ${50 + ((frame * 3 + 20) % 40)} q 6 10 0 14 q -6 -4 0 -14 Z`} />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};

const Arm: React.FC<{ x: number; y: number; angle: number; color: string; skin: string }> = ({ x, y, angle, color, skin }) => (
  <g transform={`rotate(${angle} ${x} ${y})`}>
    <rect x={x - 11} y={y - 6} width={22} height={36} rx={11} fill={color} />
    <rect x={x - 8} y={y + 24} width={16} height={30} rx={8} fill={skin} />
    <circle cx={x} cy={y + 56} r={10} fill={skin} />
  </g>
);

const Leg: React.FC<{ x: number; y: number; angle: number; color: string; shoe: string; glow?: boolean }> = ({
  x,
  y,
  angle,
  color,
  shoe,
  glow,
}) => (
  <g transform={`rotate(${-angle} ${x} ${y})`}>
    <rect x={x - 11} y={y} width={22} height={LEG * 0.95} rx={10} fill={color} />
    {glow && <ellipse cx={x + 8} cy={y + LEG + 4} rx={30} ry={18} fill="#FF2A2A" opacity={0.35} />}
    <path
      d={`M ${x - 12} ${y + LEG - 6} h 20 q 18 2 18 14 h -38 Z`}
      fill={glow ? "#E3121B" : shoe}
      stroke={B.ink}
      strokeWidth={2}
    />
  </g>
);

const HairAndHat: React.FC<{ hair: string; hairColor: string; hat: Hat; hatColor: string }> = ({ hair, hairColor, hat, hatColor }) => {
  const hairEl =
    hair === "bald" ? null : hair === "bun" ? (
      <>
        <path d="M 44 70 Q 42 10 100 10 Q 158 10 156 70 Q 146 36 100 34 Q 54 36 44 70 Z" fill={hairColor} />
        <circle cx={100} cy={4} r={20} fill={hairColor} />
      </>
    ) : (
      <path d="M 44 70 Q 40 8 100 8 Q 160 8 156 70 Q 148 40 126 36 Q 114 46 100 38 Q 86 46 74 36 Q 52 40 44 70 Z" fill={hairColor} />
    );
  switch (hat) {
    case "coif":
      return (
        <>
          {hairEl}
          <path d="M 40 84 Q 30 2 100 0 Q 170 2 160 84 Q 150 40 100 30 Q 50 40 40 84 Z" fill={hatColor} stroke="rgba(0,0,0,0.15)" strokeWidth={3} />
        </>
      );
    case "cap":
      return (
        <>
          {hairEl}
          <path d="M 46 52 Q 50 0 108 -2 Q 160 4 156 52 Q 100 36 46 52 Z" fill={hatColor} />
          <path d="M 150 30 q 30 -6 34 18 q -16 -8 -30 -4 Z" fill={hatColor} />
        </>
      );
    case "doctor":
      return (
        <>
          {hairEl}
          <rect x={52} y={-30} width={96} height={64} rx={10} fill={hatColor} />
          <rect x={40} y={26} width={120} height={16} rx={8} fill={hatColor} stroke="rgba(0,0,0,0.25)" strokeWidth={3} />
        </>
      );
    case "hood":
      return <path d="M 34 110 Q 22 -6 100 -10 Q 178 -6 166 110 Q 156 40 100 32 Q 44 40 34 110 Z" fill={hatColor} />;
    case "crown":
      return (
        <>
          {hairEl}
          <path d="M 58 30 L 62 -6 L 80 14 L 100 -14 L 120 14 L 138 -6 L 142 30 Z" fill={B.gold} stroke="#9A6B00" strokeWidth={3} />
        </>
      );
    default:
      return hairEl;
  }
};

const Face: React.FC<{ mood: DMood; frame: number }> = ({ mood, frame }) => {
  const ink = B.ink;
  const eye = (cx: number) => (
    <>
      <ellipse cx={cx} cy={78} rx={8} ry={11} fill={ink} />
      <circle cx={cx + 3} cy={74} r={3} fill="#fff" />
    </>
  );
  let eyes: React.ReactNode;
  let brows: React.ReactNode = (
    <g stroke={ink} strokeWidth={5} strokeLinecap="round">
      <line x1={70} y1={58} x2={90} y2={56} />
      <line x1={110} y1={56} x2={130} y2={58} />
    </g>
  );
  let mouth: React.ReactNode;
  switch (mood) {
    case "crazy": {
      // wide spinning eyes
      const r = frame * 12;
      eyes = (
        <g>
          {[80, 120].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={78} r={14} fill="#fff" stroke={ink} strokeWidth={3} />
              <path d={`M ${cx} 78 m -7 0 a 7 7 0 1 1 7 7 a 4 4 0 1 1 -4 -4`} fill="none" stroke={ink} strokeWidth={3} transform={`rotate(${r} ${cx} 78)`} />
            </g>
          ))}
        </g>
      );
      brows = null;
      mouth = <path d="M 74 98 Q 100 130 126 98 Z" fill="#7A1F1F" stroke={ink} strokeWidth={3} />;
      break;
    }
    case "happy":
      eyes = (
        <g stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d="M 70 80 Q 80 68 90 80" />
          <path d="M 110 80 Q 120 68 130 80" />
        </g>
      );
      mouth = <path d="M 82 98 Q 100 120 118 98 Z" fill="#7A1F1F" stroke={ink} strokeWidth={3} />;
      break;
    case "wink":
      eyes = (
        <>
          {eye(80)}
          <path d="M 110 80 Q 120 70 130 80" stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      );
      mouth = <path d="M 84 100 Q 104 118 120 98" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />;
      break;
    case "worried":
    case "shock":
      eyes = mood === "shock" ? (
        <>
          <circle cx={80} cy={78} r={13} fill="#fff" stroke={ink} strokeWidth={3} />
          <circle cx={120} cy={78} r={13} fill="#fff" stroke={ink} strokeWidth={3} />
          <circle cx={80} cy={78} r={5} fill={ink} />
          <circle cx={120} cy={78} r={5} fill={ink} />
        </>
      ) : (
        <>
          {eye(80)}
          {eye(120)}
        </>
      );
      brows = (
        <g stroke={ink} strokeWidth={5} strokeLinecap="round">
          <line x1={68} y1={56} x2={90} y2={50} />
          <line x1={110} y1={50} x2={132} y2={56} />
        </g>
      );
      mouth =
        mood === "shock" ? (
          <ellipse cx={100} cy={108} rx={12} ry={16} fill="#7A1F1F" stroke={ink} strokeWidth={3} />
        ) : (
          <path d="M 86 106 Q 93 100 100 106 Q 107 112 114 106" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        );
      break;
    case "exhausted":
      eyes = (
        <g stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d="M 70 76 Q 80 84 90 76" />
          <path d="M 110 76 Q 120 84 130 76" />
          <line x1={70} y1={88} x2={88} y2={90} stroke="#7B5B8F" strokeWidth={3} />
          <line x1={112} y1={90} x2={130} y2={88} stroke="#7B5B8F" strokeWidth={3} />
        </g>
      );
      brows = null;
      mouth = <ellipse cx={100} cy={110} rx={10} ry={7} fill="#7A1F1F" stroke={ink} strokeWidth={3} />;
      break;
    case "shout":
      eyes = (
        <>
          {eye(80)}
          {eye(120)}
        </>
      );
      brows = (
        <g stroke={ink} strokeWidth={5} strokeLinecap="round">
          <line x1={68} y1={52} x2={90} y2={60} />
          <line x1={110} y1={60} x2={132} y2={52} />
        </g>
      );
      mouth = <ellipse cx={100} cy={108} rx={16} ry={18} fill="#7A1F1F" stroke={ink} strokeWidth={3} />;
      break;
    default:
      eyes = (
        <>
          {eye(80)}
          {eye(120)}
        </>
      );
      mouth = <line x1={88} y1={104} x2={112} y2={104} stroke={ink} strokeWidth={5} strokeLinecap="round" />;
  }
  return (
    <g>
      {eyes}
      {brows}
      {mouth}
    </g>
  );
};

const Tabor: React.FC = () => (
  <g>
    <rect x={112} y={190} width={70} height={48} rx={8} fill="#B5452B" stroke={B.ink} strokeWidth={3} />
    <ellipse cx={147} cy={190} rx={35} ry={9} fill="#F3E3C0" stroke={B.ink} strokeWidth={3} />
    <path d="M 116 200 L 178 230 M 178 200 L 116 230" stroke={B.gold} strokeWidth={3} />
  </g>
);

const Pipe: React.FC = () => (
  <g>
    <rect x={96} y={108} width={12} height={90} rx={5} fill="#8A5A2B" stroke={B.ink} strokeWidth={2} transform="rotate(-20 100 110)" />
  </g>
);

/* ───── cast ───── */

export const TROFFEA: Look = {
  skin: "#F6D2B0",
  top: "#2E7D6B",
  bottom: "#2E7D6B",
  dress: true,
  apron: "#F4EBD6",
  hat: "coif",
  hatColor: "#FFFFFF",
  hair: "long",
  hairColor: "#8A4B22",
};

export const HUSBAND: Look = {
  skin: "#EDB7A0",
  top: "#6B4E9B",
  bottom: "#5A4632",
  hat: "cap",
  hatColor: "#8E3B2B",
  hair: "short",
  hairColor: "#3E2614",
  beard: true,
};

export const DOCTOR: Look = {
  skin: "#F6D2B0",
  top: "#2B2140",
  bottom: "#2B2140",
  dress: true,
  hat: "doctor",
  hatColor: "#7A1E2E",
  hair: "short",
  hairColor: "#DDDDDD",
  beard: true,
};

const TOPS = ["#C0392B", "#2E86AB", "#E1A100", "#6B4E9B", "#3E8E41", "#B5652B", "#2E7D6B", "#D35D8A"];
const BOTTOMS = ["#5A4632", "#3B3B58", "#6E5A3C", "#2F4F4F"];
const HATS: Hat[] = ["coif", "cap", "none", "hood", "coif", "none"];
const SKINS = ["#F6D2B0", "#E6B48A", "#EDB7A0", "#C98B5A"];
const HAIRS = ["#3E2614", "#8A4B22", "#C9A15A", "#1E1A18", "#6A4A3A"];

/** Deterministic townsfolk. */
export const townsfolk = (i: number): Look => {
  const dress = i % 2 === 0;
  return {
    skin: SKINS[(i * 3) % SKINS.length],
    top: TOPS[(i * 5 + 1) % TOPS.length],
    bottom: dress ? TOPS[(i * 7 + 3) % TOPS.length] : BOTTOMS[i % BOTTOMS.length],
    dress,
    apron: dress && i % 4 === 0 ? "#F4EBD6" : undefined,
    hat: HATS[(i * 7) % HATS.length],
    hatColor: dress ? "#FFFFFF" : ["#8E3B2B", "#2E5E4E", "#4A3A6B"][i % 3],
    hair: dress ? "long" : i % 5 === 1 ? "bald" : "short",
    hairColor: HAIRS[(i * 3 + 1) % HAIRS.length],
    beard: !dress && i % 3 === 1,
  };
};
