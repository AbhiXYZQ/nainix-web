import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.RESEND_FROM_NAME || 'Nainix'} <${process.env.RESEND_FROM_EMAIL || 'hello@nainix.me'}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ─── Password Reset Email ────────────────────────────────────
export async function sendPasswordResetEmail({ to, name, token }) {
  const resetLink = `${BASE_URL}/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Nainix password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                🔐 Nainix
              </h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">0% Commission Freelancing Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:600;">Reset your password</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                Hi ${name ? name : 'there'},<br/>
                We received a request to reset the password for your Nainix account.
                Click the button below to set a new password.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#0f172a;border-radius:8px;">
                    <a href="${resetLink}" 
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">
                Button not working? Copy and paste this link:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="${resetLink}" style="color:#6366f1;font-size:12px;">${resetLink}</a>
              </p>
              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <!-- Warning -->
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                ⏱ This link expires in <strong>1 hour</strong>.<br/>
                🔒 If you didn't request this, you can safely ignore this email — your password won't change.<br/>
                🚫 Never share this link with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © 2026 Nainix — 0% Commission Freelancing Platform<br/>
                <a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">nainix.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Nainix password',
    html,
  });
}

// ─── Welcome / Email Verification Email ─────────────────────
export async function sendWelcomeEmail({ to, name, username }) {
  const profileLink = `${BASE_URL}/${username}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Welcome to Nainix!</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🚀 Welcome to Nainix!</h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">0% Commission — Keep everything you earn</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">Hey ${name}! 👋</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                Your account has been created successfully. You're now part of India's 
                first <strong>0% commission</strong> freelancing platform. 
                Start exploring jobs, connecting with clients, and earning — without giving up a single rupee.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#0f172a;border-radius:8px;">
                    <a href="${profileLink}" 
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      View My Profile →
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="margin:0;color:#94a3b8;font-size:12px;">Your username: <strong style="color:#0f172a;">@${username}</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 Nainix — <a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">nainix.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to Nainix, ${name}! 🚀`,
    html,
  });
}
