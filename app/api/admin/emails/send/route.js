import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

function isAdmin(req) {
  return getSessionFromRequest(req)?.role === 'ADMIN';
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const body     = await request.json();
  const audience = body?.audience || 'all';
  const subject  = body?.subject?.trim();
  const text     = body?.body?.trim();

  if (!subject || !text) {
    return NextResponse.json({ success: false, message: 'Subject and body are required.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    // Fetch target emails
    let query = supabase.from('users').select('email');
    if (audience === 'clients')     query = query.eq('role', 'CLIENT');
    if (audience === 'freelancers') query = query.eq('role', 'FREELANCER');
    if (audience === 'ai_pro')      query = query.eq('monetization->>plan', 'AI_PRO');

    const { data: users, error } = await query;
    if (error) throw error;

    const emails = (users || []).map(u => u.email).filter(Boolean);
    if (!emails.length) {
      return NextResponse.json({ success: false, message: 'No users found for this audience.' }, { status: 400 });
    }

    // Send via Resend in batches of 50
    const resend   = new Resend(process.env.RESEND_API_KEY);
    const FROM     = `${process.env.RESEND_FROM_NAME || 'Nainix'} <${process.env.RESEND_FROM_EMAIL || 'hello@nainix.me'}>`;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nainix.me';

    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🏛️ Nainix</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Developer-First Freelance Marketplace</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="color:#374151;font-size:15px;line-height:1.8;white-space:pre-wrap;">${text}</div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 Nainix — <a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">nainix.me</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    // Batch send (Resend allows up to 50 in batch)
    let sent = 0;
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      await resend.batch.send(
        batch.map(to => ({ from: FROM, to, subject, html }))
      );
      sent += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${sent} user${sent !== 1 ? 's' : ''} successfully.`,
    });
  } catch (err) {
    console.error('[Admin Email Send]', err);
    return NextResponse.json({ success: false, message: 'Failed to send emails.' }, { status: 500 });
  }
}
