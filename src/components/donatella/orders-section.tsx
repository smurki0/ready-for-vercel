'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronLeft,
  Printer,
  RotateCcw,
  Ban,
  CalendarDays,
  MapPin,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  PackageCheck,
  ClipboardList,
  AlertCircle,
  Sparkles,
  Navigation,
  CloudSun,
  CloudRain,
  Sun,
  ThermometerSun,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { safeJsonParse } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  size: string | null
  color: string | null
  product: {
    id: string
    nameAr: string
    images: string | string[]
  } | null
}

interface Order {
  id: string
  status: string
  total: number
  customerName: string
  customerPhone: string
  address: string
  notes: string | null
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-4 w-4" />, bgColor: 'bg-yellow-500' },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <CheckCircle2 className="h-4 w-4" />, bgColor: 'bg-blue-500' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Truck className="h-4 w-4" />, bgColor: 'bg-purple-500' },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-4 w-4" />, bgColor: 'bg-green-500' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-4 w-4" />, bgColor: 'bg-red-500' },
}

const timelineSteps = [
  { key: 'pending', label: 'تم الاستلام', description: 'تم استلام طلبك بنجاح', icon: ClipboardList },
  { key: 'confirmed', label: 'قيد التجهيز', description: 'جاري تجهيز طلبك', icon: PackageCheck },
  { key: 'shipped', label: 'تم الشحن', description: 'تم شحن طلبك وهو في الطريق', icon: Truck },
  { key: 'delivered', label: 'تم التوصيل', description: 'تم توصيل طلبك بنجاح', icon: CheckCircle2 },
]

function getStepIndex(status: string): number {
  const idx = timelineSteps.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date)
  let addedDays = 0
  while (addedDays < days) {
    result = new Date(result.getTime() + 24 * 60 * 60 * 1000)
    const day = result.getDay()
    if (day !== 5 && day !== 6) { // Friday=5, Saturday=6 in Saudi
      addedDays++
    }
  }
  return result
}

function getEstimatedDelivery(createdAt: string, status: string): string {
  if (status === 'delivered') return 'تم التوصيل'
  if (status === 'cancelled') return '—'
  const created = new Date(createdAt)
  const startEstimate = addBusinessDays(created, 3)
  const endEstimate = addBusinessDays(created, 5)
  const startStr = startEstimate.toLocaleDateString('ar-SA', {
    month: 'long',
    day: 'numeric',
  })
  const endStr = endEstimate.toLocaleDateString('ar-SA', {
    month: 'long',
    day: 'numeric',
  })
  return `${startStr} - ${endStr}`
}

