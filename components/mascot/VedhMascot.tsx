'use client'

import React from 'react'

export type VedhExpression = 'idle' | 'thinking' | 'alert' | 'happy'

interface VedhMascotProps {
  expression?: VedhExpression
  size?: number | string
  className?: string
  showBadge?: boolean
  showGlow?: boolean
}

export const VedhMascot: React.FC<VedhMascotProps> = ({
  expression = 'idle',
  size = 140,
  className = '',
  showBadge = true,
  showGlow = true,
}) => {
  // Color tokens based on expression
  const visorColors = {
    idle: {
      fill: 'url(#visorGlowIdle)',
      stroke: '#39FF14',
      glow: 'rgba(57, 255, 20, 0.45)',
      hudText: 'READY',
      hudColor: '#39FF14',
    },
    thinking: {
      fill: 'url(#visorGlowThinking)',
      stroke: '#00E5FF',
      glow: 'rgba(0, 229, 255, 0.5)',
      hudText: 'PROBING…',
      hudColor: '#00E5FF',
    },
    alert: {
      fill: 'url(#visorGlowAlert)',
      stroke: '#FF9F1C',
      glow: 'rgba(255, 159, 28, 0.55)',
      hudText: 'LATENT DEFECT',
      hudColor: '#FF3B3B',
    },
    happy: {
      fill: 'url(#visorGlowHappy)',
      stroke: '#39FF14',
      glow: 'rgba(57, 255, 20, 0.65)',
      hudText: 'PASS 168h',
      hudColor: '#39FF14',
    },
  }[expression]

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Vedh the astronaut frog mascot in ${expression} state`}
    >
      {/* Background radial glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700 opacity-60"
          style={{
            backgroundColor: visorColors.glow,
            transform: 'scale(0.85)',
          }}
        />
      )}

      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-500"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="suitGradient" x1="0" y1="0" x2="200" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1C2826" />
            <stop offset="50%" stopColor="#0E1614" />
            <stop offset="100%" stopColor="#080D0B" />
          </linearGradient>

          <linearGradient id="helmetGradient" x1="50" y1="20" x2="150" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A3D36" />
            <stop offset="60%" stopColor="#121D18" />
            <stop offset="100%" stopColor="#070C0A" />
          </linearGradient>

          <linearGradient id="visorGlowIdle" x1="60" y1="50" x2="140" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#082A16" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0E4524" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#05180D" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="visorGlowThinking" x1="60" y1="50" x2="140" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#04202C" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#073B4C" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#03141B" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="visorGlowAlert" x1="60" y1="50" x2="140" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#361704" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#542407" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#230E03" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="visorGlowHappy" x1="60" y1="50" x2="140" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B381A" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#145A2C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06220F" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="goldTrims" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9F1C" />
            <stop offset="100%" stopColor="#FFD166" />
          </linearGradient>
        </defs>

        {/* Life support backpack */}
        <rect x="52" y="115" width="96" height="75" rx="14" fill="#0D1613" stroke="#253D32" strokeWidth="2" />
        <rect x="62" y="130" width="16" height="45" rx="6" fill="#15241E" />
        <rect x="122" y="130" width="16" height="45" rx="6" fill="#15241E" />
        <circle cx="100" cy="150" r="10" fill="#0A110E" stroke="#39FF14" strokeWidth="1.5" />

        {/* Spacesuit Body */}
        <path
          d="M 58 135 C 58 120 142 120 142 135 L 152 195 C 152 205 136 212 100 212 C 64 212 48 205 48 195 Z"
          fill="url(#suitGradient)"
          stroke="#2A3D36"
          strokeWidth="2"
        />

        {/* Neon Green Suit Seams */}
        <path d="M 68 140 Q 100 152 132 140" stroke="#39FF14" strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        <path d="M 100 152 L 100 205" stroke="#39FF14" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />

        {/* ISRO / Team GSR NEXUS Mission Chest Patch */}
        {showBadge && (
          <g transform="translate(74, 160)">
            <rect x="0" y="0" width="22" height="14" rx="2" fill="#060A08" stroke="#39FF14" strokeWidth="1" />
            <circle cx="6" cy="7" r="3" fill="#FF9F1C" />
            <line x1="12" y1="5" x2="19" y2="5" stroke="#F8FAFC" strokeWidth="1" />
            <line x1="12" y1="9" x2="17" y2="9" stroke="#8A94A6" strokeWidth="1" />
          </g>
        )}

        {/* Helmet Neck Ring */}
        <ellipse cx="100" cy="126" rx="46" ry="14" fill="#14201B" stroke="#39FF14" strokeWidth="2" />

        {/* Space Helmet Sphere */}
        <circle cx="100" cy="76" r="54" fill="url(#helmetGradient)" stroke="#2C4037" strokeWidth="2.5" />

        {/* Antenna with Blinking Signal */}
        <line x1="100" y1="22" x2="100" y2="6" stroke="#4E685D" strokeWidth="2.5" strokeLinecap="round" />
        <circle
          cx="100"
          cy="5"
          r="4.5"
          fill={expression === 'alert' ? '#FF3B3B' : expression === 'thinking' ? '#00E5FF' : '#39FF14'}
          className={expression === 'thinking' ? 'animate-ping' : ''}
        />
        <circle
          cx="100"
          cy="5"
          r="2.5"
          fill="#FFFFFF"
        />

        {/* Large Visor Shield */}
        <ellipse
          cx="100"
          cy="78"
          rx="42"
          ry="34"
          fill={visorColors.fill}
          stroke={visorColors.stroke}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Visor Glare / Glass Reflection Highlights */}
        <path
          d="M 68 58 C 82 50 114 50 130 58 C 122 55 90 55 74 60 Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />

        {/* Frog Inside Visor */}
        <g id="frog-face" className="transition-all duration-300">
          {/* Frog Cheeks & Chin (Vibrant Space Green) */}
          <ellipse cx="100" cy="85" rx="30" ry="20" fill="#2ECC71" />

          {/* Left Eye Bulge */}
          <circle cx="80" cy="68" r="14" fill="#2ECC71" />
          <circle cx="80" cy="68" r="11" fill="#FFFFFF" />

          {/* Right Eye Bulge */}
          <circle cx="120" cy="68" r="14" fill="#2ECC71" />
          <circle cx="120" cy="68" r="11" fill="#FFFFFF" />

          {/* Eye Pupils according to Expression */}
          {expression === 'idle' && (
            <>
              <circle cx="82" cy="68" r="6" fill="#0A1C12" />
              <circle cx="122" cy="68" r="6" fill="#0A1C12" />
              <circle cx="84" cy="66" r="2" fill="#FFFFFF" />
              <circle cx="124" cy="66" r="2" fill="#FFFFFF" />
            </>
          )}

          {expression === 'thinking' && (
            <>
              {/* Looking up thoughtfully */}
              <circle cx="80" cy="63" r="5.5" fill="#0A1C12" />
              <circle cx="120" cy="63" r="5.5" fill="#0A1C12" />
              <circle cx="82" cy="61" r="2" fill="#FFFFFF" />
              <circle cx="122" cy="61" r="2" fill="#FFFFFF" />
            </>
          )}

          {expression === 'alert' && (
            <>
              {/* Wide alert eyes */}
              <circle cx="80" cy="68" r="7.5" fill="#1C0A0A" />
              <circle cx="120" cy="68" r="7.5" fill="#1C0A0A" />
              <circle cx="82" cy="66" r="2" fill="#FF9F1C" />
              <circle cx="122" cy="66" r="2" fill="#FF9F1C" />
            </>
          )}

          {expression === 'happy' && (
            <>
              {/* Cheerful inverted arc eyes */}
              <path d="M 74 69 Q 80 62 86 69" stroke="#0A1C12" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 114 69 Q 120 62 126 69" stroke="#0A1C12" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Frog Nostrils */}
          <circle cx="97" cy="80" r="1.5" fill="#196F3D" />
          <circle cx="103" cy="80" r="1.5" fill="#196F3D" />

          {/* Frog Mouth */}
          {expression === 'happy' ? (
            <path d="M 88 88 Q 100 98 112 88" stroke="#196F3D" strokeWidth="2.5" fill="#145A32" strokeLinecap="round" />
          ) : expression === 'alert' ? (
            <ellipse cx="100" cy="89" rx="5" ry="3" fill="#196F3D" />
          ) : (
            <path d="M 90 87 Q 100 92 110 87" stroke="#196F3D" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Cheerful blush cheeks */}
          <ellipse cx="76" cy="82" rx="4" ry="2.5" fill="#FF9F1C" fillOpacity="0.45" />
          <ellipse cx="124" cy="82" rx="4" ry="2.5" fill="#FF9F1C" fillOpacity="0.45" />
        </g>

        {/* Visor Scanline HUD Overlay */}
        <path
          d="M 66 75 L 134 75"
          stroke={visorColors.stroke}
          strokeWidth="0.75"
          strokeOpacity="0.4"
          strokeDasharray="3 2"
        />
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fontSize="6"
          fontWeight="bold"
          fill={visorColors.hudColor}
          fontFamily="monospace"
          letterSpacing="0.8"
          opacity="0.85"
        >
          {visorColors.hudText}
        </text>

        {/* Hand with Microchip or Thermometer (Right Arm) */}
        <g id="right-arm-holding-chip">
          {expression === 'happy' ? (
            /* Celebratory pose: holding glowing chip high with thumbs-up */
            <g transform="translate(138, 120)">
              <path d="M 0 20 Q 15 10 24 2" stroke="#253D32" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Glove */}
              <circle cx="25" cy="0" r="8" fill="#1C2826" stroke="#39FF14" strokeWidth="1.5" />
              {/* Glowing IC Silicon Chip */}
              <rect x="22" y="-18" width="16" height="16" rx="2" fill="#080E0B" stroke="#39FF14" strokeWidth="1.5" />
              <circle cx="30" cy="-10" r="3" fill="#39FF14" />
              {/* Chip Pins */}
              <line x1="20" y1="-14" x2="22" y2="-14" stroke="#FF9F1C" strokeWidth="1" />
              <line x1="20" y1="-10" x2="22" y2="-10" stroke="#FF9F1C" strokeWidth="1" />
              <line x1="20" y1="-6" x2="22" y2="-6" stroke="#FF9F1C" strokeWidth="1" />
              <line x1="38" y1="-14" x2="40" y2="-14" stroke="#FF9F1C" strokeWidth="1" />
              <line x1="38" y1="-10" x2="40" y2="-10" stroke="#FF9F1C" strokeWidth="1" />
              <line x1="38" y1="-6" x2="40" y2="-6" stroke="#FF9F1C" strokeWidth="1" />
            </g>
          ) : expression === 'alert' ? (
            /* Warning pose: holding precision thermal probe with alert beacon */
            <g transform="translate(136, 135)">
              <path d="M 0 10 Q 12 12 20 4" stroke="#253D32" strokeWidth="12" strokeLinecap="round" fill="none" />
              <circle cx="21" cy="2" r="7.5" fill="#1C2826" stroke="#FF9F1C" strokeWidth="1.5" />
              {/* High-temp burn-in probe */}
              <rect x="20" y="-16" width="6" height="20" rx="3" fill="#0A110E" stroke="#FF3B3B" strokeWidth="1.2" />
              <circle cx="23" cy="-12" r="2" fill="#FF3B3B" />
              <path d="M 23 -16 L 23 -22" stroke="#FF9F1C" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : (
            /* Idle / Thinking pose: inspecting microchip */
            <g transform="translate(132, 142)">
              <path d="M 0 10 Q 10 16 18 10" stroke="#253D32" strokeWidth="11" strokeLinecap="round" fill="none" />
              <circle cx="18" cy="8" r="7" fill="#1C2826" stroke="#39FF14" strokeWidth="1.2" />
              {/* Microchip */}
              <rect x="18" y="-6" width="14" height="14" rx="2" fill="#060A08" stroke="#39FF14" strokeWidth="1.2" />
              <circle cx="25" cy="1" r="2.5" fill="#39FF14" />
              <line x1="22" y1="8" x2="22" y2="10" stroke="#FFD166" strokeWidth="1" />
              <line x1="25" y1="8" x2="25" y2="10" stroke="#FFD166" strokeWidth="1" />
              <line x1="28" y1="8" x2="28" y2="10" stroke="#FFD166" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* Left Arm Resting on Belt */}
        <g id="left-arm">
          <path d="M 64 140 Q 50 152 56 168" stroke="#253D32" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="58" cy="168" r="6.5" fill="#1C2826" stroke="#2C4037" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  )
}
