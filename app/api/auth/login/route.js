import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'crypto';
import { getSupabase } from '@/lib/db/supabase';
import { createSessionPayload, setSessionCookie } from '@/lib/auth/session';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

function verifyPassword(password, salt, expectedHash) {
  const hashBuffer         = scryptSync(password, salt, 64);
  const expectedHashBuffer = Buffer.from(expectedHash, 'hex');
  if (hashBuffer.length !== expectedHashBuffer.length) return false;
  return timingSafeEqual(hashBuffer, expectedHashBuffer);
}

function toSafeUser(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    bio: user.bio,
    country: user.country,
    state: user.state,
    city: user.city,
    avatarUrl: user.avatar_url || user.avatarUrl,
    videoIntro: user.video_intro || user.videoIntro,
    portfolioUrl: user.portfolio_url || user.portfolioUrl,
    skills: user.skills || [],
    portfolio: user.portfolio || [],
    socialLinks: user.social_links || user.socialLinks || {},
    roleProfile: user.role_profile || user.roleProfile || {},
    verifiedBadges: user.verified_badges || user.verifiedBadges || [],
    monetization: user.monetization || {},
    onboarding: user.onboarding || {},
    contactVerification: user.contact_verification || user.contactVerification || {},
    createdAt: user.created_at || user.createdAt,
    updatedAt: user.updated_at || user.updatedAt,
  };
}

export async function POST(request) {
  try {
    const body     = await request.json();
    const email    = normalizeEmail(body?.email);
    const password = body?.password || '';

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ success: false, message: 'No account found with this email.' }, { status: 404 });
    }

    if (!user.password_hash || !user.password_salt) {
      return NextResponse.json({ success: false, message: 'This account cannot be used for password login.' }, { status: 400 });
    }

    const isPasswordValid = verifyPassword(password, user.password_salt, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
    }

    const safeUser = toSafeUser(user);
    const response = NextResponse.json({ success: true, user: safeUser });
    setSessionCookie(response, createSessionPayload({ userId: safeUser.id, role: safeUser.role, email: safeUser.email }));
    return response;
  } catch (error) {
    console.error('[Login]', error);
    return NextResponse.json({ success: false, message: 'Unable to login right now.' }, { status: 500 });
  }
}
