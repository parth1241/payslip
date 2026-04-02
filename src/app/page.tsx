"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Activity, Wallet, Users, Zap } from "lucide-react";

/* ─────────────────────────────────────────────
 *  1) Particle Canvas Background
 * ───────────────────────────────────────────── */
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const particleCount = 80;
    const connectionDist = 120;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      radius: number = 0;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 0.5;
      }

      update() {
        if (!canvas) return;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241, 0.4)"; // indigo
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Opacity scales with distance
            const alpha = 1 - dist / connectionDist;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.3})`; // cyan tint
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
    />
  );
}

/* ─────────────────────────────────────────────
 *  2) Typewriter Component
 * ───────────────────────────────────────────── */
function Typewriter({ words }: { words: string[] }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentWord = words[currentWordIndex];

    const typeSpeed = isDeleting ? 40 : 100;
    
    if (!isDeleting && currentText === currentWord) {
      // Pause at end of word before deleting
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === "") {
      // Switch word and start typing
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      timer = setTimeout(() => {}, 500);
    } else {
      // Typing or deleting
      timer = setTimeout(() => {
        setCurrentText((prev) =>
          isDeleting
            ? currentWord.substring(0, prev.length - 1)
            : currentWord.substring(0, prev.length + 1)
        );
      }, typeSpeed);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <span className="inline-block relative">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        {currentText || "\u00A0"}
      </span>
      <span className="absolute -right-3 top-0 bottom-0 w-[3px] bg-primary animate-pulse" />
    </span>
  );
}

/* ─────────────────────────────────────────────
 *  3) CountUp Value Component
 * ───────────────────────────────────────────── */
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function StatCounter({ end, suffix = "", prefix = "", decimalPlaces = 0, duration = 2000 }: { end: number, suffix?: string, prefix?: string, decimalPlaces?: number, duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1);
      
      const currentVal = easeOutExpo(t) * end;
      setValue(currentVal);

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  const displayValue = value.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <span className="font-mono">
      {prefix}{displayValue}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
 *  4) Live Activity Feed Logic
 * ───────────────────────────────────────────── */
interface FeedTx {
  id: string;
  address: string;
  amount: number;
}

function generateRandomAddress() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let addr = "G";
  for(let i=0; i<5; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
  addr += "…";
  for(let i=0; i<4; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
  return addr;
}

/* ─────────────────────────────────────────────
 *  Main Home Page
 * ───────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [feed, setFeed] = useState<FeedTx[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "employer") router.push("/employer");
      if (session?.user?.role === "employee") router.push("/employee");
    }
  }, [status, session, router]);

  // Initialize fake feed
  useEffect(() => {
    const initialFeed = Array.from({ length: 5 }).map(() => ({
      id: Math.random().toString(),
      address: generateRandomAddress(),
      amount: Math.floor(Math.random() * 450) + 50,
    }));
    setFeed(initialFeed);

    const intervalId = setInterval(() => {
      setFeed((prev) => {
        const newTx = {
          id: Math.random().toString(),
          address: generateRandomAddress(),
          amount: Math.floor(Math.random() * 450) + 50,
        };
        // push new at front, remove last
        return [newTx, ...prev.slice(0, 4)];
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  if (status === "loading" || status === "authenticated") {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col font-sans text-foreground overflow-hidden">
      <ParticleNetwork />

      {/* ── Navbar ── */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-[19px] font-extrabold tracking-tight text-foreground">
              Payslip
            </span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/employer"
              className="text-sm font-bold leading-6 text-muted-foreground hover:text-primary transition-colors"
            >
              Employer Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 flex flex-col justify-center relative z-10 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left: Copy & CTAs */}
            <div className="flex-1">
              <div className="mb-6 inline-flex border border-primary/30 bg-primary/10 rounded-full px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <span className="relative flex h-2 w-2 mr-2 mt-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Stellar Network Native
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight min-h-[140px] sm:min-h-[160px]">
                The future of <br className="hidden sm:block" />
                <Typewriter words={["payroll", "global payments", "salary disbursement"]} />
              </h1>
              
              <p className="text-lg leading-8 text-muted-foreground max-w-xl mb-10">
                Send salaries to anyone, anywhere. Verified on-chain. Instant settlement. 100% non-custodial and secure.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-14">
                <Link
                  href="/employer"
                  className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:bg-indigo-400 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  Launch app
                </Link>
                <Link
                  href="/employee"
                  className="rounded-full border border-primary/40 px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-primary/5 transition-all duration-300"
                >
                  View demo
                </Link>
              </div>

              {/* Animated Stat Row */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/20">
                <div>
                  <h4 className="text-[28px] font-bold text-foreground">
                    <StatCounter end={12847} />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Payments sent</p>
                </div>
                <div>
                  <h4 className="text-[28px] font-bold text-foreground">
                    <StatCounter end={2.3} decimalPlaces={1} suffix="M" prefix="XLM " />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Disbursed</p>
                </div>
                <div>
                  <h4 className="text-[28px] font-bold text-foreground">
                    <StatCounter end={99.9} decimalPlaces={1} suffix="%" />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Success rate</p>
                </div>
              </div>
            </div>

            {/* Right: Live Activity Feed */}
            <div className="hidden lg:block w-full max-w-md relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl transform rotate-12" />
              
              <div className="relative bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/20">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live transactions
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Live</span>
                  </div>
                </div>

                <div className="space-y-4 h-[320px] overflow-hidden relative">
                  {/* Top fade gradient */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-card/60 to-transparent z-10" />
                  
                  {feed.map((tx, idx) => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5 transition-all duration-500 transform"
                      style={{
                        animation: idx === 0 ? "slideDown 0.5s ease-out forwards" : "none",
                        opacity: Math.max(1 - (idx * 0.25), 0), // items fade as they go down
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Wallet className="h-3.5 w-3.5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-[13px] font-mono font-medium text-foreground">{tx.address}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {idx === 0 ? "Just now" : `${idx * 2}s ago`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-foreground font-mono">
                          +{tx.amount} <span className="text-[10px] text-muted-foreground font-sans">XLM</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Bottom fade gradient */}
                  <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-card/90 to-transparent z-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── How It Works ── */}
      <section className="relative z-10 py-16 mb-16 border-t border-border/10 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Ready for liftoff</h2>
            <p className="mt-2 text-muted-foreground text-sm">Deploy payroll globally in three simple steps.</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* The connecting line */}
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-border/20 z-0">
              <div className="absolute left-0 top-0 h-full bg-primary/40 animate-[slideRight_3s_infinite]" style={{ width: '40%' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: 1, title: "Connect wallet", desc: "No passwords. Just link Freighter.", icon: Wallet },
                { step: 2, title: "Add employees", desc: "Input names and XLM salaries.", icon: Users },
                { step: 3, title: "Disburse instantly", desc: "Click run, and everyone gets paid.", icon: Zap },
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-5 text-primary text-xl font-bold relative group">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300" />
                    <item.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 opacity-20 pointer-events-none" />
                    <span>{item.step}</span>
                  </div>
                  <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inject custom keyframes for this page */}
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideRight {
          0% { left: -40%; opacity: 0; }
          50% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
