'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Package,
  Tag,
  Heart,
  CheckCheck,
  ChevronLeft,
  ShoppingBag,
  Settings,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'

type NotificationType = 'order_status_change' | 'promotion' | 'wishlist_price_drop'

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  read: boolean
  icon: React.ReactNode
  action?: () => void
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'order_status_change':
      return <Package className="h-4 w-4 text-purple-500" />
    case 'promotion':
      return <Tag className="h-4 w-4 text-[#D4A574]" />
    case 'wishlist_price_drop':
      return <Heart className="h-4 w-4 text-red-500" />
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />
  }
}

function getNotificationAction(type: NotificationType) {
  switch (type) {
    case 'order_status_change':
      return () => useUIStore.getState().setPage('orders')
    case 'promotion':
      return () => useUIStore.getState().setPage('shop')
    case 'wishlist_price_drop':
      return () => useUIStore.getState().setPage('wishlist')
    default:
      return undefined
  }
}

export default function NotificationBell() {
  const user = useAuthStore((s) => s.user)
  const setPage = useUIStore((s) => s.setPage)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch notifications from API
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          const mapped: Notification[] = data.data.map((n: {
            id: string
            type: string
            titleAr?: string
            title?: string
            messageAr?: string
            message?: string
            createdAt: string
            read: boolean
          }) => ({
            id: n.id,
            type: (n.type === 'order_status_change' || n.type === 'promotion' || n.type === 'wishlist_price_drop')
              ? n.type
              : 'promotion' as NotificationType,
            title: n.titleAr || n.title || '',
            description: n.messageAr || n.message || '',
            time: n.createdAt,
            read: n.read ?? false,
            icon: getNotificationIcon((n.type as NotificationType) || 'promotion'),
            action: getNotificationAction((n.type as NotificationType) || 'promotion'),
          }))
          setNotifications(mapped)
        }
      } catch {
        // API not available - show empty state
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id)
    if (notification.action) {
      notification.action()
    }
    setOpen(false)
  }, [markAsRead])

  const handleViewAll = useCallback(() => {
    setPage('orders')
    setOpen(false)
  }, [setPage])

  const handleNotificationSettings = useCallback(() => {
    setPage('profile')
    setOpen(false)
  }, [setPage])

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen} dir="rtl">
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Badge className="absolute -top-1 -left-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-gradient-to-bl from-[#D4A574] to-[#b8885a] text-white rounded-full border-0 shadow-sm shadow-[#D4A574]/30">
                {unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 sm:w-[420px] p-0 rounded-2xl border-border/50 shadow-xl shadow-black/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-border/30 bg-gradient-to-l from-[#D4A574]/5 via-transparent to-[#C4A4A4]/5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#D4A574]/10 flex items-center justify-center">
              <Bell className="h-3.5 w-3.5 text-[#D4A574]" />
            </div>
            <h3 className="font-bold text-sm">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] rounded-full bg-[#D4A574]/15 text-[#D4A574] border-0 font-bold">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-[#D4A574] hover:text-[#D4A574]/80 hover:bg-[#D4A574]/5"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              تعيين الكل كمقروء
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="h-6 w-6 text-[#D4A574] animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto w-fit mb-3"
              >
                <div className="h-14 w-14 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Bell className="h-7 w-7 text-muted-foreground/30" />
                </div>
              </motion.div>
              <p className="text-sm font-medium text-muted-foreground">لا توجد إشعارات</p>
              <p className="text-xs text-muted-foreground/60 mt-1">ستظهر هنا أي تحديثات أو عروض جديدة</p>
            </div>
          ) : (
            <div className="py-1">
              <AnimatePresence>
                {notifications.map((notification, i) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-start gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-all ${
                      notification.read
                        ? 'hover:bg-accent/30'
                        : 'bg-[#D4A574]/5 hover:bg-[#D4A574]/10 border border-[#D4A574]/10'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      notification.read
                        ? 'bg-muted'
                        : 'bg-[#D4A574]/10'
                    }`}>
                      {notification.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${notification.read ? 'text-muted-foreground font-medium' : 'text-foreground font-bold'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-[#D4A574] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {getTimeAgo(notification.time)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="p-2 space-y-0.5">
          <Button
            variant="ghost"
            className="w-full rounded-xl text-sm gap-1 text-[#D4A574] hover:text-[#D4A574]/80 hover:bg-[#D4A574]/5"
            onClick={handleViewAll}
          >
            عرض الكل
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-xl text-sm gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50"
            onClick={handleNotificationSettings}
          >
            <Settings className="h-3.5 w-3.5" />
            إعدادات الإشعارات
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
