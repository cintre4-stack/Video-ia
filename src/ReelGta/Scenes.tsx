import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Character } from "../Reel9320/Character";
import { Caption, MinuteBadge } from "../Reel9320/Hud";
import { Sfx } from "../Reel9320/Sfx";
import { Confetti, Flash } from "../Reel9320/Stage";
import { body, C, display } from "../Reel9320/theme";
import { BOSS, FANS, GAMER, V, WORKERS } from "./Cast";
import { BigText, Bubble, CalendarPage, OfficeBoard, RedVignette, StatusChip, Stamp, Vhs } from "./Hud";
import { CALL_VOICE_FROM } from "./timeline";
import { Chair, Couch, CouchBack, Desk, NeonSky, Office, Room, Street } from "./Sets";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const G = 1430;
/** Couch seat line; gamer feet sit a bit lower so the couch front hides the legs. */
const SEAT_Y = 1500;

const shakeX = (frame: number, at: number, power = 18) =>
  frame >= at ? Math.sin(frame * 3) * interpolate(frame - at, [0, 14], [power, 0], clamp) : 0;

/* ───────────── 1. GANCHO: LA FIEBRE ───────────── */
const CURE = 110;
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, CURE], [1, 1.08], clamp);
  return (
    <AbsoluteFill style={{ translate: `${shakeX(frame, CURE)}px 0` }}>
      <AbsoluteFill style={{ scale: `${zoom}` }}>
        <Room />
        <CouchBack top={1400} />
        <Character {...GAMER} x={540} y={SEAT_Y} height={420} pose="idle" mood="worried" sick thermometer holding="controller" />
        <Couch top={1400} />
      </AbsoluteFill>
      <RedVignette amount={interpolate(frame, [0, 20], [0.6, 1], clamp)} />
      <MinuteBadge text="MAÑANA · 19 NOV" color={V.red} top={250} />
      <BigText top={360} size={150} at={2}>
        LA FIEBRE GTA
      </BigText>
      <Caption name="Gancho" delay={6} accentWords="enfermos" accent={V.sick} style={{ top: 560, fontSize: 76 }}>
        Miles van a despertar enfermos
      </Caption>
      <Stamp text="SIN CURA" at={CURE} top={1560} size={100} />
      <Flash amount={interpolate(frame, [CURE, CURE + 2, CURE + 10], [0, 0.6, 0], clamp)} color="#FFD0D0" />
      <Sfx name="Latido" file="heartbeat.wav" from={0} durationInFrames={CURE} volume={0.9} />
      <Sfx name="Boom sin cura" file="boom.wav" from={CURE} volume={1} />
    </AbsoluteFill>
  );
};

