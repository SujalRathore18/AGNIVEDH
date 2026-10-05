'use client'

import React, { useEffect, useState } from 'react'

export const SpaceDebris: React.FC = () => {
  const [cometActive, setCometActive] = useState(false)
  const [cometStyle, setCometStyle] = useState({ top: '15%', left: '-10%' })

  // Trigger occasional comet streak
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReduced) return

    const interval = setInterval(() => {
      if (Math.random() < 0.6) {
        setCometStyle({
          top: `${Math.floor(Math.random() * 40 + 10)}%`,
          left: '-10%',
        })
        setCometActive(true)
        setTimeout(() => setCometActive(false), 2400)
      }
    }, 9000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Drifting Asteroid 1 */}
      <div
        className="absolute w-8 h-8 rounded-full border border-amber-900/40 bg-gradient-to-br from-[#2A1D13] to-[#120D08] opacity-60 blur-[0.3px]"
        style={{
          top: '22%',
          right: '12%',
          animation: 'float 18s ease-in-out infinite alternate',
          boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.8), 0 0 10px rgba(255, 159, 28, 0.1)',
        }}
      >
        <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-black/50" />
        <div className="absolute bottom-2 right-1.5 w-2 h-2 rounded-full bg-black/40" />
      </div>

      {/* Drifting Asteroid 2 (Smaller) */}
      <div
        className="absolute w-5 h-5 rounded-full border border-amber-800/30 bg-[#1F1710] opacity-50"
        style={{
          top: '68%',
          left: '8%',
          animation: 'float 22s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Small UFO Crossing Slowly */}
      <div
        className="absolute top-[32%] w-10 h-4 opacity-75 hidden sm:block"
        style={{
          animation: 'ufoDrift 60s linear infinite',
        }}
      >
        <svg viewBox="0 0 40 16" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
          {/* Cockpit Dome */}
          <ellipse cx="20" cy="5" rx="7" ry="4" fill="#00E5FF" fillOpacity="0.8" />
          {/* Saucer Hull */}
          <ellipse cx="20" cy="9" rx="18" ry="4.5" fill="#1C2826" stroke="#39FF14" strokeWidth="0.8" />
          {/* Bottom Propulsion Glow */}
          <ellipse cx="20" cy="11" rx="8" ry="1.5" fill="#39FF14" className="animate-pulse" />
          {/* Tiny Running Lights */}
          <circle cx="8" cy="9" r="1" fill="#FF9F1C" />
          <circle cx="20" cy="9" r="1" fill="#FFFFFF" />
          <circle cx="32" cy="9" r="1" fill="#FF9F1C" />
        </svg>
      </div>

      {/* Comet Streak */}
      {cometActive && (
        <div
          className="absolute h-[2px] w-48 bg-gradient-to-r from-transparent via-[#FF9F1C] to-white rounded-full opacity-80"
          style={{
            ...cometStyle,
            transform: 'rotate(-24deg)',
            boxShadow: '0 0 12px #FF9F1C, 0 0 24px #39FF14',
            animation: 'cometStreak 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        />
      )}

      <style jsx>{`
        @keyframes cometStreak {
          0% {
            transform: translateX(0) translateY(0) rotate(-24deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(120vw) translateY(60vh) rotate(-24deg);
            opacity: 0;
          }
        }
        @keyframes ufoDrift {
          0% {
            left: -80px;
            transform: translateY(0px) rotate(1deg);
          }
          50% {
            transform: translateY(-20px) rotate(-1deg);
          }
          100% {
            left: 105vw;
            transform: translateY(10px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  )
}
