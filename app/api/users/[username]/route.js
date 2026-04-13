import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { mockUsers } from '@/lib/db/schema';

import { getSessionFromRequest } from '@/lib/auth/session';

function toSafeUser(user, isOwner = false) {
  const safe = {
    id: user.id,
    role: user.role,
    name: user.name,
    username: user.username,
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

  if (isOwner) {
    safe.email = user.email;
    safe.phone = user.phone;
  }

  return safe;
}

export async function GET(request, { params }) {
  try {
    const username = String(params?.username || '').trim().toLowerCase();
    if (!username) {
      return NextResponse.json({ success: false, message: 'Username is required.' }, { status: 400 });
    }

    const session = getSessionFromRequest(request);
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;

    if (user) {
      const isOwner = session?.userId === user.id;
      return NextResponse.json({ success: true, user: toSafeUser(user, isOwner) });
    }

    // Fallback to mock data
    const mockUser = mockUsers.find((u) => u.username === username);
    if (mockUser) {
      const isOwner = session?.userId === mockUser.id;
      return NextResponse.json({ success: true, user: toSafeUser(mockUser, isOwner) });
    }

    return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
  } catch (error) {
    console.error('[GET /users/:username]', error);
    return NextResponse.json({ success: false, message: 'Unable to fetch profile right now.' }, { status: 500 });
  }
}
