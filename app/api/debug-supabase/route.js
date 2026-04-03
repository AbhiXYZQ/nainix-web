import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';

export async function GET() {
  try {
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
