import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const message = await db.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return errorResponse('الرسالة غير موجودة', 404);
    }
    return successResponse(message);
  } catch (error) {
    console.error('Get contact message error:', error);
    return errorResponse('حدث خطأ في جلب الرسالة', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const message = await db.contactMessage.update({
      where: { id },
      data: {
        ...(body.read !== undefined && { read: body.read }),
      },
    });

    return successResponse(message);
  } catch (error) {
    console.error('Update contact message error:', error);
    return errorResponse('حدث خطأ في تحديث الرسالة', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.contactMessage.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Delete contact message error:', error);
    return errorResponse('حدث خطأ في حذف الرسالة', 500);
  }
}
