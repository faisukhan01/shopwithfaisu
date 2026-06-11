import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: 'customer',
          isActive: true,
        },
      });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
    }

    // Create a simple token (base64 encoded user data)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email, role: user.role })).toString('base64');

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}