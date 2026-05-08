'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, CheckCircle, ChevronRight, ChevronLeft, ShieldCheck, Package, MessageSquarePlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { useSiteSettings } from '@/hooks/use-site-settings'

// Shape returned by the API
interface ApiReview {
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
  user: {
    id: string
    name: string
    avatar: string | null
  } | null
  product: {
    id: string
    nameAr: string
    nameEn: string
    images: string | string[]
  } | null
}

interface ReviewsStats {
  totalReviews: number
  avgRating: number
  ratingDistribution: { star: number; count: number }[]
  recommendPercent: number
}

// Derived display shape for the carousel
interface DisplayReview {
  id: string
  name: string
  rating: number
  text: string
  adminReply: string | null
  product: string
  daysAgo: number
  color: string
  productImage: string
  verified: boolean
}

function RelativeDate({ days }: { days: number }) {
  if (days === 0) return <span>اليوم</span>
  if (days === 1) return <span>منذ يوم</span>
  if (days === 2) return <span>منذ يومين</span>
  if (days <= 10) return <span>منذ {days} أيام</span>
  return <span>منذ {days} يوم</span>
}

// Animated star rating that fills from left to right on mount
function AnimatedStarRating({ rating }: { rating: number }) {
  const [visibleStars, setVisibleStars] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= rating; i++) {
      timers.push(
        setTimeout(() => {
          setVisibleStars(i)
        }, i * 120)
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [rating])

  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ scale: 0, rotate: -180 }}
          animate={
            star <= visibleStars
              ? { scale: 1, rotate: 0 }
              : { scale: 1, rotate: 0 }
          }
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: star * 0.08,
          }}
        >
          <Star
            className={`h-4 w-4 transition-all duration-300 ${
              star <= visibleStars
                ? 'fill-[#D4A574] text-[#D4A574] drop-shadow-sm'
                : 'fill-muted text-muted-foreground/30'
            }`}
          />
        </motion.div>
      ))}
    </div>
  )
}

