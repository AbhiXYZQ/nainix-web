import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) { return getSessionFromRequest(req)?.role === 'ADMIN'; }

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = Math.min(50, parseInt(searchParams.get('limit') || '15'));
  const search = searchParams.get('search') || '';
  const from   = (page - 1) * limit;
  try {
    const supabase = getSupabase();
    let query = supabase.from('proposals').select(
      '*, freelancer:users!proposals_freelancer_id_fkey(id,name,email), job:jobs(id,title,client:users!jobs_client_id_fkey(id,name))',
      { count: 'exact' }
    );
    if (search) query = query.or(`freelancer.name.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, proposals: data || [], total: count || 0, page, limit });
  } catch (err) {
    console.error('[Admin Proposals]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch proposals.' }, { status: 500 });
  }
}
