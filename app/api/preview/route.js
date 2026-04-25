import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/preview?secret=xxx&action=enable|disable
// This sets or clears the preview bypass cookie
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const action = searchParams.get('action') || 'enable';
  const PREVIEW_SECRET = process.env.PREVIEW_SECRET;

  if (!PREVIEW_SECRET || secret !== PREVIEW_SECRET) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const redirectUrl = new URL('/', request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (action === 'disable') {
    // Remove preview cookie → goes back to countdown
    response.cookies.set('nainix_preview', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });
  } else {
    // Set preview cookie valid for 30 days
    response.cookies.set('nainix_preview', PREVIEW_SECRET, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}
