'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  CheckCheck,
  RefreshCw,
  ChevronLeft,
  User,
  Clock,
  MessageSquare,
  AlertCircle,
  Phone,
  X,
  Reply,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
}

type FilterType = 'all' | 'unread' | 'read'

// ─── Constants ───────────────────────────────────────────────────────────────

const subjectConfig: Record<string, { label: string; color: string; darkColor: string; bg: string; darkBg: string }> = {
  general: {
    label: 'استفسار عام',
    color: 'text-blue-700',
    darkColor: 'dark:text-blue-400',
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
  },
  complaint: {
    label: 'شكوى',
    color: 'text-red-700',
    darkColor: 'dark:text-red-400',
    bg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
  },
  suggestion: {
    label: 'اقتراح',
    color: 'text-green-700',
    darkColor: 'dark:text-green-400',
    bg: 'bg-green-50',
    darkBg: 'dark:bg-green-900/20',
  },
  technical: {
    label: 'مشكلة تقنية',
    color: 'text-orange-700',
    darkColor: 'dark:text-orange-400',
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-900/20',
  },
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MessagesTab({ isMobile }: { isMobile: boolean }) {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // ─── Fetch Messages ──────────────────────────────────────────────────

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact')
      const data = await res.json()
      if (data.success) {
        setMessages(data.data || [])
      }
    } catch {
      toast.error('فشل تحميل الرسائل')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // ─── Actions ──────────────────────────────────────────────────────────

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: true } : m))
        )
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, read: true } : null))
        }
        toast.success('تم تعيين الرسالة كمقروءة')
      }
    } catch {
      toast.error('فشل تحديث الرسالة')
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
        if (selectedMessage) {
          setSelectedMessage((prev) => (prev ? { ...prev, read: true } : null))
        }
        toast.success('تم تعيين جميع الرسائل كمقروءة')
      }
    } catch {
      toast.error('فشل تحديث الرسائل')
    }
  }

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id))
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
          setMessageDialogOpen(false)
        }
        toast.success('تم حذف الرسالة')
      }
    } catch {
      toast.error('فشل حذف الرسالة')
    }
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message)
    setMessageDialogOpen(true)
    if (!message.read) {
      markAsRead(message.id)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteTarget(id)
    setDeleteConfirmOpen(true)
  }

  // ─── Computed ─────────────────────────────────────────────────────────

  const unreadCount = messages.filter((m) => !m.read).length
  const readCount = messages.filter((m) => m.read).length

  const filteredMessages = messages.filter((m) => {
    if (filterType === 'unread' && m.read) return false
    if (filterType === 'read' && !m.read) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    )
  })

  // ─── Skeletons ────────────────────────────────────────────────────────

  const renderSkeletons = () => (
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

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-[#D4A574]" />
            رسائل التواصل
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} رسالة غير مقروءة من ${messages.length} رسالة`
              : `جميع الرسائل مقروءة (${messages.length} رسالة)`}
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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            className="gap-1.5 rounded-xl text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">تحديث</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl dark-glow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{messages.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">إجمالي الرسائل</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl dark-glow-card border-r-4 border-r-blue-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{unreadCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">غير مقروءة</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl dark-glow-card border-r-4 border-r-green-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{readCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">مقروءة</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو الموضوع..."
            className="rounded-xl pr-10"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as FilterType)}
        >
          <SelectTrigger className="rounded-xl w-[140px]">
            <SelectValue placeholder="التصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل ({messages.length})</SelectItem>
            <SelectItem value="unread">غير مقروءة ({unreadCount})</SelectItem>
            <SelectItem value="read">مقروءة ({readCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages List */}
      {loading ? (
        renderSkeletons()
      ) : filteredMessages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 dark:bg-[#2A2522] mb-4">
            <Mail className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد رسائل</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery || filterType !== 'all'
              ? 'لم يتم العثور على رسائل مطابقة'
              : 'ستظهر رسائل التواصل هنا عند استلامها'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2 max-h-[650px] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredMessages.map((message, idx) => {
              const sConfig = subjectConfig[message.subject] || {
                label: message.subject,
                color: 'text-gray-700',
                darkColor: 'dark:text-gray-400',
                bg: 'bg-gray-50',
                darkBg: 'dark:bg-gray-900/20',
              }

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card
                    className={`rounded-2xl dark-glow-card transition-all duration-200 cursor-pointer hover:shadow-md hover:shadow-[#D4A574]/5 group ${
                      !message.read
                        ? 'border-r-4 border-r-[#D4A574] bg-[#D4A574]/[0.03] dark:bg-[#D4A574]/5'
                        : ''
                    }`}
                    onClick={() => openMessage(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <div className="shrink-0">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            !message.read
                              ? 'bg-gradient-to-br from-[#D4A574] to-[#b8885a] text-white shadow-md shadow-[#D4A574]/20'
                              : 'bg-muted dark:bg-[#2A2522] text-muted-foreground'
                          }`}>
                            {!message.read ? (
                              <Mail className="h-4.5 w-4.5" />
                            ) : (
                              <MailOpen className="h-4.5 w-4.5" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm line-clamp-1 ${
                                  !message.read
                                    ? 'font-bold text-foreground'
                                    : 'font-medium text-foreground/80'
                                }`}>
                                  {message.name}
                                </h4>
                                {!message.read && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4A574] shadow-sm shadow-[#D4A574]/50 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                                {message.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] ${sConfig.bg} ${sConfig.darkBg} ${sConfig.color} ${sConfig.darkColor}`}
                              >
                                {sConfig.label}
                              </Badge>
                            </div>
                          </div>
                          {/* Message preview */}
                          <p className={`text-xs mt-1.5 line-clamp-2 ${
                            !message.read
                              ? 'text-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {message.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(message.createdAt)}
                            </p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!message.read) markAsRead(message.id)
                                }}
                                className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:text-[#D4A574] hover:bg-[#D4A574]/10"
                                title={message.read ? 'مقروءة' : 'تعيين كمقروءة'}
                              >
                                {message.read ? (
                                  <MailOpen className="h-3 w-3" />
                                ) : (
                                  <Mail className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  confirmDelete(message.id)
                                }}
                                className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
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

      {/* ─── Message Detail Dialog ─── */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#D4A574]" />
                    رسالة تواصل
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      subjectConfig[selectedMessage.subject]
                        ? `${subjectConfig[selectedMessage.subject].bg} ${subjectConfig[selectedMessage.subject].darkBg} ${subjectConfig[selectedMessage.subject].color} ${subjectConfig[selectedMessage.subject].darkColor}`
                        : 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {subjectConfig[selectedMessage.subject]?.label || selectedMessage.subject}
                  </Badge>
                </div>
                <DialogDescription className="sr-only">
                  تفاصيل رسالة التواصل من {selectedMessage.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Sender Info */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 dark:bg-[#2A2522]/50">
                  <div className="shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {selectedMessage.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{selectedMessage.name}</h4>
                      {!selectedMessage.read && (
                        <Badge className="text-[10px] bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20">
                          جديدة
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1" dir="ltr">
                        <Mail className="h-3 w-3" />
                        {selectedMessage.email}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator className="dark:bg-[#3A3532]/60" />

                {/* Message Subject */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الموضوع</p>
                  <p className="text-sm font-semibold text-foreground">
                    {subjectConfig[selectedMessage.subject]?.label || selectedMessage.subject}
                  </p>
                </div>

                {/* Message Body */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الرسالة</p>
                  <div className="p-4 rounded-xl bg-muted/30 dark:bg-[#1A1614]/50 border border-border/30 dark:border-[#3A3532]/40 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <Separator className="dark:bg-[#3A3532]/60" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!selectedMessage.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="gap-1.5 rounded-xl text-xs"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      تعيين كمقروءة
                    </Button>
                  )}
                  <a
                    href={`mailto:${selectedMessage.email}?subject=رد: ${subjectConfig[selectedMessage.subject]?.label || selectedMessage.subject}`}
                    className="inline-flex"
                  >
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-xl text-xs bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white border-0 shadow-md"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      رد عبر البريد
                    </Button>
                  </a>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      confirmDelete(selectedMessage.id)
                    }}
                    className="gap-1.5 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              حذف الرسالة
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMessage(deleteTarget)}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
