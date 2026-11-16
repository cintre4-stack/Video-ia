import React from "react";
import { DoubleSide } from "three";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";

type V3 = [number, number, number];

/** Sartén sobre el fogón. Los ingredientes van como children (superficie en y=0). */
export const Pan: React.FC<{ children?: React.ReactNode; position?: V3 }> = ({ children, position = [0, 0.02, -0.35] }) => (
  <group position={position}>
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.66, 0.56, 0.2, 48, 1, true]} />
      <meshStandardMaterial color="#3A3F46" roughness={0.35} metalness={0.4} side={DoubleSide} />
    </mesh>
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.56, 48]} />
      <meshStandardMaterial color="#25282D" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.66, 0.025, 8, 48]} />
      <meshStandardMaterial color="#555B63" roughness={0.3} metalness={0.5} />
    </mesh>
    {/* Mango */}
    <mesh position={[0.98, 0.16, 0.18]} rotation={[0, -0.4, 0.12]}>
      <boxGeometry args={[0.7, 0.07, 0.12]} />
      <meshStandardMaterial color={C.woodDark} roughness={0.6} />
    </mesh>
    <group position={[0, 0.03, 0]}>{children}</group>
  </group>
);

/** Cazo alto para la bechamel. */
export const Pot: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <group position={[0, 0.02, -0.35]}>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.55, 0.52, 0.5, 48, 1, true]} />
      <meshStandardMaterial color={C.steel} roughness={0.25} metalness={0.6} side={DoubleSide} />
    </mesh>
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.52, 48]} />
      <meshStandardMaterial color={C.steelDark} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.55, 0.025, 8, 48]} />
      <meshStandardMaterial color={C.steel} roughness={0.2} metalness={0.7} />
    </mesh>
    <mesh position={[-0.9, 0.42, 0.15]} rotation={[0, 0.3, -0.1]}>
      <boxGeometry args={[0.75, 0.07, 0.12]} />
      <meshStandardMaterial color="#2C2C2C" roughness={0.6} />
    </mesh>
    <group position={[0, 0.03, 0]}>{children}</group>
  </group>
);

/** Disco de líquido (salsa, bechamel) dentro de un recipiente. */
export const Liquid: React.FC<{ radius: number; level: number; color: string; shine?: number }> = ({
  radius,
  level,
  color,
  shine = 0.25,
}) =>
  level <= 0.001 ? null : (
    <mesh position={[0, level / 2, 0]}>
      <cylinderGeometry args={[radius, radius * 0.97, level, 48]} />
      <meshStandardMaterial color={color} roughness={shine} />
    </mesh>
  );

/** Trozo que cae desde arriba y rebota al llegar a su sitio. */
export const useDrop = (start: number, from: V3, to: V3, dur = 14): V3 => {
  const f = useCurrentFrame();
  const t = interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const bounce = f > start + dur ? Math.max(0, Math.sin((f - start - dur) * 0.6)) * 0.06 * Math.exp(-(f - start - dur) * 0.15) : 0;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t + bounce, from[2] + (to[2] - from[2]) * t];
};

/** Muchos trocitos que caen escalonados en un recipiente redondo. */
export const Pieces: React.FC<{
  seed: string;
  count: number;
  start: number;
  every: number;
  radius: number;
  y?: number;
  color: string | ((i: number) => string);
  shape: "cube" | "ball" | "flake";
  size: number;
  /** Desplazamiento lateral del punto de caída (p. ej. tabla de cortar). */
  fromOffset?: V3;
  jitter?: number;
}> = ({ seed, count, start, every, radius, y = 0.03, color, shape, size, fromOffset = [0, 1.6, 0], jitter = 0 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const a = random(`${seed}-a-${i}`) * Math.PI * 2;
      const r = Math.sqrt(random(`${seed}-r-${i}`)) * radius;
      const to: V3 = [Math.cos(a) * r, y + random(`${seed}-y-${i}`) * size, Math.sin(a) * r];
      const from: V3 = [to[0] * 0.3 + fromOffset[0], fromOffset[1], to[2] * 0.3 + fromOffset[2]];
      return (
        <Piece
          key={i}
          start={start + i * every}
          from={from}
          to={to}
          color={typeof color === "string" ? color : color(i)}
          shape={shape}
          size={size * (0.75 + random(`${seed}-s-${i}`) * 0.5)}
          rot={random(`${seed}-rot-${i}`) * 6}
          jitter={jitter}
          phase={i}
        />
      );
    })}
  </>
);

