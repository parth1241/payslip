'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  color: string
  shape: 'rect' | 'circle'
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

const COLORS = ['#818cf8', '#a78bfa', '#e879f9', '#fbbf24', '#34d399', '#22d3ee', '#fb7185']

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 150
    let animationFrameId: number
    let startTime = Date.now()

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        size: Math.random() * 6 + 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      })
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        
        // Fade out after 2s
        if (elapsed > 2000) {
          p.opacity -= 0.015
        }

        if (p.opacity > 0) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          
          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }
      })

      if (elapsed < 4000) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default Confetti
