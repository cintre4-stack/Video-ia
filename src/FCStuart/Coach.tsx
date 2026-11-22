import React from "react";

/** Entrenador chibi 3D (estilo del reel): cabezon, gorra azul, chamarra roja. Dibujado con gradientes. */
export const Coach: React.FC<{ armsUp?: number; mouthOpen?: number; bob?: number }> = ({
  armsUp = 1,
  mouthOpen = 0,
  bob = 0,
}) => {
  const armAngle = -10 - armsUp * 70;
  return (
    <svg viewBox="-200 -260 400 520" width={520} height={676} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="skin" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFD7B0" />
          <stop offset="100%" stopColor="#E9A87A" />
        </radialGradient>
        <linearGradient id="jacket" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FF4A4A" />
          <stop offset="100%" stopColor="#B81818" />
        </linearGradient>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.45)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={250} rx={170} ry={26} fill="url(#shadow)" />
      <g transform={`translate(0 ${-bob})`}>
        {/* Brazos */}
        <g transform={`rotate(${-armAngle} -110 -20)`} style={{ transformOrigin: "-110px -20px" }}>
          <rect x={-150} y={-30} width={60} height={170} rx={30} fill="url(#jacket)" stroke="#5A0808" strokeWidth={6} />
          <circle cx={-120} cy={-50} r={34} fill="url(#skin)" stroke="#5A0808" strokeWidth={5} />
        </g>
        <g transform={`rotate(${armAngle} 110 -20)`} style={{ transformOrigin: "110px -20px" }}>
          <rect x={90} y={-30} width={60} height={170} rx={30} fill="url(#jacket)" stroke="#5A0808" strokeWidth={6} />
          <circle cx={120} cy={-50} r={34} fill="url(#skin)" stroke="#5A0808" strokeWidth={5} />
        </g>
        {/* Chamarra */}
        <rect x={-110} y={60} width={220} height={180} rx={60} fill="url(#jacket)" stroke="#5A0808" strokeWidth={6} />
        <rect x={-110} y={120} width={220} height={14} fill="#FFFFFF" opacity={0.9} />
        <rect x={-40} y={66} width={80} height={60} rx={10} fill="#FFD84A" stroke="#5A0808" strokeWidth={4} />
        <text x={0} y={104} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize={22} fill="#5A0808">
          FC STUART
        </text>
        {/* Cabeza */}
        <circle cx={0} cy={-40} r={150} fill="url(#skin)" stroke="#8A4A2A" strokeWidth={6} />
        {/* Gorra */}
        <path d="M-150 -70 Q-150 -210 0 -210 Q150 -210 150 -70 Z" fill="#1F4FD1" stroke="#0E2A7A" strokeWidth={6} />
        <rect x={-165} y={-84} width={200} height={26} rx={13} fill="#1A3FAA" stroke="#0E2A7A" strokeWidth={6} />
        <circle cx={0} cy={-206} r={14} fill="#FFD84A" stroke="#0E2A7A" strokeWidth={4} />
        {/* Ojos */}
        <ellipse cx={-55} cy={-30} rx={34} ry={40} fill="#FFFFFF" stroke="#3A2010" strokeWidth={5} />
        <ellipse cx={55} cy={-30} rx={34} ry={40} fill="#FFFFFF" stroke="#3A2010" strokeWidth={5} />
        <circle cx={-50} cy={-22} r={16} fill="#1B1B1B" />
        <circle cx={60} cy={-22} r={16} fill="#1B1B1B" />
        <circle cx={-44} cy={-30} r={5} fill="#FFFFFF" />
        <circle cx={66} cy={-30} r={5} fill="#FFFFFF" />
        {/* Cejas gritando */}
        <path d="M-95 -82 L-20 -62" stroke="#3A2010" strokeWidth={10} strokeLinecap="round" />
        <path d="M95 -82 L20 -62" stroke="#3A2010" strokeWidth={10} strokeLinecap="round" />
        {/* Bigote y boca */}
        <path d="M-50 38 Q0 18 50 38 Q0 52 -50 38 Z" fill="#3A2010" />
        <ellipse cx={0} cy={80} rx={46} ry={14 + mouthOpen * 26} fill="#7A1010" stroke="#3A2010" strokeWidth={4} />
        {mouthOpen < 0.5 ? null : <rect x={-24} y={70} width={48} height={12} fill="#FFFFFF" />}
      </g>
    </svg>
  );
};

/** Aficionado del FC Stuart: chamarra roja, cabeza chica. */
export const Fan: React.FC<{ size?: number; jump?: number }> = ({ size = 120, jump = 0 }) => (
  <svg viewBox="-60 -110 120 200" width={size} height={size * (200 / 120)} style={{ overflow: "visible" }}>
    <g transform={`translate(0 ${-jump})`}>
      <rect x={-34} y={20} width={68} height={70} rx={24} fill="#E62E2E" stroke="#5A0808" strokeWidth={4} />
      <circle cx={0} cy={-10} r={42} fill="#FFD7B0" stroke="#8A4A2A" strokeWidth={4} />
      <path d="M-42 -20 Q-42 -60 0 -60 Q42 -60 42 -20 Z" fill="#1F4FD1" stroke="#0E2A7A" strokeWidth={4} />
      <circle cx={-16} cy={-8} r={7} fill="#1B1B1B" />
      <circle cx={16} cy={-8} r={7} fill="#1B1B1B" />
      <path d="M-14 14 Q0 26 14 14" stroke="#7A1010" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);