const Piece: React.FC<{
  start: number;
  from: V3;
  to: V3;
  color: string;
  shape: "cube" | "ball" | "flake";
  size: number;
  rot: number;
  jitter: number;
  phase: number;
}> = ({ start, from, to, color, shape, size, rot, jitter, phase }) => {
  const f = useCurrentFrame();
  const p = useDrop(start, from, to);
  if (f < start) return null;
  const j = f > start + 14 ? Math.sin(f * 1.3 + phase * 2.1) * jitter : 0;
  return (
    <mesh position={[p[0], p[1] + Math.abs(j), p[2]]} rotation={[rot, rot * 1.7 + j * 4, rot * 0.5]}>
      {shape === "cube" ? (
        <boxGeometry args={[size, size, size]} />
      ) : shape === "ball" ? (
        <icosahedronGeometry args={[size, 1]} />
      ) : (
        <boxGeometry args={[size, size * 0.2, size * 0.6]} />
      )}
      <meshStandardMaterial color={color} roughness={0.6} flatShading={shape === "ball"} />
    </mesh>
  );
};

/** Vapor: bolitas blancas que suben y se desvanecen. */
export const Steam: React.FC<{ position?: V3; amount?: number; spread?: number; intensity?: number }> = ({
  position = [0, 0.3, -0.35],
  amount = 9,
  spread = 0.45,
  intensity = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <group position={position}>
      {Array.from({ length: amount }).map((_, i) => {
        const period = 50 + random(`st-p-${i}`) * 25;
        const t = ((f + random(`st-o-${i}`) * period) % period) / period;
        const x = (random(`st-x-${i}`) - 0.5) * spread * 2 + Math.sin(t * 6 + i) * 0.08;
        const z = (random(`st-z-${i}`) - 0.5) * spread;
        const op = Math.sin(t * Math.PI) * 0.22 * intensity;
        return (
          <mesh key={i} position={[x, t * 1.1, z]} scale={[0.05 + t * 0.12, 0.08 + t * 0.18, 0.05 + t * 0.12]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={op} depthWrite={false} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Burbujas que aparecen y explotan en una salsa. */
export const Bubbles: React.FC<{ y: number; radius: number; color: string; count?: number }> = ({ y, radius, color, count = 10 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const period = 24 + random(`b-p-${i}`) * 20;
        const t = ((f + random(`b-o-${i}`) * period) % period) / period;
        const a = random(`b-a-${i}`) * Math.PI * 2;
        const r = Math.sqrt(random(`b-r-${i}`)) * radius;
        return (
          <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} scale={Math.sin(t * Math.PI) * 0.035}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.15} />
          </mesh>
        );
      })}
    </>
  );
};

/* ---------- Utensilios (en coordenadas de la mano: el brazo apunta a -y) ---------- */

export const Knife: React.FC = () => (
  <group rotation={[Math.PI / 2, 0, 0]}>
    <mesh position={[0, 0.12, 0]}>
      <boxGeometry args={[0.07, 0.22, 0.07]} />
      <meshStandardMaterial color="#2B2B2B" />
    </mesh>
    <mesh position={[0, 0.42, 0.04]}>
      <boxGeometry args={[0.025, 0.42, 0.14]} />
      <meshStandardMaterial color="#DDE3EA" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

export const Spoon: React.FC = () => (
  <group>
    <mesh position={[0, -0.3, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.6, 12]} />
      <meshStandardMaterial color={C.wood} roughness={0.6} />
    </mesh>
    <mesh position={[0, -0.62, 0]} scale={[1, 1.4, 0.45]}>
      <sphereGeometry args={[0.09, 16, 16]} />
      <meshStandardMaterial color={C.wood} roughness={0.6} />
    </mesh>
  </group>
);

export const Whisk: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group rotation={[0, f * 0.6, 0]}>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.3, 12]} />
        <meshStandardMaterial color={C.tomato} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.48, 0]} rotation={[0, (i * Math.PI) / 4, 0]} scale={[0.6, 1, 1]}>
          <torusGeometry args={[0.18, 0.012, 6, 24]} />
          <meshStandardMaterial color={C.steel} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

