'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag, ShoppingBagIcon, Diamond, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'

interface Category {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  image: string | null
  _count?: { products: number }
}

const categoryImages: Record<string, string> = {
  dresses: '/products/dress-1.png',
  casual: '/products/casual-1.png',
  evening: '/products/evening-1.png',
  accessories: '/products/accessory-1.png',
}

// Animated counter for product count badge
function AnimatedBadge({ count }: { count: number }) {
  const [displayCount, setDisplayCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current || count === 0) return
    hasAnimated.current = true
    const startTime = Date.now()
    const duration = 800
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayCount(Math.floor(eased * count))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setDisplayCount(count)
      }
    }
    requestAnimationFrame(step)
  }, [count])

  return <span>{displayCount}</span>
}

// Floating diamond decoration
function FloatingDiamond({ className, delay, duration, size = 16 }: {
  className: string
  delay: number
  duration: number
  size?: number
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -25, 0],
        rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
        opacity: [0.04, 0.12, 0.04],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <Diamond className="text-[#D4A574]" style={{ width: size, height: size }} />
    </motion.div>
  )
}

// Islamic geometric pattern SVG for background
function IslamicPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="islamicPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* Eight-pointed star pattern */}
          <path
            d="M30 5L35 15L45 15L37 22L40 32L30 26L20 32L23 22L15 15L25 15Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.06"
          />
          {/* Connecting lines */}
          <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.3" opacity="0.03" />
          <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="0.3" opacity="0.03" />
          {/* Corner diamonds */}
          <path d="M0 0L5 5L0 10L-5 5Z" fill="currentColor" opacity="0.02" />
          <path d="M60 0L65 5L60 10L55 5Z" fill="currentColor" opacity="0.02" />
          <path d="M0 60L5 65L0 70L-5 65Z" fill="currentColor" opacity="0.02" />
          <path d="M60 60L65 65L60 70L55 65Z" fill="currentColor" opacity="0.02" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamicPattern)" />
    </svg>
  )
}

