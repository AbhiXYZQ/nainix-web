import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) { return getSessionFromRequest(req)?.role === 'ADMIN'; }

export async function DELETE(request, context) {
  if (!isAdmin(request)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  const params = await context.params;
  const id = params?.id;
  if (!id) return NextResponse.json({ success: false, message: 'Missing id.' }, { status: 400 });
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('collab_rooms').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Collab room deleted.' });
  } catch (err) {
    console.error('[Admin Collab DELETE]', err);
    return NextResponse.json({ success: false, message: 'Delete failed.' }, { status: 500 });
  }
}
