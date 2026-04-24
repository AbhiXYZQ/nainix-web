'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useAuthStore from '@/lib/store/authStore';

const VerifyContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const email = searchParams.get('email') || user?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef([]);

  // Redirect if already verified or not logged in
  useEffect(() => {
    if (isAuthenticated && user?.contactVerification?.emailVerified) {
      router.push(user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer');
    }
  }, [isAuthenticated, user, router]);

  // 🔥 Trigger OTP send on mount if not verified
  const hasSentInitial = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !user?.contactVerification?.emailVerified && !hasSentInitial.current) {
      hasSentInitial.current = true;
      handleResend();
    }
  }, [isAuthenticated, user]);

  // Resend timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email verified successfully!');
        // Small delay to show success state before redirecting
        setTimeout(() => {
          window.location.href = user?.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer';
        }, 1500);
      } else {
        toast.error(data.message || 'Invalid code.');
      }
    } catch (err) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/verify/resend', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        toast.success('A new code has been sent to your email.');
        setTimer(60); // 60 seconds cooldown
      } else {
        toast.error(data.message || 'Failed to resend code.');
      }
    } catch (err) {
      toast.error('Unable to resend code right now.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to <br />
              <span className="font-semibold text-foreground underline decoration-primary/30">{email || 'your email'}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{1}"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold focus:ring-2 focus:ring-primary"
                    required
                  />
                ))}
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resending || timer > 0}
                className="text-primary hover:text-primary/80 hover:bg-primary/5"
              >
                {resending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Tip */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          🔒 Verification helps us protect your account and maintain a high-quality community.
        </p>
      </motion.div>
    </div>
  );
};

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
