import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';

export async function POST(request) {
  try {
    const body      = await request.json();
    const eventName = body?.eventName;
    const payload   = body?.payload || {};

    if (!eventName) {
      return NextResponse.json({ success: false, message: 'eventName is required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('analytics_events').insert({
      event_name : eventName,
      payload,
      created_at : new Date().toISOString(),
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /analytics/event]', error);
    return NextResponse.json({ success: false, message: 'Unable to record event.' }, { status: 500 });
  }
}
