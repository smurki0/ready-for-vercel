'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Sparkles, Flower2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { safeJsonParse } from '@/lib/utils'

interface TrendingProduct {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
}

// Golden particle component
function GoldenParticle({ delay, x, duration }: { delay: number; x: number; duration: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-[#D4A574]"
      style={{ left: `${x}%`, bottom: '-5%' }}
      animate={{
        y: [0, -400, -800],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    />
  )
}

// Golden particles group (client-only to avoid hydration mismatch)
function GoldenParticlesGroup() {
  const [particles, setParticles] = useState<Array<{ delay: number; x: number; duration: number }>>([])

  /* eslint-disable react-hooks/set-state-in-effect -- client-only random values to avoid hydration mismatch */
  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        delay: i * 0.8,
        x: 5 + Math.random() * 90,
        duration: 4 + Math.random() * 3,
      }))
    )
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (particles.length === 0) return null

  return (
    <>
      {particles.map((p, i) => (
        <GoldenParticle
          key={i}
          delay={p.delay}
          x={p.x}
          duration={p.duration}
        />
      ))}
    </>
  )
}

// Floating golden circle decoration
function FloatingCircle({ size, x, y, delay }: { size: number; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-[#D4A574]/20 dark:border-[#D4A574]/15"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
      }}
      animate={{
        y: [0, -15, 0],
        scale: [1, 1.05, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

// Product thumbnail with float animation
function ProductThumbnail({
  product,
  index,
  onSelect,
}: {
  product: TrendingProduct
  index: number
  onSelect: (id: string) => void
}) {
  const images: string[] = safeJsonParse<string[]>(product.images)
  const image = images[0] || '/products/dress-1.png'
  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price

  return (
    <motion.button
      onClick={() => onSelect(product.id)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
      className="group relative flex flex-col items-center shrink-0"
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3 + index * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.3,
        }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-[#D4A574]/20 dark:bg-[#D4A574]/10 blur-xl group-hover:bg-[#D4A574]/30 dark:group-hover:bg-[#D4A574]/20 transition-all duration-500" />

        {/* Image container */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl overflow-hidden border-2 border-white/20 dark:border-white/10 shadow-xl group-hover:border-[#D4A574]/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
          <Image
            src={image}
            alt={product.nameAr}
            fill
            unoptimized
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
            <span className="text-white text-[10px] font-medium flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              عرض
            </span>
          </div>
        </div>
      </motion.div>

      {/* Product name and price */}
      <div className="mt-3 text-center max-w-[120px]">
        <p className="text-xs font-medium text-white/80 truncate group-hover:text-white transition-colors">
          {product.nameAr}
        </p>
        <p className="text-xs text-[#D4A574] font-bold mt-0.5">
          {discountedPrice.toFixed(0)} ج.م
        </p>
      </div>
    </motion.button>
  )
}

interface TrendingCollectionProps {
  badge?: string
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
}

export default function TrendingCollection({
  badge = 'موسم ربيع 2026',
  title = 'مجموعة ربيع 2026',
  subtitle = 'تصاميم مستوحاة من أناقة الطبيعة',
  description = 'اكتشفي أحدث تشكيلاتنا المستوحاة من ألوان الربيع الدافئة وتفاصيل الطبيعة الساحرة. قطع فريدة تجمع بين الأصالة والحداثة لتضيف لمسة ساحرة لإطلالتك.',
  ctaText = 'تسوقي المجموعة',
}: TrendingCollectionProps) {
  const [products, setProducts] = useState<TrendingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDot, setCurrentDot] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.5, 0.3])

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=4')
        const data = await res.json()
        if (data.success) {
          const prods = data.data.products || data.data
          setProducts(prods.slice(0, 4))
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleProductSelect = (id: string) => {
    navigateToProduct(id)
  }

  // Scroll handler for mobile dots
  const handleScroll = () => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const scrollLeft = container.scrollLeft
    const itemWidth = 160 // approximate width of each item + gap
    const newIndex = Math.round(scrollLeft / itemWidth)
    if (newIndex !== currentDot) {
      setCurrentDot(newIndex)
    }
  }

  // Scroll to dot
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return
    const itemWidth = 160
    scrollRef.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' })
    setCurrentDot(index)
  }

  return (
    <section ref={sectionRef} className="py-8 sm:py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[520px]"
        >
          {/* Parallax Background */}
          <motion.div
            style={{ y: bgY }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #2D1B1B 0%, #1A1210 30%, #0F0A08 60%, #1A1210 100%)',
              }}
            />
          </motion.div>

          {/* Animated overlay */}
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/15 via-transparent to-[#C4A4A4]/10" />
          </motion.div>

          {/* Decorative floating circles */}
          <FloatingCircle size={120} x="10%" y="15%" delay={0} />
          <FloatingCircle size={80} x="75%" y="20%" delay={1} />
          <FloatingCircle size={60} x="85%" y="65%" delay={2} />
          <FloatingCircle size={100} x="5%" y="70%" delay={1.5} />
          <FloatingCircle size={40} x="50%" y="10%" delay={0.5} />

          {/* Golden particles */}
          <GoldenParticlesGroup />

          {/* Subtle Arabic geometric pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(30deg, #D4A574 12%, transparent 12.5%, transparent 87%, #D4A574 87.5%, #D4A574),
              linear-gradient(150deg, #D4A574 12%, transparent 12.5%, transparent 87%, #D4A574 87.5%, #D4A574),
              linear-gradient(30deg, #D4A574 12%, transparent 12.5%, transparent 87%, #D4A574 87.5%, #D4A574),
              linear-gradient(150deg, #D4A574 12%, transparent 12.5%, transparent 87%, #D4A574 87.5%, #D4A574)
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px',
          }} />

          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />

          {/* Warm gradient border at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: 'linear-gradient(90deg, transparent, #D4A574, #FFD700, #D4A574, transparent)',
          }} />

          {/* Main content */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-12 h-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content Side */}
            <div className="flex-1 text-center lg:text-right space-y-5">
              {/* Season badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4A574]/30 dark:border-[#D4A574]/20 bg-[#D4A574]/10 dark:bg-[#D4A574]/5"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Flower2 className="h-4 w-4 text-[#D4A574]" />
                </motion.div>
                <span className="text-xs font-medium text-[#D4A574]">{badge}</span>
                <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
              </motion.div>

              {/* Collection Name */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
              >
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #D4A574 0%, #FFD700 50%, #D4A574 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg sm:text-xl text-white/80 font-medium"
              >
                {subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm sm:text-base text-white/50 max-w-md mx-auto lg:mx-0 leading-relaxed"
              >
                {description}
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="relative inline-block overflow-hidden rounded-xl">
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 z-10 pointer-events-none"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                  />
                  <Button
                    onClick={() => useUIStore.getState().navigateToShop()}
                    size="lg"
                    className="relative rounded-xl px-8 h-12 text-base font-bold gap-2 shadow-xl shadow-[#D4A574]/25 border border-[#D4A574]/20"
                    style={{
                      background: 'linear-gradient(135deg, #D4A574 0%, #C9956A 50%, #D4A574 100%)',
                    }}
                  >
                    {ctaText}
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Product Showcase Side */}
            <div className="w-full lg:w-auto flex flex-col items-center">
              {loading ? (
                <div className="flex gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  {/* Desktop: Row of floating products */}
                  <div className="hidden lg:flex gap-5 items-end">
                    {products.map((product, index) => (
                      <ProductThumbnail
                        key={product.id}
                        product={product}
                        index={index}
                        onSelect={handleProductSelect}
                      />
                    ))}
                  </div>

                  {/* Mobile: Horizontal scroll with navigation */}
                  <div className="lg:hidden w-full">
                    <div
                      ref={scrollRef}
                      onScroll={handleScroll}
                      className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {products.map((product, index) => (
                        <div key={product.id} className="snap-center">
                          <ProductThumbnail
                            product={product}
                            index={index}
                            onSelect={handleProductSelect}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Navigation dots */}
                    {products.length > 1 && (
                      <div className="flex justify-center gap-2 mt-2">
                        {products.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => scrollToIndex(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              i === currentDot
                                ? 'w-6 bg-[#D4A574]'
                                : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Flower2 className="h-12 w-12 text-[#D4A574]/30 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">قريباً...</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom gradient border */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
            background: 'linear-gradient(90deg, transparent, #C4A4A4, #D4A574, #C4A4A4, transparent)',
          }} />
        </motion.div>
      </div>
    </section>
  )
}
