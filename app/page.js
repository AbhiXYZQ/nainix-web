'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockSuccessStories } from '@/lib/db/schema';

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* 🚀 NEW FOUNDERS TOP BANNER */}
      <div className="w-full bg-gradient-to-r from-primary via-accent to-primary p-0.5 text-center group cursor-pointer relative overflow-hidden transition-all hover:brightness-110">
        <Link href="/founders" className="flex items-center justify-center gap-2 text-sm font-medium text-white px-4 py-2 relative z-10 w-full h-full">
           <Zap className="h-4 w-4 animate-pulse" />
           <span><strong className="underline underline-offset-2 decoration-white/60">Launch Offer:</strong> Lifetime 0% Commission & Founding Member Batch for Early Freelancers. </span>
           <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs hidden sm:inline-block border border-white/20">Learn More</span>
           <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center space-y-8"
          >
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm bg-card">
              <Zap className="mr-2 h-4 w-4 text-primary" fill="currentColor" />
              <span>0% Commission Forever</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Hire Developers Directly.
              </span>
              <br />
              <span>Or Find Dev Work Fast.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nainix is a freelancing platform where clients post projects, freelancers send proposals,
              and both connect directly without commission cuts.
            </p>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {[
                '1. Client posts a project',
                '2. Freelancers submit proposals',
                '3. You connect and start directly'
              ].map((item) => (
                <div key={item} className="rounded-lg border bg-card px-4 py-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/jobs">
                  Find Dev Work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/register">Post a Project</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Ticker / Shoutout Wall */}
      <section className="w-full border-y bg-card py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...mockSuccessStories, ...mockSuccessStories].map((story, idx) => (
            <span key={idx} className="mx-8 text-sm text-muted-foreground">
              {story.text}
            </span>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Developers Choose Nainix
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple workflow for both sides: post work, apply to work, connect directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">0% Commission</h3>
                <p className="text-muted-foreground">
                  Keep 100% of what you earn. No platform fees, no hidden charges. 
                  Your work, your money.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Direct Contact</h3>
                <p className="text-muted-foreground">
                  Connect directly with clients. Share your GitHub, LinkedIn, or WhatsApp. 
                  Build real relationships.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Matching</h3>
                <p className="text-muted-foreground">
                  AI-powered job matching based on your skills. Get ranked proposals 
                  and urgent SOS tags for quick gigs.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container py-24 scroll-mt-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              How Nainix Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clear flow for every new visitor, whether you are hiring or freelancing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Join as Client to hire or Freelancer to work.' },
              { step: '02', title: 'Post or Apply', desc: 'Clients post projects and freelancers send proposals.' },
              { step: '03', title: 'Review Match', desc: 'Compare profiles, pricing, and smart match scores.' },
              { step: '04', title: 'Connect Directly', desc: 'Finalize details and start work with 0% commission.' }
            ].map((item, idx) => (
              <div key={idx} className="relative space-y-3">
                <div className="text-5xl font-bold text-primary/20">{item.step}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Revenue Features */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Scale Faster with Premium Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent upgrades built for growth without commission cuts.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: 'Featured Jobs',
                desc: 'Boost your job visibility for 24-72 hours and get faster high-quality proposals.'
              },
              {
                title: 'Verification Badge',
                desc: 'Increase trust with a verified profile badge for better response rates.'
              },
              {
                title: 'AI Pro Plan',
                desc: 'Use AI proposal enhancement and premium matching tools to win more work.'
              }
            ].map((item) => (
              <Card key={item.title} className="border">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/pricing">
                View Pricing Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to keep 100% of your earnings?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers who've already ditched the 20% platform fees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LandingPage;