function AnimatedCounter({
  target,
  duration = 1500,
  suffix = '',
}: {
  target: number
  duration?: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return <span>{count}{suffix}</span>
}

// Helper: deterministic color from string
function stringToColor(str: string): string {
  const colors = ['#D4A574', '#C4A4A4', '#8B6F6F', '#A78B71', '#B8A090', '#9B7E6B']
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Helper: get first image from product images
function getProductImage(product: ApiReview['product']): string {
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

// Helper: calculate days ago
function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

// Map API review to display review
function mapApiToDisplay(apiReview: ApiReview): DisplayReview {
  return {
    id: apiReview.id,
    name: apiReview.user?.name || 'مستخدم',
    rating: apiReview.rating,
    text: apiReview.comment || '',
    adminReply: apiReview.adminReply || null,
    product: apiReview.product?.nameAr || 'منتج',
    daysAgo: getDaysAgo(apiReview.createdAt),
    color: stringToColor(apiReview.user?.name || apiReview.id),
    productImage: getProductImage(apiReview.product),
    verified: true, // all reviews from API are verified purchases
  }
}

// Loading skeleton for the carousel
function ReviewCardSkeleton() {
  return (
    <Card className="h-full rounded-2xl border-border/50 bg-background/60 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded" />
          ))}
        </div>
        <Skeleton className="h-4 w-full mb-2 bg-muted/50" />
        <Skeleton className="h-4 w-3/4 mb-4 bg-muted/50" />
        <div className="flex items-center gap-2.5 mb-4">
          <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
          <Skeleton className="h-3 w-24 bg-muted/50" />
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-border/30 mt-auto">
          <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
          <div className="flex-1">
            <Skeleton className="h-3 w-20 mb-1 bg-muted/50" />
            <Skeleton className="h-3 w-16 bg-muted/50" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<DisplayReview[]>([])
  const [stats, setStats] = useState<ReviewsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(1)
  const setPage = useUIStore((s) => s.setPage)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const carouselRef = useRef<HTMLDivElement>(null)
  const { getSetting } = useSiteSettings()

  const [responsiveItemsPerView, setResponsiveItemsPerView] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1
  )

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews?limit=20')
        const data = await res.json()
        if (data.success) {
          const apiReviews: ApiReview[] = data.data.reviews
          const displayReviews = apiReviews.map(mapApiToDisplay)
          // Only include reviews that have comment text
          const reviewsWithText = displayReviews.filter((r) => r.text.length > 0)
          setReviews(reviewsWithText.length > 0 ? reviewsWithText : displayReviews)
          setStats(data.data.stats)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const maxIndex = Math.max(0, reviews.length - responsiveItemsPerView)

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
    },
    [currentIndex, maxIndex]
  )

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Smooth auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused || reviews.length === 0) return
    const interval = setInterval(goNext, 5000)
    return () => clearInterval(interval)
  }, [isPaused, goNext, reviews.length])

  // Responsive: update max index on resize
  useEffect(() => {
    const handleResize = () => {
      setResponsiveItemsPerView(window.innerWidth >= 768 ? 3 : 1)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const visibleReviews = reviews.slice(
    currentIndex,
    currentIndex + responsiveItemsPerView
  )

  // If not enough items at end, wrap around
  const displayReviews =
    visibleReviews.length < responsiveItemsPerView
      ? [
          ...visibleReviews,
          ...reviews.slice(
            0,
            responsiveItemsPerView - visibleReviews.length
          ),
        ]
      : visibleReviews

  const totalDots = reviews.length

  // Loading state
  if (loading) {
    return (
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/8 via-[#C4A4A4]/5 to-transparent dark:from-[#D4A574]/5 dark:via-[#C4A4A4]/3" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-3" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state — no reviews
  if (reviews.length === 0) {
    return (
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/8 via-[#C4A4A4]/5 to-transparent dark:from-[#D4A574]/5 dark:via-[#C4A4A4]/3" />

        {/* Decorative quote marks */}
        <div className="absolute top-8 right-8 sm:top-12 sm:right-16 pointer-events-none select-none">
          <Quote className="h-32 sm:h-48 w-32 sm:w-48 text-[#D4A574]/8 dark:text-[#D4A574]/5 rotate-180" />
        </div>
        <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-16 pointer-events-none select-none">
          <Quote className="h-32 sm:h-48 w-32 sm:w-48 text-[#C4A4A4]/8 dark:text-[#C4A4A4]/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A574]" />
              <Quote className="h-6 w-6 text-[#D4A574]" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A574]" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 dark-text-glow">
              {getSetting('testimonialsTitle', 'ماذا تقول عميلاتنا')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              {getSetting('testimonialsSubtitle', 'آراء حقيقية من سيدات اختارن دوناتيلا')}
            </p>
          </motion.div>

          {/* Empty state */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4A574]/10 mb-6">
              <MessageSquarePlus className="h-9 w-9 text-[#D4A574]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              لا توجد تقييمات بعد
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              كوني أول من يقيّم!
            </p>
            <Button
              onClick={() => navigateToShop()}
              className="rounded-xl px-6 h-11 gap-2 border border-[#D4A574]/30 shadow-lg shadow-[#D4A574]/20"
              style={{
                background: 'linear-gradient(135deg, #D4A574 0%, #C9956A 100%)',
              }}
            >
              تسوقي الآن
            </Button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative py-16 sm:py-20 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/8 via-[#C4A4A4]/5 to-transparent dark:from-[#D4A574]/5 dark:via-[#C4A4A4]/3" />

      {/* Dark mode dot pattern */}
      <div className="absolute inset-0 hidden dark:block dark-dot-pattern opacity-50" />

      {/* Decorative quote marks */}
      <div className="absolute top-8 right-8 sm:top-12 sm:right-16 pointer-events-none select-none">
        <Quote className="h-32 sm:h-48 w-32 sm:w-48 text-[#D4A574]/8 dark:text-[#D4A574]/5 rotate-180" />
      </div>
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-16 pointer-events-none select-none">
        <Quote className="h-32 sm:h-48 w-32 sm:w-48 text-[#C4A4A4]/8 dark:text-[#C4A4A4]/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A574]" />
            <Quote className="h-6 w-6 text-[#D4A574]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A574]" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 dark-text-glow">
            {getSetting('testimonialsTitle', 'ماذا تقول عميلاتنا')}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            {getSetting('testimonialsSubtitle', 'آراء حقيقية من سيدات اختارن دوناتيلا')}
          </p>
        </motion.div>

        {/* Overall Rating Summary — only shown if we have stats */}
        {stats && stats.totalReviews > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-12"
          >
            {/* Average Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#D4A574]">
                  <AnimatedCounter target={stats.avgRating} duration={1200} />
                </span>
                <Star className="h-6 w-6 fill-[#D4A574] text-[#D4A574]" />
              </div>
              <p className="text-xs text-muted-foreground">متوسط التقييم</p>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-border hidden sm:block" />

            {/* Total Reviews */}
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-foreground">
                +<AnimatedCounter target={stats.totalReviews} duration={1400} />
              </p>
              <p className="text-xs text-muted-foreground">تقييم حقيقي</p>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-border hidden sm:block" />

            {/* Recommend */}
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-foreground">
                <AnimatedCounter target={stats.recommendPercent} duration={1300} suffix="%" />
              </p>
              <p className="text-xs text-muted-foreground">يوصين بصديقاتهن</p>
            </div>
          </motion.div>
        )}

        {/* Carousel Navigation Arrows */}
        <div className="relative" ref={carouselRef}>
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border-border/50 hover:bg-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all shadow-lg hidden sm:flex"
            onClick={goNext}
            aria-label="السابق"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border-border/50 hover:bg-[#D4A574]/10 hover:border-[#D4A574]/30 transition-all shadow-lg hidden sm:flex"
            onClick={goPrev}
            aria-label="التالي"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Review Cards */}
          <div className="overflow-hidden px-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 60 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
              >
                {displayReviews.map((review, idx) => (
                  <motion.div
                    key={`${review.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    style={{
                      transform: `translateY(${idx === 1 ? -8 : 0}px)`,
                    }}
                  >
                    <motion.div
                      whileHover={{
                        y: -8,
                        boxShadow: '0 16px 48px rgba(212, 165, 116, 0.2), 0 6px 20px rgba(196, 164, 164, 0.12)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full rounded-2xl border-border/50 bg-background/60 backdrop-blur-sm hover:border-[#D4A574]/30 transition-colors duration-300 group relative dark-glow-card dark:border-[#3A3532]/80 dark:bg-[#252220]/80">
                        <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                          {/* Decorative gold gradient quote mark */}
                          <div className="absolute top-3 left-3 pointer-events-none select-none">
                            <span
                              className="text-5xl sm:text-6xl font-serif leading-none"
                              style={{
                                background: 'linear-gradient(135deg, #D4A574, #C4A4A4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                              }}
                            >
                              &ldquo;
                            </span>
                          </div>

                          {/* Star rating - animated fill */}
                          <div className="mb-3">
                            <AnimatedStarRating rating={review.rating} />
                          </div>

                          {/* Review text */}
                          <p className="text-sm leading-relaxed text-foreground/90 dark:text-foreground/85 mb-2 flex-1">
                            {review.text}
                          </p>

                          {/* Admin Reply */}
                          {review.adminReply && (
                            <div className="mb-3 p-2.5 rounded-lg bg-[#D4A574]/5 dark:bg-[#D4A574]/10 border border-[#D4A574]/10 dark:border-[#D4A574]/20">
                              <div className="flex items-center gap-1 mb-1">
                                <ShieldCheck className="h-3 w-3 text-[#D4A574]" />
                                <span className="text-[10px] font-semibold text-[#D4A574]">رد الإدارة</span>
                              </div>
                              <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{review.adminReply}</p>
                            </div>
                          )}

                          {/* Product with thumbnail */}
                          <button
                            onClick={() => setPage('shop')}
                            className="flex items-center gap-2.5 text-xs text-[#D4A574] hover:text-[#b8885a] transition-colors mb-4 text-right w-fit font-medium group/prod"
                          >
                            <div className="relative h-8 w-8 rounded-md overflow-hidden shrink-0 border border-[#D4A574]/20 group-hover/prod:border-[#D4A574]/40 transition-colors">
                              <Image
                                src={review.productImage}
                                alt={review.product}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <span className="line-clamp-1">{review.product}</span>
                          </button>

                          {/* Customer info */}
                          <div className="flex items-center gap-3 pt-3 border-t border-border/30 dark:border-[#3A3532]/50">
                            {/* Avatar with golden ring border */}
                            <div className="relative shrink-0">
                              <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-[#D4A574] to-[#C4A4A4]" />
                              <div
                                className="relative h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-background dark:border-[#252220]"
                                style={{ backgroundColor: review.color }}
                              >
                                {review.name.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate dark:text-foreground">
                                {review.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {/* Verified purchase badge */}
                                {review.verified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                  >
                                    <ShieldCheck className="h-2.5 w-2.5" />
                                    مشترى متحقق
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              <RelativeDate days={review.daysAgo} />
                            </span>
                          </div>

                          {/* Hover glow effect */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                            background: 'radial-gradient(circle at 50% 0%, rgba(212, 165, 116, 0.06) 0%, transparent 70%)',
                          }} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-[#D4A574]'
                  : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40 dark:bg-[#3A3532] dark:hover:bg-[#D4A574]/30'
              }`}
              aria-label={`الانتقال للتقييم ${idx + 1}`}
            />
          ))}
        </div>

        {/* Mobile navigation arrows */}
        <div className="flex items-center justify-center gap-4 mt-4 sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/50"
            onClick={goPrev}
            aria-label="التالي"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {totalDots}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/50"
            onClick={goNext}
            aria-label="السابق"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Trust indicator at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground/60"
        >
          <Package className="h-3.5 w-3.5" />
          <span>جميع التقييمات من مشتريات حقيقية ومتحقق منها</span>
        </motion.div>
      </div>
    </section>
  )
}
