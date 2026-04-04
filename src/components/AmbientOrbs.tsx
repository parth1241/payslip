'use client'

import React from 'react'

export function AmbientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Orb 1: Top-Left Indigo */}
      <div 
        className="absolute -top-[10%] -left-[5%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen"
        style={{ animation: 'rotateOrb 60s linear infinite, floatOrb 20s ease-in-out infinite' }}
      />
      
      {/* Orb 2: Bottom-Right Violet */}
      <div 
        className="absolute -bottom-[10%] -right-[5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px] mix-blend-screen"
        style={{ animation: 'rotateOrb 80s linear reverse infinite, floatOrb 25s ease-in-out infinite 2s' }}
      />
      
      {/* Orb 3: Center-Right Cyan */}
      <div 
        className="absolute top-[30%] -right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px] mix-blend-screen"
        style={{ animation: 'floatOrb 15s ease-in-out infinite 1s' }}
      />
    </div>
  )
}

export default AmbientOrbs
