import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'donatella-secret-key-2024'
);

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { email, password } = result.data;

    // Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if banned
    if (user.banned) {
      return errorResponse('Account has been suspended', 403);
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15min')
      .setIssuedAt()
      .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    const response = successResponse(userWithoutPassword);

    // Set httpOnly cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse('Internal server error', 500);
  }
}
