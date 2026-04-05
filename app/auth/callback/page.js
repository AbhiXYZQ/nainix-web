'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/lib/store/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      // Parse token from URL fragment (implicit grant flow)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const errorDescription = params.get('error_description');

      if (errorDescription) {
        toast.error(errorDescription);
        router.push('/login?error=OAuthFailed');
        return;
      }

      if (!accessToken) {
        // Fallback or missing token
        router.push('/login?error=MissingToken');
        return;
      }

      try {
        // Send access token securely to our server
        const res = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error(data.message || 'Authentication failed');
          router.push('/login?error=' + (data.message || 'VerificationFailed'));
          return;
        }

        if (data.user) {
          login(data.user);
        }

        // Navigate to the provided redirect route
        if (data.redirect) {
          router.push(data.redirect);
        }
      } catch (err) {
        console.error('Callback error:', err);
        toast.error('An unexpected error occurred during login.');
        router.push('/login?error=ServerError');
      }
    };

    handleAuth();
  }, [router, login]);

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold text-destructive">Authentication Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => router.push('/login')} className="text-primary hover:underline">
          Return to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center flex-col gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Completing secure authentication...</p>
    </div>
  );
}
