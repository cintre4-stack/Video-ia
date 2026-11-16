import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { Dancer, Look, townsfolk } from "../ReelBaile/Dancer";
import { B, body, display, L } from "../ReelBaile/theme";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { BEER, BeerFlood, BeerWave, London, Vat } from "./London";
import { cue, SCENE_FRAMES } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = L.ground;
const popAt = (frame: number, at: number) =>
  interpolate(frame - at, [0, 5, 11], [0, 1.15, 1], clamp);
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/* ───── cast (1814) ───── */
const CRICK: Look = {
  skin: "#F2C9A0",
  top: "#E8E0D0",
  bottom: "#5A4632",
  apron: "#8A6A4A",
  hat: "cap",
  hatColor: "#3E4A5E",
  hair: "short",
  hairColor: "#6A3A1E",
};
const BOSS: Look = {
  skin: "#F6D2B0",
  top: "#1E2A3A",
  bottom: "#1E2A3A",
  dress: true,
  hat: "tophat",
  hatColor: "#1A1A22",
  hair: "short",
  hairColor: "#9A9A9A",
  beard: true,
};
const JUDGE: Look = {
  skin: "#EDB7A0",
  top: "#141418",
  bottom: "#141418",
  dress: true,
  hat: "wig",
  hair: "bald",
};
const NARRADOR: Look = {
  skin: "#E6B48A",
  top: "#2E86AB",
  bottom: "#2E5E7A",
  hair: "short",
  hairColor: "#3E2614",
};
const LONDONER = (i: number): Look => {
  const t = townsfolk(i + 40);
  return {
    ...t,
    hat: t.dress ? "coif" : i % 3 === 0 ? "tophat" : "cap",
    hatColor: t.dress ? "#FFFFFF" : "#2A2A33",
  };
};

const Big: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      right: 40,
      textAlign: "center",
      fontFamily: display,
      color: B.white,
      WebkitTextStroke: `14px ${B.ink}`,
      paintOrder: "stroke fill",
      textShadow: "0 8px 0 rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Stamp: React.FC<{
  text: string;
  at: number;
  top: number;
  color?: string;
  size?: number;
  rotate?: number;
}> = ({ text, at, top, color = "#E3121B", size = 100, rotate = -7 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        scale: `${interpolate(frame - at, [0, 5, 10], [2.8, 0.92, 1], clamp)}`,
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontFamily: display,
          fontSize: size,
          color,
          border: `12px solid ${color}`,
          borderRadius: 22,
          padding: "0 30px",
          rotate: `${rotate}deg`,
          background: "rgba(255,255,255,0.8)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Mug: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <rect
      x={18}
      y={34}
      width={64}
      height={76}
      rx={10}
      fill="#E8B04A"
      stroke={B.ink}
      strokeWidth={6}
    />
    <rect x={30} y={46} width={10} height={52} rx={5} fill="#F6CE7A" />
    <path
      d="M 82 52 q 28 0 28 22 q 0 22 -28 22"
      fill="none"
      stroke={B.ink}
      strokeWidth={8}
    />
    <path
      d="M 12 40 q 4 -24 26 -18 q 10 -16 28 -6 q 18 -10 24 10 q 8 4 2 14 Z"
      fill={BEER.foam}
      stroke={B.ink}
      strokeWidth={5}
    />
  </svg>
);

const Bubble: React.FC<{
  text: string;
  x: number;
  y: number;
  at: number;
  tail?: "left" | "right";
}> = ({ text, x, y, at, tail = "left" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        scale: `${popAt(frame, at)}`,
        fontFamily: display,
        fontSize: 52,
        lineHeight: 1.05,
        color: B.ink,
        background: "#fff",
        border: `6px solid ${B.ink}`,
        borderRadius: 36,
        padding: "12px 30px",
        maxWidth: 560,
        textAlign: "center",
      }}
    >
      {text}
      <div
        style={{
          position: "absolute",
          bottom: -34,
          [tail]: 60,
          width: 0,
          height: 0,
          borderLeft: "20px solid transparent",
          borderRight: "20px solid transparent",
          borderTop: `34px solid ${B.ink}`,
        }}
      />
    </div>
  );
};

