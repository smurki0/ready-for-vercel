'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Clock, ChevronLeft, Flame, ShoppingBag, Tag, Timer, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { useSiteSettings } from '@/hooks/use-site-settings'
import Image from 'next/image'

interface FlashProduct {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
}

// Sparkle particles (client-only to avoid hydration mismatch)
function SparkleParticles() {
  const [sparkles, setSparkles] = useState<Array<{ top: number; left: number; duration: number; delay: number }>>([])

  /* eslint-disable react-hooks/set-state-in-effect -- client-only random values to avoid hydration mismatch */
  useEffect(() => {
    setSparkles(
      Array.from({ length: 6 }, () => ({
        top: 15 + Math.random() * 70,
        left: 10 + Math.random() * 80,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 3,
      }))
    )
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (sparkles.length === 0) return null

  return (
    <>
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#D4A574]"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

function CountdownTimer() {
  const { getSetting } = useSiteSettings()
  const countdownEndTime = getSetting('flashSaleCountdownEndTime', '')

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Use admin-configured end time, or default to 6 hours from now
    const target = countdownEndTime
      ? new Date(countdownEndTime)
      : (() => { const d = new Date(); d.setHours(d.getHours() + 6); return d })()

    // If the target is in the past, don't start the timer
    if (target.getTime() <= Date.now()) {
      return
    }

    const timer = setInterval(() => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        clearInterval(timer)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdownEndTime])

  const formatNum = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {[
        ...(timeLeft.days > 0 ? [{ value: formatNum(timeLeft.days), label: 'يوم' }] : []),
        { value: formatNum(timeLeft.hours), label: 'ساعة' },
        { value: formatNum(timeLeft.minutes), label: 'دقيقة' },
        { value: formatNum(timeLeft.seconds), label: 'ثانية' },
      ].map((item, i, arr) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <motion.div
              key={item.value}
              initial={{ y: -4, opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/15 dark:bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 min-w-[48px] text-center border border-white/10"
            >
              <span className="text-xl sm:text-2xl font-bold text-white font-mono">{item.value}</span>
            </motion.div>
            <span className="text-[9px] text-white/50 mt-1">{item.label}</span>
          </div>
          {i < arr.length - 1 && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-white/50 text-xl font-bold mb-4"
            >
              :
            </motion.span>
          )}
        </div>
      ))}
    </div>
  )
}

function CountdownWrapper() {
  const { getBoolSetting } = useSiteSettings()
  const showCountdown = getBoolSetting('showFlashSaleCountdown', true)

  if (!showCountdown) return null

  return (
    <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
      <Timer className="h-4 w-4 text-[#D4A574] shrink-0" />
      <span className="text-white/70 text-sm">ينتهي العرض خلال</span>
      <CountdownTimer />
    </div>
  )
}

function FlashProductCard({ product, claimed }: { product: FlashProduct; claimed: number }) {
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const salePrice = product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price
  const imageSrc = Array.isArray(product.images)
    ? product.images[0] || '/products/placeholder.png'
    : typeof product.images === 'string' && product.images.startsWith('[')
      ? (() => { try { const arr = JSON.parse(product.images); return arr[0] || '/products/placeholder.png' } catch { return product.images } })()
      : product.images || '/products/placeholder.png'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5"
    >
      {/* Product image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
        <Image
          src={imageSrc}
          alt={product.nameAr}
          fill
          unoptimized
          className="object-cover"
        />
        {/* Discount badge */}
        <Badge className="absolute top-2 right-2 bg-[#D4A574] text-white border-0 gap-1 shadow-lg shadow-[#D4A574]/30">
          <Tag className="h-3 w-3" />
          خصم {product.discount}%
        </Badge>
        {/* Hot badge */}
        <motion.div
          className="absolute top-2 left-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Badge className="bg-red-500 text-white border-0 gap-0.5 text-[10px] shadow-lg">
            <Flame className="h-3 w-3" />
            حار
          </Badge>
        </motion.div>
      </div>

      {/* Product info */}
      <p className="text-white font-medium text-sm mb-2">{product.nameAr}</p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[#D4A574] font-bold text-lg">{salePrice} ج.م</span>
        {product.discount > 0 && (
          <>
            <span className="text-white/40 line-through text-sm">{product.price} ج.م</span>
            <Badge className="bg-green-500/10 text-green-400 border-0 text-[10px]">
              وفّري {Math.round(product.price - salePrice)} ج.م
            </Badge>
          </>
        )}
      </div>

      {/* Progress bar - claimed percentage */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-white/50 mb-1">
          <span>تم بيع {claimed}%</span>
          <span className="text-[#D4A574]">باقي القليل!</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${claimed}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full relative"
            style={{ background: 'linear-gradient(90deg, #D4A574, #FFD700)' }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 8px rgba(212,165,116,0.5)' }} />
          </motion.div>
        </div>
      </div>

      {/* Quick action */}
      <Button
        className="w-full mt-3 rounded-xl h-9 text-sm gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10"
        onClick={() => navigateToShop()}
      >
        <ShoppingBag className="h-4 w-4" />
        أضيفي للسلة
        <ArrowRight className="h-3 w-3" />
      </Button>
    </motion.div>
  )
}

interface FlashSaleBannerProps {
  title?: string
  subtitle?: string
  ctaText?: string
}

export default function FlashSaleBanner({
  title = 'تخفيضات خاطفة',
  subtitle = 'عروض لا تتكرر',
  ctaText = 'تسوقي الآن',
}: FlashSaleBannerProps) {
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [currentProduct, setCurrentProduct] = useState(0)
  const navigateToShop = useUIStore((s) => s.navigateToShop)

  useEffect(() => {
    const fetchDiscounted = async () => {
      try {
        const res = await fetch('/api/products?limit=50')
        const data = await res.json()
        if (data.success) {
          const allProducts = data.data.products || data.data
          // Filter for products with discounts > 0
          const discounted = (allProducts as FlashProduct[]).filter(
            (p: FlashProduct) => p.discount > 0
          ).slice(0, 3)
          setProducts(discounted)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchDiscounted()
  }, [])

  useEffect(() => {
    if (products.length === 0) return
    const interval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % products.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [products.length])

  // Calculate max discount percentage for the header text
  const maxDiscount = products.length > 0
    ? Math.max(...products.map((p) => p.discount))
    : 0

  // Generate pseudo-random claimed percentage based on product id for visual interest
  const getClaimed = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i)
    }
    return 50 + Math.abs(hash) % 45 // 50-94%
  }

  // If loading, show skeleton
  if (loading) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #2D1B1B 0%, #1A0F0F 40%, #0D0808 100%)',
              }}
            >
              <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 text-center lg:text-right">
                    <Skeleton className="h-8 w-48 mx-auto lg:mx-0 mb-4 bg-white/10" />
                    <Skeleton className="h-10 w-36 mx-auto lg:mx-0 mb-3 bg-white/10" />
                    <Skeleton className="h-5 w-52 mx-auto lg:mx-0 mb-6 bg-white/10" />
                    <Skeleton className="h-12 w-36 mx-auto lg:mx-0 rounded-xl bg-white/10" />
                  </div>
                  <div className="w-full lg:w-[320px] shrink-0">
                    <Skeleton className="aspect-square rounded-2xl bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // If no discounted products, show a generic promotional banner
  if (products.length === 0) {
    return (
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 2px rgba(212,165,116,0.3), 0 0 20px rgba(212,165,116,0.1)',
                  '0 0 0 3px rgba(212,165,116,0.6), 0 0 40px rgba(212,165,116,0.3)',
                  '0 0 0 2px rgba(212,165,116,0.3), 0 0 20px rgba(212,165,116,0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl"
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #2D1B1B 0%, #1A0F0F 40%, #0D0808 100%)',
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10 -translate-x-1/3 -translate-y-1/3 bg-[#D4A574]" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 translate-x-1/4 translate-y-1/4 bg-[#C4A4A4]" />

                <div className="relative z-10 p-8 sm:p-10 lg:p-14 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 mb-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Zap className="h-5 w-5 text-[#D4A574]" />
                    </motion.div>
                    <span
                      className="text-xl sm:text-2xl font-extrabold"
                      style={{
                        background: 'linear-gradient(135deg, #D4A574 0%, #FFD700 50%, #D4A574 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {title}
                    </span>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    >
                      <Zap className="h-5 w-5 text-[#D4A574]" />
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
                  >
                    {subtitle}
                  </motion.h3>
                  <p className="text-white/60 text-sm sm:text-base mb-6">
                    تابعينا لتكوني أول من يعرف عن عروضنا المميزة
                  </p>

                  <div className="relative inline-block overflow-hidden rounded-xl">
                    <motion.div
                      className="absolute inset-0 z-10"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                      }}
                    />
                    <Button
                      onClick={() => navigateToShop()}
                      size="lg"
                      className="relative rounded-xl px-8 h-12 text-base font-bold gap-2 shadow-lg shadow-[#D4A574]/30 border border-[#D4A574]/30"
                      style={{
                        background: 'linear-gradient(135deg, #D4A574 0%, #C9956A 100%)',
                      }}
                    >
                      <Flame className="h-4 w-4" />
                      {ctaText}
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    )
  }

  const product = products[currentProduct]

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Pulsing border */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 2px rgba(212,165,116,0.3), 0 0 20px rgba(212,165,116,0.1)',
                '0 0 0 3px rgba(212,165,116,0.6), 0 0 40px rgba(212,165,116,0.3)',
                '0 0 0 2px rgba(212,165,116,0.3), 0 0 20px rgba(212,165,116,0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl"
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #2D1B1B 0%, #1A0F0F 40%, #0D0808 100%)',
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10 -translate-x-1/3 -translate-y-1/3 bg-[#D4A574]" />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 translate-x-1/4 translate-y-1/4 bg-[#C4A4A4]" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2 bg-[#D4A574]" />

              {/* Animated sparkle particles */}
              <SparkleParticles />

              {/* Subtle dot pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #D4A574 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }} />

              <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Left side - Text & Timer */}
                  <div className="flex-1 text-center lg:text-right">
                    {/* Flash Sale Badge */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 mb-4"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Zap className="h-5 w-5 text-[#D4A574]" />
                      </motion.div>
                      <span
                        className="text-xl sm:text-2xl font-extrabold"
                        style={{
                          background: 'linear-gradient(135deg, #D4A574 0%, #FFD700 50%, #D4A574 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {title}
                      </span>
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      >
                        <Zap className="h-5 w-5 text-[#D4A574]" />
                      </motion.div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
                    >
                      خصم حتى{' '}
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #D4A574 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {maxDiscount}%
                      </span>
                    </motion.h3>
                    <p className="text-white/60 text-sm sm:text-base mb-6">
                      {subtitle} — لفترة محدودة فقط!
                    </p>

                    {/* Countdown */}
                    <CountdownWrapper />

                    {/* Shimmer Button */}
                    <div className="relative inline-block overflow-hidden rounded-xl">
                      <motion.div
                        className="absolute inset-0 z-10"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                        }}
                      />
                      <Button
                        onClick={() => navigateToShop()}
                        size="lg"
                        className="relative rounded-xl px-8 h-12 text-base font-bold gap-2 shadow-lg shadow-[#D4A574]/30 border border-[#D4A574]/30"
                        style={{
                          background: 'linear-gradient(135deg, #D4A574 0%, #C9956A 100%)',
                        }}
                      >
                        <Flame className="h-4 w-4" />
                        {ctaText}
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right side - Product Showcase */}
                  <div className="w-full lg:w-[320px] shrink-0">
                    <AnimatePresence mode="wait">
                      <FlashProductCard
                        key={product.id}
                        product={product}
                        claimed={getClaimed(product.id)}
                      />
                    </AnimatePresence>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                      {products.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentProduct(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === currentProduct
                              ? 'w-6 bg-[#D4A574]'
                              : 'w-2 bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
