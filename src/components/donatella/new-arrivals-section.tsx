'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Flame, Tag, ArrowLeft, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from './product-card'
import { useUIStore } from '@/stores/ui-store'
import { useSiteSettings } from '@/hooks/use-site-settings'

interface Product {
  id: string
  nameAr: string
  nameEn: string
  price: number
  discount: number
  images: string | string[]
  stock: number
  categoryId: string
  category?: { nameAr: string; nameEn: string; slug: string }
}

// Animated "New" badge with glow pulse
function NewBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      className="relative"
    >
      {/* Glow pulse behind badge */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(212, 165, 116, 0.4)',
            '0 0 0 6px rgba(212, 165, 116, 0)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <Badge className="relative bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white text-[10px] font-bold shadow-lg shadow-[#D4A574]/25 gap-1 px-2.5 py-1 border-0">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-3 w-3" />
        </motion.div>
        جديد
      </Badge>
    </motion.div>
  )
}

// Enhanced skeleton loader for product cards
function ProductSkeleton() {
  return (
    <div className="min-w-[220px] sm:min-w-[260px] snap-start">
      <div className="aspect-[3/4] rounded-2xl skeleton-luxury mb-3 relative">
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-12 rounded-full bg-transparent" />
        </div>
      </div>
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-5 w-1/2 rounded-lg" />
      </div>
    </div>
  )
}

// Scroll indicator dots for mobile
function ScrollIndicators({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4 sm:hidden">
      {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full transition-all duration-300"
          animate={{
            width: i === current ? 16 : 6,
            height: 6,
            backgroundColor: i === current ? '#D4A574' : 'rgba(212, 165, 116, 0.2)',
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  )
}

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const { getSetting } = useSiteSettings()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const res = await fetch('/api/products?sort=newest&limit=10')
        const data = await res.json()
        if (data.success) {
          const prods = data.data.products || data.data
          setProducts(prods)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchNew()
  }, [])

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    // RTL: scrollLeft is negative in RTL mode
    setCanScrollRight(scrollLeft > -scrollWidth + clientWidth + 10)
    setCanScrollLeft(scrollLeft < -10)

    // Calculate active index for scroll indicators
    const cardWidth = 280 // approximate card width + gap
    const absScrollLeft = Math.abs(scrollLeft)
    const newIndex = Math.round(absScrollLeft / cardWidth)
    setActiveIndex(newIndex)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons)
    updateScrollButtons()
    return () => el.removeEventListener('scroll', updateScrollButtons)
  }, [products, updateScrollButtons])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    const currentScroll = scrollRef.current.scrollLeft
    // In RTL, scrollLeft is negative. Left = more negative, Right = less negative
    const newScroll = direction === 'left'
      ? currentScroll - scrollAmount
      : currentScroll + scrollAmount
    scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' })
  }

  // Count products with discounts
  const saleCount = products.filter((p) => p.discount > 0).length

  if (!loading && products.length === 0) return null

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-0 w-48 h-48 rounded-full bg-[#D4A574]/5 dark:bg-[#D4A574]/3 blur-3xl" />
      <div className="absolute bottom-10 right-0 w-48 h-48 rounded-full bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/3 blur-3xl" />
      {/* Additional subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Enhanced Section Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {/* Decorative icon container with enhanced animation */}
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-md shadow-[#D4A574]/20">
                <Zap className="h-6 w-6 text-white" />
              </div>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(212, 165, 116, 0.3)',
                    '0 0 0 8px rgba(212, 165, 116, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {getSetting('newArrivalsTitle', 'وصل حديثاً')}
                </h2>
                {/* Animated "New" badge in header */}
                <NewBadge />
              </div>
              <div className="flex items-center gap-2 mt-1">
                {/* Decorative line */}
                <div className="hidden sm:block h-4 w-px bg-gradient-to-b from-transparent via-[#D4A574] to-transparent" />
                <p className="text-muted-foreground text-sm">
                  {getSetting('newArrivalsSubtitle', 'أحدث المنتجات في مجموعتنا')}
                </p>
              </div>
              {/* Sale indicator */}
              {saleCount > 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-1.5 mt-1"
                >
                  <Tag className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-xs text-destructive font-medium">
                    {saleCount} منتج بخصم خاص
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border/50 hover:border-[#D4A574]/50 transition-colors"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border/50 hover:border-[#D4A574]/50 transition-colors"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigateToShop()}
              className="text-primary hover:text-primary/80 gap-1 text-sm group"
            >
              عرض الكل
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* ─── Scrollable product row with gradient fades ─────────────── */}
        <div className="relative group/scroll">
          {/* Right gradient fade */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-300"
            style={{ opacity: canScrollRight ? 1 : 0 }} />
          {/* Left gradient fade */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300"
            style={{ opacity: canScrollLeft ? 1 : 0 }} />

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ProductSkeleton />
                  </motion.div>
                ))
              : products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="min-w-[220px] sm:min-w-[260px] snap-start relative"
                  >
                    {/* Sale badge overlay with enhanced animation */}
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 z-20">
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 + i * 0.05 }}
                        >
                          <Badge className="bg-gradient-to-l from-destructive to-red-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm gap-1 border-0">
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              <Flame className="h-3 w-3" />
                            </motion.div>
                            خصم {product.discount}%
                          </Badge>
                        </motion.div>
                      </div>
                    )}
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>

          {/* Mobile scroll indicators */}
          {!loading && products.length > 0 && (
            <ScrollIndicators total={products.length} current={activeIndex} />
          )}

          {/* Mobile scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="flex sm:hidden items-center justify-center mt-2 gap-1"
          >
            <motion.div
              animate={{ x: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/50"
            >
              <ChevronLeft className="h-3 w-3" />
              <span>اسحبي للمزيد</span>
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
