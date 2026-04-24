import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider')?.toLowerCase();

    if (!provider || !['google', 'github', 'apple', 'linkedin_oidc'].includes(provider)) {
      return NextResponse.json({ success: false, message: 'Invalid or missing provider' }, { status: 400 });
    }

    // Since we're missing an anonymized key, we use the service role from `getSupabase`.
    // We are on the server environment, so this will return `{ data: { url: ... } }`.
    const supabase = getSupabase();
    
    // We construct the callback URL safely (use localhost during development)
    const requestUrl = new URL(request.url);
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin)
      : requestUrl.origin;
    const redirectTo = `${baseUrl}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[OAuth Initiation]', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (data?.url) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.json({ success: false, message: 'Unable to initiate OAuth flow.' }, { status: 500 });
  } catch (error) {
    console.error('[OAuth Route]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
