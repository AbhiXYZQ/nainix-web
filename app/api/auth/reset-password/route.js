import { NextResponse } from 'next/server';
import { randomBytes, scryptSync } from 'crypto';
import { getDatabase } from '@/lib/db/mongodb';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body || {};

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Reset token is missing or invalid.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tokensCollection = db.collection('passwordResetTokens');
    const usersCollection = db.collection('users');

    // Find the token record
    const tokenRecord = await tokensCollection.findOne({ token });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, message: 'Reset link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      await tokensCollection.deleteOne({ token });
      return NextResponse.json(
        { success: false, message: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const { hash, salt } = hashPassword(password);

    // Update user password
    const updateResult = await usersCollection.updateOne(
      { id: tokenRecord.userId },
      {
        $set: {
          passwordHash: hash,
          passwordSalt: salt,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User account not found.' },
        { status: 404 }
      );
    }

    // Delete all tokens for this user (one-time use)
    await tokensCollection.deleteMany({ userId: tokenRecord.userId });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
