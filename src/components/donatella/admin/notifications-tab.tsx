'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Bell,
  FileText,
  CheckCheck,
  Trash2,
  Search,
  ChevronRight,
  ChevronLeft,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: 'order' | 'user' | 'discount' | 'system'
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  read: boolean
  link?: string
  createdAt: string
}

interface AuditLog {
  id: string
  userId: string
  userName?: string | null
  userEmail?: string | null
  action: string
  entity: string
  entityId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

interface AuditLogResponse {
  logs: AuditLog[]
  total: number
  page: number
  totalPages: number
}

type InnerTab = 'notifications' | 'audit'

// ─── Constants ───────────────────────────────────────────────────────────────

const notificationTypeConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; darkColor: string; bg: string; darkBg: string }
> = {
  order: {
    label: 'طلب',
    icon: <ShoppingCart className="h-4 w-4" />,
    color: 'text-blue-700',
    darkColor: 'dark:text-blue-400',
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
  },
  user: {
    label: 'مستخدم',
    icon: <Users className="h-4 w-4" />,
    color: 'text-purple-700',
    darkColor: 'dark:text-purple-400',
    bg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/20',
  },
  discount: {
    label: 'خصم',
    icon: <Tag className="h-4 w-4" />,
    color: 'text-green-700',
    darkColor: 'dark:text-green-400',
    bg: 'bg-green-50',
    darkBg: 'dark:bg-green-900/20',
  },
  system: {
    label: 'نظام',
    icon: <Settings className="h-4 w-4" />,
    color: 'text-orange-700',
    darkColor: 'dark:text-orange-400',
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/20',
  },
}

const actionConfig: Record<string, { label: string; color: string; darkColor: string }> = {
  create: { label: 'إنشاء', color: 'bg-green-100 text-green-800', darkColor: 'dark:bg-green-900/30 dark:text-green-400' },
  update: { label: 'تحديث', color: 'bg-blue-100 text-blue-800', darkColor: 'dark:bg-blue-900/30 dark:text-blue-400' },
  delete: { label: 'حذف', color: 'bg-red-100 text-red-800', darkColor: 'dark:bg-red-900/30 dark:text-red-400' },
  login: { label: 'تسجيل دخول', color: 'bg-purple-100 text-purple-800', darkColor: 'dark:bg-purple-900/30 dark:text-purple-400' },
  logout: { label: 'تسجيل خروج', color: 'bg-gray-100 text-gray-800', darkColor: 'dark:bg-gray-900/30 dark:text-gray-400' },
  status_change: { label: 'تغيير حالة', color: 'bg-orange-100 text-orange-800', darkColor: 'dark:bg-orange-900/30 dark:text-orange-400' },
}

