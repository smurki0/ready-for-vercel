'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, ArrowLeft, Crown, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductCard from './product-card'
import { useUIStore } from '@/stores/ui-store'

interface Product {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string | null
  descriptionEn: string | null
  price: number
  discount: number
  images: string | string[]
  sizes: string | string[]
  colors: string | string[]
  stock: number
  featured: boolean
  active: boolean
  categoryId: string
  category?: { nameAr: string; nameEn: string; slug: string }
}

// Enhanced Arabic ornamental SVG decoration with multiple styles
function ArabicOrnament({ className, variant = 'wave' }: { className?: string; variant?: 'wave' | 'geometric' | 'floral' }) {
  if (variant === 'geometric') {
    return (
      <svg
        className={className}
        width="120"
        height="24"
        viewBox="0 0 120 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 12L10 2L20 12L10 22Z" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <path d="M20 12L30 2L40 12L30 22Z" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path d="M40 12L50 2L60 12L50 22Z" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <path d="M60 12L70 2L80 12L70 22Z" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <path d="M80 12L90 2L100 12L90 22Z" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path d="M100 12L110 2L120 12L110 22Z" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx="60" cy="12" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    )
  }

  if (variant === 'floral') {
    return (
      <svg
        className={className}
        width="120"
        height="28"
        viewBox="0 0 120 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Central flower */}
        <circle cx="60" cy="14" r="4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="60" cy="14" r="1.5" fill="currentColor" opacity="0.4" />
        <path d="M60 10C62 8 64 10 60 14" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <path d="M60 18C58 20 56 18 60 14" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <path d="M56 14C54 12 56 10 60 14" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <path d="M64 14C66 16 64 18 60 14" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        {/* Side swirls */}
        <path d="M0 14C10 6 20 6 30 14C35 18 40 18 45 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <path d="M120 14C110 6 100 6 90 14C85 18 80 18 75 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        {/* Small dots */}
        <circle cx="30" cy="14" r="1.5" fill="currentColor" opacity="0.25" />
        <circle cx="90" cy="14" r="1.5" fill="currentColor" opacity="0.25" />
        <circle cx="45" cy="14" r="1" fill="currentColor" opacity="0.2" />
        <circle cx="75" cy="14" r="1" fill="currentColor" opacity="0.2" />
      </svg>
    )
  }

  // Default wave variant (enhanced)
  return (
    <svg
      className={className}
      width="120"
      height="24"
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 12C10 4 20 4 30 12C40 20 50 20 60 12C70 4 80 4 90 12C100 20 110 20 120 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="60" cy="12" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="30" cy="12" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="90" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// Enhanced shimmer loading skeleton component with luxury styling
function ShimmerCard() {
  return (
    <div className="min-w-[220px] sm:min-w-[260px] snap-start">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden skeleton-luxury">
        {/* Skeleton badge placeholder */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-16 rounded-full bg-transparent" />
        </div>
        {/* Skeleton wishlist button */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-8 w-8 rounded-full bg-transparent" />
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-1/3 rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-1/3 rounded-lg" />
          <Skeleton className="h-4 w-1/4 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-2/5 rounded-lg" />
      </div>
    </div>
  )
}

// Product card with Editor's Pick overlay
function FeaturedProductCard({ product, index, isVisible }: { product: Product; index: number; isVisible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative min-w-[220px] sm:min-w-[260px] snap-start group"
    >
      {/* Editor's Pick badge on first product */}
      {index === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="absolute top-3 right-3 z-30"
        >
          <Badge className="bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white font-bold text-[10px] gap-1 shadow-lg shadow-[#D4A574]/25 px-2.5 py-1">
            <Crown className="h-3 w-3" />
            اختيار المحرر
          </Badge>
        </motion.div>
      )}
      <ProductCard product={product} />
    </motion.div>
  )
}

// Animated underline component
function AnimatedUnderline() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-[2px] w-24 bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574] rounded-full origin-right mt-3"
    />
  )
}