// Enhanced skeleton loader for category cards
function CategorySkeleton() {
  return (
    <div className="aspect-[3/4] rounded-2xl overflow-hidden">
      <div className="w-full h-full skeleton-luxury relative">
        <div className="absolute bottom-0 inset-x-0 p-5 space-y-3">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoriesSection({ title = 'التصنيفات', subtitle = 'اختاري ما يناسب ذوقك' }: { title?: string; subtitle?: string }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Determine grid columns based on category count
  const gridCols = categories.length <= 3
    ? 'grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <section className="py-16 sm:py-24 bg-secondary/20 relative overflow-hidden">
      {/* Islamic geometric background pattern */}
      <div className="absolute inset-0 pointer-events-none text-[#D4A574] dark:text-[#D4A574]">
        <IslamicPattern />
      </div>

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/8 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#D4A574]/5 dark:bg-[#D4A574]/3 translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/3 pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full bg-[#D4A574]/3 dark:bg-[#D4A574]/2 pointer-events-none" />

      {/* Floating diamonds */}
      <FloatingDiamond className="top-[10%] right-[15%]" delay={0} duration={6} size={20} />
      <FloatingDiamond className="top-[30%] left-[8%]" delay={1.5} duration={7} size={14} />
      <FloatingDiamond className="bottom-[25%] right-[10%]" delay={3} duration={5.5} size={18} />
      <FloatingDiamond className="bottom-[15%] left-[20%]" delay={2} duration={6.5} size={12} />
      <FloatingDiamond className="top-[50%] right-[30%]" delay={4} duration={8} size={16} />
      <FloatingDiamond className="top-[5%] left-[40%]" delay={1} duration={7.5} size={10} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          {/* Decorative elements */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-l from-[#D4A574] to-transparent" />
            <div className="relative">
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-xl"
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
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] shadow-md shadow-[#D4A574]/20">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="h-px w-16 bg-gradient-to-r from-[#D4A574] to-transparent" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground">
            {title}
          </h2>
          {/* Animated decorative underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-[2px] w-20 bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574] rounded-full origin-center mx-auto mt-3"
          />
          {/* Subtitle */}
          <p className="text-[#D4A574] mt-3 text-sm font-medium">
            {subtitle}
          </p>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-md mx-auto">
            تصفحي مجموعتنا حسب التصنيف واكتشفي أسلوبك المميز
          </p>
        </motion.div>

        {/* Categories Grid - Responsive with improved layout */}
        <div className={`grid ${gridCols} gap-4 sm:gap-5 lg:gap-6`}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CategorySkeleton />
                </motion.div>
              ))
            : categories.map((category, i) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigateToShop(category.id)}
                  onMouseEnter={() => setHoveredId(category.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative aspect-[3/4] sm:aspect-[2/3] lg:aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-500"
                >
                  {/* Golden border glow on hover */}
                  <div className="absolute inset-0 rounded-2xl z-20 pointer-events-none transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(212,165,116,0.25),0_0_40px_rgba(212,165,116,0.1)]" />

                  {/* Gold shimmer sweep border animation on hover */}
                  <div className="absolute inset-0 rounded-2xl z-20 pointer-events-none overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,165,116,0.6), rgba(196,164,164,0.4), rgba(212,165,116,0.6))',
                        padding: '2px',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    {/* Shimmer sweep effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(212,165,116,0.5), transparent)',
                          padding: '2px',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }}
                      />
                    </div>
                  </div>

                  {/* Image with enhanced hover zoom (1.15) */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      scale: hoveredId === category.id ? 1.15 : 1,
                      y: hoveredId === category.id ? -10 : 0,
                    }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    <Image
                      src={categoryImages[category.slug] || '/products/dress-1.png'}
                      alt={category.nameAr}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/85 group-hover:via-black/50 transition-all duration-500" />

                  {/* Prominent "Shop Now" overlay that slides up on hover */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pb-8">
                    <span className="bg-white/90 dark:bg-foreground/90 backdrop-blur-sm text-charcoal dark:text-background px-7 py-3 rounded-full text-sm font-bold flex items-center gap-2.5 shadow-xl border border-white/20">
                      <ShoppingBagIcon className="h-4 w-4 text-[#D4A574]" />
                      تسوقي الآن
                      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                    </span>
                  </div>

                  {/* Category Info */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 lg:p-6 z-10 transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl group-hover:text-[#D4A574] transition-colors duration-300">
                      {category.nameAr}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {/* Premium product count badge */}
                      {category._count && (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-l from-[#D4A574]/20 to-[#C4A4A4]/20 backdrop-blur-sm text-white/90 border border-white/10 text-[11px] px-3 py-0.5 hover:bg-[#D4A574]/30 group-hover:bg-[#D4A574]/25 group-hover:text-[#D4A574] group-hover:border-[#D4A574]/30 transition-all duration-300 shadow-sm"
                        >
                          <Sparkles className="h-2.5 w-2.5 ml-1 text-[#D4A574]/70" />
                          <AnimatedBadge count={category._count.products} /> منتج
                        </Badge>
                      )}
                      <div className="h-1 w-1 rounded-full bg-white/30" />
                      <p className="text-[#D4A574]/70 dark:text-[#D4A574]/80 text-xs group-hover:text-[#D4A574] transition-colors duration-300">
                        اكتشفي
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
        </div>

        {/* Shop All Categories CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => navigateToShop()}
            className="relative overflow-hidden h-12 px-8 rounded-xl font-semibold bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white shadow-lg shadow-[#D4A574]/20 hover:shadow-xl hover:shadow-[#D4A574]/30 transition-all duration-300 group"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 overflow-hidden rounded-xl">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </span>
            <span className="relative flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              تصفحي جميع التصنيفات
              <ArrowLeft className="h-4 w-4" />
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
