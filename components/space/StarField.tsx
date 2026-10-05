'use client'

import React, { useEffect, useRef } from 'react'

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate stars with depth layers
    const numStars = Math.min(220, Math.floor((width * height) / 7500))
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      brightness: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.02 + 0.005,
      twinkleSpeed: Math.random() * 0.04 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      isGreenTint: Math.random() < 0.15,
      isAmberTint: Math.random() < 0.08,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Background subtle nebula gradient
      const grad = ctx.createRadialGradient(
        width * 0.2,
        height * 0.3,
        10,
        width * 0.2,
        height * 0.3,
        width * 0.6
      )
      grad.addColorStop(0, 'rgba(10, 35, 20, 0.08)')
      grad.addColorStop(0.5, 'rgba(5, 15, 10, 0.03)')
      grad.addColorStop(1, 'rgba(5, 7, 10, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Draw each star
      for (const s of stars) {
        if (!prefersReducedMotion) {
          s.twinklePhase += s.twinkleSpeed
          s.y -= s.speed
          if (s.y < 0) {
            s.y = height
            s.x = Math.random() * width
          }
        }

        const alpha = Math.max(
          0.15,
          s.brightness + Math.sin(s.twinklePhase) * 0.35
        )

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)

        if (s.isGreenTint) {
          ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.85})`
        } else if (s.isAmberTint) {
          ctx.fillStyle = `rgba(255, 159, 28, ${alpha * 0.85})`
        } else {
          ctx.fillStyle = `rgba(240, 245, 255, ${alpha})`
        }

        ctx.fill()
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  )
}
