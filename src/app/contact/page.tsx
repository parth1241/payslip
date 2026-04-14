'use client'

import React, { useState } from 'react'
import PageLayout from '@/components/PageLayout'
import { Mail, MessageSquare, Globe, CheckCircle, Send, ArrowRight, MapPin } from 'lucide-react'

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'General',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    // Simulate API call
    setTimeout(() => {
      setFormState('success')
    }, 1500)
  }

  return (
    <PageLayout>
      <div className="bg-[#0a0a1a] text-white selection:bg-indigo-500/30 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.1),_transparent_40%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Get in <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">touch</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Whether you have a question, want to partner, or just want to say hi, we're here to help.
            </p>
          </div>
        </section>

        {/* SPLIT LAYOUT SECTION */}
        <section className="py-16 px-6 relative z-10">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* LEFT: CONTACT FORM */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
              {formState === 'success' ? (
                <div className="py-20 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8">
                    <CheckCircle className="h-10 w-10 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Thanks! We've got it.</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">
                    We'll review your message and reply within 24 hours. Talk soon!
                  </p>
                  <button 
                    onClick={() => setFormState('idle')}
                    className="mt-10 px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2 text-indigo-400">Send us a message</h2>
                  <p className="text-sm text-slate-400 mb-10">Fill out the form below and we'll be in touch.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Your Name"
                          className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                        <input 
                          required
                          type="email" 
                          placeholder="hello@example.com"
                          className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Company (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Acme Corp"
                          className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subject</label>
                        <select 
                          className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all appearance-none"
                        >
                          <option>General</option>
                          <option>Sales</option>
                          <option>Partnership</option>
                          <option>Press</option>
                          <option>Bug Report</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Message</label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="Tell us what's on your mind..."
                        className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="btn-primary w-full py-4 text-sm font-bold shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                    >
                      {formState === 'submitting' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send message <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* RIGHT: CONTACT DETAILS */}
            <div className="space-y-6 lg:pl-12">
              
              {/* Email Card */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all group flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Email us</h3>
                  <p className="text-sm text-slate-300 font-medium mb-1">hello@payslip.app</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">We reply within 24 hours</p>
                </div>
              </div>

              {/* Discord Card */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group flex flex-col gap-4">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Join our Discord</h3>
                    <p className="text-sm text-slate-300 font-medium mb-1">discord.gg/payslip</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">400+ community members</p>
                  </div>
                </div>
                <a href="#" className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 group/link mt-2">
                  Join Discord <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Twitter Card */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-all group flex flex-col gap-4">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Follow us</h3>
                    <p className="text-sm text-slate-300 font-medium mb-1">@payslipapp</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Latest updates and announcements</p>
                  </div>
                </div>
              </div>

              {/* WORLD MAP DECORATIVE */}
              <div className="pt-12 text-center lg:text-left">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-12 flex items-center gap-3 justify-center lg:justify-start">
                  <Globe className="h-3 w-3" /> Based in India · Building for the world
                </p>
                
                <div className="relative w-full h-[200px] opacity-40 grayscale group hover:grayscale-0 transition-all">
                  <WorldMapSVG />
                  {/* Mumbai */}
                  <LocationDot x="72%" y="48%" color="bg-indigo-500" label="Mumbai" />
                  {/* SF */}
                  <LocationDot x="12%" y="36%" color="bg-violet-500" label="SF" />
                  {/* London */}
                  <LocationDot x="48%" y="28%" color="bg-cyan-500" label="London" />
                  {/* Singapore */}
                  <LocationDot x="78%" y="58%" color="bg-cyan-500" label="Singapore" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  )
}

function LocationDot({ x, y, color, label }: { x: string, y: string, color: string, label: string }) {
  return (
    <div 
      className="absolute group/pin"
      style={{ top: y, left: x }}
    >
      <div className={`relative flex h-3 w-3`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color} border border-white/20`}></span>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#030712] border border-white/10 px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
        {label}
      </div>
    </div>
  )
}

function WorldMapSVG() {
  return (
    <svg viewBox="0 0 1000 500" className="w-full h-full fill-white/10 stroke-white/5 stroke-[0.5]">
      {/* Simplified world map shapes */}
      <path d="M150,150 Q180,100 250,120 T300,180 T200,300 T120,250 Z" /> {/* NA */}
      <path d="M180,300 Q200,350 250,450 T300,400 T250,300 Z" /> {/* SA */}
      <path d="M450,100 Q500,80 550,120 T580,200 T480,250 T420,180 Z" /> {/* EU */}
      <path d="M480,250 Q520,300 550,400 T450,420 T400,300 Z" /> {/* AF */}
      <path d="M600,100 Q750,80 850,150 T900,300 T750,400 T650,300 T600,200 Z" /> {/* Asia */}
      <path d="M800,350 Q850,380 900,450 T750,480 T780,380 Z" /> {/* Aus */}
    </svg>
  )
}
