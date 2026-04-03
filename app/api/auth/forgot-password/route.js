import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getSupabase } from '@/lib/db/supabase';
import { sendPasswordResetEmail } from '@/lib/email/resend';

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const isDev     = process.env.NODE_ENV !== 'production';
const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_YOUR_API_KEY_HERE';

export async function POST(request) {
  try {
    const body  = await request.json();
    const email = normalizeEmail(body?.email || '');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user } = await supabase.from('users').select('id, email, name').eq('email', email).maybeSingle();

    if (user) {
      // Delete any previous tokens for this user
      await supabase.from('password_reset_tokens').delete().eq('user_id', user.id);

      const token     = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await supabase.from('password_reset_tokens').insert({
        user_id    : user.id,
        email      : user.email,
        token,
        expires_at : expiresAt,
        created_at : new Date().toISOString(),
      });

      if (hasResend) {
        try {
          await sendPasswordResetEmail({ to: user.email, name: user.name, token });
        } catch (emailError) {
          console.error('[Resend] Email send failed:', emailError?.message);
        }
      }

      if (isDev) {
        const resetLink = `/reset-password?token=${token}`;
        return NextResponse.json({
          success : true,
          message : hasResend
            ? `Password reset email sent to ${email}. Check your inbox.`
            : 'Dev mode: use the resetLink below (no email service configured).',
          ...(isDev && { devToken: token, resetLink }),
        });
      }
    }

    return NextResponse.json({
      success : true,
      message : 'If an account exists with this email, you will receive reset instructions shortly.',
    });
  } catch (error) {
    console.error('[ForgotPassword]', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
