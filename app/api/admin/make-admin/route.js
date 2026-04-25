import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// POST /api/admin/make-admin
// Body: { email: "hello@nainix.me", secret: "ADMIN_BOOTSTRAP_SECRET" }
// Use this ONCE to set your account as ADMIN in Supabase.
// After that, this route is useless (and safe to leave in).
export async function POST(request) {
  try {
    const body   = await request.json();
    const email  = body?.email?.trim().toLowerCase();
    const secret = body?.secret;

    // Must match env var ADMIN_BOOTSTRAP_SECRET
    const BOOTSTRAP = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!BOOTSTRAP || secret !== BOOTSTRAP) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle();

    if (findErr || !user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ role: 'ADMIN', updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `✅ ${email} has been promoted to ADMIN. Please log out and log back in.`,
    });
  } catch (error) {
    console.error('[Make Admin]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
