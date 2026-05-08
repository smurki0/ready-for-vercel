'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  MessageSquare,
  Send,
  Loader2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  PenLine,
  ShieldCheck,
  Pin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { toast } from 'sonner'

interface ReviewUser {
  id: string
  name: string
  avatar: string | null
}

interface Review {
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
}

interface ReviewStats {
  totalReviews: number
  avgRating: number
  ratingDistribution: { star: number; count: number }[]
}

interface ProductReviewsProps {
  productId: string
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-6 w-6',
  }

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} transition-colors duration-200 ${
            star <= rating
              ? 'fill-[#D4A574] text-[#D4A574]'
              : 'fill-muted text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="p-0.5 transition-transform"
        >
          <Star
            className={`h-7 w-7 transition-colors duration-200 ${
              star <= (hovered || value)
                ? 'fill-[#D4A574] text-[#D4A574]'
                : 'fill-muted text-muted-foreground/30'
            }`}
          />
        </motion.button>
      ))}
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`
  return `منذ ${Math.floor(diffDays / 365)} سنة`
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const user = useAuthStore((s) => s.user)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const setPage = useUIStore((s) => s.setPage)

  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.data.reviews)
        setStats(data.data.stats)
        // Check if current user already reviewed
        if (user) {
          setUserAlreadyReviewed(
            data.data.reviews.some((r: Review) => r.userId === user.id)
          )
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [productId, user])

  useEffect(() => {
    setLoading(true)
    fetchReviews()
  }, [fetchReviews])

  const handleSubmitReview = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    if (newRating === 0) {
      toast.error('يرجى اختيار التقييم')
      return
    }
    if (!newComment.trim()) {
      toast.error('يرجى كتابة تعليق')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('تم إرسال تقييمك بنجاح')
        setNewRating(0)
        setNewComment('')
        setShowForm(false)
        setUserAlreadyReviewed(true)
        fetchReviews()
      } else {
        toast.error(data.error || 'فشل إرسال التقييم')
      }
    } catch {
      toast.error('حدث خطأ أثناء إرسال التقييم')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalReviews = stats?.totalReviews || 0
  const avgRating = stats?.avgRating || 0
  const distribution = stats?.ratingDistribution || []
  const maxCount = Math.max(...distribution.map((d) => d.count), 1)

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#D4A574]/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-[#D4A574]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              التقييمات والمراجعات
            </h2>
            {totalReviews > 0 && (
              <p className="text-sm text-muted-foreground">
                {totalReviews} تقييم
              </p>
            )}
          </div>
        </div>
        {!userAlreadyReviewed && (
          <Button
            onClick={() => {
              if (!user) {
                setAuthModalTab('login')
                setPage('auth')
                toast.error('يرجى تسجيل الدخول أولاً')
                return
              }
              setShowForm(!showForm)
            }}
            className="gap-2 rounded-xl bg-[#D4A574] hover:bg-[#D4A574]/90 text-white"
          >
            <PenLine className="h-4 w-4" />
            اكتبي تقييمك
          </Button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-[#D4A574]/20 dark:border-[#D4A574]/30 bg-gradient-to-bl from-[#D4A574]/5 dark:from-[#D4A574]/10 to-transparent">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-foreground">
                  شاركي رأيك في هذا المنتج
                </h3>

                {/* Star Rating Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    التقييم
                  </label>
                  <div className="flex items-center gap-3">
                    <InteractiveStarRating
                      value={newRating}
                      onChange={setNewRating}
                    />
                    {newRating > 0 && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm font-medium text-[#D4A574]"
                      >
                        {newRating === 1 && 'سيء'}
                        {newRating === 2 && 'ضعيف'}
                        {newRating === 3 && 'مقبول'}
                        {newRating === 4 && 'جيد'}
                        {newRating === 5 && 'ممتاز'}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    التعليق
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="شاركي تجربتك مع هذا المنتج..."
                    className="min-h-[100px] resize-none rounded-xl border-[#C4A4A4]/20 dark:border-[#C4A4A4]/30 focus:border-[#D4A574] focus:ring-[#D4A574]/20"
                    dir="rtl"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || newRating === 0 || !newComment.trim()}
                    className="gap-2 rounded-xl bg-[#D4A574] hover:bg-[#D4A574]/90 text-white"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already reviewed message */}
      {userAlreadyReviewed && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-[#D4A574]/10 dark:bg-[#D4A574]/15 border border-[#D4A574]/20 dark:border-[#D4A574]/30"
        >
          <Star className="h-4 w-4 fill-[#D4A574] text-[#D4A574]" />
          <p className="text-sm text-[#D4A574] font-medium">
            شكراً لك! لقد قمت بتقييم هذا المنتج مسبقاً
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {totalReviews === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mx-auto h-20 w-20 rounded-full bg-[#C4A4A4]/10 dark:bg-[#C4A4A4]/15 flex items-center justify-center mb-4">
            <Star className="h-9 w-9 text-[#C4A4A4]/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            لا توجد تقييمات بعد
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            كوني أول من يشارك رأيه في هذا المنتج وساعدي المتسوقات الأخريات في اتخاذ قرارهن
          </p>
          {!userAlreadyReviewed && (
            <Button
              onClick={() => {
                if (!user) {
                  setAuthModalTab('login')
                  setPage('auth')
                  toast.error('يرجى تسجيل الدخول أولاً')
                  return
                }
                setShowForm(true)
              }}
              className="mt-4 gap-2 rounded-xl bg-[#D4A574] hover:bg-[#D4A574]/90 text-white"
            >
              <PenLine className="h-4 w-4" />
              اكتبي أول تقييم
            </Button>
          )}
        </motion.div>
      )}

      {/* Reviews Content */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-[#C4A4A4]/15 dark:border-[#C4A4A4]/25 bg-gradient-to-bl from-[#C4A4A4]/5 dark:from-[#C4A4A4]/10 to-transparent sticky top-28">
              <CardContent className="p-6 space-y-5">
                {/* Average Rating Display */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-foreground mb-1">
                    {avgRating.toFixed(1)}
                  </div>
                  <StarRating rating={Math.round(avgRating)} size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">
                    من أصل {totalReviews} تقييم
                  </p>
                </div>

                <Separator className="bg-[#C4A4A4]/15 dark:bg-[#C4A4A4]/25" />

                {/* Rating Distribution */}
                <div className="space-y-2.5">
                  {distribution
                    .slice()
                    .sort((a, b) => b.star - a.star)
                    .map((item) => (
                      <div key={item.star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-8 text-left" dir="ltr">
                          {item.star} ★
                        </span>
                        <Progress
                          value={maxCount > 0 ? (item.count / maxCount) * 100 : 0}
                          className="h-2 flex-1 bg-muted [&>[data-slot=indicator]]:bg-[#D4A574]"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {displayedReviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className={`border-border/50 hover:border-[#C4A4A4]/30 dark:hover:border-[#C4A4A4]/40 transition-colors duration-300 ${
                    review.pinned ? 'border-[#D4A574]/30 dark:border-[#D4A574]/40 bg-[#D4A574]/[0.02] dark:bg-[#D4A574]/5' : ''
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* User Avatar */}
                          <div className="h-10 w-10 rounded-full bg-gradient-to-bl from-[#C4A4A4]/30 dark:from-[#C4A4A4]/20 to-[#D4A574]/20 dark:to-[#D4A574]/15 flex items-center justify-center shrink-0">
                            {review.user.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-[#D4A574]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground text-sm">
                                {review.user.name}
                              </p>
                              {review.pinned && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-[#D4A574] bg-[#D4A574]/10 px-1.5 py-0.5 rounded-full">
                                  <Pin className="h-2.5 w-2.5" />
                                  مثبت
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}

                      {/* Admin Reply */}
                      {review.adminReply && (
                        <div className="mt-3 p-3 rounded-xl bg-[#D4A574]/5 dark:bg-[#D4A574]/10 border border-[#D4A574]/10 dark:border-[#D4A574]/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#D4A574]" />
                            <span className="text-xs font-semibold text-[#D4A574]">رد الإدارة</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{review.adminReply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Show More/Less Button */}
            {reviews.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-2"
              >
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="gap-2 rounded-xl border-[#C4A4A4]/20 dark:border-[#C4A4A4]/30 hover:bg-[#C4A4A4]/5 dark:hover:bg-[#C4A4A4]/10 hover:border-[#C4A4A4]/40 dark:hover:border-[#C4A4A4]/50"
                >
                  {showAllReviews ? (
                    <>
                      عرض تقييمات أقل
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      عرض كل التقييمات ({reviews.length})
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
