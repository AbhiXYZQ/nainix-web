import { NextResponse } from 'next/server';
import { randomBytes, scryptSync } from 'crypto';
import { getSupabase } from '@/lib/db/supabase';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export async function POST(request) {
  try {
    const body             = await request.json();
    const { token, password } = body || {};

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'Reset token is missing or invalid.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: tokenRecord } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (!tokenRecord) {
      return NextResponse.json({ success: false, message: 'Reset link is invalid or has already been used.' }, { status: 400 });
    }

    if (new Date() > new Date(tokenRecord.expires_at)) {
      await supabase.from('password_reset_tokens').delete().eq('token', token);
      return NextResponse.json({ success: false, message: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const { hash, salt } = hashPassword(password);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hash, password_salt: salt, updated_at: new Date().toISOString() })
      .eq('id', tokenRecord.user_id);

    if (updateError) throw updateError;

    // Delete all tokens for this user (one-time use)
    await supabase.from('password_reset_tokens').delete().eq('user_id', tokenRecord.user_id);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[ResetPassword]', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
