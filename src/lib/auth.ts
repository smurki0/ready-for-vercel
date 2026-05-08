import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'donatella-secret-key-2024'
);

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export async function verifyAuth(
  request: NextRequest
): Promise<AuthPayload | null> {
  try {
    const token = request.cookies.get('access_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(
  request: NextRequest
): Promise<AuthPayload | null> {
  const payload = await verifyAuth(request);
  if (!payload || payload.role !== 'admin') return null;

  // Also check if user is banned
  const user = await db.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.banned) return null;

  return payload;
}