/* ───────────── 2. REBOBINAR A 2013 ───────────── */
const REW_END = 36;
const RELEASE = 104;
export const SceneRewind: React.FC = () => {
  const frame = useCurrentFrame();
  const rewinding = frame < REW_END;
  return (
    <AbsoluteFill>
      {rewinding ? (
        <AbsoluteFill style={{ filter: "saturate(0.4) contrast(1.2)", translate: `${Math.sin(frame * 5) * 8}px 0` }}>
          <Room />
          <CouchBack top={1400} />
          {/* the gamer zips backwards */}
          <Character {...GAMER} x={interpolate(frame, [0, REW_END], [540, 1200])} y={SEAT_Y} height={420} pose="run" facing="left" mood="neutral" phase={-frame * 3} />
          <Couch top={1400} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2E6BD8 0%, #0B1A2E 75%)" }}>
          <AbsoluteFill style={{ background: "repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,255,255,0.05) 0deg 10deg, transparent 10deg 20deg)", rotate: `${frame * 0.3}deg`, scale: "2" }} />
          <MinuteBadge text="ÉRASE UNA VEZ..." color="#2E6BD8" top={260} />
          <CalendarPage day="17" month="SEPTIEMBRE" year="2013" at={REW_END + 2} top={400} />
          {frame >= RELEASE && (
            <BigText top={1000} size={150} at={RELEASE} color={V.cyan}>
              ¡SALE GTA V!
            </BigText>
          )}
          <Character {...GAMER} x={540} y={G + 40} height={300} pose={frame >= RELEASE ? "celebrate" : "idle"} mood={frame >= RELEASE ? "happy" : "neutral"} />
          <Confetti start={RELEASE} colors={[V.cyan, V.pink, V.yellow, "#FFFFFF"]} count={60} />
        </AbsoluteFill>
      )}
      <Vhs amount={rewinding ? 1 : interpolate(frame, [REW_END, REW_END + 8], [0.8, 0], clamp)} />
      <Flash amount={interpolate(frame, [REW_END, REW_END + 2, REW_END + 8], [0, 0.8, 0], clamp)} />
      <Sfx name="Rebobinado" file="rewind.wav" from={0} volume={0.8} durationInFrames={REW_END + 4} />
      <Sfx name="Ding fecha" file="ding.wav" from={REW_END + 2} volume={0.5} />
      <Sfx name="Boom sale" file="boom.wav" from={RELEASE} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 3. ENCUESTA: 46% PIDIÓ EL DÍA ───────────── */
const POLL_FILL = [70, 120] as const;
export const ScenePoll: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = Math.round(interpolate(frame, POLL_FILL, [0, 46], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const freeIdx = new Set([0, 3, 4, 7, 8]);
  return (
    <AbsoluteFill>
      <Office />
      <MinuteBadge text="ENCUESTA EN IGN · 2013" color="#2E6BD8" top={250} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 46, color: C.ink }}>
        ~11.000 lectores votaron
      </div>
      <BigText top={420} size={230} at={POLL_FILL[0]} color={V.yellow}>
        {pct}%
      </BigText>
      {/* bar */}
      <div style={{ position: "absolute", left: 110, right: 110, top: 680, height: 56, borderRadius: 28, background: "rgba(8,14,28,0.85)", border: `6px solid ${C.ink}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#36C46B,#7CFFA6)" }} />
      </div>
      <Caption name="Encuesta" delay={POLL_FILL[0] + 10} accentWords="día libre" accent="#36C46B" style={{ top: 770, fontSize: 72 }}>
        Casi la mitad ya había pedido el día libre
      </Caption>
      {new Array(10).fill(0).map((_, i) => {
        const row = Math.floor(i / 5);
        const free = freeIdx.has(i) && frame >= POLL_FILL[0] + 10 + i * 4;
        const look = WORKERS[i % WORKERS.length];
        const x = 140 + (i % 5) * 200 + (row ? 0 : 0);
        const y = row ? 1500 : 1250;
        return (
          <React.Fragment key={i}>
            <Character {...look} x={x} y={y} height={220} pose={free ? "celebrate" : "idle"} mood={free ? "happy" : "neutral"} phase={i * 7} />
            {free && (
              <div style={{ position: "absolute", left: x - 70, top: y - 300, width: 140, textAlign: "center", fontFamily: display, fontSize: 36, color: C.white, background: "#36C46B", border: `4px solid ${C.ink}`, borderRadius: 14, rotate: `${(i % 2 ? 1 : -1) * 6}deg` }}>
                LIBRE
              </div>
            )}
          </React.Fragment>
        );
      })}
      <Sfx name="Ding 46" file="ding.wav" from={POLL_FILL[1]} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ───────────── 4. UNO DE CADA CINCO FINGIÓ ───────────── */
const FAKE = 86;
export const SceneOneInFive: React.FC = () => {
  const frame = useCurrentFrame();
  const spot = interpolate(frame, [30, 44], [0, 1], clamp);
  const chosenX = 740;
  return (
    <AbsoluteFill>
      <Office />
      {WORKERS.slice(0, 5).map((w, i) => {
        const x = 140 + i * 200;
        const chosen = i === 3;
        return (
          <Character
            key={i}
            {...w}
            x={x}
            y={G}
            height={270}
            pose={chosen && frame >= FAKE ? "sad" : "idle"}
            mood={chosen ? (frame >= FAKE ? "worried" : frame >= 30 ? "happy" : "neutral") : "neutral"}
            sick={chosen && frame >= FAKE}
            thermometer={chosen && frame >= FAKE}
            phase={i * 9}
          />
        );
      })}
      {/* spotlight on the chosen one */}
      <AbsoluteFill style={{ opacity: spot * 0.75, background: `radial-gradient(circle 210px at ${chosenX}px 1290px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 85%, rgba(5,8,20,1) 100%)` }} />
      <OfficeBoard present={5} total={5} date="17 SEP 13" />
      <BigText top={440} size={140} at={8}>
        1 DE CADA 5
      </BigText>
      <Caption name="Fingir" delay={40} accentWords="enfermo" accent={V.sick} style={{ top: 620, fontSize: 74 }}>
        iba a llamar fingiendo estar enfermo
      </Caption>
      <div style={{ position: "absolute", left: chosenX - 60, top: 980, width: 120, textAlign: "center", fontFamily: display, fontSize: 100, color: V.red, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", opacity: spot, translate: `0 ${Math.sin(frame * 0.3) * 8}px` }}>
        ↓
      </div>
      <StatusChip before="sano" after="fingiendo" changeAt={FAKE} />
      <Sfx name="Ding spot" file="ding.wav" from={30} volume={0.4} />
      <Sfx name="Cof" file="groan.wav" from={FAKE} volume={0.5} durationInFrames={30} />
    </AbsoluteFill>
  );
};

/* ───────────── 5. LA LLAMADA ───────────── */
const WINK = 96;
export const SceneCall: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = frame < 26 ? Math.sin(frame * 2.2) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {/* top half: the boss at the office */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 955, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -480, width: 1080, height: 1920 }}>
          <Office />
          <Character {...BOSS} x={330} y={1440} height={330} pose="idle" holding="phone" mood={frame > WINK ? "worried" : "neutral"} />
          <Desk x={740} y={1440} w={360} />
        </div>
        <div style={{ position: "absolute", left: 40, top: 250, padding: "4px 22px", borderRadius: 14, background: "#2E6BD8", color: C.white, fontFamily: display, fontSize: 46, border: `5px solid ${C.ink}` }}>EL JEFE · 9:00</div>
      </div>
      {/* bottom half: the gamer at home */}
      <div style={{ position: "absolute", left: 0, top: 965, width: 1080, height: 955, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: -820, width: 1080, height: 1920 }}>
          <Room />
          <CouchBack top={1400} />
          <Character
            {...GAMER}
            x={540}
            y={SEAT_Y}
            height={420}
            pose="idle"
            holding={frame >= WINK ? "controller" : "phone"}
            mood={frame >= WINK ? "happy" : "worried"}
            sick={frame < WINK}
            thermometer
            lift={ring}
          />
          <Couch top={1400} />
        </div>
      </div>
      <Bubble at={CALL_VOICE_FROM + 2} left={260} top={1020} width={560} size={56} tail="down">
        Cof, cof... Jefe, hoy no puedo ir
      </Bubble>
      {frame >= WINK && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: display, fontSize: 70, color: C.white, background: V.pink, padding: "4px 30px", borderRadius: 20, border: `6px solid ${C.ink}`, rotate: "-5deg", scale: `${interpolate(frame - WINK, [0, 5, 10], [0, 1.2, 1], clamp)}` }}>
            *empieza a jugar*
          </div>
        </div>
      )}
      <Sfx name="Ring" file="ring.wav" from={0} volume={0.7} durationInFrames={30} />
      <Sfx name="Ding guiño" file="ding.wav" from={WINK} volume={0.4} />
    </AbsoluteFill>
  );
};


/* ───────────── 6. COLAS A MEDIANOCHE ───────────── */
const MIDNIGHT = 62;
export const SceneQueue: React.FC = () => {
  const frame = useCurrentFrame();
  const open = frame >= MIDNIGHT;
  return (
    <AbsoluteFill>
      <Street />
      <MinuteBadge text={open ? "17 SEP · 00:00" : "16 SEP · 23:59"} color={open ? V.red : "#3A2C5E"} top={250} />
      <BigText top={360} size={110} at={4} color={V.yellow}>
        COLAS A MEDIANOCHE
      </BigText>
      {FANS.map((f, i) => {
        const x = 620 - i * 120 + (open ? Math.min(frame - MIDNIGHT, 40) * 2 : 0);
        return (
          <Character
            key={i}
            {...f}
            x={x}
            y={1420 + (i % 2) * 30}
            height={250}
            pose={open ? (i % 2 ? "celebrate" : "run") : "wait"}
            mood={open ? "happy" : "neutral"}
            phase={i * 11}
          />
        );
      })}
      {open && <Confetti start={MIDNIGHT} colors={[V.pink, V.cyan, V.yellow]} count={50} />}
      <Sfx name="Público medianoche" file="roar.wav" from={MIDNIGHT} volume={0.35} />
    </AbsoluteFill>
  );
};

/* ───────────── 7. 800 MILLONES EN UN DÍA ───────────── */
const DAY1_END = 80;
const DAY3 = 104;
const RECORD = 152;
const fmt = (n: number) => n.toLocaleString("es-ES").replace(/\s/g, ".");
export const SceneMoney: React.FC = () => {
  const frame = useCurrentFrame();
  const value =
    frame < DAY3
      ? Math.round(interpolate(frame, [16, DAY1_END], [0, 800], { ...clamp, easing: Easing.out(Easing.quad) })) * 1_000_000
      : 1_000_000_000;
  const bump = frame >= DAY3 ? interpolate(frame - DAY3, [0, 5, 12], [1.25, 0.95, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{ translate: `${shakeX(frame, RECORD, 22)}px 0` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${V.money} 0%, #0B2A1A 80%)` }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 3px, transparent 4px)", backgroundSize: "60px 60px" }} />
      <MinuteBadge text="RESULTADO" color={V.moneyDark} top={250} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: display, fontSize: 118, color: C.white, WebkitTextStroke: `14px ${C.ink}`, paintOrder: "stroke fill", scale: `${bump}`, fontVariantNumeric: "tabular-nums" }}>
        ${fmt(value)}
      </div>
      <BigText key={frame >= DAY3 ? "d3" : "d1"} top={540} size={96} at={frame >= DAY3 ? DAY3 : 20} color={frame >= DAY3 ? V.yellow : "#7CFFA6"}>
        {frame >= DAY3 ? "EN SOLO 3 DÍAS" : "EN 24 HORAS"}
      </BigText>
      <Confetti start={DAY3} colors={["#7CFFA6", "#3BB273", "#1F6E45"]} count={70} />
      <Character {...GAMER} x={540} y={G} height={340} pose={frame >= DAY3 ? "celebrate" : "idle"} mood="happy" holding="controller" />
      <Stamp text="¡RÉCORD MUNDIAL!" at={RECORD} top={760} size={92} color="#D4A017" rotate={-8} />
      <Flash amount={interpolate(frame, [DAY3, DAY3 + 2, DAY3 + 8], [0, 0.7, 0], clamp)} />
      <Sfx name="Caja 800M" file="cash.wav" from={DAY1_END - 4} volume={0.7} />
      <Sfx name="Caja 1000M" file="cash.wav" from={DAY3} volume={0.8} />
      <Sfx name="Boom récord" file="boom.wav" from={RECORD} volume={0.9} />
      <Sfx name="Público récord" file="roar.wav" from={RECORD} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── 8. OFICINAS VACÍAS ───────────── */
export const SceneOffice: React.FC = () => {
  const frame = useCurrentFrame();
  const bx = interpolate(frame, [0, 120], [120, 900], clamp);
  return (
    <AbsoluteFill>
      <Office />
      {[200, 540, 880].map((x, i) => (
        <React.Fragment key={x}>
          <Chair x={x} y={1150} spin={Math.sin(frame * 0.06 + i) * 6} />
          <Desk x={x} y={1210} w={280} screen="off" />
        </React.Fragment>
      ))}
      <Character {...BOSS} x={bx} y={1470} height={300} pose="run" mood="worried" phase={0} />
      {[0, 1, 2].map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            left: bx - 70 + k * 55,
            top: 1060 - Math.abs(Math.sin(frame * 0.2 + k)) * 30,
            fontFamily: display,
            fontSize: 80,
            color: V.yellow,
            WebkitTextStroke: `8px ${C.ink}`,
            paintOrder: "stroke fill",
            opacity: interpolate(frame, [20 + k * 8, 26 + k * 8], [0, 1], clamp),
          }}
        >
          ?
        </div>
      ))}
      <OfficeBoard present={12} total={12} to={1} changeAt={8} changeLen={46} date="17 SEP 13" />
      <Caption name="Oficinas" delay={6} accentWords="vacías confundidos" accent={V.red} style={{ top: 430, fontSize: 80 }}>
        Sillas vacías y jefes confundidos
      </Caption>
      <Sfx name="Ding vacío" file="ding.wav" from={54} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── 9. TRECE AÑOS DESPUÉS ───────────── */
