import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

const ALLOWED_FEATURES = ['VERIFICATION_BADGE', 'AI_PRO'];

export async function POST(request) {
  try {
    const body    = await request.json();
    const session = getSessionFromRequest(request);
    const role    = body?.role;
    const feature = String(body?.feature || '').trim().toUpperCase();

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (!feature) {
      return NextResponse.json({ success: false, message: 'feature is required.' }, { status: 400 });
    }
    if (!['CLIENT', 'FREELANCER'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role.' }, { status: 400 });
    }
    if (!ALLOWED_FEATURES.includes(feature)) {
      return NextResponse.json({ success: false, message: 'Invalid upgrade feature.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, monetization, verified_badges')
      .eq('id', session.userId)   // ✅ Fixed: was using undefined `userId`
      .maybeSingle();

    if (userError) throw userError;
    if (!user) return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    if (role && user.role !== role) return NextResponse.json({ success: false, message: 'Role mismatch for this account.' }, { status: 403 });
    if (feature === 'AI_PRO' && user.role !== 'FREELANCER') {
      return NextResponse.json({ success: false, message: 'AI Pro is available for freelancers only.' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const existingMonetization = user.monetization || {
      plan: 'FREE', verificationBadgeActive: false, aiProActive: false, aiProActivatedAt: null,
    };

    let updatedMonetization = { ...existingMonetization };
    let updatedBadges       = [...(user.verified_badges || [])];
    let amountUsd = 0;

    if (feature === 'VERIFICATION_BADGE') {
      updatedMonetization.verificationBadgeActive = true;
      amountUsd = 12;
      if (!updatedBadges.includes('Verified User')) updatedBadges.push('Verified User');
    }
    if (feature === 'AI_PRO') {
      updatedMonetization.plan           = 'AI_PRO';
      updatedMonetization.aiProActive    = true;
      updatedMonetization.aiProActivatedAt = now;
      amountUsd = 19;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ monetization: updatedMonetization, verified_badges: updatedBadges, updated_at: now })
      .eq('id', session.userId);

    if (updateError) throw updateError;

    await supabase.from('billing_transactions').insert({
      user_id    : user.id,
      role       : user.role,
      feature,
      amount_usd : amountUsd,
      currency   : 'USD',
      status     : 'PAID_MOCK',
      created_at : now,
    });

    return NextResponse.json({
      success      : true,
      monetization : updatedMonetization,
      verifiedBadges: updatedBadges,
      transaction  : { feature, amountUsd, status: 'PAID_MOCK' },
    });
  } catch (error) {
    console.error('[POST /monetization/upgrade]', error);
    return NextResponse.json({ success: false, message: 'Unable to process upgrade right now.' }, { status: 500 });
  }
}