/** Dark brewery interior: brick wall, beams and lamps. */
const Interior: React.FC<{ dim?: number }> = ({ dim = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #3A2418 0%, #5A3A26 60%, #2A1A12 100%)",
      }}
    >
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", opacity: 0.22 }}
      >
        {new Array(40)
          .fill(0)
          .map((_, r) =>
            new Array(8)
              .fill(0)
              .map((__, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={c * 150 + (r % 2) * 75 - 75}
                  y={r * 48}
                  width={142}
                  height={42}
                  rx={4}
                  fill="#000"
                />
              )),
          )}
      </svg>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 330 + i * 260,
            height: 40,
            background: "#2A1A10",
            borderTop: "4px solid #4A3020",
          }}
        />
      ))}
      {[200, 880].map((lx, i) => (
        <div
          key={lx}
          style={{
            position: "absolute",
            left: lx - 200,
            top: 500,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,200,110,0.35) 0%, rgba(255,200,110,0) 65%)",
            opacity: 0.85 + 0.15 * Math.sin(frame * 0.3 + i),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: G - 60,
          bottom: 0,
          background: "#2E2018",
          borderTop: "8px solid #4A3424",
        }}
      />
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />}
    </AbsoluteFill>
  );
};

/* ───────────── 1. GANCHO: una ola gigante… de cerveza ───────────── */
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const notWater = cue("s01", 0.6);
  const reveal = cue("s01", 0.84);
  const isBeer = frame >= reveal;
  const front = interpolate(frame, [0, reveal], [-200, 620], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const shake = isBeer
    ? Math.sin(frame * 3) * interpolate(frame - reveal, [0, 16], [20, 0], clamp)
    : 0;
  return (
    <AbsoluteFill style={{ translate: `${shake}px 0` }}>
      <London sky="grey" />
      <MinuteBadge text="LONDRES · 1814" color="#1E2A3A" top={L.badgeTop} />
      <Caption
        name="Gancho"
        delay={isBeer ? reveal : frame >= notWater ? notWater : 4}
        accentWords={
          isBeer ? "cerveza!" : frame >= notWater ? "agua..." : "ola gigante"
        }
        accent={isBeer ? B.gold : "#7FC4FF"}
        style={{ top: L.captionTop + 20, fontSize: isBeer ? 110 : 84 }}
      >
        {isBeer
          ? "¡Era CERVEZA!"
          : frame >= notWater
            ? "Pero no era agua..."
            : "Una ola gigante arrasó Londres"}
      </Caption>
      <Dancer
        {...LONDONER(1)}
        x={interpolate(frame, [0, 180], [560, 1000])}
        y={G + 80}
        height={260}
        pose="run"
        mood="shock"
      />
      <Dancer
        {...LONDONER(2)}
        x={interpolate(frame, [0, 180], [760, 1200])}
        y={G + 120}
        height={250}
        pose="run"
        mood="shock"
        phase={9}
      />
      <BeerWave front={front} height={isBeer ? 560 : 520} water={!isBeer} />
      {isBeer && (
        <div
          style={{
            position: "absolute",
            left: 540 - 150,
            top: 660,
            scale: `${popAt(frame, reveal)}`,
            rotate: `${Math.sin(frame * 0.25) * 8}deg`,
          }}
        >
          <Mug size={300} />
        </div>
      )}
      <Sfx name="Ola" file="flood.wav" from={0} volume={0.6} />
      <Sfx name="Boom cerveza" file="boom.wav" from={reveal} volume={1} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. La fábrica Meux y la cuba gigante ───────────── */
export const SceneBrewery: React.FC = () => {
  const frame = useCurrentFrame();
  const inside = cue("s02", 0.42);
  if (frame < inside) {
    return (
      <AbsoluteFill>
        <London sky="grey" brewery />
        <MinuteBadge text="17 OCT 1814" color="#1E2A3A" top={L.badgeTop} />
        <Caption
          name="Fábrica"
          delay={4}
          accentWords="Meux"
          accent={B.gold}
          style={{ top: L.captionTop + 20 }}
        >
          Fábrica de cerveza Meux
        </Caption>
        <Dancer
          {...LONDONER(3)}
          x={160}
          y={G + 60}
          height={250}
          pose="walk"
          mood="neutral"
        />
        <Dancer
          {...LONDONER(4)}
          x={420}
          y={G + 110}
          height={240}
          pose="idle"
          mood="happy"
          facing="left"
          phase={20}
        />
      </AbsoluteFill>
    );
  }
  const t = frame - inside;
  const ruler = interpolate(t, [10, 40], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Interior />
      <Caption
        name="Cuba"
        delay={inside + 2}
        accentWords="7 metros"
        accent={B.gold}
        style={{ top: L.captionTop - 100 }}
      >
        Una cuba de casi 7 metros
      </Caption>
      <Vat x={560} bottom={G - 60} w={420} h={760} />
      {/* height ruler */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: G - 60 - 760 * ruler,
          width: 14,
          height: 760 * ruler,
          background: B.gold,
          border: `4px solid ${B.ink}`,
        }}
      />
      {ruler > 0.95 && (
        <div
          style={{
            position: "absolute",
            left: 60,
            top: G - 860,
            fontFamily: display,
            fontSize: 70,
            color: B.gold,
            WebkitTextStroke: `10px ${B.ink}`,
            paintOrder: "stroke fill",
            scale: `${popAt(t, 40)}`,
          }}
        >
          6,7 M
        </div>
      )}
      <Dancer
        {...CRICK}
        x={880}
        y={G - 50}
        height={190}
        pose="idle"
        mood="neutral"
        facing="left"
      />
      <div
        style={{
          position: "absolute",
          left: 360,
          right: 160,
          top: G - 20,
          textAlign: "center",
          fontFamily: body,
          fontWeight: 900,
          fontSize: 40,
          color: BEER.foam,
          opacity: interpolate(t, [50, 60], [0, 1], clamp),
        }}
      >
        Llena de cerveza negra (porter)
      </div>
      <Sfx name="Crujido" file="creak.wav" from={inside + 10} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 3. El aro de hierro ───────────── */
export const SceneHoop: React.FC = () => {
  const frame = useCurrentFrame();
  const slipAt = cue("s03", 0.38);
  const boss = cue("s03", 0.64);
  const slip = interpolate(frame, [slipAt, slipAt + 18], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  return (
    <AbsoluteFill>
      <Interior />
      <MinuteBadge text="POR LA TARDE" color="#7A1E2E" top={L.badgeTop} />
      <Caption
        name="Aro"
        delay={frame >= boss ? boss : 4}
        accentWords={frame >= boss ? "jefe" : "Crick"}
        accent={B.gold}
        style={{ top: L.captionTop + 20 }}
      >
        {frame >= boss ? "Su jefe..." : "George Crick ve algo raro"}
      </Caption>
      <Vat x={720} bottom={G - 60} w={380} h={700} slip={slip} />
      {slip > 0.9 && (
        <div
          style={{
            position: "absolute",
            left: 470,
            top: 600,
            whiteSpace: "nowrap",
            fontFamily: display,
            fontSize: 50,
            color: "#fff",
            background: "#C24A2A",
            border: `5px solid ${B.ink}`,
            borderRadius: 14,
            padding: "2px 18px",
            rotate: "-6deg",
            scale: `${popAt(frame, slipAt + 18)}`,
          }}
        >
          ARO SUELTO · ≈ 320 KG
        </div>
      )}
      <Dancer
        {...CRICK}
        x={frame >= boss ? 400 : 250}
        y={G + 40}
        height={330}
        pose={frame >= slipAt + 12 ? "point" : "walk"}
        mood={frame >= slipAt + 12 ? "shock" : "neutral"}
        speed={frame >= slipAt + 12 ? 1 : 0.8}
      />
      {frame >= boss && (
        <Dancer
          {...BOSS}
          x={interpolate(frame, [boss, boss + 20], [-150, 140], {
            ...clamp,
            easing: ease,
          })}
          y={G + 80}
          height={340}
          pose="shrug"
          mood="happy"
        />
      )}
      <Bubble text="Tranquilo, no pasa nada" x={60} y={860} at={boss + 18} />
      <Sfx name="Clang" file="clang.wav" from={slipAt + 16} volume={0.9} />
    </AbsoluteFill>
  );
};

/* ───────────── 4. ¡BUM! Efecto dominó ───────────── */
export const SceneBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const bum = cue("s04", 0.24);
  const domino = cue("s04", 0.6);
  const bulge = interpolate(frame, [0, bum], [0, 1], clamp);
  const shake =
    frame >= bum
      ? Math.sin(frame * 3.3) *
        interpolate(frame - bum, [0, 24], [30, 0], clamp)
      : 0;
  const side = [
    { x: 150, at: domino },
    { x: 950, at: domino + 10 },
  ];
  return (
    <AbsoluteFill style={{ translate: `${shake}px ${shake * 0.4}px` }}>
      <Interior />
      <MinuteBadge
        text="≈ 17:30 · UNA HORA DESPUÉS"
        color="#7A1E2E"
        top={L.badgeTop}
      />
      {side.map((v) => (
        <Vat
          key={v.x}
          x={v.x}
          bottom={G - 120}
          w={230}
          h={480}
          burstT={frame >= v.at ? frame - v.at : undefined}
          bulge={frame >= v.at - 12 ? 0.7 : 0}
        />
      ))}
      <Vat
        x={540}
        bottom={G - 60}
        w={400}
        h={720}
        bulge={bulge}
        slip={1}
        burstT={frame >= bum ? frame - bum : undefined}
      />
      {frame >= bum && (
        <BeerWave
          front={interpolate(frame - bum, [0, 40], [300, 1500], clamp)}
          height={interpolate(frame - bum, [0, 20], [120, 600], clamp)}
        />
      )}
      {frame >= bum && frame < domino && (
        <Big
          style={{
            top: 420,
            fontSize: 260,
            color: B.gold,
            scale: `${popAt(frame, bum)}`,
          }}
        >
          ¡BUM!
        </Big>
      )}
      {frame >= domino && (
        <Caption
          name="Dominó"
          delay={domino}
          accentWords="dominó"
          accent={B.gold}
          style={{ top: L.captionTop + 40 }}
        >
          Efecto dominó
        </Caption>
      )}
      <AbsoluteFill
        style={{
          background: "#FFF6E0",
          opacity: interpolate(
            frame,
            [bum, bum + 2, bum + 10],
            [0, 0.9, 0],
            clamp,
          ),
        }}
      />
      <Sfx name="Crujido" file="creak.wav" from={0} volume={0.8} />
      <Sfx name="Bum" file="boom.wav" from={bum} volume={1} />
      <Sfx name="Ola" file="flood.wav" from={bum} volume={0.8} />
      {side.map((v) => (
        <Sfx
          key={v.x}
          name={`Bum ${v.x}`}
          file="boom.wav"
          from={v.at}
          volume={0.6}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────── 5. La ola sale a la calle ───────────── */
export const SceneWave: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = SCENE_FRAMES.s05;
  const height = cue("s05", 0.62);
  const front = interpolate(frame, [0, dur - 10], [-100, 1250], clamp);
  const litres = Math.round(
    interpolate(frame, [4, height], [0, 1470000], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    }),
  );
  return (
    <AbsoluteFill>
      <London sky="grey" brewery breweryDamage={1} />
      <Big style={{ top: 250, fontSize: 120, color: B.gold }}>
        {litres.toLocaleString("es-ES")}
      </Big>
      <Big style={{ top: 400, fontSize: 64 }}>LITROS DE CERVEZA</Big>
      {[0, 1, 2].map((i) => (
        <Dancer
          key={i}
          {...LONDONER(i + 6)}
          x={front + 260 + i * 140}
          y={G + 70 + (i % 2) * 50}
          height={240}
          pose="run"
          mood="shock"
          phase={i * 8}
        />
      ))}
      <BeerWave front={front} height={480} />
      {frame >= height && (
        <div
          style={{
            position: "absolute",
            left: Math.max(40, Math.min(front - 420, 600)),
            top: G - 520,
            scale: `${popAt(frame, height)}`,
            fontFamily: display,
            fontSize: 64,
            color: "#fff",
            background: "#7A1E2E",
            border: `6px solid ${B.ink}`,
            borderRadius: 18,
            padding: "2px 22px",
          }}
        >
          OLA DE ≈ 4,6 M
        </div>
      )}
      <Sfx name="Ola" file="flood.wav" from={0} volume={0.9} />
      <Sfx
        name="Gritos"
        file="crowd.wav"
        from={10}
        volume={0.4}
        durationInFrames={120}
      />
    </AbsoluteFill>
  );
};

/* ───────────── 6. St Giles se inunda ───────────── */
export const SceneStGiles: React.FC = () => {
  const frame = useCurrentFrame();
  const flood = cue("s06", 0.62);
  const level = interpolate(frame, [flood - 10, flood + 30], [1700, 1180], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <London sky="grey" poor tone={0.1} />
      <MinuteBadge text="ST GILES" color="#4A3E38" top={L.badgeTop} />
      <Caption
        name="St Giles"
        delay={frame >= flood ? flood : 4}
        accentWords={frame >= flood ? "segundos." : "pobres"}
        accent={frame >= flood ? B.gold : "#FF9A6B"}
        style={{ top: L.captionTop + 20, fontSize: 80 }}
      >
        {frame >= flood
          ? "Casas y sótanos, inundados en segundos."
          : "Uno de los barrios más pobres de Londres"}
      </Caption>
      {frame < flood + 10 && (
        <>
          <Dancer
            {...LONDONER(10)}
            x={200}
            y={G + 70}
            height={240}
            pose="idle"
            mood="neutral"
          />
          <Dancer
            {...LONDONER(11)}
            x={820}
            y={G + 80}
            height={230}
            pose="idle"
            mood="worried"
            facing="left"
            phase={14}
          />
        </>
      )}
      <BeerFlood level={level} />
      <Sfx name="Inundación" file="flood.wav" from={flood - 10} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 7. Tragedia (tono serio) ───────────── */
const Candle: React.FC<{ x: number; y: number; on: boolean }> = ({
  x,
  y,
  on,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - 22, top: y }}>
      <svg
        width={44}
        height={150}
        viewBox="0 0 44 150"
        style={{ overflow: "visible" }}
      >
        {on && (
          <ellipse
            cx={22}
            cy={14}
            rx={40}
            ry={46}
            fill="rgba(255,200,90,0.18)"
          />
        )}
        {on && (
          <path
            d={`M 22 ${-8 + Math.sin(frame * 0.5 + x) * 2} q 12 18 0 30 q -12 -12 0 -30 Z`}
            fill="#FFC93C"
            stroke="#FF8A2B"
            strokeWidth={3}
          />
        )}
        <rect
          x={10}
          y={24}
          width={24}
          height={110}
          rx={6}
          fill="#F4EFE2"
          stroke={B.ink}
          strokeWidth={4}
        />
        <line x1={22} y1={24} x2={22} y2={16} stroke={B.ink} strokeWidth={3} />
      </svg>
    </div>
  );
};
export const SceneTragedy: React.FC = () => {
  const frame = useCurrentFrame();
  const eight = cue("s07", 0.12);
  const wake = cue("s07", 0.42);
  const maid = cue("s07", 0.72);
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 55%, #2A2E44 0%, #0C0E18 85%)",
      }}
    >
      <Caption
        name="Tragedia"
        delay={3}
        accentWords=""
        accent={B.gold}
        style={{ top: 260 }}
      >
        Fue una tragedia
      </Caption>
      {frame >= eight && (
        <Big
          style={{ top: 430, fontSize: 96, scale: `${popAt(frame, eight)}` }}
        >
          <span style={{ color: B.gold }}>8</span> personas murieron
        </Big>
      )}
      {new Array(8).fill(0).map((_, i) => (
        <Candle
          key={i}
          x={180 + i * 103}
          y={1000 + (i % 2) * 30}
          on={frame >= eight + i * 6}
        />
      ))}
      {[
        { at: wake, text: "5 estaban en un velatorio, en un sótano" },
        { at: maid, text: "Eleanor Cooper, camarera, 14 años" },
      ].map((l, i) =>
        frame >= l.at ? (
          <div
            key={l.text}
            style={{
              position: "absolute",
              left: 80,
              right: 80,
              top: 620 + i * 140,
              textAlign: "center",
              fontFamily: body,
              fontWeight: 900,
              fontSize: 50,
              color: "#E8E4DA",
              opacity: interpolate(frame - l.at, [0, 12], [0, 1], clamp),
              translate: `0 ${interpolate(frame - l.at, [0, 12], [20, 0], clamp)}px`,
            }}
          >
            {l.text}
          </div>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

/* ───────────── 8. El mito ───────────── */
export const SceneMyth: React.FC = () => {
  const frame = useCurrentFrame();
  const party = cue("s08", 0.22);
  const busted = cue("s08", 0.74);
  const isBusted = frame >= busted;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          filter: isBusted ? "grayscale(1) brightness(0.75)" : undefined,
        }}
      >
        <London sky="grey" />
        <BeerFlood level={G + 10} />
        {frame >= party &&
          [0, 1, 2, 3].map((i) => (
            <Dancer
              key={i}
              {...LONDONER(i + 14)}
              x={150 + i * 250}
              y={G + 100 + (i % 2) * 60}
              height={270}
              pose={i % 2 ? "cheers" : "point"}
              holding={i % 2 ? "mug" : "ladle"}
              mood={i % 2 ? "happy" : "crazy"}
              phase={i * 11}
              facing={i % 2 ? "left" : "right"}
            />
          ))}
      </AbsoluteFill>
      <MinuteBadge text="EL MITO" color="#2E86AB" top={L.badgeTop} />
      <Caption
        name="Mito"
        delay={isBusted ? busted : party}
        accentWords={isBusted ? "pruebas" : "cazos"}
        accent={isBusted ? "#FF5A4D" : B.gold}
        style={{ top: L.captionTop + 20 }}
      >
        {isBusted
          ? "No hay pruebas de que pasara"
          : "¿Salieron con cazos a beberla?"}
      </Caption>
      <Stamp text="SIN PRUEBAS" at={busted} top={760} />
      <Sfx name="Fiesta" file="roar.wav" from={party} volume={0.3} />
      <Sfx name="Sello" file="scratch.wav" from={busted} volume={0.9} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. El juicio ───────────── */
export const SceneTrial: React.FC = () => {
  const frame = useCurrentFrame();
  const god = cue("s09", 0.24);
  const nobody = cue("s09", 0.46);
  const taxes = cue("s09", 0.62);
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #4A2E1E 0%, #6E4A30 60%, #3A2416 100%)",
      }}
    >
      {/* wood panels */}
      {new Array(6).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 20 + i * 180,
            top: 120,
            width: 160,
            height: 1200,
            border: "6px solid rgba(0,0,0,0.18)",
            borderRadius: 10,
          }}
        />
      ))}
      <Caption
        name="Juicio"
        delay={3}
        accentWords="juicio?"
        accent={B.gold}
        style={{ top: 250 }}
      >
        ¿Y el juicio?
      </Caption>
      <Stamp
        text="ACTO DE DIOS"
        at={god}
        top={420}
        color="#7A1E2E"
        size={92}
        rotate={-4}
      />
      <Stamp
        text="NADIE CULPABLE"
        at={nobody}
        top={590}
        color="#E3121B"
        size={84}
        rotate={5}
      />
      {/* judge's bench */}
      <Dancer
        {...JUDGE}
        x={frame >= taxes ? 260 : 540}
        y={1180}
        height={330}
        pose={frame >= god - 6 && frame < god + 10 ? "point" : "idle"}
        mood="neutral"
      />
      <div
        style={{
          position: "absolute",
          left: frame >= taxes ? 60 : 340,
          width: 400,
          top: 1060,
          height: 280,
          background: "#3A2416",
          border: `8px solid ${B.ink}`,
          borderRadius: 12,
        }}
      />
      {frame >= taxes && (
        <>
          <Dancer
            {...BOSS}
            x={interpolate(frame, [taxes, taxes + 18], [1250, 800], {
              ...clamp,
              easing: ease,
            })}
            y={G + 60}
            height={380}
            pose="cheers"
            holding="mug"
            mood="happy"
            facing="left"
          />
          {new Array(16).fill(0).map((_, i) => {
            const t = frame - taxes - i * 3;
            if (t < 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 640 + random(`cx${i}`) * 340,
                  top: 700 + t * 12,
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: B.gold,
                  border: `5px solid ${B.ink}`,
                  fontFamily: display,
                  fontSize: 36,
                  textAlign: "center",
                  lineHeight: "44px",
                  color: B.ink,
                  opacity: interpolate(t, [0, 40, 60], [1, 1, 0], clamp),
                }}
              >
                £
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 560,
              right: 40,
              top: 840,
              textAlign: "center",
              fontFamily: display,
              fontSize: 58,
              lineHeight: 1.05,
              color: "#fff",
              WebkitTextStroke: `10px ${B.ink}`,
              paintOrder: "stroke fill",
              scale: `${popAt(frame, taxes)}`,
            }}
          >
            + IMPUESTOS
            <br />
            DEVUELTOS
            <br />
            <span style={{ color: B.gold }}>≈ £7.250</span>
          </div>
        </>
      )}
      <Sfx name="Mazo" file="kick.wav" from={god - 4} volume={1} />
      <Sfx name="Sello 1" file="boom.wav" from={god} volume={0.7} />
      <Sfx name="Sello 2" file="boom.wav" from={nobody} volume={0.6} />
      <Sfx name="Monedas" file="ding.wav" from={taxes} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ───────────── 10. CTA: mira bien el barril ───────────── */
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const comments = cue("s10", 0.4);
  const barrel = cue("s10", 0.66);
  const scared = cue("s10", 0.86);
  const bulge = interpolate(frame, [barrel, barrel + 50], [0, 0.6], clamp);
  return (
    <AbsoluteFill>
      <London sky="night" lit />
      <Caption
        name="CTA"
        delay={frame >= barrel ? barrel : frame >= comments ? comments : 3}
        accentWords={
          frame >= barrel
            ? "barril."
            : frame >= comments
              ? "comentarios"
              : "culpables?"
        }
        accent={frame >= barrel ? "#FF5A4D" : B.gold}
        style={{ top: 250, fontSize: 92 }}
      >
        {frame >= barrel
          ? "Mira bien el barril."
          : frame >= comments
            ? "Te leo en comentarios"
            : "¿Accidente o culpables?"}
      </Caption>
      <Vat
        x={800}
        bottom={G + 40}
        w={300}
        h={420}
        slip={
          frame >= barrel
            ? interpolate(frame, [barrel, barrel + 20], [0, 1], clamp)
            : 0
        }
        bulge={bulge}
      />
      <Dancer
        {...NARRADOR}
        x={360}
        y={G + 80}
        height={520}
        pose="cheers"
        holding="mug"
        mood={frame >= scared ? "shock" : frame >= barrel ? "worried" : "happy"}
      />
      <Sfx name="Brindis" file="ding.wav" from={6} volume={0.5} />
      <Sfx name="Crujido barril" file="creak.wav" from={barrel} volume={0.9} />
      <Sfx name="Aro" file="clang.wav" from={barrel + 18} volume={0.6} />
    </AbsoluteFill>
  );
};
