'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Shield, Zap, Award, ChevronRight, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Subtle Wireframe Globe Component
const BackgroundGlobe = () => {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]); // Full rotation
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="fixed inset-0 -z-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <motion.div
        style={{ rotate, scale }}
        className="relative w-[180vw] h-[180vw] md:w-[90vw] md:h-[90vw] max-w-[1200px] max-h-[1200px] opacity-[0.15] dark:opacity-[0.25]"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-primary fill-none" strokeWidth="0.2">
          {/* Longitudinal Rings */}
          {[...Array(12)].map((_, i) => (
            <ellipse
              key={`long-${i}`}
              cx="50"
              cy="50"
              rx="50"
              ry="50"
              transform={`rotate(${i * 15} 50 50)`}
              strokeDasharray="1 2"
              className="opacity-60"
            />
          ))}
          {/* Latitudinal Rings */}
          {[...Array(12)].map((_, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="50"
              cy="50"
              rx="50"
              ry={i * 8}
              className="opacity-30"
            />
          ))}
          <circle cx="50" cy="50" r="49.9" className="opacity-80" />
        </svg>
      </motion.div>
    </div>
  );
};

export default function FoundersPage() {
  const [freelancerCount, setFreelancerCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/stats/freelancers')
      .then(res => res.json())
      .then(data => {
        if (data.success) setFreelancerCount(data.count || 0);
      })
      .catch(err => console.error(err));
  }, []);

  const claimed = freelancerCount;
  const maxSpots = 500;
  const isSoldOut = claimed >= maxSpots;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 relative">
      <BackgroundGlobe />
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Section 1: Hero */}
      <section className="container px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs md:text-sm font-semibold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 rounded-full mb-8">
            <PenTool className="h-4 w-4" /> The Nainix Manifesto
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Built by a Developer.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">For the Developers.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            The freelance industry is broken. Heavy commissions are eating into your hard work. It's time to fix it. 
            <br className="hidden md:block" />
            <span className="text-foreground font-semibold"> Join the 0% commission revolution before the doors close.</span>
          </p>
        </motion.div>
      </section>

      {/* Section 2: Founder's Letter */}
      <section className="container px-6 py-12 max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative bg-card/60 backdrop-blur-md border border-border rounded-3xl p-8 md:p-14 shadow-2xl"
        >
          {/* Quote marks aesthetic */}
          <div className="absolute -top-6 -left-4 text-8xl text-primary/10 font-serif leading-none select-none">"</div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-8 font-serif italic text-foreground/90 leading-tight">
            A Letter to My Fellow Techies:
          </h2>
          
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            <p>
              When I started coding and taking on web development projects under the Nainix Dev brand, I realized a harsh truth about the gig economy. The platforms we rely on take up to 20% of our hard-earned money. 
            </p>
            <p>
              As an AI & ML student spending late nights debugging code, I knew this wasn't fair. Technology should empower creators, not tax them.
            </p>
            <p>
              That's exactly why I started building Nainix—a strictly <strong className="text-foreground font-bold">0% commission freelance marketplace</strong>. No hidden fees, no deductions. Just pure collaboration.
            </p>
            <p>
              Right now, I am opening the platform exclusively for the backbone of any tech ecosystem: The Developers and Freelancers. We are building the supply side first, and I want to reward the early believers who are joining me on this mission.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
              <div className="h-full w-full rounded-full bg-card flex items-center justify-center font-bold text-xl text-primary">
                A
              </div>
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">Abhishek Kumar</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Founder, Nainix</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 3: Early Believer Perks */}
      <section className="container px-6 py-24 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">The Founding Member Rewards</h2>
          <p className="text-lg md:text-xl text-muted-foreground">We reward those who believe in our mission from day one.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: 100 Developers */}
          <motion.div whileHover={{ y: -5 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative h-full border-amber-500/30 bg-card/80 backdrop-blur-xl shadow-lg hover:border-amber-500/50 transition-colors overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-inner">
                     <span className="text-4xl">🥇</span>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold mb-1">Priority Tier</h3>
                    <p className="text-xl md:text-2xl font-extrabold text-foreground">The First 100 Developers</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Zap className="h-6 w-6 text-amber-500" /> Lifetime Premium Access
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Zero subscription fees, priority job bidding, and top-tier visibility forever. You will never pay a dime to use the premium features of Nainix.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: 500 Developers */}
          <motion.div whileHover={{ y: -5 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative h-full border-primary/30 bg-card/80 backdrop-blur-xl shadow-lg hover:border-primary/50 transition-colors overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-8 md:p-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-16 w-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
                     <span className="text-4xl">🏅</span>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Community Tier</h3>
                    <p className="text-xl md:text-2xl font-extrabold text-foreground">
                      The Next 400 <span className="text-muted-foreground text-lg ml-1 font-semibold">(Top 500)</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" /> Digital Identity Badge
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    An exclusive, verifiable holographic digital card on your dashboard. Clients will know you were here from day one. You represent the trusted foundation of Nainix.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Final Push / Counter */}
      <section className="container px-6 py-24 max-w-4xl mx-auto mb-12 relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative rounded-[2.5rem] overflow-hidden border border-border bg-card p-1 shadow-2xl shadow-primary/10"
        >
          {/* Animated gradient border simulation */}
           <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-[spin_5s_linear_infinite] opacity-10" />
           
           <div className="relative bg-card/95 backdrop-blur-2xl rounded-[2.3rem] p-8 md:p-16 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Spots are filling up fast.</h2>
              <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                This isn't just a platform; it's a movement to take back our earnings. <span className="text-foreground font-bold">Will you be one of the original 500?</span>
              </p>

              {/* The Live Counter UI */}
              <div className="max-w-md mx-auto mb-12 bg-background/80 border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Shield className="h-24 w-24" />
                 </div>
                 
                 <div className="flex justify-between items-center mb-4 relative z-10">
                   <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wide text-sm">
                     <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                     Live Status
                   </div>
                   <div className="text-muted-foreground font-medium text-sm">
                      <span className="text-foreground font-bold text-2xl font-mono mr-1">
                        {mounted ? claimed : '--'}
                      </span>
                      / {maxSpots} Spots
                   </div>
                 </div>
                 
                 <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-3 relative z-10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(100, (claimed / maxSpots) * 100)}%` }}
                     transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                     className="h-full bg-foreground rounded-full"
                   />
                 </div>
                 <p className="text-sm text-foreground/80 font-medium relative z-10">
                   {isSoldOut ? 'All founding spots are claimed!' : `Almost ${claimed} developers have successfully claimed their spot.`}
                 </p>
              </div>

              {/* CTA Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Button size="lg" asChild disabled={isSoldOut} className="h-16 px-12 text-lg font-bold rounded-full shadow-xl transition-all border border-transparent hover:shadow-primary/30">
                  <Link href="/register">
                    {isSoldOut ? 'Join the Waitlist' : 'Claim My Spot Now'} <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
           </div>
        </motion.div>
      </section>
    </div>
  );
}
