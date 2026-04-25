import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  return getSessionFromRequest(req)?.role === 'ADMIN';
}

// GET /api/admin/jobs?page=1&limit=15&search=&status=&category=
export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page     = Math.max(1, parseInt(searchParams.get('page')  || '1'));
  const limit    = Math.min(50, parseInt(searchParams.get('limit') || '15'));
  const search   = searchParams.get('search')   || '';
  const status   = searchParams.get('status')   || '';
  const category = searchParams.get('category') || '';
  const from     = (page - 1) * limit;

  try {
    const supabase = getSupabase();

    let query = supabase
      .from('jobs')
      .select('*, client:users(id, name, email)', { count: 'exact' });

    if (search)   query = query.ilike('title', `%${search}%`);
    if (status)   query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Get proposal count per job
    const jobIds = (data || []).map(j => j.id);
    let proposalCounts = {};
    if (jobIds.length > 0) {
      const { data: props } = await supabase
        .from('proposals')
        .select('job_id')
        .in('job_id', jobIds);

      (props || []).forEach(p => {
        proposalCounts[p.job_id] = (proposalCounts[p.job_id] || 0) + 1;
      });
    }

    const jobs = (data || []).map(j => ({
      ...j,
      proposal_count: proposalCounts[j.id] || 0,
    }));

    return NextResponse.json({ success: true, jobs, total: count || 0, page, limit });
  } catch (err) {
    console.error('[Admin Jobs GET]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch jobs.' }, { status: 500 });
  }
}