const entityConfig: Record<string, { label: string; color: string; darkColor: string }> = {
  product: { label: 'منتج', color: 'bg-indigo-100 text-indigo-800', darkColor: 'dark:bg-indigo-900/30 dark:text-indigo-400' },
  order: { label: 'طلب', color: 'bg-blue-100 text-blue-800', darkColor: 'dark:bg-blue-900/30 dark:text-blue-400' },
  user: { label: 'مستخدم', color: 'bg-purple-100 text-purple-800', darkColor: 'dark:bg-purple-900/30 dark:text-purple-400' },
  category: { label: 'فئة', color: 'bg-teal-100 text-teal-800', darkColor: 'dark:bg-teal-900/30 dark:text-teal-400' },
  discount: { label: 'خصم', color: 'bg-green-100 text-green-800', darkColor: 'dark:bg-green-900/30 dark:text-green-400' },
  shipping: { label: 'شحن', color: 'bg-cyan-100 text-cyan-800', darkColor: 'dark:bg-cyan-900/30 dark:text-cyan-400' },
  banner: { label: 'بانر', color: 'bg-pink-100 text-pink-800', darkColor: 'dark:bg-pink-900/30 dark:text-pink-400' },
  settings: { label: 'إعدادات', color: 'bg-gray-100 text-gray-800', darkColor: 'dark:bg-gray-900/30 dark:text-gray-400' },
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`
  return date.toLocaleDateString('ar-SA')
}

function parseDetails(details: string | null | undefined): Record<string, unknown> | null {
  if (!details) return null
  try {
    return JSON.parse(details)
  } catch {
    return null
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NotificationsTab({ isMobile }: { isMobile: boolean }) {
  const [innerTab, setInnerTab] = useState<InnerTab>('notifications')

  // ─── Notifications State ──────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationSearch, setNotificationSearch] = useState('')

  // ─── Audit Logs State ─────────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditEntityFilter, setAuditEntityFilter] = useState<string>('all')
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all')
  const [auditSearch, setAuditSearch] = useState('')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // ─── Fetch Notifications ──────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true)
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      if (data.success) setNotifications(data.data.notifications || [])
    } catch {
      toast.error('فشل تحميل الإشعارات')
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  // ─── Fetch Audit Logs ─────────────────────────────────────────────────

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', auditPage.toString())
      params.set('limit', '20')
      if (auditEntityFilter !== 'all') params.set('entity', auditEntityFilter)
      if (auditActionFilter !== 'all') params.set('action', auditActionFilter)
      if (auditSearch) params.set('search', auditSearch)

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.data.logs || [])
        setAuditTotalPages(data.data.totalPages || 1)
        setAuditTotal(data.data.total || 0)
      }
    } catch {
      toast.error('فشل تحميل سجل الأنشطة')
    } finally {
      setAuditLoading(false)
    }
  }, [auditPage, auditEntityFilter, auditActionFilter, auditSearch])

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  // Reset page when filters change
  useEffect(() => {
    setAuditPage(1)
  }, [auditEntityFilter, auditActionFilter, auditSearch])

  // ─── Notification Actions ─────────────────────────────────────────────

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
        toast.success('تم تعيين الإشعار كمقروء')
      }
    } catch {
      toast.error('فشل تحديث الإشعار')
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
        toast.success('تم تعيين جميع الإشعارات كمقروءة')
      }
    } catch {
      toast.error('فشل تحديث الإشعارات')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
        toast.success('تم حذف الإشعار')
      }
    } catch {
      toast.error('فشل حذف الإشعار')
    }
  }

  const clearAllNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
        toast.success('تم مسح جميع الإشعارات')
      }
    } catch {
      toast.error('فشل مسح الإشعارات')
    }
  }

  // ─── Computed ─────────────────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (!notificationSearch) return true
    const q = notificationSearch.toLowerCase()
    return (
      n.titleAr.toLowerCase().includes(q) ||
      n.messageAr.toLowerCase().includes(q) ||
      n.titleEn.toLowerCase().includes(q)
    )
  })

  // ─── Loading Skeletons ────────────────────────────────────────────────

  const renderNotificationSkeletons = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="rounded-2xl dark-glow-card">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-3 w-1/4 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderAuditSkeletons = () => (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 p-3">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  )

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Inner Tab Switcher ─── */}
      <div className="flex gap-2 bg-muted/30 dark:bg-[#2A2522]/50 p-1.5 rounded-2xl">
        <button
          onClick={() => setInnerTab('notifications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center ${
            innerTab === 'notifications'
              ? 'bg-background dark:bg-[#231F1C] text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="h-4 w-4" />
          الإشعارات
          {unreadCount > 0 && (
            <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground rounded-full">
              {unreadCount}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setInnerTab('audit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center ${
            innerTab === 'audit'
              ? 'bg-background dark:bg-[#231F1C] text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          سجل الأنشطة
        </button>
      </div>

      {/* ═══ Notifications Tab ═══ */}
      <AnimatePresence mode="wait">
        {innerTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">الإشعارات</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {unreadCount > 0
                    ? `${unreadCount} إشعار غير مقروء`
                    : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">تعيين الكل كمقروء</span>
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="gap-1.5 rounded-xl text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">مسح الكل</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={notificationSearch}
                onChange={(e) => setNotificationSearch(e.target.value)}
                placeholder="بحث في الإشعارات..."
                className="rounded-xl pr-10"
              />
            </div>

            {/* Notifications List */}
            {notificationsLoading ? (
              renderNotificationSkeletons()
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 dark:bg-[#2A2522] mb-4">
                  <Bell className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground text-sm">
                  {notificationSearch
                    ? 'لم يتم العثور على إشعارات مطابقة'
                    : 'ستظهر الإشعارات هنا عند ورودها'}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {filteredNotifications.map((notification, idx) => {
                    const typeConf =
                      notificationTypeConfig[notification.type] ||
                      notificationTypeConfig.system

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <Card
                          className={`rounded-2xl dark-glow-card transition-all duration-200 cursor-pointer hover:shadow-md hover:shadow-[#D4A574]/5 ${
                            !notification.read
                              ? 'border-r-4 border-r-[#D4A574] bg-[#D4A574]/5 dark:bg-[#D4A574]/5'
                              : ''
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              {/* Type Icon */}
                              <div
                                className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${typeConf.bg} ${typeConf.darkBg} ${typeConf.color} ${typeConf.darkColor}`}
                              >
                                {typeConf.icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                                      {notification.titleAr}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {notification.messageAr}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {!notification.read && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                                    )}
                                    <Badge
                                      variant="secondary"
                                      className={`text-[10px] ${typeConf.bg} ${typeConf.darkBg} ${typeConf.color} ${typeConf.darkColor}`}
                                    >
                                      {typeConf.label}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-[11px] text-muted-foreground">
                                    {formatRelativeTime(notification.createdAt)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.id)
                                    }}
                                    className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ Audit Logs Tab ═══ */}
        {innerTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">سجل الأنشطة</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {auditTotal} سجل نشاط
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAuditLogs()}
                className="gap-1.5 rounded-xl text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">تحديث</span>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="بحث في السجل..."
                  className="rounded-xl pr-10"
                />
              </div>
              <Select
                value={auditEntityFilter}
                onValueChange={setAuditEntityFilter}
              >
                <SelectTrigger className="rounded-xl w-[140px]">
                  <SelectValue placeholder="الكيان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الكيانات</SelectItem>
                  {Object.entries(entityConfig).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>
                      {conf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={auditActionFilter}
                onValueChange={setAuditActionFilter}
              >
                <SelectTrigger className="rounded-xl w-[140px]">
                  <SelectValue placeholder="الإجراء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإجراءات</SelectItem>
                  {Object.entries(actionConfig).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>
                      {conf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audit Logs Table / Cards */}
            {auditLoading ? (
              renderAuditSkeletons()
            ) : auditLogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 dark:bg-[#2A2522] mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد سجلات</h3>
                <p className="text-muted-foreground text-sm">
                  {auditSearch || auditEntityFilter !== 'all' || auditActionFilter !== 'all'
                    ? 'لم يتم العثور على سجلات مطابقة للفلاتر'
                    : 'ستظهر سجلات الأنشطة هنا'}
                </p>
              </motion.div>
            ) : isMobile ? (
              /* Mobile Cards */
              <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {auditLogs.map((log, idx) => {
                    const actionConf =
                      actionConfig[log.action] || {
                        label: log.action,
                        color: 'bg-gray-100 text-gray-800',
                        darkColor: 'dark:bg-gray-900/30 dark:text-gray-400',
                      }
                    const entityConf =
                      entityConfig[log.entity] || {
                        label: log.entity,
                        color: 'bg-gray-100 text-gray-800',
                        darkColor: 'dark:bg-gray-900/30 dark:text-gray-400',
                      }
                    const isExpanded = expandedLogId === log.id
                    const details = parseDetails(log.details)

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <Card
                          className="rounded-2xl dark-glow-card cursor-pointer"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={`text-[10px] ${actionConf.color} ${actionConf.darkColor}`}>
                                  {actionConf.label}
                                </Badge>
                                <Badge className={`text-[10px] ${entityConf.color} ${entityConf.darkColor}`}>
                                  {entityConf.label}
                                </Badge>
                              </div>
                              <ChevronLeft
                                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                  isExpanded ? '-rotate-90' : ''
                                }`}
                              />
                            </div>
                            <div className="text-sm text-foreground">
                              {log.userName || 'مستخدم غير معروف'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatRelativeTime(log.createdAt)}
                              {log.ipAddress && (
                                <span className="ml-2 opacity-60">({log.ipAddress})</span>
                              )}
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 pt-2 border-t border-border/50 dark:border-[#3A3532]/60 space-y-1.5 text-xs">
                                    {log.userEmail && (
                                      <div>
                                        <span className="text-muted-foreground">البريد: </span>
                                        <span className="text-foreground" dir="ltr">{log.userEmail}</span>
                                      </div>
                                    )}
                                    {log.entityId && (
                                      <div>
                                        <span className="text-muted-foreground">معرّف الكيان: </span>
                                        <span className="text-foreground font-mono text-[11px]" dir="ltr">
                                          {log.entityId}
                                        </span>
                                      </div>
                                    )}
                                    {details && (
                                      <div>
                                        <span className="text-muted-foreground">التفاصيل: </span>
                                        <pre
                                          className="mt-1 p-2 rounded-lg bg-muted/50 dark:bg-[#1A1614] text-[11px] overflow-x-auto max-h-32 text-foreground"
                                          dir="ltr"
                                        >
                                          {JSON.stringify(details, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* Desktop Table */
              <div className="rounded-2xl border border-border/50 dark:border-[#3A3532]/60 overflow-hidden dark-glow-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 dark:bg-[#2A2522]/50">
                      <TableHead className="text-xs font-semibold">المستخدم</TableHead>
                      <TableHead className="text-xs font-semibold">الإجراء</TableHead>
                      <TableHead className="text-xs font-semibold">الكيان</TableHead>
                      <TableHead className="text-xs font-semibold">التفاصيل</TableHead>
                      <TableHead className="text-xs font-semibold">الوقت</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => {
                      const actionConf =
                        actionConfig[log.action] || {
                          label: log.action,
                          color: 'bg-gray-100 text-gray-800',
                          darkColor: 'dark:bg-gray-900/30 dark:text-gray-400',
                        }
                      const entityConf =
                        entityConfig[log.entity] || {
                          label: log.entity,
                          color: 'bg-gray-100 text-gray-800',
                          darkColor: 'dark:bg-gray-900/30 dark:text-gray-400',
                        }
                      const isExpanded = expandedLogId === log.id
                      const details = parseDetails(log.details)

                      return (
                        <Fragment key={log.id}>
                          <TableRow
                            className="cursor-pointer hover:bg-muted/30 dark:hover:bg-[#2A2522]/30 transition-colors"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          >
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {log.userName || 'غير معروف'}
                                </p>
                                {log.userEmail && (
                                  <p className="text-[11px] text-muted-foreground" dir="ltr">
                                    {log.userEmail}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${actionConf.color} ${actionConf.darkColor}`}>
                                {actionConf.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${entityConf.color} ${entityConf.darkColor}`}>
                                {entityConf.label}
                              </Badge>
                              {log.entityId && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono" dir="ltr">
                                  {log.entityId.slice(0, 8)}...
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              {details ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help max-w-[200px] truncate">
                                        <Eye className="h-3 w-3 shrink-0" />
                                        <span className="truncate" dir="ltr">
                                          {JSON.stringify(details).slice(0, 50)}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" className="max-w-xs">
                                      <pre className="text-[11px] overflow-x-auto" dir="ltr">
                                        {JSON.stringify(details, null, 2)}
                                      </pre>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatRelativeTime(log.createdAt)}
                              </div>
                              {log.ipAddress && (
                                <div className="text-[10px] text-muted-foreground/60" dir="ltr">
                                  {log.ipAddress}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                          {/* Expanded Details Row */}
                          <AnimatePresence>
                            {isExpanded && details && (
                              <TableRow key={`${log.id}-detail`}>
                                <TableCell colSpan={5} className="p-0">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-6 py-3 bg-muted/20 dark:bg-[#2A2522]/30 border-t border-border/30 dark:border-[#3A3532]/30">
                                      <pre
                                        className="text-[11px] text-foreground overflow-x-auto max-h-40"
                                        dir="ltr"
                                      >
                                        {JSON.stringify(details, null, 2)}
                                      </pre>
                                    </div>
                                  </motion.div>
                                </TableCell>
                              </TableRow>
                            )}
                          </AnimatePresence>
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {auditTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  الصفحة {auditPage} من {auditTotalPages} ({auditTotal} سجل)
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    disabled={auditPage <= 1}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, auditTotalPages) }, (_, i) => {
                    let pageNum: number
                    if (auditTotalPages <= 5) {
                      pageNum = i + 1
                    } else if (auditPage <= 3) {
                      pageNum = i + 1
                    } else if (auditPage >= auditTotalPages - 2) {
                      pageNum = auditTotalPages - 4 + i
                    } else {
                      pageNum = auditPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={auditPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAuditPage(pageNum)}
                        className={`h-8 w-8 p-0 rounded-lg text-xs ${
                          auditPage === pageNum
                            ? 'bg-[#D4A574] hover:bg-[#b8885a] text-white'
                            : ''
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                    disabled={auditPage >= auditTotalPages}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد مسح جميع الإشعارات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllNotifications()
                setShowClearConfirm(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              مسح الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
