'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  Eye,
  ChevronLeft,
  Palette,
  Crown,
  Sun,
  Briefcase,
  Star,
  Heart,
  Gem,
  Diamond,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { safeJsonParse } from '@/lib/utils'

interface LookProduct {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
}

interface CuratedLook {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  accentColor: string
  productIds: string[]
}

const curatedLooks: CuratedLook[] = [
  {
    id: 'evening',
    title: 'إطلالة المساء',
    description: 'أناقة لا تُنسى في أمسياتك الخاصة، لمسة من الفخامة تليق بكِ',
    icon: <Star className="h-5 w-5" />,
    gradient: 'from-[#2D1B2E]/80 via-[#1a1025]/60 to-[#0D0A1A]/80',
    accentColor: '#D4A574',
    productIds: ['1', '2'],
  },
  {
    id: 'morning',
    title: 'أناقة الصباح',
    description: 'بداية مشرقة بإطلالة أنيقة وعملية',
    icon: <Sun className="h-5 w-5" />,
    gradient: 'from-[#F5E6D3]/80 via-[#EDE0D4]/60 to-[#DDD0C0]/80',
    accentColor: '#8B6F6F',
    productIds: ['3', '4'],
  },
  {
    id: 'spring',
    title: 'رومانسية الربيع',
    description: 'أنوثة ناعمة وألوان ربيعية ساحرة',
    icon: <Palette className="h-5 w-5" />,
    gradient: 'from-[#C4A4A4]/70 via-[#E8D5D5]/50 to-[#D4B8B8]/70',
    accentColor: '#C4A4A4',
    productIds: ['5', '6'],
  },
  {
    id: 'work',
    title: 'كلاسيكية العمل',
    description: 'احترافية وأسلوب مميز في مكان العمل',
    icon: <Briefcase className="h-5 w-5" />,
    gradient: 'from-[#3A3532]/80 via-[#2A2522]/60 to-[#1A1614]/80',
    accentColor: '#D4A574',
    productIds: ['7', '8'],
  },
  {
    id: 'royal',
    title: 'سهرة ملكية',
    description: 'تألقي كملكة في أرقى المناسبات والسهرات',
    icon: <Crown className="h-5 w-5" />,
    gradient: 'from-[#1A1025]/80 via-[#2D1B2E]/60 to-[#3A1D3E]/80',
    accentColor: '#D4A574',
    productIds: ['9', '10'],
  },
]

/* ─── Parallax Image Card ─────────────────────────────────────────────── */
function ParallaxImageCard({
  src,
  alt,
  className,
  containerRef,
}: {
  src: string
  alt: string
  className?: string
  containerRef: React.RefObject<HTMLElement | null>
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <motion.div className={className} style={{ y }}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-cover"
      />
    </motion.div>
  )
}

