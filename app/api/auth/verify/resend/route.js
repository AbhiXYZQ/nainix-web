import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';
import { triggerEmailVerification } from '@/lib/auth/verification';

export async function POST(request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();

    // Fetch user details to get email and name
    const { data: user, error } = await supabase
      .from('users')
      .select('email, name, contact_verification')
      .eq('id', session.userId)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    // Don't resend if already verified
    if (user.contact_verification?.emailVerified) {
      return NextResponse.json({ success: false, message: 'Email is already verified.' }, { status: 400 });
    }

    // Trigger new OTP
    await triggerEmailVerification(session.userId, user.email, user.name);

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email!',
    });
  } catch (error) {
    console.error('[POST /api/auth/verify/resend]', error);
    
    // Return the specific error message if it's a helpful domain/resend error
    const message = error.message?.includes('Resend') 
      ? error.message 
      : 'Failed to resend code. Please try again.';

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
