import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";

export type Pose =
  | "idle"
  | "run"
  | "kick"
  | "celebrate"
  | "sad"
  | "header"
  | "slide"
  | "wait"
  | "dive";

export type Mood = "happy" | "neutral" | "sad" | "shout" | "worried";
export type Hair = "short" | "mohawk" | "buzz" | "blond" | "long" | "bald" | "curly";
export type Pattern = "plain" | "hoops" | "stripes";

export type Kit = {
  shirt: string;
  shirt2?: string;
  pattern?: Pattern;
  shorts: string;
  socks: string;
  number?: string | number;
  /** font size of the shirt number / text (default 38) */
  numberSize?: number;
  numberColor?: string;
};

export type CharacterProps = {
  kit: Kit;
  skin: string;
  hair?: Hair;
  hairColor?: string;
  beard?: boolean;
  pose?: Pose;
  mood?: Mood;
  /** 0..1 progress of a kick / header / dive action */
  action?: number;
  /** horizontal center of feet in px */
  x: number;
  /** feet baseline in px */
  y: number;
  height?: number;
  facing?: "left" | "right";
  /** offsets the run / bounce cycle so groups don't move in sync */
  phase?: number;
  /** extra vertical lift in px (jumps) */
  lift?: number;
  /** optional prop held in the raised right hand */
  holding?: "redcard" | "board" | "trophy" | "shirt" | "whistle";
  boardText?: string;
  opacity?: number;
};

const LEG_LEN = 74;

