import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function POST(request) {
  try {
    const body        = await request.json();
    const session     = getSessionFromRequest(request);
    const role        = body?.role;
    const jobId       = body?.jobId;
    const featuredDays = Number(body?.featuredDays || 3);

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    if (!jobId) {
      return NextResponse.json({ success: false, message: 'jobId is required.' }, { status: 400 });
    }
    if (![1, 3].includes(featuredDays)) {
      return NextResponse.json({ success: false, message: 'featuredDays must be 1 or 3.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: user } = await supabase.from('users').select('id, role').eq('id', session.userId).maybeSingle();

    if (!user) return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    if (role && user.role !== role) return NextResponse.json({ success: false, message: 'Role mismatch for this account.' }, { status: 403 });
    if (user.role !== 'CLIENT') return NextResponse.json({ success: false, message: 'Only clients can feature jobs.' }, { status: 403 });

    const { data: job } = await supabase.from('jobs').select('id, client_id').eq('id', jobId).maybeSingle();
    if (!job) return NextResponse.json({ success: false, message: 'Job not found.' }, { status: 404 });
    if (job.client_id !== user.id) return NextResponse.json({ success: false, message: 'You can only feature your own jobs.' }, { status: 403 });

    const featuredUntil = new Date(Date.now() + featuredDays * 86400000).toISOString();
    const { error } = await supabase.from('jobs').update({
      is_featured    : true,
      featured_until : featuredUntil,
      updated_at     : new Date().toISOString(),
    }).eq('id', jobId);

    if (error) throw error;

    return NextResponse.json({
      success      : true,
      jobId,
      featuredDays,
      featuredUntil,
      amountUsd    : featuredDays === 1 ? 9 : 19,
      status       : 'PAID_MOCK',
    });
  } catch (error) {
    console.error('[POST /jobs/feature]', error);
    return NextResponse.json({ success: false, message: 'Unable to feature this job right now.' }, { status: 500 });
  }
}
