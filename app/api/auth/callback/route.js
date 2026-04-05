import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { createSessionPayload, setSessionCookie } from '@/lib/auth/session';

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
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ success: false, message: 'Missing access token' }, { status: 400 });
    }

    const supabase = getSupabase();
    
    // Verify user securely on server using the token
    const { data: userData, error: userError } = await supabase.auth.getUser(access_token);

    if (userError || !userData?.user) {
      console.error('[OAuth Backend Verify] Error:', userError);
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    const authUser = userData.user;
    const email = authUser.email;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email not provided by OAuth provider' }, { status: 400 });
    }

    // Check if this user exists in our local custom 'users' table
    const { data: existingUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (dbError) {
      console.error('[OAuth DB Check] Error:', dbError);
      return NextResponse.json({ success: false, message: 'Database lookup failed' }, { status: 500 });
    }

    if (existingUser) {
      const safeUser = toSafeUser(existingUser);
      const response = NextResponse.json({ 
        success: true, 
        user: safeUser,
        redirect: existingUser.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer'
      });
      setSessionCookie(response, createSessionPayload({ userId: safeUser.id, role: safeUser.role, email: safeUser.email }));
      return response;
    } else {
      // User does NOT exist in custom 'users' table. Need to register.
      const metadata = authUser.user_metadata || {};
      const oauthPendingPayload = JSON.stringify({
        email: email,
        name: metadata.full_name || metadata.name || '',
        avatar_url: metadata.avatar_url || metadata.picture || '',
        providerId: authUser.id, 
        verified: true,
      });
      
      const response = NextResponse.json({ 
        success: true, 
        redirect: `/register?oauth=true&name=${encodeURIComponent(metadata.full_name || metadata.name || '')}&email=${encodeURIComponent(email)}`
      });

      const base64Payload = Buffer.from(oauthPendingPayload).toString('base64');
      response.cookies.set('oauth_pending', base64Payload, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60,
      });

      return response;
    }
  } catch (error) {
    console.error('[OAuth POST Callback Error]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
