import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, scryptSync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '@/lib/db/supabase';
import { createSessionPayload, setSessionCookie } from '@/lib/auth/session';
import { sendWelcomeEmail } from '@/lib/email/resend';

const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_YOUR_API_KEY_HERE';

const normalizeEmail    = (email    = '') => email.trim().toLowerCase();
const normalizeUsername = (username = '') => username.trim().toLowerCase();

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone = '') {
  return /^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s-]/g, ''));
}
function isValidUrl(value = '') {
  if (!value) return true;
  try { new URL(value); return true; } catch { return false; }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
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
    const cookieStore = cookies();
    const oauthPending = cookieStore.get('oauth_pending');
    let isOAuth = false;
    let oauthAvatar = null;
    let oauthEmailVerified = false;
    
    if (oauthPending) {
      isOAuth = true;
      try {
        const payload = JSON.parse(Buffer.from(oauthPending.value, 'base64').toString('utf-8'));
        oauthAvatar = payload.avatar_url;
        oauthEmailVerified = payload.verified;
      } catch (e) {
        console.error('[OAuth Parse Error]', e);
      }
    }

    const body        = await request.json();
    const website     = body?.website; // Honeypot field

    // Bot detection
    if (website) {
       console.warn('[Register] Bot attempt blocked via honeypot.');
       return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 });
    }

    const name        = body?.name?.trim();
    const email       = normalizeEmail(body?.email);
    const username    = normalizeUsername(body?.username);
    const password    = body?.password || '';
    const role        = body?.role;
    const phone       = body?.phone?.trim();
    const country     = body?.country?.trim();
    const state       = body?.state?.trim();
    const city        = body?.city?.trim();
    const bio         = body?.bio?.trim();
    const linkedin    = body?.linkedin?.trim() || '';
    const github      = body?.github?.trim()   || '';
    const acceptTerms = !!body?.acceptTerms;
    const roleDetails = body?.roleDetails || {};

    if (!name || !email || !username || (!isOAuth && !password) || !role || !phone || !country || !state || !city || !bio) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }
    if (!isValidEmail(email))     return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    if (!isValidPhone(phone))     return NextResponse.json({ success: false, message: 'Please enter a valid phone number in international format.' }, { status: 400 });
    if (!isOAuth && password.length < 8)      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters.' }, { status: 400 });
    if (!['CLIENT', 'FREELANCER'].includes(role)) return NextResponse.json({ success: false, message: 'Invalid role selected.' }, { status: 400 });
    if (bio.length < 30)          return NextResponse.json({ success: false, message: 'Bio must be at least 30 characters.' }, { status: 400 });
    if (!acceptTerms)             return NextResponse.json({ success: false, message: 'You must accept terms and privacy policy.' }, { status: 400 });
    if ((linkedin && !isValidUrl(linkedin)) || (github && !isValidUrl(github))) {
      return NextResponse.json({ success: false, message: 'Please provide valid social profile URLs.' }, { status: 400 });
    }

    const freelancerRoleDetails = {
      professionalTitle : roleDetails?.professionalTitle?.trim() || '',
      experienceYears   : Number(roleDetails?.experienceYears    || 0),
      hourlyRate        : Number(roleDetails?.hourlyRate         || 0),
      skills            : Array.isArray(roleDetails?.skills) ? roleDetails.skills.map((s) => String(s).trim()).filter(Boolean) : [],
      availability      : roleDetails?.availability              || '',
      portfolioUrl      : roleDetails?.portfolioUrl?.trim()      || '',
    };
    const clientRoleDetails = {
      companyName    : roleDetails?.companyName?.trim()    || '',
      companyWebsite : roleDetails?.companyWebsite?.trim() || '',
      companySize    : roleDetails?.companySize            || '',
      hiringGoal     : roleDetails?.hiringGoal?.trim()    || '',
      budgetRange    : roleDetails?.budgetRange            || '',
    };

    if (role === 'FREELANCER') {
      if (!freelancerRoleDetails.professionalTitle || freelancerRoleDetails.experienceYears < 0 ||
          freelancerRoleDetails.hourlyRate <= 0 || !freelancerRoleDetails.availability || freelancerRoleDetails.skills.length < 3) {
        return NextResponse.json({ success: false, message: 'Freelancer details are incomplete.' }, { status: 400 });
      }
      if (!isValidUrl(freelancerRoleDetails.portfolioUrl)) {
        return NextResponse.json({ success: false, message: 'Invalid portfolio URL.' }, { status: 400 });
      }
    }
    if (role === 'CLIENT') {
      if (!clientRoleDetails.companyName || !clientRoleDetails.companySize || !clientRoleDetails.hiringGoal || !clientRoleDetails.budgetRange) {
        return NextResponse.json({ success: false, message: 'Client company details are incomplete.' }, { status: 400 });
      }
      if (!isValidUrl(clientRoleDetails.companyWebsite)) {
        return NextResponse.json({ success: false, message: 'Invalid company website URL.' }, { status: 400 });
      }
    }

    const supabase = getSupabase();

    // Check email uniqueness
    const { data: byEmail } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
    if (byEmail) return NextResponse.json({ success: false, message: 'Email is already registered.' }, { status: 409 });

    // Check username uniqueness
    const { data: byUsername } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
    if (byUsername) return NextResponse.json({ success: false, message: 'Username is already taken.' }, { status: 409 });

    // Check phone uniqueness
    const { data: byPhone } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
    if (byPhone) return NextResponse.json({ success: false, message: 'Phone number is already registered.' }, { status: 409 });

    let hash = null;
    let salt = null;
    if (!isOAuth) {
      const p = hashPassword(password);
      hash = p.hash;
      salt = p.salt;
    }
    const now = new Date().toISOString();
    const id  = uuidv4();

    const newUser = {
      id,
      role,
      name,
      email,
      username,
      bio,
      phone,
      country,
      state,
      city,
      verified_badges : [],
      social_links    : { ...(linkedin ? { linkedin } : {}), ...(github ? { github } : {}) },
      avatar_url      : oauthAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      skills          : role === 'FREELANCER' ? freelancerRoleDetails.skills : [],
      portfolio       : [],
      video_intro     : null,
      role_profile    : role === 'FREELANCER' ? freelancerRoleDetails : clientRoleDetails,
      onboarding      : { profileVersion: 'premium-v1', termsAcceptedAt: now, completedAt: now },
      contact_verification: { emailVerified: Boolean(oauthEmailVerified), phoneVerified: false, emailVerifiedAt: oauthEmailVerified ? now : null, phoneVerifiedAt: null },
      monetization    : { plan: 'FREE', verificationBadgeActive: false, aiProActive: false, aiProActivatedAt: null },
      password_hash   : hash,
      password_salt   : salt,
      created_at      : now,
      updated_at      : now,
    };

    const { error: insertError } = await supabase.from('users').insert(newUser);
    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ success: false, message: 'Email or username already in use.' }, { status: 409 });
      }
      throw insertError;
    }

    if (hasResend) {
      sendWelcomeEmail({ to: newUser.email, name: newUser.name, username: newUser.username })
        .catch((err) => console.error('[Resend] Welcome email failed:', err?.message));
    }

    const safeUser = toSafeUser(newUser);
    const response = NextResponse.json({ success: true, user: safeUser });
    setSessionCookie(response, createSessionPayload({ userId: safeUser.id, role: safeUser.role, email: safeUser.email }));
    if (isOAuth) {
      response.cookies.delete('oauth_pending');
    }
    return response;
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json({ success: false, message: 'Unable to create account right now.' }, { status: 500 });
  }
}
