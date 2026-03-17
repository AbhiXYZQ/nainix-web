'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devLink, setDevLink] = useState('');
  const [notFound, setNotFound] = useState(false);

  const isDev = process.env.NODE_ENV !== 'production';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setNotFound(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Something went wrong.');
        return;
      }

      // Dev mode: redirect directly to reset page if token was generated
      if (result.devToken && result.resetLink) {
        // Auto-navigate in dev so user doesn't need email
        router.push(result.resetLink);
        return;
      }

      // No devToken = email not in DB (but we pretend success for security)
      setSubmitted(true);
      setNotFound(true); // Show a helpful dev hint

    } catch {
      toast.error('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md space-y-4"
      >
        {/* ── Dev mode banner ─────────────────────────────── */}
        {isDev && !submitted && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3 flex gap-3 items-start">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-600 dark:text-amber-400">Dev Mode — No email service</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Enter your <strong>registered</strong> email → you'll be taken directly to the reset page. No inbox needed.
              </p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your registered email address.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get Reset Link
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              /* ── Email not in DB (dev mode hint) ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                  <AlertTriangle className="h-7 w-7 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Email Not Found</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{email}</span> is not registered in the local database.
                  </p>
                </div>

                {notFound && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-left text-sm space-y-1">
                    <p className="font-semibold text-amber-600 dark:text-amber-400">💡 Dev Tip</p>
                    <p className="text-xs text-muted-foreground">
                      Use the exact email you used when you <Link href="/register" className="text-primary underline">registered</Link> your account on this local server.
                      Different sessions / machines have separate DBs.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button onClick={() => { setSubmitted(false); setNotFound(false); }}>
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/register">Create an Account</Link>
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full gap-1.5">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
