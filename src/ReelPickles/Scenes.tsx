import React from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, useCurrentFrame } from "remotion";
import { Character, type CharacterProps } from "../Reel9320/Character";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { Confetti, Flash, Stadium } from "../Reel9320/Stage";
import { body, C, display, LAYOUT, SKIN } from "../Reel9320/theme";
import { Dog, Trophy } from "./Dog";
import {
  BanquetSet,
  BanquetTable,
  BobbyHelmet,
  DisplayCase,
  ENGLAND_CROWD,
  EyeMask,
  HallSet,
  Magnifier,
  P,
  Parcel,
  Plate,
  Rays,
  Sparkles,
  Stamp,
  StreetSet,
} from "./Sets";
import { HOOK_REWIND, NADA_AT, REVEAL_AT, THEFT_AT, VOICE_LEAD } from "./timeline";
import { VOICE_FRAMES } from "./voiceover.generated";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = LAYOUT.ground;
const pop = (t: number) => interpolate(t, [0, 6, 12], [0, 1.15, 1], clamp);

type Look = Omit<CharacterProps, "x" | "y">;

// England played the 1966 final in red shirts, white shorts, red socks.
const englandKit = (number?: number) => ({ shirt: P.englandRed, shorts: "#FFFFFF", socks: P.englandRed, number });
const MOORE: Look = { kit: englandKit(6), skin: SKIN.light, hair: "blond", height: 340 };
const MATE_A: Look = { kit: englandKit(9), skin: SKIN.light, hair: "bald", hairColor: "#5A3A22" };
const MATE_B: Look = { kit: englandKit(16), skin: SKIN.light, hair: "short", hairColor: "#6B3E1E" };
const CORBETT: Look = {
  kit: { shirt: "#7A5230", shorts: "#3A3F4A", socks: "#3A3F4A" },
  skin: SKIN.light,
  hair: "short",
  hairColor: "#2B1B10",
};
const THIEF: Look = {
  kit: { shirt: "#1A1A1A", shirt2: "#FFFFFF", pattern: "hoops", shorts: "#1A1A1A", socks: "#1A1A1A" },
  skin: SKIN.light,
  hair: "buzz",
  hairColor: "#111",
};
const BOBBY: Look = { kit: { shirt: P.police, shorts: P.police, socks: "#111" }, skin: SKIN.light, hair: "bald" };
const GUEST: Look = { kit: { shirt: "#22243A", shorts: "#22243A", socks: "#111", number: "♦", numberSize: 26 }, skin: SKIN.light, hair: "short" };

/* ───────────── 1. GANCHO: el perro con la copa → rebobinar ───────────── */
const HookLive: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stadium crowd={ENGLAND_CROWD} hype={1} />
      <Rays x={540} y={1200} opacity={0.6} />
      <div
        style={{
          position: "absolute",
          top: 230,
          width: "100%",
          textAlign: "center",
          fontFamily: body,
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: 6,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        MUNDIAL · INGLATERRA
      </div>
      <div
        style={{
          position: "absolute",
          top: 270,
          width: "100%",
          textAlign: "center",
          fontFamily: display,
          fontSize: 250,
          color: C.gold,
          WebkitTextStroke: `14px ${C.ink}`,
          paintOrder: "stroke fill",
          scale: `${interpolate(frame, [0, 6, 14], [1.6, 0.94, 1], clamp)}`,
          textShadow: "0 0 60px rgba(255,201,60,0.6)",
        }}
      >
        1966
      </div>
      <Caption name="Gancho" delay={8} accentWords="perro?" accent={C.gold} style={{ top: 590 }}>
        Inglaterra ganó su Mundial gracias a... ¿un perro?
      </Caption>
      <Dog x={520} y={G + 60} height={460} pose="happy" trophy />
      <Confetti start={0} colors={[P.englandRed, "#FFFFFF", P.englandNavy, C.gold]} count={70} />
    </AbsoluteFill>
  );
};

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const rewinding = frame >= HOOK_REWIND;
  const t = frame - HOOK_REWIND;
  // Rewind runs the live scene backwards at 3x, from the freeze point.
  const shown = rewinding ? Math.max(0, HOOK_REWIND - t * 3) : frame;
  const jitter = rewinding ? Math.sin(frame * 7.3) * 8 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.night }}>
      <AbsoluteFill
        style={{
          translate: `${jitter}px 0`,
          filter: rewinding ? "saturate(0.15) contrast(1.35) brightness(0.9)" : undefined,
        }}
      >
        <Freeze frame={shown}>
          <HookLive />
        </Freeze>
      </AbsoluteFill>
      {rewinding && (
        <>
          <AbsoluteFill
            style={{
              background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 7px)",
            }}
          />
          <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(0,0,0,0) 45%, rgba(140,0,0,0.55) 100%)" }} />
          <div
            style={{
              position: "absolute",
              top: 1560,
              width: "100%",
              textAlign: "center",
              fontFamily: display,
              fontSize: 76,
              color: C.white,
              textShadow: "-6px 0 0 rgba(255,0,60,0.8), 6px 0 0 rgba(0,220,255,0.8)",
              opacity: Math.floor(frame / 8) % 2 ? 1 : 0.55,
            }}
          >
            ◀◀ REBOBINANDO
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: (t * 40) % 1920,
              height: 26,
              background: "rgba(255,255,255,0.18)",
            }}
          />
        </>
      )}
      <Sfx name="Grito estadio" file="roar.wav" from={0} volume={0.5} durationInFrames={HOOK_REWIND} />
      <Sfx name="Rebobinado" file="whoosh.wav" from={HOOK_REWIND} volume={1} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. EL ROBO ───────────── */