export const Shaker: React.FC<{ color: string }> = ({ color }) => (
  <group position={[0, -0.18, 0]} rotation={[Math.PI, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.1, 0.12, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.18, 0]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color={C.steel} metalness={0.7} roughness={0.2} />
    </mesh>
  </group>
);

export const Grater: React.FC = () => (
  <group position={[0, -0.25, 0]} rotation={[0.3, 0, 0]}>
    <mesh>
      <boxGeometry args={[0.28, 0.45, 0.04]} />
      <meshStandardMaterial color={C.steel} metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);

export const Spatula: React.FC = () => (
  <group>
    <mesh position={[0, -0.25, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
      <meshStandardMaterial color="#2C2C2C" />
    </mesh>
    <mesh position={[0, -0.6, 0.06]} rotation={[0.25, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.02]} />
      <meshStandardMaterial color={C.steel} metalness={0.7} roughness={0.25} />
    </mesh>
  </group>
);

/** Tabla de cortar con verduras enteras que van desapareciendo. */
export const Board: React.FC<{ position: V3; children?: React.ReactNode }> = ({ position, children }) => (
  <group position={position}>
    <mesh position={[0, 0.04, 0]}>
      <boxGeometry args={[1.1, 0.08, 0.7]} />
      <meshStandardMaterial color="#D9A066" roughness={0.7} />
    </mesh>
    <group position={[0, 0.08, 0]}>{children}</group>
  </group>
);

/* ---------- Fuente de horno con capas ---------- */

export const DISH = { w: 1.7, d: 1.0, h: 0.5, wall: 0.06 };

export type LayerKind = "pasta" | "carne" | "bechamel" | "queso";
const LAYER: Record<LayerKind, { color: string; h: number }> = {
  pasta: { color: C.pasta, h: 0.035 },
  carne: { color: "#A5321D", h: 0.07 },
  bechamel: { color: C.bechamel, h: 0.05 },
  queso: { color: C.cheese, h: 0.05 },
};

export const layerHeights = (kinds: LayerKind[]) => {
  let y = 0.04;
  return kinds.map((k) => {
    const out = y;
    y += LAYER[k].h;
    return out;
  });
};

/** Fuente de cristal (se ven las capas). `layers` = capas y frame en que caen. */
export const BakingDish: React.FC<{
  position?: V3;
  layers: { kind: LayerKind; at: number }[];
  /** 0..1 dorado del queso. */
  golden?: number;
  /** Rotación Y para enseñar el lateral. */
  rotY?: number;
  /** 0..1 subida del trozo cortado (solo en el final). */
  cut?: number;
}> = ({ position = [0, 0.01, 0.1], layers, golden = 0, rotY = 0, cut }) => {
  const f = useCurrentFrame();
  const ys = layerHeights(layers.map((l) => l.kind));
  const { w, d, h, wall } = DISH;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Base */}
      <mesh position={[0, wall / 2, 0]}>
        <boxGeometry args={[w, wall, d]} />
        <meshStandardMaterial color="#CFE8F0" transparent opacity={0.55} roughness={0.05} />
      </mesh>
      {/* Paredes de cristal */}
      {[
        [0, h / 2, d / 2, w, h, wall],
        [0, h / 2, -d / 2, w, h, wall],
        [w / 2, h / 2, 0, wall, h, d],
        [-w / 2, h / 2, 0, wall, h, d],
      ].map(([x, y, z, sx, sy, sz], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color="#D8F1F8" transparent opacity={0.28} roughness={0.05} depthWrite={false} />
        </mesh>
      ))}
      {/* Asas */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 + 0.1), h * 0.8, 0]}>
          <boxGeometry args={[0.18, 0.05, 0.45]} />
          <meshStandardMaterial color="#D8F1F8" transparent opacity={0.5} roughness={0.05} />
        </mesh>
      ))}
      {layers.map((l, i) => {
        if (f < l.at) return null;
        const t = interpolate(f, [l.at, l.at + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
        const drop = (1 - t) * 1.2;
        const spec = LAYER[l.kind];
        const isTop = l.kind === "queso";
        const color = isTop
          ? interpolateHex(C.cheese, C.crust, golden)
          : spec.color;
        const iw = w - wall * 1.2;
        const id = d - wall * 1.2;
        const mat = <meshStandardMaterial color={color} roughness={isTop ? 0.45 - golden * 0.15 : 0.55} />;
        if (cut !== undefined) {
          // Lasaña cortada: el trozo de la derecha se levanta con la espátula.
          const sw = 0.42;
          const sd = id / 2;
          return (
            <group key={i}>
              <mesh position={[-sw / 2, ys[i] + spec.h / 2, 0]}>
                <boxGeometry args={[iw - sw, spec.h, id]} />
                {mat}
              </mesh>
              <mesh position={[iw / 2 - sw / 2, ys[i] + spec.h / 2, -sd / 2]}>
                <boxGeometry args={[sw, spec.h, sd]} />
                {mat}
              </mesh>
              <mesh position={[iw / 2 - sw / 2, ys[i] + spec.h / 2 + cut * 0.5, sd / 2 + cut * 0.5]} rotation={[cut * 0.15, 0, 0]}>
                <boxGeometry args={[sw, spec.h, sd]} />
                {mat}
              </mesh>
            </group>
          );
        }
        return (
          <mesh key={i} position={[0, ys[i] + spec.h / 2 + drop, 0]} scale={[0.6 + t * 0.4, 1, 0.6 + t * 0.4]}>
            <boxGeometry args={[iw, spec.h, id]} />
            {mat}
          </mesh>
        );
      })}
      {/* Manchas tostadas del gratinado */}
      {golden > 0.3 &&
        Array.from({ length: 22 }).map((_, i) => {
          const top = ys[ys.length - 1] + LAYER.queso.h + 0.005;
          const gx = (random(`g-x-${i}`) - 0.5) * (w - 0.25);
          if (cut !== undefined && gx > w / 2 - 0.55) return null;
          return (
            <mesh
              key={`g${i}`}
              position={[gx, top, (random(`g-z-${i}`) - 0.5) * (d - 0.25)]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={(golden - 0.3) * 1.4}
            >
              <circleGeometry args={[0.04 + random(`g-s-${i}`) * 0.06, 12]} />
              <meshStandardMaterial color="#B5621C" roughness={0.6} />
            </mesh>
          );
        })}
    </group>
  );
};

export const interpolateHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const k = Math.max(0, Math.min(1, t));
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * k);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
};

