import { db } from '@/lib/db'

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'status_change'
export type AuditEntity = 'product' | 'order' | 'user' | 'category' | 'discount' | 'shipping' | 'banner' | 'settings' | 'review' | 'contact'

interface AuditLogInput {
  userId: string
  action: AuditAction
  entity: AuditEntity
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details ? JSON.stringify(input.details) : null,
        ipAddress: input.ipAddress,
      },
    })
  } catch (err) {
    console.error('Failed to create audit log:', err)
    // Don't throw — audit logging should not break the main operation
  }
}

export async function createNotification(input: {
  type: 'order' | 'user' | 'discount' | 'system'
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  link?: string
}) {
  try {
    await db.notification.create({ data: input })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}
