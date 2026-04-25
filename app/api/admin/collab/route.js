import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function isAdmin(req) { return getSessionFromRequest(req)?.role === 'ADMIN'; }

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  try {
    const supabase = getSupabase();
    const { data, count, error } = await supabase
      .from('collab_rooms')
      .select('*, creator:users!collab_rooms_creator_id_fkey(id,name,email)', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Get member counts
    const roomIds = (data || []).map(r => r.id);
    let memberCounts = {};
    if (roomIds.length > 0) {
      const { data: members } = await supabase.from('collab_members').select('room_id').in('room_id', roomIds);
      (members || []).forEach(m => { memberCounts[m.room_id] = (memberCounts[m.room_id] || 0) + 1; });
    }

    const rooms = (data || []).map(r => ({ ...r, member_count: memberCounts[r.id] || 0 }));
    return NextResponse.json({ success: true, rooms, total: count || 0 });
  } catch (err) {
    console.error('[Admin Collab]', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch rooms.' }, { status: 500 });
  }
}
