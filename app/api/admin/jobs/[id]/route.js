import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  return getSessionFromRequest(req)?.role === 'ADMIN';
}

// PATCH /api/admin/jobs/[id] — action: 'feature' | 'unfeature' | 'close' | 'delete'
export async function PATCH(request, context) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const params = await context.params;
  const id     = params?.id;
  const body   = await request.json();
  const action = body?.action;

  if (!id || !action) {
    return NextResponse.json({ success: false, message: 'Missing id or action.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    // Fetch current job to toggle feature
    const { data: job } = await supabase.from('jobs').select('is_featured').eq('id', id).maybeSingle();

    let update  = {};
    let message = '';

    switch (action) {
      case 'feature':
        const nowFeatured = !job?.is_featured;
        update  = {
          is_featured:    nowFeatured,
          featured_until: nowFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          updated_at:     new Date().toISOString()
        };
        message = nowFeatured ? 'Job is now featured for 30 days.' : 'Job has been unfeatured.';
        break;

      case 'close':
        update  = { status: 'COMPLETED', updated_at: new Date().toISOString() };
        message = 'Job has been closed.';
        break;

      case 'delete':
        const { error: delErr } = await supabase.from('jobs').delete().eq('id', id);
        if (delErr) throw delErr;
        return NextResponse.json({ success: true, message: 'Job deleted successfully.' });

      default:
        return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
    }

    const { error } = await supabase.from('jobs').update(update).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('[Admin Job PATCH]', err);
    return NextResponse.json({ success: false, message: 'Action failed.' }, { status: 500 });
  }
}
