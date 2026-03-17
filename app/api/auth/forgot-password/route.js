import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getDatabase } from '@/lib/db/mongodb';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email || '');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const tokensCollection = db.collection('passwordResetTokens');

    // Always respond the same way — don't reveal if email exists (security)
    const user = await usersCollection.findOne({ email });

    if (user) {
      // Delete any previous tokens for this user
      await tokensCollection.deleteMany({ userId: user.id });

      // Create a new secure token (32 random bytes = 64 hex chars)
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await tokensCollection.insertOne({
        userId: user.id,
        email: user.email,
        token,
        expiresAt,
        createdAt: new Date(),
      });

      // ── In production: send an email here with the reset link ──
      // e.g. via Resend, SendGrid, or Nodemailer.
      // Reset link format: /reset-password?token=<token>
      //
      // For now (dev mode): return the token directly so it can be tested
      // without an email service.

      const isDev = process.env.NODE_ENV !== 'production';
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions.',
        ...(isDev && { devToken: token, resetLink: `/reset-password?token=${token}` }),
      });
    }

    // User not found — same response for security
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive reset instructions.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
