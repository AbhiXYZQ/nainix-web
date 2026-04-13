import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

const ALLOWED_EVENTS = [
  'page_view',
  'button_click',
  'form_submit',
  'job_view',
  'proposal_submit',
  'search',
  'login_success',
  'register_success'
];

export async function POST(request) {
  try {
    const session = getSessionFromRequest(request);
    const body      = await request.json();
    const eventName = body?.eventName?.trim()?.slice(0, 50);
    const payload   = body?.payload || {};

    if (!eventName) {
      return NextResponse.json({ success: false, message: 'eventName is required.' }, { status: 400 });
    }

    // Basic whitelist check to prevent custom event spam
    if (!ALLOWED_EVENTS.includes(eventName)) {
       // Log but don't error to prevent leaking allowed list, or just ignore
       return NextResponse.json({ success: true, masked: true }); 
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('analytics_events').insert({
      event_name : eventName,
      payload: JSON.stringify(payload).slice(0, 500), // Limit payload size
      user_id: session?.userId || null, 
      created_at : new Date().toISOString(),
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /analytics/event]', error);
    return NextResponse.json({ success: false, message: 'Unable to record event.' }, { status: 500 });
  }
}
