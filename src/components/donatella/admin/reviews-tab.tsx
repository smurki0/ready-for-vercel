'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  MessageSquare,
  Trash2,
  Search,
  RefreshCw,
  Pin,
  PinOff,
  CheckCircle2,
  XCircle,
  Reply,
  Clock,
  User,
  ShieldCheck,
  ChevronDown,
  Filter,
  Send,
  Loader2,
  AlertCircle,
  Package,
  TrendingUp,
  Eye,
  EyeOff,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
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
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewUser {
  id: string
  name: string
  avatar: string | null
  email: string
}

interface ReviewProduct {
  id: string
  nameAr: string
  nameEn: string
  images: string | string[]
}

interface ReviewItem {
  id: string
  userId: string
  productId: string
  rating: number
  comment: string | null
  adminReply: string | null
  approved: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
  user: ReviewUser
  product: ReviewProduct | null
}

interface ReviewStats {
  totalReviews: number
  approvedCount: number
  pendingCount: number
  pinnedCount: number
  repliedCount: number
  avgRating: number
  ratingDistribution: { star: number; count: number }[]
}

type FilterType = 'all' | 'approved' | 'pending' | 'replied' | 'unreplied'
type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1: return 'سيء'
    case 2: return 'ضعيف'
    case 3: return 'مقبول'
    case 4: return 'جيد'
    case 5: return 'ممتاز'
    default: return ''
  }
}

function getRatingColor(rating: number): string {
  switch (rating) {
    case 1: return 'text-red-500'
    case 2: return 'text-orange-500'
    case 3: return 'text-yellow-500'
    case 4: return 'text-emerald-500'
    case 5: return 'text-green-500'
    default: return 'text-muted-foreground'
  }
}

