import { db } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

// Public endpoint - no auth required
export async function GET() {
  try {
    const settings = await db.siteSettings.findMany({
      orderBy: { key: 'asc' },
    });

    // Convert to key-value object
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return successResponse(settingsMap);
  } catch (err) {
    console.error('Public settings GET error:', err);
    return errorResponse('Internal server error', 500);
  }
}