function getExpectedDeliveryCard(createdAt: string, status: string): {
  date: string
  weatherIcon: React.ReactNode
  weatherText: string
  gradient: string
} {
  if (status === 'delivered') {
    return {
      date: 'تم التوصيل ✓',
      weatherIcon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
      weatherText: 'تم توصيل طلبك بنجاح',
      gradient: 'from-green-500/10 to-emerald-500/10',
    }
  }
  if (status === 'cancelled') {
    return {
      date: '—',
      weatherIcon: <XCircle className="h-8 w-8 text-red-400" />,
      weatherText: 'تم إلغاء الطلب',
      gradient: 'from-red-500/10 to-rose-500/10',
    }
  }

  const created = new Date(createdAt)
  const endEstimate = addBusinessDays(created, 5)
  const month = endEstimate.getMonth()
  const dateStr = endEstimate.toLocaleDateString('ar-SA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // Weather based on month in Saudi Arabia
  let weatherIcon: React.ReactNode
  let weatherText: string
  let gradient: string

  if (month >= 5 && month <= 8) { // June-Sept: very hot
    weatherIcon = <Sun className="h-8 w-8 text-orange-400" />
    weatherText = 'حار — احفظي المنتجات من الحرارة'
    gradient = 'from-orange-500/10 to-yellow-500/10'
  } else if (month >= 2 && month <= 4) { // March-May: warm/spring
    weatherIcon = <CloudSun className="h-8 w-8 text-amber-400" />
    weatherText = 'طقس معتدل — مثالي للتوصيل'
    gradient = 'from-amber-500/10 to-sky-500/10'
  } else if (month >= 10 || month <= 1) { // Nov-Feb: mild/cool
    weatherIcon = <ThermometerSun className="h-8 w-8 text-sky-400" />
    weatherText = 'طقس لطيف — وصول آمن'
    gradient = 'from-sky-500/10 to-indigo-500/10'
  } else { // Rare rainy days
    weatherIcon = <CloudRain className="h-8 w-8 text-blue-400" />
    weatherText = 'قد يكون هناك تأخير بسبب الأمطار'
    gradient = 'from-blue-500/10 to-slate-500/10'
  }

  return { date: dateStr, weatherIcon, weatherText, gradient }
}

function getPaymentMethod(order: Order): string {
  return 'الدفع عند الاستلام'
}

function VerticalOrderTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const currentStep = getStepIndex(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
        >
          <XCircle className="h-6 w-6 text-red-500" />
        </motion.div>
        <div>
          <p className="font-semibold text-red-600 dark:text-red-400">تم إلغاء الطلب</p>
          <p className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-2">
      {timelineSteps.map((step, i) => {
        const isCompleted = i <= currentStep
        const isCurrent = i === currentStep
        const IconComp = step.icon
        const isLast = i === timelineSteps.length - 1

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="relative flex items-start gap-4 pb-6 last:pb-0"
          >
            {/* Step connector with animated fill */}
            {!isLast && (
              <div className="absolute right-[19px] top-10 bottom-0 w-0.5">
                {/* Background dotted line */}
                <div className="absolute inset-0 border-r-2 border-dashed border-border" />
                {/* Gold fill animation */}
                <motion.div
                  initial={{ height: '0%' }}
                  animate={{ height: isCompleted && i < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                  className="absolute top-0 right-0 w-0.5 bg-[#D4A574]"
                  style={{
                    boxShadow: '0 0 6px rgba(212,165,116,0.4)',
                  }}
                />
              </div>
            )}

            {/* Step dot/circle */}
            <div className="relative z-10 shrink-0">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
                  className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md ${
                    isCurrent
                      ? 'bg-[#D4A574] text-white ring-4 ring-[#D4A574]/20'
                      : 'bg-[#D4A574]/90 text-white'
                  }`}
                >
                  <IconComp className="h-5 w-5" />
                </motion.div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <IconComp className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              {/* Animated pulse for current step */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 h-10 w-10 rounded-full bg-[#D4A574]/30"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>

            {/* Step content */}
            <div className="pt-1.5 min-w-0">
              <p className={`font-semibold text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
              <p className={`text-xs mt-0.5 ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                {step.description}
              </p>
              {isCurrent && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5"
                >
                  <Badge variant="secondary" className="text-[10px] gap-1 bg-[#D4A574]/10 text-[#D4A574]">
                    <Sparkles className="h-3 w-3" />
                    الحالة الحالية
                  </Badge>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function TrackShipmentDialog({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}) {
  if (!order) return null

  const trackingNumber = `DN-${order.id.slice(0, 8).toUpperCase()}`

  // Simulate tracking events based on order status
  const trackingEvents = [
    {
      status: 'completed',
      title: 'تم استلام الطلب',
      location: 'مستودع DONATELLA - الرياض',
      time: new Date(order.createdAt).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' }) + '، 9:00 صباحاً',
    },
    {
      status: 'completed',
      title: 'جاري التجهيز والتغليف',
      location: 'مستودع DONATELLA - الرياض',
      time: new Date(order.createdAt).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' }) + '، 2:30 مساءً',
    },
    {
      status: order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 'current',
      title: 'تم التسليم لشركة الشحن',
      location: 'فرع أرامكس - الرياض',
      time: new Date(new Date(order.createdAt).getTime() + 86400000).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' }) + '، 10:30 صباحاً',
    },
    {
      status: order.status === 'shipped' ? 'current' : order.status === 'delivered' ? 'completed' : 'pending',
      title: 'الشحنة في الطريق',
      location: 'في الطريق إلى وجهتك',
      time: 'قيد التحديث',
    },
    {
      status: order.status === 'delivered' ? 'completed' : 'pending',
      title: 'تم التوصيل',
      location: 'عنوان التوصيل',
      time: order.status === 'delivered' ? 'تم بنجاح' : getEstimatedDelivery(order.createdAt, order.status),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0" dir="rtl">
        <div className="p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-[#D4A574]" />
              تتبع الشحنة
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              طلب #{order.id.slice(-6).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[70vh]">
        <div className="p-6 space-y-5">
          {/* Tracking Number */}
          <div className="p-4 rounded-xl bg-gradient-to-l from-[#D4A574]/10 to-transparent border border-[#D4A574]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">رقم التتبع</p>
                <p className="text-lg font-bold text-[#D4A574] font-mono tracking-wider" dir="ltr">{trackingNumber}</p>
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="h-10 w-10 rounded-full bg-[#D4A574]/10 flex items-center justify-center"
              >
                <Navigation className="h-5 w-5 text-[#D4A574]" />
              </motion.div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative rounded-xl overflow-hidden border border-border/30 h-52 bg-gradient-to-br from-[#E8D5C4]/30 via-[#D4A574]/5 to-[#C4A4A4]/10 flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }} />
            {/* Saudi Arabia map outline hint */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `radial-gradient(ellipse at 60% 45%, #D4A574 0%, transparent 60%)`,
            }} />

            <div className="text-center relative z-10">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Truck className="h-12 w-12 text-[#D4A574] mx-auto mb-2" />
              </motion.div>
              <p className="text-sm font-medium text-foreground">الشحنة في الطريق</p>
              <p className="text-xs text-muted-foreground mt-1">آخر تحديث: منذ ساعة</p>
            </div>

            {/* Animated route line with dashes */}
            <motion.div
              className="absolute bottom-10 right-10 left-10 h-0.5 bg-border/50"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, #D4A57433, #D4A57433 4px, transparent 4px, transparent 8px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-[#D4A574]"
                style={{ boxShadow: '0 0 8px rgba(212,165,116,0.5)' }}
                initial={{ width: '0%' }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </motion.div>
            {/* Origin dot - Riyadh */}
            <div className="absolute bottom-8 right-8 z-10">
              <div className="h-5 w-5 rounded-full bg-[#D4A574] border-2 border-white shadow-md" />
              <span className="text-[9px] text-[#D4A574] font-medium absolute -bottom-3 right-0 whitespace-nowrap">الرياض</span>
            </div>
            {/* Moving truck indicator */}
            <motion.div
              className="absolute bottom-7 z-20"
              initial={{ right: '36px' }}
              animate={{ right: 'calc(36px + 60% - 36px)' }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            >
              <div className="h-3 w-3 rounded-full bg-[#D4A574] shadow-lg shadow-[#D4A574]/50" />
            </motion.div>
            {/* Destination dot */}
            <div className="absolute bottom-8 left-8 z-10">
              <div className="h-5 w-5 rounded-full bg-muted border-2 border-border" />
              <span className="text-[9px] text-muted-foreground font-medium absolute -bottom-3 left-0 whitespace-nowrap">وجهتك</span>
            </div>
          </div>

          {/* Detailed Tracking Timeline */}
          <div className="space-y-0">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#D4A574]" />
              تفاصيل التتبع
            </h4>
            {trackingEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="relative flex items-start gap-3 pb-4 last:pb-0"
              >
                {/* Connector line */}
                {i < trackingEvents.length - 1 && (
                  <div className="absolute right-[9px] top-5 bottom-0 w-px">
                    <div className={`h-full ${event.status === 'completed' ? 'bg-[#D4A574]/40' : 'bg-border'}`} />
                  </div>
                )}
                {/* Step indicator */}
                <div className="shrink-0 mt-0.5">
                  {event.status === 'completed' ? (
                    <div className="h-5 w-5 rounded-full bg-[#D4A574] flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  ) : event.status === 'current' ? (
                    <div className="relative">
                      <div className="h-5 w-5 rounded-full bg-[#D4A574] flex items-center justify-center">
                        <Truck className="h-3 w-3 text-white" />
                      </div>
                      <motion.div
                        className="absolute inset-0 h-5 w-5 rounded-full bg-[#D4A574]/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-muted border border-border" />
                  )}
                </div>
                {/* Content */}
                <div className={`flex-1 min-w-0 ${event.status === 'pending' ? 'opacity-50' : ''}`}>
                  <p className={`text-sm font-medium ${event.status === 'completed' || event.status === 'current' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carrier info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20 text-sm">
              <span className="text-muted-foreground">شركة الشحن</span>
              <span className="font-medium">أرامكس</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20 text-sm">
              <span className="text-muted-foreground">نوع الشحن</span>
              <span className="font-medium">عادي</span>
            </div>
          </div>

          {/* Expected delivery in dialog */}
          <div className="p-4 rounded-xl bg-gradient-to-l from-[#D4A574]/10 to-transparent border border-[#D4A574]/20">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#D4A574] shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">التوصيل المتوقع</p>
                <p className="text-sm font-bold text-foreground">{getEstimatedDelivery(order.createdAt, order.status)}</p>
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function OrderDetailModal({
  order,
  open,
  onClose,
  onCancel,
  onReorder,
  onPrint,
  cancellingId,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
  onCancel: (id: string) => void
  onReorder: (order: Order) => void
  onPrint: (order: Order) => void
  cancellingId: string | null
}) {
  const [trackDialogOpen, setTrackDialogOpen] = useState(false)

  if (!order) return null

  const status = statusMap[order.status] || statusMap.pending
  const canCancel = order.status === 'pending'
  const canReorder = order.status === 'delivered'
  const isShipped = order.status === 'shipped' || order.status === 'confirmed'
  const navigateToProduct = useUIStore.getState().navigateToProduct
  const deliveryCard = getExpectedDeliveryCard(order.createdAt, order.status)

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0" dir="rtl">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border/50">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">
                  طلب #{order.id.slice(-6).toUpperCase()}
                </DialogTitle>
                <Badge className={`${status.color} gap-1 font-medium text-sm`}>
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
              <DialogDescription className="text-muted-foreground text-sm mt-1">
                {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Tracking Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#D4A574]" />
                    تتبع الطلب
                  </h4>
                  {isShipped && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5 text-xs h-8 border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
                      onClick={() => setTrackDialogOpen(true)}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      تتبع الشحنة
                    </Button>
                  )}
                </div>
                <VerticalOrderTimeline status={order.status} createdAt={order.createdAt} />
              </div>

              <Separator />

              {/* Expected Delivery Card with Weather */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 bg-gradient-to-l ${deliveryCard.gradient} border border-border/30`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{deliveryCard.weatherIcon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">التوصيل المتوقع</p>
                    <p className="text-base font-bold text-foreground">{deliveryCard.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">{deliveryCard.weatherText}</p>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <CalendarDays className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">تاريخ التوصيل المتوقع</p>
                    <p className="text-sm font-semibold">
                      {getEstimatedDelivery(order.createdAt, order.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <MapPin className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">عنوان التوصيل</p>
                    <p className="text-sm font-semibold line-clamp-2">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <CreditCard className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">طريقة الدفع</p>
                    <p className="text-sm font-semibold">{getPaymentMethod(order)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <Package className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">عدد المنتجات</p>
                    <p className="text-sm font-semibold">
                      {order.orderItems.length} منتج ({order.orderItems.reduce((a, b) => a + b.quantity, 0)} قطعة)
                    </p>
                  </div>
                </div>
              </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                المنتجات
              </h4>
              <div className="space-y-3">
                {order.orderItems.map((item) => {
                  const images: string[] = item.product
                    ? safeJsonParse<string[]>(item.product.images)
                    : []
                  const mainImage = images[0] || '/products/dress-1.png'

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-center p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors border border-border/20"
                    >
                      <button
                        onClick={() => {
                          if (item.product) {
                            navigateToProduct(item.productId)
                            onClose()
                          }
                        }}
                        className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/30"
                      >
                        <Image
                          src={mainImage}
                          alt={item.product?.nameAr || 'منتج'}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product?.nameAr || 'منتج'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.size && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              المقاس: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              اللون: {item.color}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          الكمية: {item.quantity} × {item.price.toFixed(0)} ج.م
                        </p>
                      </div>
                      <span className="text-sm font-bold shrink-0 text-primary">
                        {(item.price * item.quantity).toFixed(0)} ج.م
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium">{order.total.toFixed(0)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-medium text-green-600 dark:text-green-400">مجاني</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">الإجمالي</span>
                <span className="font-bold text-primary text-lg">
                  {order.total.toFixed(0)} ج.م
                </span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}

            {/* Customer Info */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">معلومات العميل</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">الاسم: </span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الهاتف: </span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/50 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() => onPrint(order)}
          >
            <Printer className="h-4 w-4" />
            طباعة الإيصال
          </Button>
          {canReorder && (
            <Button
              className="rounded-xl gap-2"
              onClick={() => {
                onReorder(order)
                onClose()
              }}
            >
              <RotateCcw className="h-4 w-4" />
              إعادة الطلب
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              className="rounded-xl gap-2"
              onClick={() => onCancel(order.id)}
              disabled={cancellingId === order.id}
            >
              {cancellingId === order.id ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              إلغاء الطلب
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Track Shipment Dialog */}
    <TrackShipmentDialog
      order={order}
      open={trackDialogOpen}
      onClose={() => setTrackDialogOpen(false)}
    />
    </>
  )
}

const filterTabs = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'delivered', label: 'تم التوصيل' },
  { key: 'cancelled', label: 'ملغي' },
]

const emptyStateMessages: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  all: {
    title: 'لا توجد طلبات',
    description: 'لم تقومي بأي طلب بعد. تصفحي المتجر واعثري على ما يعجبك!',
    icon: <Package className="h-14 w-14 text-muted-foreground/30" />,
  },
  pending: {
    title: 'لا توجد طلبات قيد الانتظار',
    description: 'ليس لديك أي طلبات قيد الانتظار حالياً',
    icon: <Clock className="h-14 w-14 text-yellow-400/50" />,
  },
  shipped: {
    title: 'لا توجد طلبات مشحونة',
    description: 'ليس لديك أي طلبات في الطريق حالياً',
    icon: <Truck className="h-14 w-14 text-purple-400/50" />,
  },
  delivered: {
    title: 'لا توجد طلبات مسلّمة',
    description: 'لم يتم توصيل أي طلبات بعد',
    icon: <CheckCircle2 className="h-14 w-14 text-green-400/50" />,
  },
  cancelled: {
    title: 'لا توجد طلبات ملغاة',
    description: 'لم يتم إلغاء أي طلبات، وهذا جيد!',
    icon: <XCircle className="h-14 w-14 text-red-400/50" />,
  },
}

export default function OrdersSection() {
  const setPage = useUIStore((s) => s.setPage)
  const user = useAuthStore((s) => s.user)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setCartOpen)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!user) return
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleRefresh = () => {
    fetchOrders(true)
    toast.success('تم تحديث الطلبات')
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setModalOpen(true)
  }

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return
    setCancellingId(orderToCancel)
    setCancelDialogOpen(false)

    try {
      const res = await fetch(`/api/orders/${orderToCancel}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderToCancel ? { ...o, status: 'cancelled' } : o))
        )
        if (selectedOrder?.id === orderToCancel) {
          setSelectedOrder((prev) => prev ? { ...prev, status: 'cancelled' } : null)
        }
        toast.success('تم إلغاء الطلب بنجاح')
      } else {
        toast.error(data.error || 'فشل إلغاء الطلب')
      }
    } catch {
      toast.error('حدث خطأ أثناء إلغاء الطلب')
    } finally {
      setCancellingId(null)
      setOrderToCancel(null)
    }
  }

  const handleReorder = async (order: Order) => {
    if (!user) return
    try {
      for (const item of order.orderItems) {
        if (item.product) {
          await addItem(item.productId, item.quantity, item.size || undefined, item.color || undefined)
        }
      }
      toast.success('تمت إضافة المنتجات إلى السلة')
      setCartOpen(true)
    } catch {
      toast.error('حدث خطأ أثناء إعادة الطلب')
    }
  }

  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const itemsHtml = order.orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.product?.nameAr || 'منتج'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:left;">${item.price.toFixed(0)} ج.م</td>
      </tr>
    `
      )
      .join('')

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
      <head><title>إيصال طلب #${order.id.slice(-6).toUpperCase()}</title></head>
      <body style="font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:auto;">
        <h1 style="text-align:center;margin-bottom:8px;">DONATELLA</h1>
        <p style="text-align:center;color:#888;margin-bottom:24px;">إيصال طلب</p>
        <p><strong>رقم الطلب:</strong> #${order.id.slice(-6).toUpperCase()}</p>
        <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
        <p><strong>الحالة:</strong> ${statusMap[order.status]?.label || order.status}</p>
        <p><strong>الاسم:</strong> ${order.customerName}</p>
        <p><strong>العنوان:</strong> ${order.address}</p>
        <hr style="margin:16px 0;" />
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:right;">المنتج</th>
              <th style="padding:8px;text-align:center;">الكمية</th>
              <th style="padding:8px;text-align:left;">السعر</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <hr style="margin:16px 0;" />
        <p style="text-align:left;font-size:18px;font-weight:bold;">الإجمالي: ${order.total.toFixed(0)} ج.م</p>
        <p style="text-align:center;margin-top:40px;color:#888;font-size:12px;">شكراً لتسوقك مع DONATELLA</p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredOrders = activeFilter === 'all'
    ? orders
    : activeFilter === 'shipped'
      ? orders.filter((o) => o.status === 'shipped' || o.status === 'confirmed')
      : orders.filter((o) => o.status === activeFilter)

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    shipped: orders.filter((o) => o.status === 'shipped' || o.status === 'confirmed').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  if (!user) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative mb-6 mx-auto w-fit">
            <div className="h-32 w-32 rounded-full bg-secondary/50 flex items-center justify-center">
              <Package className="h-14 w-14 text-muted-foreground/30" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-muted-foreground text-sm mb-6">
            يجب تسجيل الدخول لعرض الطلبات
          </p>
          <Button onClick={() => setPage('auth')}>تسجيل الدخول</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">طلباتي</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                تابعي حالة طلباتك وتفاصيلها
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-10 w-10"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs value={activeFilter} onValueChange={setActiveFilter} dir="rtl">
            <TabsList className="w-full flex-wrap h-auto gap-1 p-1 bg-secondary/50">
              {filterTabs.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-lg text-xs sm:text-sm gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab.label}
                  {orderCounts[tab.key as keyof typeof orderCounts] > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 px-1.5 text-[10px] rounded-full"
                    >
                      {orderCounts[tab.key as keyof typeof orderCounts]}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            {filterTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                {loading ? (
                  <div className="space-y-4 mt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Skeleton className="h-36 rounded-2xl" />
                      </motion.div>
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-28 w-28 rounded-full bg-secondary/50 flex items-center justify-center"
                      >
                        {emptyStateMessages[tab.key]?.icon || emptyStateMessages.all.icon}
                      </motion.div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {emptyStateMessages[tab.key]?.title || 'لا توجد طلبات'}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                      {emptyStateMessages[tab.key]?.description || 'لا توجد طلبات'}
                    </p>
                    {tab.key === 'all' && (
                      <Button onClick={() => setPage('shop')} className="rounded-xl gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        تسوقي الآن
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {filteredOrders.map((order, i) => {
                      const orderStatus = statusMap[order.status] || statusMap.pending
                      const canCancel = order.status === 'pending'
                      const canReorder = order.status === 'delivered'

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          layout
                        >
                          <Card
                            className="rounded-2xl border-border/50 overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
                            onClick={() => openOrderDetail(order)}
                          >
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-center gap-4">
                                {/* Status indicator */}
                                <div className={`h-2 w-2 rounded-full shrink-0 ${orderStatus.bgColor}`} />

                                {/* Order Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm sm:text-base">
                                      طلب #{order.id.slice(-6).toUpperCase()}
                                    </span>
                                    <Badge className={`${orderStatus.color} gap-1 font-medium text-xs`}>
                                      {orderStatus.icon}
                                      {orderStatus.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <ShoppingBag className="h-3.5 w-3.5" />
                                      {order.orderItems.length} منتج
                                    </span>
                                    <span className="font-bold text-primary">
                                      {order.total.toFixed(0)} ج.م
                                    </span>
                                  </div>

                                  {/* Quick action buttons */}
                                  {(canCancel || canReorder || order.status === 'shipped' || order.status === 'confirmed') && (
                                    <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                      {(order.status === 'shipped' || order.status === 'confirmed') && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-lg gap-1.5 h-7 text-xs border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
                                          onClick={() => openOrderDetail(order)}
                                        >
                                          <Navigation className="h-3 w-3" />
                                          تتبع الشحنة
                                        </Button>
                                      )}
                                      {canReorder && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-lg gap-1.5 h-7 text-xs"
                                          onClick={() => handleReorder(order)}
                                        >
                                          <RotateCcw className="h-3 w-3" />
                                          إعادة الطلب
                                        </Button>
                                      )}
                                      {canCancel && (
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="rounded-lg gap-1.5 h-7 text-xs"
                                          onClick={() => handleCancelClick(order.id)}
                                          disabled={cancellingId === order.id}
                                        >
                                          {cancellingId === order.id ? (
                                            <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Ban className="h-3 w-3" />
                                          )}
                                          إلغاء
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Arrow */}
                                <ChevronLeft className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCancel={handleCancelClick}
        onReorder={handleReorder}
        onPrint={handlePrintReceipt}
        cancellingId={cancellingId}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} dir="rtl">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              تأكيد إلغاء الطلب
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنتِ متأكدة من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              نعم، إلغاء الطلب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