export const Character: React.FC<CharacterProps> = ({
  kit,
  skin,
  hair = "short",
  hairColor = "#2B1B10",
  beard,
  pose = "idle",
  mood = "neutral",
  action = 0,
  x,
  y,
  height = 300,
  facing = "right",
  phase = 0,
  lift = 0,
  holding,
  boardText,
  opacity = 1,
}) => {
  const frame = useCurrentFrame() + phase;
  const id = useId().replace(/:/g, "");

  // Default limb angles (deg). Positive leg angle swings the foot forward.
  let legL = 0;
  let legR = 0;
  let armL = 18;
  let armR = -18;
  let bob = 0;
  let tilt = 0;
  let headTilt = 0;

  const cyc = Math.sin(frame * 0.55);

  switch (pose) {
    case "idle":
      bob = Math.sin(frame * 0.12) * 3;
      armL = 14 + Math.sin(frame * 0.12) * 3;
      armR = -14 - Math.sin(frame * 0.12) * 3;
      break;
    case "wait":
      bob = Math.sin(frame * 0.08) * 2;
      armL = 150;
      armR = -150;
      headTilt = Math.sin(frame * 0.07) * 6;
      break;
    case "run":
      legL = cyc * 38;
      legR = -cyc * 38;
      armL = -cyc * 45;
      armR = cyc * 45;
      bob = -Math.abs(Math.cos(frame * 0.55)) * 10;
      tilt = 6;
      break;
    case "kick": {
      // wind-up (0..0.45) then strike (0.45..1)
      const wind = Math.min(action / 0.45, 1);
      const strike = Math.max((action - 0.45) / 0.55, 0);
      legR = -45 * wind + 120 * strike;
      legL = 6;
      armL = -50;
      armR = 70;
      tilt = -8 * strike + 4;
      break;
    }
    case "header":
      legL = -20;
      legR = 25;
      armL = 70;
      armR = -70;
      tilt = 10 + action * 25;
      headTilt = action * 20;
      break;
    case "celebrate":
      armL = 160 + Math.sin(frame * 0.6) * 15;
      armR = -160 - Math.sin(frame * 0.6) * 15;
      bob = -Math.abs(Math.sin(frame * 0.32)) * 40;
      legL = 18;
      legR = -18;
      break;
    case "sad":
      armL = 6;
      armR = -6;
      headTilt = 14;
      tilt = 4;
      bob = 6;
      break;
    case "slide":
      legL = 85;
      legR = 65;
      armL = -40;
      armR = 120;
      tilt = -55;
      bob = 60;
      break;
    case "dive":
      armL = 150;
      armR = 120;
      legL = 20;
      legR = -10;
      tilt = -85 * action;
      bob = -60 * Math.sin(action * Math.PI);
      break;
  }

  if (holding === "redcard" || holding === "trophy") {
    armR = -165;
  }
  if (holding === "board") {
    armR = -125;
  }
  if (holding === "shirt") {
    armR = -170;
  }

  const scale = height / 320;
  const eyesClosed = mood === "happy" && pose === "celebrate";

  return (
    <div
      style={{
        position: "absolute",
        left: x - 100 * scale,
        top: y - 320 * scale - lift,
        width: 200 * scale,
        height: 320 * scale,
        opacity,
        scale: facing === "left" ? "-1 1" : "1 1",
      }}
    >
      <svg
        viewBox="-40 -60 280 400"
        width={280 * scale}
        height={400 * scale}
        style={{ position: "absolute", left: -40 * scale, top: -60 * scale, overflow: "visible" }}
      >
        <defs>
          <clipPath id={`torso-${id}`}>
            <rect x={58} y={128} width={84} height={82} rx={24} />
          </clipPath>
        </defs>
        {/* ground shadow */}
        <ellipse
          cx={100}
          cy={318}
          rx={58 - Math.min(lift + Math.abs(bob), 120) * 0.2}
          ry={9}
          fill="rgba(0,0,0,0.28)"
        />
        <g transform={`translate(0 ${bob}) rotate(${tilt} 100 240)`}>
          {/* back arm */}
          <Limb x={64} y={146} angle={armL} len={58} color={kit.shirt} hand={skin} />
          {/* legs */}
          <Leg x={86} y={222} angle={legL} kit={kit} skin={skin} />
          <Leg x={114} y={222} angle={legR} kit={kit} skin={skin} />
          {/* shorts */}
          <rect x={64} y={196} width={72} height={44} rx={12} fill={kit.shorts} />
          {/* torso */}
          <g clipPath={`url(#torso-${id})`}>
            <rect x={58} y={128} width={84} height={82} fill={kit.shirt} />
            {kit.pattern === "hoops" &&
              [0, 1, 2, 3].map((i) => (
                <rect key={i} x={58} y={138 + i * 22} width={84} height={11} fill={kit.shirt2} />
              ))}
            {kit.pattern === "stripes" &&
              [0, 1, 2, 3].map((i) => (
                <rect key={i} x={66 + i * 22} y={128} width={11} height={82} fill={kit.shirt2} />
              ))}
          </g>
          <rect
            x={58}
            y={128}
            width={84}
            height={82}
            rx={24}
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={3}
          />
          {kit.number !== undefined && (
            <text
              x={100}
              y={186}
              textAnchor="middle"
              fontFamily="Lilita One, sans-serif"
              fontSize={kit.numberSize ?? 38}
              fill={kit.numberColor ?? C.white}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={2}
              paintOrder="stroke"
              transform={facing === "left" ? "translate(200 0) scale(-1 1)" : undefined}
            >
              {kit.number}
            </text>
          )}
          {/* front arm */}
          <Limb x={136} y={146} angle={armR} len={58} color={kit.shirt} hand={skin} />
          {holding === "shirt" && (
            <g transform={`rotate(${armR} 136 146)`}>
              <Held kind="shirt" />
            </g>
          )}
          {/* head */}
          <g transform={`rotate(${headTilt} 100 120)`}>
            <rect x={90} y={112} width={20} height={20} fill={skin} />
            <circle cx={100} cy={72} r={56} fill={skin} />
            <circle cx={100} cy={72} r={56} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={3} />
            <HairShape hair={hair} color={hairColor} />
            {beard && (
              <path
                d="M 58 86 Q 62 128 100 130 Q 138 128 142 86 Q 130 112 100 114 Q 70 112 58 86 Z"
                fill={hairColor}
                opacity={0.85}
              />
            )}
            {/* cheeks */}
            <circle cx={70} cy={92} r={8} fill="#FF8A8A" opacity={0.35} />
            <circle cx={130} cy={92} r={8} fill="#FF8A8A" opacity={0.35} />
            <Eyes mood={mood} closed={eyesClosed} />
            <Mouth mood={mood} />
          </g>
          {holding && holding !== "shirt" && (
            <g transform={`rotate(${armR} 136 146)`}>
              <Held kind={holding} text={boardText} />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

const Limb: React.FC<{
  x: number;
  y: number;
  angle: number;
  len: number;
  color: string;
  hand: string;
}> = ({ x, y, angle, len, color, hand }) => (
  <g transform={`rotate(${angle} ${x} ${y})`}>
    <rect x={x - 10} y={y - 6} width={20} height={len * 0.55} rx={10} fill={color} />
    <rect x={x - 8} y={y + len * 0.4} width={16} height={len * 0.55} rx={8} fill={hand} />
    <circle cx={x} cy={y + len} r={10} fill={hand} />
  </g>
);

const Leg: React.FC<{ x: number; y: number; angle: number; kit: Kit; skin: string }> = ({
  x,
  y,
  angle,
  kit,
  skin,
}) => (
  <g transform={`rotate(${-angle} ${x} ${y})`}>
    <rect x={x - 11} y={y} width={22} height={LEG_LEN * 0.45} rx={10} fill={skin} />
    <rect x={x - 11} y={y + LEG_LEN * 0.38} width={22} height={LEG_LEN * 0.55} rx={9} fill={kit.socks} />
    <ellipse cx={x + 8} cy={y + LEG_LEN + 2} rx={18} ry={9} fill={C.ink} />
  </g>
);

const HairShape: React.FC<{ hair: Hair; color: string }> = ({ hair, color }) => {
  switch (hair) {
    case "bald":
      return null;
    case "buzz":
      return <path d="M 46 62 Q 52 16 100 14 Q 148 16 154 62 Q 128 38 100 38 Q 72 38 46 62 Z" fill={color} opacity={0.75} />;
    case "mohawk":
      return (
        <>
          <path d="M 48 60 Q 54 20 100 16 Q 146 20 152 60 Q 128 42 100 42 Q 72 42 48 60 Z" fill={color} opacity={0.45} />
          <path d="M 84 30 Q 86 -6 100 -10 Q 114 -6 116 30 Q 100 24 84 30 Z" fill={color} />
        </>
      );
    case "blond":
      return <path d="M 44 66 Q 44 8 100 8 Q 156 8 156 66 Q 140 34 100 32 Q 60 34 44 66 Z" fill="#F4D35E" />;
    case "curly":
      return (
        <g fill={color}>
          <path d="M 42 76 Q 36 4 100 2 Q 164 4 158 76 Q 150 42 100 36 Q 50 42 42 76 Z" />
          {[48, 66, 84, 100, 116, 134, 152].map((cx, i) => (
            <circle key={cx} cx={cx} cy={i % 2 ? 6 : 16} r={16} />
          ))}
          <circle cx={42} cy={44} r={14} />
          <circle cx={158} cy={44} r={14} />
        </g>
      );
    case "long":
      return <path d="M 40 100 Q 34 6 100 6 Q 166 6 160 100 Q 152 40 100 34 Q 48 40 40 100 Z" fill={color} />;
    case "short":
    default:
      return (
        <path
          d="M 44 70 Q 40 6 100 6 Q 160 6 156 70 Q 150 40 128 34 Q 118 46 100 36 Q 84 46 72 34 Q 50 40 44 70 Z"
          fill={color}
        />
      );
  }
};

const Eyes: React.FC<{ mood: Mood; closed: boolean }> = ({ mood, closed }) => {
  if (closed) {
    return (
      <g stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M 70 78 Q 80 68 90 78" />
        <path d="M 110 78 Q 120 68 130 78" />
      </g>
    );
  }
  const browY = mood === "sad" || mood === "worried" ? -4 : 0;
  return (
    <g>
      <ellipse cx={80} cy={78} rx={8} ry={11} fill={C.ink} />
      <ellipse cx={120} cy={78} rx={8} ry={11} fill={C.ink} />
      <circle cx={83} cy={74} r={3} fill={C.white} />
      <circle cx={123} cy={74} r={3} fill={C.white} />
      <g stroke={C.ink} strokeWidth={5} strokeLinecap="round">
        {mood === "sad" || mood === "worried" ? (
          <>
            <line x1={68} y1={60 + browY} x2={90} y2={56} />
            <line x1={110} y1={56} x2={132} y2={60 + browY} />
          </>
        ) : mood === "shout" ? (
          <>
            <line x1={68} y1={54} x2={90} y2={60} />
            <line x1={110} y1={60} x2={132} y2={54} />
          </>
        ) : (
          <>
            <line x1={70} y1={58} x2={90} y2={56} />
            <line x1={110} y1={56} x2={130} y2={58} />
          </>
        )}
      </g>
    </g>
  );
};

const Mouth: React.FC<{ mood: Mood }> = ({ mood }) => {
  switch (mood) {
    case "happy":
      return <path d="M 82 98 Q 100 120 118 98 Z" fill="#7A1F1F" stroke={C.ink} strokeWidth={3} />;
    case "shout":
      return <ellipse cx={100} cy={106} rx={16} ry={18} fill="#7A1F1F" stroke={C.ink} strokeWidth={3} />;
    case "sad":
      return <path d="M 84 110 Q 100 96 116 110" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
    case "worried":
      return <path d="M 86 106 Q 93 100 100 106 Q 107 112 114 106" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
    case "neutral":
    default:
      return <line x1={88} y1={104} x2={112} y2={104} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
  }
};

/** Prop drawn at the end of the front arm (arm points down = +y before rotation). */
const Held: React.FC<{ kind: NonNullable<CharacterProps["holding"]>; text?: string }> = ({
  kind,
  text,
}) => {
  const hx = 136;
  const hy = 146 + 58;
  switch (kind) {
    case "redcard":
      return <rect x={hx - 14} y={hy} width={28} height={40} rx={4} fill="#E3121B" stroke={C.ink} strokeWidth={3} />;
    case "whistle":
      return <circle cx={hx} cy={hy + 6} r={8} fill="#CCCCCC" />;
    case "shirt":
      return (
        <path
          d={`M ${hx - 30} ${hy} l 20 -10 h 20 l 20 10 l -8 16 l -8 -4 v 40 h -28 v -40 l -8 4 Z`}
          fill={C.city}
          stroke={C.ink}
          strokeWidth={3}
        />
      );
    case "trophy":
      return (
        <g transform={`translate(${hx} ${hy + 10}) rotate(180)`}>
          <path d="M -30 0 h 60 q 0 50 -30 60 q -30 -10 -30 -60 Z" fill={C.gold} stroke="#9A6B00" strokeWidth={3} />
          <rect x={-8} y={58} width={16} height={22} fill={C.gold} />
          <rect x={-24} y={78} width={48} height={12} rx={3} fill="#9A6B00" />
        </g>
      );
    case "board":
      return (
        <g transform={`translate(${hx} ${hy + 50}) rotate(125)`}>
          <rect x={-85} y={-10} width={170} height={100} rx={12} fill="#111" stroke="#444" strokeWidth={5} />
          <text
            x={0}
            y={68}
            textAnchor="middle"
            fontFamily="Lilita One, sans-serif"
            fontSize={76}
            fill="#36FF6B"
          >
            {text}
          </text>
        </g>
      );
  }
};
