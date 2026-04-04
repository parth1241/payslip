'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function CursorSpotlight() {
  const pathname = usePathname()
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isVisible, setIsVisible] = useState(false)

  // Only show on modern landing pages, not on dashboard
  const isLandingPage = ['/', '/about', '/careers', '/contact', '/blog'].includes(pathname)

  useEffect(() => {
    if (!isLandingPage) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isLandingPage])

  if (!isLandingPage) return null

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        background: `radial-gradient(250px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.08), transparent)`,
        // We use a CSS transition for the left/top to give it a "weighted" feel
        // but since we're using background radial gradient, we just rely on JS update speed
        // or we can use a separate div that follows the cursor
      }}
    />
  )
}

export default CursorSpotlight
