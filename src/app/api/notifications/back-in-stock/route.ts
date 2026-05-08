import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/api';

// In-memory store for demo purposes
const backInStockSignups: Array<{
  id: string;
  productId: string;
  email: string;
  size?: string;
  createdAt: string;
}> = [];

const backInStockSchema = z.object({
  productId: z.string().min(1, 'معرف المنتج مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  size: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = backInStockSchema.parse(body);

    // Check for duplicate signup
    const existing = backInStockSignups.find(
      (s) => s.productId === validated.productId && s.email === validated.email
    );

    if (existing) {
      return successResponse({
        message: 'أنت مسجل بالفعل في قائمة الإشعارات لهذا المنتج',
        alreadySignedUp: true,
      });
    }

    // Store the signup
    const signup = {
      id: `bis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: validated.productId,
      email: validated.email,
      size: validated.size,
      createdAt: new Date().toISOString(),
    };

    backInStockSignups.push(signup);

    return successResponse({
      message: 'تم تسجيلك بنجاح في قائمة الإشعارات',
      signup,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return errorResponse(firstError.message, 400);
    }
    console.error('Back in stock notification error:', error);
    return errorResponse('حدث خطأ في تسجيل الإشعار', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let results = backInStockSignups;
    if (productId) {
      results = results.filter((s) => s.productId === productId);
    }

    return successResponse(results);
  } catch (error) {
    console.error('Get back in stock signups error:', error);
    return errorResponse('حدث خطأ في جلب الإشعارات', 500);
  }
}
