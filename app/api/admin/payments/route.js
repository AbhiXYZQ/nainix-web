import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  return getSessionFromRequest(req)?.role === 'ADMIN';
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
  const limit  = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search') || '';
  const from   = (page - 1) * limit;

  try {
    const supabase = getSupabase();

    let query = supabase
      .from('payments')
      .select('*, user:users(id, email, name)', { count: 'exact' });

    if (search) {
      query = query.or(`razorpay_payment_id.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;

    // Revenue calculations
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [todayRes, monthRes, totalRes] = await Promise.all([
      supabase.from('payments').select('amount').gte('created_at', today),
      supabase.from('payments').select('amount').gte('created_at', month),
      supabase.from('payments').select('amount'),
    ]);

    const sum = (rows) => (rows || []).reduce((acc, r) => acc + (Number(r.amount) || 0), 0) / 100;

    return NextResponse.json({
      success: true,
      payments: data || [],
      total: count || 0,
      page, limit,
      revenue: {
        today: sum(todayRes.data),
        month: sum(monthRes.data),
        total: sum(totalRes.data),
      }
    });
  } catch (err) {
    console.error('[Admin Payments GET]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch payments.' }, { status: 500 });
  }
}
