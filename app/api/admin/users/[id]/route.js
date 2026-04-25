import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  return getSessionFromRequest(req)?.role === 'ADMIN';
}

// PATCH /api/admin/users/[id] — action: 'ban' | 'unban' | 'verify' | 'delete'
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
    let update = {};
    let message = '';

    switch (action) {
      case 'ban':
        update  = { is_banned: true, updated_at: new Date().toISOString() };
        message = 'User has been banned.';
        break;
      case 'unban':
        update  = { is_banned: false, updated_at: new Date().toISOString() };
        message = 'User has been unbanned.';
        break;
      case 'verify':
        update  = { email_verified: true, updated_at: new Date().toISOString() };
        message = 'User email has been force-verified.';
        break;
      default:
        return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
    }

    const { error } = await supabase.from('users').update(update).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error('[Admin User PATCH]', err);
    return NextResponse.json({ success: false, message: 'Action failed.' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(request, context) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const params = await context.params;
  const id     = params?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing user id.' }, { status: 400 });
  }

  // Prevent self-deletion
  const session = getSessionFromRequest(request);
  if (session?.userId === id) {
    return NextResponse.json({ success: false, message: 'You cannot delete your own account.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[Admin User DELETE]', err);
    return NextResponse.json({ success: false, message: 'Delete failed.' }, { status: 500 });
  }
}