/** Horno con puerta de cristal iluminada. */
export const Oven: React.FC<{ glow: number; doorOpen?: number; dial?: number; children?: React.ReactNode }> = ({
  glow,
  doorOpen = 0,
  dial = 0,
  children,
}) => (
  <group position={[0, 0, 0.1]}>
    {/* Carcasa hueca: suelo, techo, laterales y fondo */}
    {[
      [0, 0.08, -0.25, 2.3, 0.16, 1.5],
      [0, 1.36, -0.25, 2.3, 0.28, 1.5],
      [-1.075, 0.75, -0.25, 0.15, 1.5, 1.5],
      [1.075, 0.75, -0.25, 0.15, 1.5, 1.5],
      [0, 0.75, -1.0, 2.3, 1.5, 0.02],
    ].map(([x, y, z, sx, sy, sz], i) => (
      <mesh key={i} position={[x, y, z]}>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial color="#E9ECEF" roughness={0.3} metalness={0.2} />
      </mesh>
    ))}
    {/* Rejilla */}
    <mesh position={[0, 0.22, -0.25]}>
      <boxGeometry args={[1.95, 0.02, 1.4]} />
      <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
    </mesh>
    {/* Interior iluminado */}
    <mesh position={[0, 0.66, -0.98]}>
      <boxGeometry args={[1.9, 0.95, 0.02]} />
      <meshStandardMaterial color="#2A1408" emissive="#FF8A2A" emissiveIntensity={glow * 0.9} />
    </mesh>
    <group position={[0, 0.66, 0.15]}>{children}</group>
    {/* Puerta (bisagra abajo) */}
    <group position={[0, 0.16, 0.53]} rotation={[doorOpen * 1.45, 0, 0]}>
      <mesh position={[0, 0.5, 0.03]}>
        <boxGeometry args={[2.1, 1.0, 0.06]} />
        <meshStandardMaterial color="#3B3F45" roughness={0.3} metalness={0.4} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 1.02, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 12]} />
        <meshStandardMaterial color={C.steel} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
    {/* Panel de mandos */}
    <mesh position={[0, 1.36, 0.51]}>
      <boxGeometry args={[2.3, 0.24, 0.04]} />
      <meshStandardMaterial color="#2E3238" roughness={0.4} />
    </mesh>
    {[-0.75, 0.75].map((x, i) => (
      <group key={x} position={[x, 1.36, 0.56]} rotation={[Math.PI / 2, i === 0 ? dial : 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 20]} />
          <meshStandardMaterial color={C.steel} metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.04, 0.05]}>
          <boxGeometry args={[0.02, 0.02, 0.08]} />
          <meshStandardMaterial color={C.tomato} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, 1.36, 0.54]}>
      <boxGeometry args={[0.6, 0.14, 0.01]} />
      <meshStandardMaterial color="#111" emissive="#FF5A1F" emissiveIntensity={glow > 0.05 ? 0.9 : 0} />
    </mesh>
  </group>
);
