import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';

const ADMIN_EMAIL = 'hello@nainix.me';

export async function GET(request) {
  try {
    const session = getSessionFromRequest(request);
    
    // Security Check: Only the site owner/admin can run debug tests
    if (!session || session.email !== ADMIN_EMAIL) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized: Administrative access required.' 
      }, { status: 403 });
    }

    const supabase = getSupabase();
    
    // Test 1: Basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        step: 'connection_test',
        error: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connected and users table exists!',
      rowCount: data
    });
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      step: 'catch',
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}
