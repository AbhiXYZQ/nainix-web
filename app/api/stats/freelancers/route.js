import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    // Use count='exact' to get the total number of freelancers
    // In a high-traffic production system we might use estimates or caching, 
    // but exact counting up to 500 is extremely fast.
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'FREELANCER');

    if (error) {
      console.warn('Unable to fetch freelancer count, falling back to 0', error);
      return NextResponse.json({ success: true, count: 0 });
    }

    return NextResponse.json({ success: true, count: count || 0 });
  } catch (error) {
    console.error('[GET /stats/freelancers]', error);
    // Silent fallback so UI doesn't crash
    return NextResponse.json({ success: true, count: 0 });
  }
}
