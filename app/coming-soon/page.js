'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Launch Date: 1 June 2026, 12:00 AM IST ───────────────────────
const LAUNCH_DATE = new Date('2026-06-01T00:00:00+05:30');

function getTimeLeft() {
  const now = new Date();
  const diff = LAUNCH_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

function CountUnit({ value, label }) {
  const [display, setDisplay] = useState(value);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (value !== display) {
      setFlip(true);
      const t = setTimeout(() => {
        setDisplay(value);
        setFlip(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 flex items-center justify-center">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/10 border border-violet-500/30 backdrop-blur-sm" />
        <div className="absolute inset-0 rounded-2xl opacity-40"
          style={{ boxShadow: '0 0 30px rgba(139,92,246,0.3) inset' }} />

        <AnimatePresence mode="wait">
          <motion.span
            key={display}
            initial={{ opacity: 0, y: flip ? -20 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-black tabular-nums text-white"
          >
            {String(display).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/80">
        {label}
      </span>
    </div>
  );
}

export default function ComingSoonPage() {
  const [time, setTime] = useState(getTimeLeft());
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef(null);

  // Countdown tick
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -Math.random() * 0.4 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        if (this.life > this.maxLife) this.reset();
        this.opacity = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030014] flex flex-col items-center justify-center">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Deep gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-950/10 blur-[80px]" />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-violet-500/40 bg-violet-500/10 text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Something Big Is Coming
          </span>
        </motion.div>

        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight">
            <span className="bg-gradient-to-br from-white via-violet-200 to-indigo-400 bg-clip-text text-transparent">
              Nainix
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed mb-12"
        >
          India's first <span className="text-violet-300 font-semibold">developer-first</span> freelance marketplace is launching soon. 
          Low commissions. Direct connections. Real work.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center gap-4 sm:gap-6 md:gap-8 mb-16"
        >
          <CountUnit value={time.days} label="Days" />
          <Separator />
          <CountUnit value={time.hours} label="Hours" />
          <Separator />
          <CountUnit value={time.minutes} label="Minutes" />
          <Separator />
          <CountUnit value={time.seconds} label="Seconds" />
        </motion.div>

        {/* Launch date label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-slate-500 mb-10 -mt-8 font-mono"
        >
          Launching on{' '}
          <span className="text-violet-400 font-semibold">June 1, 2026</span>
        </motion.p>

        {/* Notify form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full max-w-md"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-sm"
            >
              <span className="text-xl">🎉</span>
              You're on the list! We'll notify you on launch day.
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                required
                className="flex-1 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
              />
              <button
                type="submit"
                className="px-5 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-200 whitespace-nowrap hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
              >
                Notify Me
              </button>
            </form>
          )}
        </motion.div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center gap-6 text-slate-600 text-xs"
        >
          <span>© 2026 Nainix</span>
          <span>·</span>
          <a href="mailto:hello@nainix.me" className="hover:text-violet-400 transition-colors">hello@nainix.me</a>
          <span>·</span>
          <span>www.nainix.me</span>
        </motion.div>
      </div>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-2 mt-[-16px]">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60" />
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60" />
    </div>
  );
}
