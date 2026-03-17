'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// ─── Inner component uses useSearchParams (needs Suspense) ───
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validate token presence
  const tokenMissing = !token;

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'fair';
    return 'strong';
  })();

  const strengthColor = {
    weak: 'bg-red-500',
    fair: 'bg-amber-500',
    strong: 'bg-green-500',
  };

  const strengthWidth = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Reset failed. Please try again.');
        return;
      }

      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      toast.error('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid / missing token ──────────────────────────────
  if (tokenMissing) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Invalid Reset Link</p>
            <p className="text-sm text-muted-foreground">
              This link is missing the reset token. Please request a new one.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/forgot-password">Request New Link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Success ──────────────────────────────────────────────
  if (success) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10"
          >
            <CheckCircle2 className="h-7 w-7 text-green-500" />
          </motion.div>
          <div className="space-y-1">
            <p className="font-semibold text-lg">Password Reset!</p>
            <p className="text-sm text-muted-foreground">
              Your password has been updated. Redirecting to login…
            </p>
          </div>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Reset form ───────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {passwordStrength && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor[passwordStrength]} ${strengthWidth[passwordStrength]}`}
                  />
                </div>
                <p className={`text-xs ${
                  passwordStrength === 'weak' ? 'text-red-500' :
                  passwordStrength === 'fair' ? 'text-amber-500' : 'text-green-500'
                }`}>
                  {passwordStrength === 'weak' && 'Weak — too short'}
                  {passwordStrength === 'fair' && 'Fair — add uppercase & numbers'}
                  {passwordStrength === 'strong' && '✓ Strong password'}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
            {confirm && password === confirm && password.length >= 6 && (
              <p className="text-xs text-green-500">✓ Passwords match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || password !== confirm || password.length < 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting…
              </>
            ) : (
              'Reset Password'
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Request a new link
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Wrap in Suspense for useSearchParams (Next.js requirement)
export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <Card>
            <CardContent className="py-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