const SIX = 48;
export const SceneLater: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 130], [1, 1.12], clamp);
  return (
    <AbsoluteFill>
      <NeonSky zoom={zoom} />
      <BigText top={250} size={100} at={2} color={V.cyan} glow={V.cyan}>
        13 AÑOS DESPUÉS
      </BigText>
      <CalendarPage day="19" month="NOVIEMBRE" year="2026" at={SIX - 10} top={420} color={V.pink} />
      <Stamp text="¡MAÑANA!" at={SIX + 12} top={1020} size={110} color={V.red} rotate={8} />
      <Caption name="Asustan" delay={70} accentWords="asustan" accent={V.pink} style={{ top: 1240, fontSize: 80 }}>
        Sale GTA VI. Y los números asustan
      </Caption>
      <Vhs amount={interpolate(frame, [0, 10], [0.7, 0], clamp)} />
      <Sfx name="Glitch" file="glitch.wav" from={0} volume={0.6} />
      <Sfx name="Latido" file="heartbeat.wav" from={SIX} volume={0.7} durationInFrames={90} />
      <Sfx name="Boom mañana" file="boom.wav" from={SIX + 12} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ───────────── 10. 1,5 MILLONES · 1.000 MILLONES A LA BASURA ───────────── */
const PEOPLE = [24, 96] as const;
const TRASH = 130;
const BIN_STAMP = 186;
export const SceneNumbers: React.FC = () => {
  const frame = useCurrentFrame();
  const people = Math.round(interpolate(frame, PEOPLE, [0, 1_500_000], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const heads = 96;
  const shown = Math.floor(interpolate(frame, PEOPLE, [0, heads], clamp));
  const lidOpen = interpolate(frame, [TRASH - 6, TRASH + 4], [0, -35], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #5B1E8C 0%, #14062E 80%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 255, textAlign: "center", fontFamily: body, fontWeight: 900, fontSize: 40, color: "rgba(255,255,255,0.85)", letterSpacing: 2 }}>
        ESTIMACIÓN DE UN ECONOMISTA · EE.UU.
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 310, textAlign: "center", fontFamily: display, fontSize: 150, color: V.cyan, WebkitTextStroke: `16px ${C.ink}`, paintOrder: "stroke fill", fontVariantNumeric: "tabular-nums" }}>
        {fmt(people)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", fontFamily: display, fontSize: 64, color: C.white, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill" }}>
        PODRÍAN FALTAR AL TRABAJO
      </div>
      {/* grid of little absent workers */}
      <svg style={{ position: "absolute", left: 90, top: 590 }} width={900} height={400}>
        {new Array(heads).fill(0).map((_, i) => {
          const cx = 25 + (i % 16) * 56;
          const cy = 30 + Math.floor(i / 16) * 64;
          const on = i < shown;
          const col = [V.pink, V.cyan, V.yellow, "#7CFFA6"][i % 4];
          return on ? (
            <g key={i}>
              <circle cx={cx} cy={cy} r={18} fill={col} stroke={C.ink} strokeWidth={4} />
              <rect x={cx - 18} y={cy + 16} width={36} height={22} rx={10} fill={col} stroke={C.ink} strokeWidth={4} />
            </g>
          ) : null;
        })}
      </svg>
      {frame >= TRASH - 24 && (
        <BigText top={1020} size={110} at={TRASH - 24} color="#7CFFA6">
          $1.000 MILLONES
        </BigText>
      )}
      {/* bills falling into the bin */}
      {new Array(14).fill(0).map((_, i) => {
        const start = TRASH - 10 + i * 3;
        const t = frame - start;
        if (t < 0) return null;
        const y = Math.min(1200 + t * t * 1.4, 1500);
        const x = 540 + (random(`bx${i}`) - 0.5) * 260 * Math.max(0, 1 - t / 22);
        return y >= 1500 ? null : (
          <div key={i} style={{ position: "absolute", left: x - 50, top: y, width: 100, height: 50, borderRadius: 6, background: V.money, border: `4px solid ${C.ink}`, rotate: `${t * 14 + i * 30}deg`, fontFamily: display, fontSize: 32, color: "#E8FFE8", textAlign: "center" }}>
            $
          </div>
        );
      })}
      {/* trash bin */}
      <div style={{ position: "absolute", left: 400, top: 1480, width: 280, height: 260, borderRadius: "0 0 30px 30px", background: "#6F7E8C", border: `8px solid ${C.ink}`, backgroundImage: "repeating-linear-gradient(90deg, transparent 0 40px, rgba(0,0,0,0.2) 40px 50px)" }} />
      <div style={{ position: "absolute", left: 380, top: 1450, width: 320, height: 40, borderRadius: 14, background: "#8B9AA8", border: `8px solid ${C.ink}`, rotate: `${lidOpen}deg`, transformOrigin: "0% 100%" }} />
      <Stamp text="A LA BASURA" at={BIN_STAMP} top={1290} size={88} />
      <Sfx name="Ding gente" file="ding.wav" from={PEOPLE[1]} volume={0.4} />
      <Sfx name="Caja" file="cash.wav" from={TRASH - 24} volume={0.5} />
      <Sfx name="Golpe basura" file="kick.wav" from={TRASH + 14} volume={0.8} />
      <Sfx name="Boom basura" file="boom.wav" from={BIN_STAMP} volume={0.7} />
    </AbsoluteFill>
  );
};