export default function LookbookSection() {
  const setPage = useUIStore((s) => s.setPage)
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const setCartOpen = useUIStore((s) => s.setCartOpen)

  const [products, setProducts] = useState<Record<string, LookProduct>>({})
  const [loading, setLoading] = useState(true)
  const [selectedLook, setSelectedLook] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=20')
        const data = await res.json()
        if (data.success) {
          const prods = data.data.products || data.data
          const map: Record<string, LookProduct> = {}
          prods.forEach((p: LookProduct) => {
            map[p.id] = p
          })
          setProducts(map)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const getProductImage = useCallback((product: LookProduct) => {
    const imgs = safeJsonParse<string[]>(product.images)
    return imgs[0] || '/products/dress-1.png'
  }, [])

  const getDiscountedPrice = useCallback((product: LookProduct) => {
    return product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
  }, [])

  const getLookTotal = useCallback((look: CuratedLook) => {
    return look.productIds.reduce((total, pid) => {
      const p = products[pid]
      if (!p) return total
      return total + getDiscountedPrice(p)
    }, 0)
  }, [products, getDiscountedPrice])

  const handleShopTheLook = useCallback(async (look: CuratedLook) => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    try {
      for (const pid of look.productIds) {
        await addItem(pid, 1)
      }
      toast.success('تمت إضافة جميع القطعات إلى السلة')
      setCartOpen(true)
    } catch {
      toast.error('حدث خطأ أثناء إضافة المنتجات')
    }
  }, [user, addItem, setAuthModalTab, setPage, setCartOpen])

  if (loading) {
    return (
      <div className="pt-6 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section ref={sectionRef} className="pt-6 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Premium Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 -top-8 bg-gradient-to-b from-[#D4A574]/5 via-[#C4A4A4]/3 to-transparent dark:from-[#D4A574]/3 dark:via-[#C4A4A4]/2 rounded-3xl pointer-events-none" />
          <div className="absolute inset-0 -top-8 pointer-events-none dark:dark-dot-pattern rounded-3xl" />

          <div className="relative">
            {/* Top decorative row */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#D4A574]/50"
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#D4A574] to-[#b8885a] shadow-lg shadow-[#D4A574]/20 dark-gold-pulse"
              >
                <Gem className="h-5 w-5 text-white" />
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#D4A574]/50"
              />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 mb-4 dark:bg-[#D4A574]/15 dark:border-[#D4A574]/25">
              <Sparkles className="h-4 w-4 text-[#D4A574]" />
              <span className="text-sm font-medium text-[#D4A574]">لوبوك دوناتيلا</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 dark-text-glow">
              إطلالات ملهمة
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              اكتشفي تشكيلاتنا المختارة بعناية من أحدث الصيحات، وأضيفي الإطلالة كاملة لسلتك بنقرة واحدة
            </p>

            {/* Decorative diamond divider */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#D4A574]/40 to-[#D4A574]" />
              <Diamond className="h-3.5 w-3.5 text-[#D4A574] rotate-45" />
              <div className="h-[1px] w-20 bg-gradient-to-l from-transparent via-[#D4A574]/40 to-[#D4A574]" />
            </div>

            {/* Look count */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex -space-x-1 space-x-reverse">
                {curatedLooks.slice(0, 3).map((look) => (
                  <div
                    key={look.id}
                    className="h-6 w-6 rounded-full border-2 border-background flex items-center justify-center"
                    style={{ backgroundColor: look.accentColor + '30' }}
                  >
                    <div className="scale-50" style={{ color: look.accentColor }}>{look.icon}</div>
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{curatedLooks.length} إطلالات مميزة</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Featured Look (First look - large) ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Large Featured Look */}
          {curatedLooks.slice(0, 1).map((look) => (
            <motion.div
              key={look.id}
              className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-auto lg:row-span-2 shadow-xl shadow-black/10 dark:shadow-black/30 dark-glow-card"
              onClick={() => setSelectedLook(selectedLook === look.id ? null : look.id)}
              onMouseEnter={() => setHoveredImage(look.id)}
              onMouseLeave={() => setHoveredImage(null)}
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background Image Collage with Parallax */}
              <div className="absolute inset-0 overflow-hidden">
                {look.productIds.map((pid, i) => {
                  const p = products[pid]
                  if (!p) return null
                  return (
                    <div
                      key={pid}
                      className={`absolute overflow-hidden ${
                        i === 0 ? 'inset-0' : 'bottom-0 left-0 w-1/2 h-1/2'
                      }`}
                    >
                      <ParallaxImageCard
                        src={getProductImage(p)}
                        alt={p.nameAr}
                        containerRef={sectionRef}
                      />
                      {/* Zoom on hover */}
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          scale: hoveredImage === look.id ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <Image
                          src={getProductImage(p)}
                          alt={p.nameAr}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </motion.div>
                    </div>
                  )
                })}
              </div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${look.gradient}`} />

              {/* Dark mode warm overlay */}
              <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Hover overlay info */}
              <AnimatePresence>
                {hoveredImage === look.id && selectedLook !== look.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/10 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/30"
                    >
                      <Eye className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: look.accentColor + '20' }}>
                    <div style={{ color: look.accentColor }}>{look.icon}</div>
                  </div>
                  <Badge className="bg-white/10 backdrop-blur-sm text-white border-0 text-xs">
                    إطلالة مميزة
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{look.title}</h2>
                <p className="text-white/80 text-sm sm:text-base mb-4 max-w-md">{look.description}</p>

                <AnimatePresence>
                  {selectedLook === look.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Products in Look */}
                      <div className="space-y-3 mb-4">
                        {look.productIds.map((pid, i) => {
                          const p = products[pid]
                          if (!p) return null
                          return (
                            <motion.div
                              key={pid}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10"
                            >
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={getProductImage(p)}
                                  alt={p.nameAr}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{p.nameAr}</p>
                                <p className="text-xs text-white/70">{getDiscountedPrice(p).toFixed(0)} ج.م</p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigateToProduct(pid)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/70 text-sm">الإجمالي</span>
                        <span className="text-lg font-bold text-white">{getLookTotal(look).toFixed(0)} ج.م</span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 rounded-xl gap-2 text-white border-0 shadow-lg"
                          style={{ backgroundColor: look.accentColor }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShopTheLook(look)
                          }}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          تسوّقي الإطلالة
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-xl text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToProduct(look.productIds[0])
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedLook !== look.id && (
                  <Button
                    variant="ghost"
                    className="w-fit rounded-xl gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedLook(look.id)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    اكتشفي الإطلالة
                  </Button>
                )}
              </div>
            </motion.div>
          ))}

          {/* ─── Masonry-style Grid for Remaining Looks ───────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Row 1: 2 equal cards */}
            {curatedLooks.slice(1, 3).map((look, idx) => (
              <LookbookCard
                key={look.id}
                look={look}
                idx={idx}
                products={products}
                selectedLook={selectedLook}
                hoveredImage={hoveredImage}
                setSelectedLook={setSelectedLook}
                setHoveredImage={setHoveredImage}
                getProductImage={getProductImage}
                getDiscountedPrice={getDiscountedPrice}
                getLookTotal={getLookTotal}
                navigateToProduct={navigateToProduct}
                handleShopTheLook={handleShopTheLook}
                sectionRef={sectionRef}
              />
            ))}

            {/* Row 2: 1 tall card spanning 2 rows + 1 short card */}
            {curatedLooks.slice(3, 5).map((look, idx) => (
              <LookbookCard
                key={look.id}
                look={look}
                idx={idx + 2}
                products={products}
                selectedLook={selectedLook}
                hoveredImage={hoveredImage}
                setSelectedLook={setSelectedLook}
                setHoveredImage={setHoveredImage}
                getProductImage={getProductImage}
                getDiscountedPrice={getDiscountedPrice}
                getLookTotal={getLookTotal}
                navigateToProduct={navigateToProduct}
                handleShopTheLook={handleShopTheLook}
                sectionRef={sectionRef}
                tall={idx === 0}
              />
            ))}
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <Button
            variant="outline"
            className="rounded-xl gap-2 border-[#D4A574]/30 hover:bg-[#D4A574]/5 hover:border-[#D4A574]/50 text-[#D4A574] dark:border-[#D4A574]/25 dark:hover:bg-[#D4A574]/10"
            onClick={() => setPage('home')}
          >
            <ChevronLeft className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Individual Lookbook Card ─────────────────────────────────────────── */
function LookbookCard({
  look,
  idx,
  products,
  selectedLook,
  hoveredImage,
  setSelectedLook,
  setHoveredImage,
  getProductImage,
  getDiscountedPrice,
  getLookTotal,
  navigateToProduct,
  handleShopTheLook,
  sectionRef,
  tall = false,
}: {
  look: CuratedLook
  idx: number
  products: Record<string, LookProduct>
  selectedLook: string | null
  hoveredImage: string | null
  setSelectedLook: (id: string | null) => void
  setHoveredImage: (id: string | null) => void
  getProductImage: (p: LookProduct) => string
  getDiscountedPrice: (p: LookProduct) => number
  getLookTotal: (look: CuratedLook) => number
  navigateToProduct: (id: string) => void
  handleShopTheLook: (look: CuratedLook) => void
  sectionRef: React.RefObject<HTMLElement | null>
  tall?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 * (idx + 1) }}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg shadow-black/10 dark:shadow-black/30 dark-glow-card ${
        tall ? 'sm:row-span-2 aspect-[3/4] sm:aspect-auto' : 'aspect-[3/4]'
      }`}
      onClick={() => setSelectedLook(selectedLook === look.id ? null : look.id)}
      onMouseEnter={() => setHoveredImage(look.id)}
      onMouseLeave={() => setHoveredImage(null)}
      whileHover={{ scale: 1.015, transition: { duration: 0.3 } }}
    >
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {look.productIds[0] && products[look.productIds[0]] && (
          <ParallaxImageCard
            src={getProductImage(products[look.productIds[0]])}
            alt={look.title}
            containerRef={sectionRef}
          />
        )}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hoveredImage === look.id ? 1.1 : 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {look.productIds[0] && products[look.productIds[0]] && (
            <Image
              src={getProductImage(products[look.productIds[0]])}
              alt={look.title}
              fill
              unoptimized
              className="object-cover"
            />
          )}
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${look.gradient}`} />

      {/* Dark mode warm overlay */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-white/10 dark:ring-[#D4A574]/20" />

      {/* Hover overlay - Shop the Look button */}
      <AnimatePresence>
        {hoveredImage === look.id && selectedLook !== look.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/30 flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">تسوّقي الإطلالة</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/30"
            >
              <Eye className="h-5 w-5 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: look.accentColor + '20' }}>
            <div className="scale-90" style={{ color: look.accentColor }}>{look.icon}</div>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{look.title}</h3>
        <p className="text-white/70 text-xs mb-3 line-clamp-2">{look.description}</p>

        <AnimatePresence>
          {selectedLook === look.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2 mb-3">
                {look.productIds.map((pid, i) => {
                  const p = products[pid]
                  if (!p) return null
                  return (
                    <motion.div
                      key={pid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10"
                    >
                      <div className="relative h-9 w-9 rounded-md overflow-hidden shrink-0">
                        <Image src={getProductImage(p)} alt={p.nameAr} fill unoptimized className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{p.nameAr}</p>
                        <p className="text-[10px] text-white/60">{getDiscountedPrice(p).toFixed(0)} ج.م</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs">الإجمالي</span>
                <span className="text-sm font-bold text-white">{getLookTotal(look).toFixed(0)} ج.م</span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 rounded-xl gap-2 text-white border-0 h-9 text-xs shadow-lg"
                  style={{ backgroundColor: look.accentColor }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShopTheLook(look)
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  تسوّقي الإطلالة
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToProduct(look.productIds[0])
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedLook !== look.id && (
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <Eye className="h-3.5 w-3.5" />
            <span>اكتشفي الإطلالة</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
