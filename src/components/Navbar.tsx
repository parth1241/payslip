'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ChevronRight, LayoutDashboard, LogOut, User } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Features', href: '/#features' },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const dashboardHref = session?.user?.role === 'employer' ? '/employer/dashboard' : '/employee/portal';
  const profileHref = session?.user?.role === 'employer' ? '/employer/settings/account' : '/employee/profile';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => pathname === href

  return (
    <nav 
      className={`sticky top-0 z-[100] w-full h-[64px] flex items-center transition-all duration-300 ${
        isScrolled ? 'navbar-glass scrolled' : 'navbar-glass'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LEFT: Logo & Beta Tag */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold gradient-text">
              PaySlip
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500">
            BETA
          </span>
        </div>

        {/* CENTER: Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.label} 
              href={link.href}
              className={`relative text-sm font-medium transition-colors duration-150 py-2 ${
                isActive(link.href) ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* RIGHT: Buttons / Session */}
        <div className="flex items-center gap-4">
          {!session ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-5 py-2 text-sm font-medium text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="btn-primary"
              >
                Get started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {session.user?.role && (
                <Link 
                  href={dashboardHref}
                  className="hidden sm:flex items-center gap-2 btn-primary !py-2 !px-4 text-xs"
                >
                  Dashboard <ChevronRight className="h-4 w-4" />
                </Link>
              )}
              
              {/* Avatar Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10 hover:ring-white/20 transition-all"
                >
                  {session.user?.name?.[0].toUpperCase() || 'U'}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute top-10 right-0 w-48 bg-[#0f0f2e] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href={profileHref} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                      <User className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <Link href={dashboardHref} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                      <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                    </Link>
                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-all text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOBILE HAMBURGER */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden relative w-10 h-10 flex flex-col items-center justify-center focus:outline-none ${isMobileMenuOpen ? 'hamburger-active' : ''}`}
          >
            <span className="hamburger-line line-1" />
            <span className="hamburger-line line-2" />
            <span className="hamburger-line line-3" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      <div 
        className={`absolute top-[64px] left-0 w-full bg-[#0f0f2e] border-b border-white/10 transition-all duration-300 ease-in-out z-[-1] ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'
        }`}
      >
        <div className="p-6 space-y-2">
          {NAV_LINKS.map((link, idx) => (
            <Link 
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-3 px-4 text-lg font-medium transition-all border-l-2 ${
                isActive(link.href) 
                  ? 'border-indigo-500 bg-white/5 text-white' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={{ borderLeftColor: isActive(link.href) ? ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][idx % 5] : 'transparent' }}
            >
              {link.label}
            </Link>
          ))}
          {!session && (
            <div className="pt-6 flex flex-col gap-3">
              <Link href="/login" className="w-full py-4 text-center font-bold text-white rounded-xl border border-white/10 hover:bg-white/5">
                Log in
              </Link>
              <Link href="/signup" className="w-full py-4 text-center font-bold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