/* ───────────── 11. DIAGNÓSTICO: FIEBRE DE VICE CITY ───────────── */
const NOT_FLU = 74;
const VICE = 98;
export const SceneDiagnosis: React.FC = () => {
  const frame = useCurrentFrame();
  const vice = frame >= VICE;
  const card = interpolate(frame, [VICE, VICE + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const coughs = [18, 46];
  return (
    <AbsoluteFill style={{ translate: `${shakeX(frame, VICE, 16)}px 0` }}>
      {vice ? <NeonSky zoom={1.05} /> : <Office />}
      <Character
        {...WORKERS[0]}
        x={540}
        y={1200}
        height={380}
        pose={vice ? "celebrate" : "sad"}
        mood={vice ? "happy" : "worried"}
        sick={!vice}
        thermometer
        holding={vice ? "controller" : undefined}
      />
      <Desk x={540} y={1420} w={440} screen={vice ? "game" : "on"} />
      {!vice &&
        coughs.map((c) =>
          frame >= c && frame < c + 26 ? (
            <div key={c} style={{ position: "absolute", left: 700, top: 820 - (frame - c) * 2, fontFamily: display, fontSize: 70, color: C.white, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", rotate: "10deg", opacity: interpolate(frame - c, [0, 4, 20, 26], [0, 1, 1, 0]) }}>
              COF COF
            </div>
          ) : null,
        )}
      {!vice && (
        <Caption name="Tose raro" delay={4} accentWords="raro..." accent={V.sick} style={{ top: 330, fontSize: 80, color: C.white }}>
          Si mañana tu compañero tose raro...
        </Caption>
      )}
      {!vice && <Stamp text="NO ES GRIPE" at={NOT_FLU} top={1400} size={96} />}
      {vice && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 270, opacity: card, scale: `${0.6 + card * 0.4}`, rotate: "-3deg", borderRadius: 30, padding: "20px 30px 30px", background: "rgba(20,6,46,0.9)", border: `8px solid ${V.cyan}`, boxShadow: `0 0 50px ${V.pink}`, textAlign: "center" }}>
          <div style={{ fontFamily: body, fontWeight: 900, fontSize: 46, letterSpacing: 4, color: V.cyan }}>DIAGNÓSTICO</div>
          <div style={{ fontFamily: display, fontSize: 116, lineHeight: 1, color: V.pink, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", textShadow: `0 0 30px ${V.pink}` }}>
            FIEBRE DE VICE CITY
          </div>
        </div>
      )}
      <StatusChip before="enfermo" after="fingiendo" changeAt={VICE} label="DIAGNÓSTICO REAL:" />
      <Flash amount={interpolate(frame, [VICE, VICE + 2, VICE + 10], [0, 0.85, 0], clamp)} color="#FFD0F0" />
      <Sfx name="Tos 1" file="groan.wav" from={coughs[0]} volume={0.35} durationInFrames={24} />
      <Sfx name="Boom no gripe" file="boom.wav" from={NOT_FLU} volume={0.6} />
      <Sfx name="Glitch vice" file="glitch.wav" from={VICE - 2} volume={0.5} />
      <Sfx name="Público vice" file="roar.wav" from={VICE} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ───────────── 12. CTA ───────────── */
export const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const opt = (at: number) => interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const pulse = 1 + Math.max(0, Math.sin((frame - 80) * 0.25)) * 0.05 * (frame > 80 ? 1 : 0);
  return (
    <AbsoluteFill>
      <Room />
      <AbsoluteFill style={{ background: "rgba(10,6,30,0.45)" }} />
      <Caption name="Pregunta" delay={4} accentWords="trabajar enfermar?" accent={V.pink} style={{ top: 250, fontSize: 88 }}>
        ¿Mañana vas a trabajar... o te vas a enfermar?
      </Caption>
      <div style={{ position: "absolute", left: 110, right: 110, top: 610, display: "flex", flexDirection: "column", gap: 22 }}>
        {[
          { k: "A", t: "VOY A TRABAJAR", bg: "#2E6BD8", at: 30, s: 1 },
          { k: "B", t: "ME ENFERMO", bg: V.pink, at: 60, s: pulse },
        ].map((o) => (
          <div key={o.k} style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 24px", borderRadius: 26, background: o.bg, border: `7px solid ${C.ink}`, fontFamily: display, fontSize: 62, color: C.white, scale: `${opt(o.at) * o.s}`, boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
            <span style={{ background: C.white, color: C.ink, borderRadius: 16, padding: "0 20px", border: `5px solid ${C.ink}` }}>{o.k}</span>
            {o.t}
          </div>
        ))}
      </div>
      <CouchBack top={1400} />
      <Character {...GAMER} x={540} y={SEAT_Y} height={420} pose="idle" mood="happy" thermometer holding="controller" />
      <Couch top={1400} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1530, textAlign: "center", fontFamily: display, fontSize: 64, color: V.yellow, WebkitTextStroke: `8px ${C.ink}`, paintOrder: "stroke fill", opacity: interpolate(frame, [100, 110], [0, 1], clamp) }}>
        TE LEO EN COMENTARIOS
      </div>
      <Sfx name="Pop A" file="ding.wav" from={30} volume={0.3} />
      <Sfx name="Pop B" file="ding.wav" from={60} volume={0.3} />
    </AbsoluteFill>
  );
};