export const SceneTheft: React.FC = () => {
  const frame = useCurrentFrame();
  const stolen = frame >= THEFT_AT;
  const thiefIn = interpolate(frame, [10, THEFT_AT - 6], [-160, 330], clamp);
  const thiefOut = interpolate(frame, [THEFT_AT, THEFT_AT + 26], [540, 1300], { ...clamp, easing: Easing.in(Easing.quad) });
  const blink = stolen && frame < THEFT_AT + 8 ? (Math.floor(frame / 2) % 2 ? 0.85 : 0.2) : 0;
  return (
    <AbsoluteFill>
      <HallSet dark={blink} />
      <DisplayCase x={540} y={1150} broken={stolen}>
        {!stolen && <Trophy x={540} y={1135} size={300} shine={Math.abs(Math.sin(frame * 0.15))} />}
      </DisplayCase>
      {!stolen && (
        <>
          <Character {...THIEF} x={thiefIn} y={G + 10} height={300} pose="run" mood="neutral" phase={3} />
          <EyeMask x={thiefIn} y={G + 10} height={300} />
        </>
      )}
      {stolen && (
        <>
          <Character {...THIEF} x={thiefOut} y={G + 10} height={300} pose="run" mood="happy" holding="trophy" />
          <EyeMask x={thiefOut} y={G + 10} height={300} />
        </>
      )}
      <MinuteBadge text="LONDRES · MARZO 1966" color={P.englandNavy} top={300} />
      {!stolen ? (
        <Caption name="Faltan 4 meses" delay={VOICE_LEAD} accentWords="4" accent={C.gold} style={{ top: 420 }}>
          Faltan 4 meses para el Mundial...
        </Caption>
      ) : (
        <Caption name="Roban la copa" delay={THEFT_AT} accentWords="roban" accent="#FF5A5A" style={{ top: 420 }}>
          ...y roban la copa
        </Caption>
      )}
      <Stamp text="¡ROBADA!" at={THEFT_AT + 6} top={760} />
      <Sfx name="Cristal" file="kick.wav" from={THEFT_AT} volume={1} />
      <Sfx name="Golpe robo" file="boom.wav" from={THEFT_AT + 6} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 3. RESCATE Y SCOTLAND YARD ───────────── */
const NOTE = "£15.000";
const NOTE_COLORS = ["#FFD23F", "#FFFFFF", "#7FD4FF", "#FF8FA3", "#B8F27C", "#FFFFFF", "#FFB347"];
export const SceneRansom: React.FC = () => {
  const frame = useCurrentFrame();
  const split = VOICE_LEAD + Math.round(VOICE_FRAMES.s03 * 0.42);
  const noteIn = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const toCorner = interpolate(frame, [split, split + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const search = frame - split;
  const bobbyX = 300 + Math.sin(search * 0.08) * 120;
  const bobby2X = 800 - Math.sin(search * 0.07 + 1) * 110;
  return (
    <AbsoluteFill>
      <StreetSet scroll={frame * 2} />
      <AbsoluteFill style={{ background: "rgba(10,18,60,0.45)" }} />
      {search >= 0 && (
        <>
          <Character {...BOBBY} x={bobbyX} y={G + 20} height={300} pose="run" mood="worried" facing={Math.cos(search * 0.08) > 0 ? "right" : "left"} />
          <BobbyHelmet x={bobbyX} y={G + 20} height={300} />
          <Magnifier x={bobbyX + (Math.cos(search * 0.08) > 0 ? 110 : -110)} y={G - 150} size={140} rotate={Math.cos(search * 0.08) > 0 ? 0 : 90} />
          <Character {...BOBBY} x={bobby2X} y={G + 40} height={280} pose="idle" mood="sad" phase={7} facing="left" />
          <BobbyHelmet x={bobby2X} y={G + 40} height={280} />
          <MinuteBadge text="SCOTLAND YARD BUSCA" color={P.police} top={300} />
        </>
      )}
      {/* ransom note */}
      <div
        style={{
          position: "absolute",
          left: interpolate(toCorner, [0, 1], [110, 560]),
          top: interpolate(toCorner, [0, 1], [380, 420]),
          width: 860,
          height: 560,
          scale: `${noteIn * interpolate(toCorner, [0, 1], [1, 0.46])}`,
          transformOrigin: "0 0",
          rotate: `${interpolate(toCorner, [0, 1], [-4, 6])}deg`,
          background: "#F4EEDC",
          border: `8px solid ${C.ink}`,
          borderRadius: 10,
          boxShadow: "0 20px 0 rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {NOTE.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                fontFamily: i % 2 ? display : "Georgia, serif",
                fontWeight: 900,
                fontSize: 120,
                padding: "0 14px",
                background: NOTE_COLORS[i % NOTE_COLORS.length],
                border: `5px solid ${C.ink}`,
                rotate: `${(i % 3) * 5 - 5}deg`,
                scale: `${pop(frame - 4 - i * 2)}`,
                display: "inline-block",
                color: C.ink,
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <div style={{ fontFamily: body, fontWeight: 900, fontSize: 54, color: C.ink, textAlign: "center", lineHeight: 1.1 }}>
          ...O LA COPA
          <br />
          NO VUELVE
        </div>
      </div>
      {search < 0 && (
        <Caption name="Rescate" delay={VOICE_LEAD} accentWords="15.000" accent={C.gold} style={{ top: 1040 }}>
          Piden 15.000 libras
        </Caption>
      )}
      <Stamp text="NADA." at={NADA_AT} top={1000} size={170} />
      <Sfx name="Papel" file="whoosh.wav" from={0} volume={0.7} />
      <Sfx name="Nada" file="groan.wav" from={NADA_AT} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 4. EL PASEO ───────────── */
export const SceneWalk: React.FC = () => {
  const frame = useCurrentFrame();
  const manX = 360;
  const dogX = 700;
  const bob = -Math.abs(Math.cos(frame * 0.5)) * 6;
  return (
    <AbsoluteFill>
      <StreetSet scroll={frame * 7} />
      <Character {...CORBETT} x={manX} y={G + 20} height={360} pose="run" mood="happy" />
      <Dog x={dogX} y={G + 25} height={210} pose="walk" />
      {/* leash: hand → collar */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d={`M ${manX + 50} ${G - 120} Q ${(manX + dogX) / 2 + 20} ${G - 30 + bob} ${dogX + 50} ${G - 70 + bob}`}
          stroke={P.englandRed}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <MinuteBadge text="27 MARZO 1966 · 7 DÍAS DESPUÉS" color="#2E7D32" top={300} />
      <Caption name="Paseo" delay={VOICE_LEAD} accentWords="Pickles." accent={C.gold} style={{ top: 420 }}>
        David Corbett pasea a su perro, Pickles.
      </Caption>
      <NameTag text="PICKLES" x={dogX + 40} y={G - 300} at={VOICE_LEAD + Math.round(VOICE_FRAMES.s04 * 0.75)} />
    </AbsoluteFill>
  );
};

const NameTag: React.FC<{ text: string; x: number; y: number; at: number }> = ({ text, x, y, at }) => {
  const frame = useCurrentFrame();
  const s = pop(frame - at);
  if (s <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        width: 300,
        top: y,
        textAlign: "center",
        scale: `${s}`,
        fontFamily: display,
        fontSize: 54,
        color: C.ink,
        background: C.gold,
        border: `6px solid ${C.ink}`,
        borderRadius: 18,
        rotate: "4deg",
      }}
    >
      {text} ⬇
    </div>
  );
};

/* ───────────── 5. EL OLFATO ───────────── */
export const SceneSniff: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 90], [1, 1.14], clamp);
  const dogX = 420;
  const sniff = (i: number) => {
    const t = (frame + i * 7) % 21;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: dogX + 150 + t * 5,
          top: G - 110 - i * 26,
          fontFamily: display,
          fontSize: 50,
          color: C.white,
          WebkitTextStroke: `6px ${C.ink}`,
          paintOrder: "stroke fill",
          opacity: interpolate(t, [0, 6, 20], [0, 1, 0]),
        }}
      >
        ~
      </div>
    );
  };
  const qAt = 34;
  return (
    <AbsoluteFill style={{ scale: `${zoom}`, transformOrigin: "60% 75%" }}>
      <StreetSet close />
      {/* car wheel at the hedge */}
      <div style={{ position: "absolute", left: 830, top: 1150, width: 300, height: 170, background: "#2F6FB5", border: `8px solid ${C.ink}`, borderRadius: "60px 0 0 20px" }} />
      <div style={{ position: "absolute", left: 870, top: 1240, width: 150, height: 150, borderRadius: "50%", background: "#1A1A1A", border: `8px solid ${C.ink}`, boxShadow: "inset 0 0 0 30px #333, inset 0 0 0 44px #AAA" }} />
      <Parcel x={720} y={G - 30} w={210} wiggle={frame > qAt ? 3 : 0} />
      <Dog x={dogX} y={G + 30} height={300} pose="sniff" />
      {[0, 1, 2].map(sniff)}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 1020,
          fontFamily: display,
          fontSize: 150,
          color: C.gold,
          WebkitTextStroke: `12px ${C.ink}`,
          paintOrder: "stroke fill",
          scale: `${pop(frame - qAt)}`,
          rotate: "10deg",
        }}
      >
        ?!
      </div>
      <MinuteBadge text="BEULAH HILL · SUR DE LONDRES" color="#2E7D32" top={300} />
      <Caption name="Olfato" delay={VOICE_LEAD} accentWords="periódico." accent={C.gold} style={{ top: 420 }}>
        Olfatea un paquete envuelto en periódico.
      </Caption>
      <Sfx name="Ding" file="ding.wav" from={qAt} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 6. ¡ES LA COPA! ───────────── */
export const SceneReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - REVEAL_AT;
  const open = interpolate(t, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const rise = interpolate(t, [2, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const shake = t >= 0 ? Math.sin(frame * 3.3) * interpolate(t, [0, 16], [22, 0], clamp) : 0;
  const tension = interpolate(frame, [0, REVEAL_AT], [1, 1.08], clamp);
  return (
    <AbsoluteFill style={{ translate: `${shake}px ${shake * 0.6}px` }}>
      <AbsoluteFill style={{ background: t >= 0 ? "radial-gradient(circle at 50% 55%, #6B4A10 0%, #1B1206 75%)" : "radial-gradient(circle at 50% 55%, #2A3550 0%, #0B0F1A 75%)" }} />
      <AbsoluteFill style={{ scale: `${t >= 0 ? 1 : tension}` }}>
        <Rays x={560} y={1060} opacity={rise} size={2200} />
        {t >= 0 && <Sparkles count={40} />}
        <Character {...CORBETT} x={250} y={G + 20} height={380} pose={t >= 0 ? "celebrate" : "idle"} mood={t >= 0 ? "shout" : "worried"} />
        {rise > 0 && <Trophy x={560} y={G - 120 - rise * 80} size={460 * rise} shine={rise} />}
        <Parcel x={560} y={G - 40} w={320} open={open} wiggle={t < 0 ? 2 : 0} />
        <Dog x={860} y={G + 40} height={230} pose={t >= 0 ? (t > 12 ? "happy" : "shock") : "sit"} facing="left" />
      </AbsoluteFill>
      {t < 0 ? (
        <Caption name="Lo abre" delay={VOICE_LEAD} accentWords="" style={{ top: 420 }}>
          Corbett lo abre y...
        </Caption>
      ) : (
        <Caption name="¡La copa!" delay={REVEAL_AT} accentWords="copa mundo!" accent={C.gold} style={{ top: 380, fontSize: 104 }}>
          ¡ES LA COPA DEL MUNDO!
        </Caption>
      )}
      <Flash amount={interpolate(t, [0, 2, 12], [0, 1, 0], clamp)} color="#FFF4C8" />
      <Sfx name="Latido" file="heartbeat.wav" from={0} durationInFrames={REVEAL_AT} volume={0.9} />
      <Sfx name="Boom copa" file="boom.wav" from={REVEAL_AT} volume={1} />
      <Sfx name="Brillo" file="ding.wav" from={REVEAL_AT + 4} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 7. HÉROE NACIONAL ───────────── */
export const SceneHero: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flashes = [24, 34, 41, 52];
  const flash = Math.max(...flashes.map((f) => interpolate(frame - f, [0, 1, 6], [0, 0.6, 0], clamp)));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2A3F7A 0%, #0B1229 75%)" }}>
      <Rays x={540} y={950} opacity={0.5} color="rgba(255,255,255,0.18)" />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 330,
          height: 1050,
          background: P.paper,
          border: `10px solid ${C.ink}`,
          borderRadius: 8,
          rotate: `${(1 - spin) * 720 - 3}deg`,
          scale: `${spin}`,
          boxShadow: "0 30px 0 rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign: "center", fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 70, color: C.ink, borderBottom: `6px solid ${C.ink}`, padding: "16px 0 8px" }}>
          The London Post
        </div>
        <div style={{ textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 26, letterSpacing: 4, color: "#444", padding: "8px 0", borderBottom: `3px solid ${C.ink}` }}>
          28 MARZO 1966 · EDICIÓN ESPECIAL
        </div>
        <div style={{ textAlign: "center", fontFamily: display, fontSize: 100, lineHeight: 1, color: C.ink, padding: "26px 30px 10px" }}>
          ¡UN PERRO SALVA LA COPA!
        </div>
        <div style={{ position: "relative", margin: "10px auto", width: 620, height: 470, background: "#CFC8B4", border: `6px solid ${C.ink}`, filter: "grayscale(1) contrast(1.1)" }}>
          <Dog x={300} y={430} height={300} pose="sit" medal />
        </div>
        {new Array(3).fill(0).map((_, i) => (
          <div key={i} style={{ margin: "14px 40px 0", height: 16, background: "rgba(40,40,40,0.3)", borderRadius: 6 }} />
        ))}
      </div>
      <Caption name="Héroe" delay={VOICE_LEAD + 4} accentWords="héroe" accent={C.gold} style={{ top: 1420 }}>
        Pickles, héroe nacional.
      </Caption>
      <Flash amount={flash} />
      <Sfx name="Giro" file="whoosh.wav" from={0} volume={0.9} />
      {flashes.map((f) => (
        <Sfx key={f} name="Flash" file="kick.wav" from={f} volume={0.35} durationInFrames={20} />
      ))}
    </AbsoluteFill>
  );
};

/* ───────────── 8. INGLATERRA CAMPEONA ───────────── */
export const SceneFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <AbsoluteFill>
      <Stadium crowd={ENGLAND_CROWD} hype={1} />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: LAYOUT.hudTop,
          height: 92,
          display: "flex",
          alignItems: "center",
          borderRadius: 18,
          background: "rgba(8,14,28,0.9)",
          border: "3px solid rgba(255,255,255,0.14)",
          fontFamily: body,
          fontWeight: 900,
          color: C.white,
          fontSize: 34,
          overflow: "hidden",
          opacity: enter,
          translate: `0 ${(1 - enter) * -40}px`,
        }}
      >
        <div style={{ width: 16, alignSelf: "stretch", background: P.englandRed }} />
        <div style={{ flex: 1, paddingLeft: 18 }}>INGLATERRA</div>
        <div style={{ fontFamily: display, fontSize: 56, padding: "0 18px", alignSelf: "stretch", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.1)" }}>
          4 - 2
        </div>
        <div style={{ flex: 1, textAlign: "right", paddingRight: 18 }}>ALEMANIA OCC.</div>
        <div style={{ width: 16, alignSelf: "stretch", background: "#FFFFFF" }} />
        <div style={{ width: 130, alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center", background: "#444", fontSize: 30 }}>
          FINAL
        </div>
      </div>
      <MinuteBadge text="30 JULIO 1966 · WEMBLEY" color={P.englandRed} />
      <Caption name="Campeones" delay={VOICE_LEAD + 2} accentWords="Mundial" accent={C.gold}>
        En julio, Inglaterra gana el Mundial
      </Caption>
      <Character {...MATE_A} x={220} y={G + 10} height={300} pose="celebrate" mood="happy" phase={4} />
      <Character {...MATE_B} x={860} y={G + 10} height={300} pose="celebrate" mood="happy" phase={9} />
      <Character {...MOORE} x={540} y={G + 30} pose="idle" mood="happy" holding="trophy" lift={Math.abs(Math.sin(frame * 0.25)) * 30} />
      <Confetti start={0} colors={[P.englandRed, "#FFFFFF", P.englandNavy, C.gold]} />
      <Sfx name="Silbato final" file="whistle-final.wav" from={0} volume={0.7} />
      <Sfx name="Rugido" file="roar.wav" from={6} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. LA CENA ───────────── */
export const SceneBanquet: React.FC = () => {
  const frame = useCurrentFrame();
  const tableY = 1250;
  const dogX = 470;
  const clean = interpolate(frame, [20, 70], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <BanquetSet />
      <Character {...GUEST} x={180} y={1330} height={330} pose="idle" mood="happy" phase={2} />
      <Character {...GUEST} x={900} y={1330} height={330} pose="idle" mood="shout" phase={5} facing="left" />
      <BanquetTable y={tableY} />
      <Plate x={200} y={tableY - 30} clean={0} />
      <Plate x={dogX + 140} y={tableY - 30} clean={clean} />
      <Plate x={880} y={tableY - 30} clean={0} />
      <Dog x={dogX} y={tableY - 22} height={290} pose="lick" medal />
      <MinuteBadge text="BANQUETE DE CAMPEONES" color="#7A1020" top={300} />
      <Caption name="Cena" delay={VOICE_LEAD} accentWords="Pickles" accent={C.gold} style={{ top: 420 }}>
        ...y Pickles va a la cena de campeones
      </Caption>
      <Sfx name="Ding" file="ding.wav" from={70} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 10. CTA: ¿QUIÉN FUE EL HÉROE? ───────────── */
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const vs = pop(frame - 14);
  const chipAt = VOICE_LEAD + Math.round(VOICE_FRAMES.s10 * 0.62);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 540, background: P.englandRed }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 540, background: "#E9B949" }} />
      <div style={{ position: "absolute", left: 500, top: 0, bottom: 0, width: 80, background: C.ink, rotate: "8deg", scale: "1 1.2" }} />
      <Caption name="Pregunta" delay={4} accentWords="héroe?" accent={C.gold} style={{ top: 300 }}>
        ¿Quién fue el verdadero héroe?
      </Caption>
      <Character {...MOORE} x={280} y={1230} height={440} pose="idle" mood="happy" holding="trophy" />
      <Dog x={820} y={1230} height={300} pose="sit" medal facing="left" />
      {[
        { x: 280, text: "BOBBY MOORE", bg: "#FFFFFF" },
        { x: 800, text: "PICKLES", bg: "#FFFFFF" },
      ].map((l) => (
        <div
          key={l.text}
          style={{
            position: "absolute",
            left: l.x - 220,
            width: 440,
            top: 1270,
            textAlign: "center",
            fontFamily: display,
            fontSize: 58,
            color: C.ink,
            background: l.bg,
            border: `6px solid ${C.ink}`,
            borderRadius: 18,
            scale: `${pop(frame - 8)}`,
          }}
        >
          {l.text}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 520,
          textAlign: "center",
          fontFamily: display,
          fontSize: 190,
          color: C.gold,
          WebkitTextStroke: `16px ${C.ink}`,
          paintOrder: "stroke fill",
          scale: `${vs}`,
        }}
      >
        VS
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: LAYOUT.chipTop, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: body,
            fontWeight: 900,
            fontSize: 46,
            color: C.white,
            background: "rgba(8,14,28,0.92)",
            border: `5px solid ${C.gold}`,
            borderRadius: 999,
            padding: "14px 40px",
            scale: `${pop(frame - chipAt)}`,
          }}
        >
          TE LEO EN COMENTARIOS 👇
        </div>
      </div>
      <Sfx name="VS" file="boom.wav" from={14} volume={0.7} />
    </AbsoluteFill>
  );
};
