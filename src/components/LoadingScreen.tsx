'use client'

import React, { useState, useEffect } from 'react'

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isLoaded = sessionStorage.getItem('loaded')
    if (isLoaded) return

    setIsVisible(true)

    const timer = setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem('loaded', 'true')
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0a1a] flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards delay-1000">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-6 animate-pulse">
          PaySlip
        </h1>
        <div className="flex gap-3">
          <div 
            className="w-3 h-3 rounded-full bg-indigo-500" 
            style={{ animation: 'dotPulse 1s ease-in-out infinite' }}
          />
          <div 
            className="w-3 h-3 rounded-full bg-violet-500" 
            style={{ animation: 'dotPulse 1s ease-in-out 0.2s infinite' }}
          />
          <div 
            className="w-3 h-3 rounded-full bg-cyan-500" 
            style={{ animation: 'dotPulse 1s ease-in-out 0.4s infinite' }}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
