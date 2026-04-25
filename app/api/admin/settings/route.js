import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) { return getSessionFromRequest(req)?.role === 'ADMIN'; }

// In production, these settings would be saved to a DB/env config table.
// For now, we log them and return success (settings like siteMode are handled via middleware env vars).
export async function POST(request) {
  if (!isAdmin(request)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  try {
    const body = await request.json();
    console.log('[Admin Settings] Updated:', body);
    // TODO: Save to a platform_settings table in Supabase for dynamic config
    return NextResponse.json({ success: true, message: 'Settings noted. For siteMode changes, update PREVIEW_SECRET env var in Vercel.' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed.' }, { status: 500 });
  }
}
