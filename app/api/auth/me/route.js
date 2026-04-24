import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

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

// ─── GET /api/auth/me — Get current session user ─────────────
export async function GET(request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    console.error('[GET /me]', error);
    return NextResponse.json({ success: false, message: 'Unable to fetch session user.' }, { status: 500 });
  }
}

// ─── PATCH /api/auth/me — Update profile ─────────────────────
export async function PATCH(request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const allowedTopLevel = [
      'name', 'bio', 'city', 'state', 'country', 'portfolio', 'skills'
    ];

    const updates = {};
    
    // 1. Direct maps
    for (const field of allowedTopLevel) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    
    if (body.avatarUrl !== undefined) updates.avatar_url = body.avatarUrl;
    if (body.portfolioUrl !== undefined) updates.portfolio_url = body.portfolioUrl;
    if (body.videoIntro !== undefined) updates.video_intro = body.videoIntro;
    if (body.socialLinks !== undefined) updates.social_links = body.socialLinks;

    // 2. Fetch existing user first to merge the role_profile JSONB properly
    const supabase = getSupabase();
    const { data: user, error: fetchErr } = await supabase.from('users').select('role_profile').eq('id', session.userId).maybeSingle();
    
    if (fetchErr || !user) {
      return NextResponse.json({ success: false, message: 'User not found for update.' }, { status: 404 });
    }

    // 3. Handle role_profile (freelancer specific fields)
    let roleProfileUpdated = false;
    const newRoleProfile = { ...user.role_profile };

    if (body.professionalTitle !== undefined) { newRoleProfile.professionalTitle = body.professionalTitle; roleProfileUpdated = true; }
    if (body.hourlyRate !== undefined)        { newRoleProfile.hourlyRate = body.hourlyRate; roleProfileUpdated = true; }
    if (body.experienceYears !== undefined)   { newRoleProfile.experienceYears = body.experienceYears; roleProfileUpdated = true; }
    if (body.availability !== undefined)      { newRoleProfile.availability = body.availability; roleProfileUpdated = true; }
    
    if (roleProfileUpdated) {
      updates.role_profile = newRoleProfile;
    }

    if (Object.keys(updates).length === 0) {
       // Just return existing if nothing to patch
      return NextResponse.json({ success: true });
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: toSafeUser(updatedUser) });
  } catch (error) {
    console.error('[PATCH /me]', error);
    return NextResponse.json({ success: false, message: 'Unable to update profile.' }, { status: 500 });
  }
}
