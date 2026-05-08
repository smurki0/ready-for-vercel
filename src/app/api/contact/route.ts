import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  subject: z.string().min(1, 'الموضوع مطلوب'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const contactMessage = await db.contactMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      },
    });

    return successResponse(contactMessage, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      const message = firstIssue?.message || 'بيانات غير صالحة';
      return errorResponse(message, 400);
    }
    console.error('Contact form error:', error);
    return errorResponse('حدث خطأ في إرسال الرسالة', 500);
  }
}

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    return errorResponse('حدث خطأ في جلب الرسائل', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Bulk mark all as read
    if (body.markAllRead) {
      await db.contactMessage.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return successResponse({ markedAllRead: true });
    }

    return errorResponse('إجراء غير معروف', 400);
  } catch (error) {
    console.error('Bulk update contact messages error:', error);
    return errorResponse('حدث خطأ في تحديث الرسائل', 500);
  }
}