function getProductImage(product: ReviewItem['product']): string {
  if (!product) return '/products/placeholder.png'
  const images = product.images
  if (Array.isArray(images)) return images[0] || '/products/placeholder.png'
  if (typeof images === 'string' && images.startsWith('[')) {
    try {
      const arr = JSON.parse(images)
      return arr[0] || '/products/placeholder.png'
    } catch {
      return images
    }
  }
  return typeof images === 'string' && images ? images : '/products/placeholder.png'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 transition-colors duration-200 ${
            star <= rating
              ? 'fill-[#D4A574] text-[#D4A574]'
              : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ReviewsTab({ isMobile }: { isMobile: boolean }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')

  // Detail dialog
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Reply dialog
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyTarget, setReplyTarget] = useState<ReviewItem | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // ─── Fetch Reviews ──────────────────────────────────────────────────

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (ratingFilter !== 'all') params.set('rating', ratingFilter)
      if (filterType === 'approved') params.set('approved', 'true')
      else if (filterType === 'pending') params.set('approved', 'false')
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/reviews?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.data.reviews || [])
        setStats(data.data.stats || null)
      }
    } catch {
      toast.error('فشل تحميل التعليقات')
    } finally {
      setLoading(false)
    }
  }, [filterType, ratingFilter, searchQuery])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // ─── Actions ──────────────────────────────────────────────────────────

  const toggleApproved = async (review: ReviewItem) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !review.approved }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, approved: !r.approved } : r))
        )
        if (selectedReview?.id === review.id) {
          setSelectedReview((prev) => (prev ? { ...prev, approved: !prev.approved } : null))
        }
        toast.success(review.approved ? 'تم إخفاء التعليق' : 'تم اعتماد التعليق')
      }
    } catch {
      toast.error('فشل تحديث التعليق')
    }
  }

  const togglePinned = async (review: ReviewItem) => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !review.pinned }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, pinned: !r.pinned } : r))
        )
        if (selectedReview?.id === review.id) {
          setSelectedReview((prev) => (prev ? { ...prev, pinned: !prev.pinned } : null))
        }
        toast.success(review.pinned ? 'تم إلغاء التثبيت' : 'تم تثبيت التعليق')
      }
    } catch {
      toast.error('فشل تحديث التعليق')
    }
  }

  const submitReply = async () => {
    if (!replyTarget || !replyText.trim()) return
    setReplySubmitting(true)
    try {
      const res = await fetch(`/api/admin/reviews/${replyTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === replyTarget.id ? { ...r, adminReply: replyText.trim() } : r))
        )
        if (selectedReview?.id === replyTarget.id) {
          setSelectedReview((prev) => (prev ? { ...prev, adminReply: replyText.trim() } : null))
        }
        toast.success('تم إرسال الرد بنجاح')
        setReplyDialogOpen(false)
        setReplyTarget(null)
        setReplyText('')
      } else {
        toast.error(data.error || 'فشل إرسال الرد')
      }
    } catch {
      toast.error('حدث خطأ أثناء إرسال الرد')
    } finally {
      setReplySubmitting(false)
    }
  }

  const deleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
        if (selectedReview?.id === id) {
          setSelectedReview(null)
          setDetailDialogOpen(false)
        }
        toast.success('تم حذف التعليق')
      }
    } catch {
      toast.error('فشل حذف التعليق')
    }
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  const openReview = (review: ReviewItem) => {
    setSelectedReview(review)
    setDetailDialogOpen(true)
  }

  const openReplyDialog = (review: ReviewItem) => {
    setReplyTarget(review)
    setReplyText(review.adminReply || '')
    setReplyDialogOpen(true)
  }

  const confirmDelete = (id: string) => {
    setDeleteTarget(id)
    setDeleteConfirmOpen(true)
  }

  // ─── Computed ─────────────────────────────────────────────────────────

  const filteredReviews = reviews.filter((r) => {
    if (filterType === 'replied' && !r.adminReply) return false
    if (filterType === 'unreplied' && r.adminReply) return false
    if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter)) return false
    return true
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
            <MessageSquare className="h-6 w-6 text-[#D4A574]" />
            تعليقات الزبائن
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {stats ? `${stats.totalReviews} تعليق — متوسط التقييم ${stats.avgRating} نجوم` : 'إدارة تعليقات وتقييمات العملاء'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReviews}
          className="gap-1.5 rounded-xl text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">تحديث</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="rounded-2xl dark-glow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-0.5">إجمالي التعليقات</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl dark-glow-card border-r-4 border-r-green-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">معتمدة</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl dark-glow-card border-r-4 border-r-yellow-500">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">بانتظار المراجعة</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl dark-glow-card border-r-4 border-r-[#D4A574]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#D4A574]">{stats.repliedCount}</div>
              <p className="text-xs text-muted-foreground mt-0.5">تم الرد عليها</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.totalReviews > 0 && (
        <Card className="rounded-2xl dark-glow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.avgRating}</div>
                <StarRating rating={Math.round(stats.avgRating)} />
              </div>
              <Separator orientation="vertical" className="h-12 dark:bg-[#3A3532]/60" />
              <div className="flex-1 space-y-1.5">
                {stats.ratingDistribution
                  .slice()
                  .sort((a, b) => b.star - a.star)
                  .map((item) => {
                    const maxCount = Math.max(...stats.ratingDistribution.map((d) => d.count), 1)
                    return (
                      <div key={item.star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-8 text-left" dir="ltr">
                          {item.star} ★
                        </span>
                        <Progress
                          value={maxCount > 0 ? (item.count / maxCount) * 100 : 0}
                          className="h-1.5 flex-1 bg-muted [&>[data-slot=indicator]]:bg-[#D4A574]"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">{item.count}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو التعليق أو المنتج..."
            className="rounded-xl pr-10"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as FilterType)}
        >
          <SelectTrigger className="rounded-xl w-[160px]">
            <Filter className="h-3.5 w-3.5 ml-1.5 text-muted-foreground" />
            <SelectValue placeholder="التصفية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="approved">معتمدة</SelectItem>
            <SelectItem value="pending">بانتظار المراجعة</SelectItem>
            <SelectItem value="replied">تم الرد</SelectItem>
            <SelectItem value="unreplied">بدون رد</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={ratingFilter}
          onValueChange={(v) => setRatingFilter(v as RatingFilter)}
        >
          <SelectTrigger className="rounded-xl w-[130px]">
            <Star className="h-3.5 w-3.5 ml-1.5 text-[#D4A574]" />
            <SelectValue placeholder="التقييم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التقييمات</SelectItem>
            <SelectItem value="5">5 نجوم</SelectItem>
            <SelectItem value="4">4 نجوم</SelectItem>
            <SelectItem value="3">3 نجوم</SelectItem>
            <SelectItem value="2">نجمتان</SelectItem>
            <SelectItem value="1">نجمة واحدة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {loading ? (
        renderSkeletons()
      ) : filteredReviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 dark:bg-[#2A2522] mb-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد تعليقات</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery || filterType !== 'all'
              ? 'لم يتم العثور على تعليقات مطابقة'
              : 'ستظهر تعليقات العملاء هنا عند إضافتها'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2 max-h-[700px] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`rounded-2xl dark-glow-card transition-all duration-200 cursor-pointer hover:shadow-md hover:shadow-[#D4A574]/5 group ${
                    !review.approved
                      ? 'border-r-4 border-r-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/5'
                      : review.pinned
                        ? 'border-r-4 border-r-[#D4A574] bg-[#D4A574]/[0.02] dark:bg-[#D4A574]/5'
                        : ''
                  }`}
                  onClick={() => openReview(review)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="shrink-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          review.pinned
                            ? 'bg-gradient-to-br from-[#D4A574] to-[#b8885a] text-white shadow-md shadow-[#D4A574]/20'
                            : 'bg-muted dark:bg-[#2A2522] text-muted-foreground'
                        }`}>
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={review.user.name} className="h-full w-full rounded-xl object-cover" />
                          ) : (
                            <User className="h-4.5 w-4.5" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-foreground line-clamp-1">
                                {review.user?.name || 'مستخدم'}
                              </h4>
                              {review.pinned && (
                                <Badge className="text-[10px] bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20 h-5 gap-0.5">
                                  <Pin className="h-2.5 w-2.5" />
                                  مثبت
                                </Badge>
                              )}
                              {!review.approved && (
                                <Badge className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 h-5 gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  بانتظار المراجعة
                                </Badge>
                              )}
                              {review.adminReply && (
                                <Badge className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 h-5 gap-0.5">
                                  <MessageCircle className="h-2.5 w-2.5" />
                                  تم الرد
                                </Badge>
                              )}
                            </div>
                            {/* Product + Rating row */}
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <StarRating rating={review.rating} />
                              <span className={`text-xs font-medium ${getRatingColor(review.rating)}`}>
                                {getRatingLabel(review.rating)}
                              </span>
                              {review.product && (
                                <>
                                  <span className="text-muted-foreground/40">•</span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {review.product.nameAr}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Quick actions (visible on hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); toggleApproved(review) }}
                              className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-500/10"
                              title={review.approved ? 'إخفاء التعليق' : 'اعتماد التعليق'}
                            >
                              {review.approved ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); togglePinned(review) }}
                              className={`h-7 w-7 p-0 rounded-lg ${review.pinned ? 'text-[#D4A574] hover:bg-[#D4A574]/10' : 'text-muted-foreground hover:text-[#D4A574] hover:bg-[#D4A574]/10'}`}
                              title={review.pinned ? 'إلغاء التثبيت' : 'تثبيت التعليق'}
                            >
                              {review.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); openReplyDialog(review) }}
                              className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                              title="رد على التعليق"
                            >
                              <Reply className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); confirmDelete(review.id) }}
                              className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="حذف التعليق"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Comment preview */}
                        {review.comment && (
                          <p className="text-xs mt-1.5 line-clamp-2 text-foreground/70">
                            {review.comment}
                          </p>
                        )}

                        {/* Admin reply preview */}
                        {review.adminReply && (
                          <div className="mt-2 p-2 rounded-lg bg-[#D4A574]/5 dark:bg-[#D4A574]/10 border border-[#D4A574]/10 dark:border-[#D4A574]/20">
                            <div className="flex items-center gap-1.5 mb-1">
                              <ShieldCheck className="h-3 w-3 text-[#D4A574]" />
                              <span className="text-[10px] font-semibold text-[#D4A574]">رد الإدارة</span>
                            </div>
                            <p className="text-xs text-foreground/60 line-clamp-1">{review.adminReply}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Review Detail Dialog ─── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#D4A574] fill-[#D4A574]" />
                    تفاصيل التعليق
                  </DialogTitle>
                  <div className="flex items-center gap-1.5">
                    {selectedReview.pinned && (
                      <Badge className="text-[10px] bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20">
                        <Pin className="h-2.5 w-2.5 ml-0.5" />
                        مثبت
                      </Badge>
                    )}
                    <Badge
                      className={`text-[10px] ${
                        selectedReview.approved
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                      }`}
                    >
                      {selectedReview.approved ? (
                        <><CheckCircle2 className="h-2.5 w-2.5 ml-0.5" />معتمد</>
                      ) : (
                        <><Clock className="h-2.5 w-2.5 ml-0.5" />بانتظار المراجعة</>
                      )}
                    </Badge>
                  </div>
                </div>
                <DialogDescription className="sr-only">
                  تفاصيل تعليق من {selectedReview.user?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* User Info */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 dark:bg-[#2A2522]/50">
                  <div className="shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {selectedReview.user?.avatar ? (
                      <img src={selectedReview.user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      selectedReview.user?.name?.charAt(0) || 'م'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-foreground">{selectedReview.user?.name || 'مستخدم'}</h4>
                    <p className="text-xs text-muted-foreground" dir="ltr">{selectedReview.user?.email}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                {selectedReview.product && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 dark:bg-[#1A1614]/50 border border-border/30 dark:border-[#3A3532]/40">
                    <div className="shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={getProductImage(selectedReview.product)}
                        alt={selectedReview.product.nameAr}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        المنتج
                      </p>
                      <p className="text-sm font-medium text-foreground line-clamp-1">{selectedReview.product.nameAr}</p>
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التقييم</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={selectedReview.rating} />
                    <span className={`text-sm font-semibold ${getRatingColor(selectedReview.rating)}`}>
                      {selectedReview.rating}/5 — {getRatingLabel(selectedReview.rating)}
                    </span>
                  </div>
                </div>

                <Separator className="dark:bg-[#3A3532]/60" />

                {/* Comment */}
                {selectedReview.comment && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">التعليق</p>
                    <div className="p-4 rounded-xl bg-muted/30 dark:bg-[#1A1614]/50 border border-border/30 dark:border-[#3A3532]/40 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedReview.comment}
                    </div>
                  </div>
                )}

                {/* Admin Reply */}
                {selectedReview.adminReply && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-[#D4A574]" />
                      رد الإدارة
                    </p>
                    <div className="p-4 rounded-xl bg-[#D4A574]/5 dark:bg-[#D4A574]/10 border border-[#D4A574]/20 dark:border-[#D4A574]/30 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedReview.adminReply}
                    </div>
                  </div>
                )}

                <Separator className="dark:bg-[#3A3532]/60" />

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleApproved(selectedReview)}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    {selectedReview.approved ? (
                      <><EyeOff className="h-3.5 w-3.5" />إخفاء</>
                    ) : (
                      <><Eye className="h-3.5 w-3.5" />اعتماد</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePinned(selectedReview)}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    {selectedReview.pinned ? (
                      <><PinOff className="h-3.5 w-3.5" />إلغاء التثبيت</>
                    ) : (
                      <><Pin className="h-3.5 w-3.5" />تثبيت</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDetailDialogOpen(false)
                      setTimeout(() => openReplyDialog(selectedReview), 150)
                    }}
                    className="gap-1.5 rounded-xl text-xs bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white border-0 shadow-md"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    {selectedReview.adminReply ? 'تعديل الرد' : 'رد'}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(selectedReview.id)}
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

      {/* ─── Reply Dialog ─── */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          {replyTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Reply className="h-5 w-5 text-[#D4A574]" />
                  {replyTarget.adminReply ? 'تعديل الرد' : 'الرد على التعليق'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  الرد على تعليق {replyTarget.user?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Original comment preview */}
                <div className="p-3 rounded-xl bg-muted/30 dark:bg-[#1A1614]/50 border border-border/30 dark:border-[#3A3532]/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{replyTarget.user?.name}</span>
                    <StarRating rating={replyTarget.rating} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {replyTarget.comment || '(بدون تعليق كتابي)'}
                  </p>
                </div>

                {/* Reply textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">رد الإدارة</label>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتبي ردك على هذا التعليق..."
                    className="min-h-[120px] resize-none rounded-xl border-[#C4A4A4]/20 dark:border-[#C4A4A4]/30 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
                    dir="rtl"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={submitReply}
                    disabled={replySubmitting || !replyText.trim()}
                    className="gap-1.5 rounded-xl bg-gradient-to-l from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] text-white border-0 shadow-md"
                  >
                    {replySubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {replySubmitting ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setReplyDialogOpen(false); setReplyTarget(null); setReplyText('') }}
                    className="rounded-xl"
                  >
                    إلغاء
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
              حذف التعليق
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteReview(deleteTarget)}
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