export default function FeaturedSection({ title = 'المنتجات المميزة', subtitle = 'أفضل المنتجات المختارة لكِ' }: { title?: string; subtitle?: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)

  // IntersectionObserver for card entrance animations
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )
    const el = sectionRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=8')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data.products || data.data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    // Calculate scroll progress (0 to 1)
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll > 0) {
      setScrollProgress(Math.abs(el.scrollLeft) / maxScroll)
    }
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [products, loading, checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current
    if (!el) return
    const scrollAmount = 300
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleViewAllFeatured = () => {
    navigateToShop()
  }

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#D4A574]/5 dark:bg-[#D4A574]/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/3 dark:bg-primary/2 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      {/* Decorative golden line patterns in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #D4A574 1px, transparent 1px),
              linear-gradient(-45deg, #D4A574 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ─── Animated Gradient Header Background ────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(212,165,116,0.08) 0%, rgba(196,164,164,0.05) 25%, rgba(245,237,230,0.1) 50%, rgba(212,165,116,0.06) 75%, rgba(196,164,164,0.04) 100%)',
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 50%', '50% 100%', '0% 0%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Floating sparkle particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.05, 0.2, 0.05],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          >
            <Star className="h-2 w-2 text-[#D4A574]" />
          </motion.div>
        ))}
        {/* Fade out at bottom of header gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Scrolling Marquee */}
      <div className="overflow-hidden mb-8 border-y border-[#D4A574]/10 bg-[#D4A574]/3 dark:bg-[#D4A574]/2">
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{ x: [0, -800] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex items-center gap-8 py-2.5"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-sm font-medium text-[#D4A574]/60 dark:text-[#D4A574]/50 flex items-center gap-3">
                <span>منتجات مميزة مختارة بعناية</span>
                <Sparkles className="h-3 w-3 text-[#D4A574]/40" />
                <span>اختيار المحرر</span>
                <Crown className="h-3 w-3 text-[#D4A574]/40" />
              </span>
            ))}
          </motion.div>
          <motion.div
            animate={{ x: [0, -800] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex items-center gap-8 py-2.5"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-sm font-medium text-[#D4A574]/60 dark:text-[#D4A574]/50 flex items-center gap-3">
                <span>منتجات مميزة مختارة بعناية</span>
                <Sparkles className="h-3 w-3 text-[#D4A574]/40" />
                <span>اختيار المحرر</span>
                <Crown className="h-3 w-3 text-[#D4A574]/40" />
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Section Header with Ornamental Elements ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="relative">
            {/* Top ornamental line with geometric variant */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="h-px w-8 bg-gradient-to-l from-[#D4A574] to-transparent" />
              <ArabicOrnament className="text-[#D4A574]/30 dark:text-[#D4A574]/20 w-20 h-4" variant="geometric" />
              <div className="h-px w-8 bg-gradient-to-r from-[#D4A574] to-transparent" />
            </motion.div>

            {/* Decorative gradient icon container with Sparkles + pulse ring */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-gradient-to-l from-[#D4A574] to-transparent" />
              <div className="relative">
                {/* Pulse ring animation */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(212, 165, 116, 0.3)',
                      '0 0 0 6px rgba(212, 165, 116, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-[#D4A574] to-[#b8885a] shadow-md shadow-[#D4A574]/20">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <div className="h-px w-10 bg-gradient-to-r from-[#D4A574] to-transparent" />
            </div>

            {/* Title with animated gradient text effect */}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h2>
            {/* Animated underline below title */}
            <AnimatedUnderline />
            {/* Subtitle text */}
            <p className="text-muted-foreground mt-3 text-sm">
              {subtitle}
            </p>
            <p className="text-[#D4A574]/70 dark:text-[#D4A574]/60 mt-1 text-xs">
              اكتشفي أحدث القطع المميزة من مجموعتنا
            </p>

            {/* Bottom ornamental flourish with floral variant */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-3 flex items-center gap-2"
            >
              <ArabicOrnament className="text-[#D4A574]/20 dark:text-[#D4A574]/15 w-16 h-4" variant="floral" />
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation arrows */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg hover:border-[#D4A574]/50 transition-colors"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg hover:border-[#D4A574]/50 transition-colors"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Products Horizontal Scroll */}
        <div className="relative">
          {/* Gradient fade edges */}
          {canScrollLeft && (
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ShimmerCard key={i} />
                ))
              : products.map((product, i) => (
                  <FeaturedProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    isVisible={isVisible}
                  />
                ))}
          </div>

          {/* Scroll progress bar */}
          {!loading && products.length > 0 && (
            <div className="mt-4 mx-auto max-w-xs">
              <div className="h-1 bg-border/30 dark:bg-border/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] rounded-full"
                  style={{ width: `${Math.max(scrollProgress * 100, 8)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )}

          {/* Mobile scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex sm:hidden items-center justify-center mt-3 gap-1.5"
          >
            <motion.div
              animate={{ x: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/60"
            >
              <ChevronLeft className="h-3 w-3" />
              <span>اسحبي لرؤية المزيد</span>
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Enhanced View All Button ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Button
            onClick={handleViewAllFeatured}
            className="relative overflow-hidden h-12 px-8 rounded-xl font-semibold group border-2 border-[#D4A574] bg-transparent text-[#D4A574] hover:bg-[#D4A574] hover:text-white transition-all duration-300 shadow-none hover:shadow-lg hover:shadow-[#D4A574]/20"
          >
            {/* Background fill animation on hover */}
            <span className="absolute inset-0 bg-gradient-to-l from-[#D4A574] to-[#b8885a] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            {/* Shimmer sweep effect on hover */}
            <span className="absolute inset-0 overflow-hidden rounded-xl">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1s] ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </span>
            <span className="relative flex items-center gap-2">
              عرض الكل
              <motion.span
                className="inline-flex"
                whileHover={{ x: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </motion.span>
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
