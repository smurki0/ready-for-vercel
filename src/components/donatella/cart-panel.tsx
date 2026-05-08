'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Tag, Truck, CalendarDays, Sparkles, Package, Heart, ChevronLeft, AlertTriangle, CheckCircle2, PartyPopper, MapPin, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { safeJsonParse, seededRandom, useMounted } from '@/lib/utils'
import { toast } from 'sonner'

// Default free shipping threshold (used as fallback when API is unavailable)
const DEFAULT_FREE_SHIPPING_THRESHOLD = 500

// Suggested products - fetched from API
interface SuggestedProduct {
  id: string
  nameAr: string
  images: string | string[]
  price: number
  discount: number
}

// Available coupon code (fetched from API)
interface AvailableCoupon {
  code: string
  label: string
}

// Confetti sparkle component for free shipping celebration
function ConfettiSparkle({ active }: { active: boolean }) {
  const mounted = useMounted()

  const sparkles = useMemo(() => {
    const rand = seededRandom(33)
    const colors = ['#D4A574', '#C4A4A4', '#8B6F6F', '#E8C9A0', '#F5EDE6']
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      delay: rand() * 0.5,
      duration: 1 + rand() * 1,
      size: 4 + rand() * 6,
      color: colors[Math.floor(rand() * 5)],
      xDrift: (rand() - 0.5) * 60,
    }))
  }, [])

  if (!mounted || !active) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          initial={false}
          animate={{
            y: [0, 40, 80],
            opacity: [1, 0.8, 0],
            scale: [0, 1, 0.5],
            x: [0, s.xDrift],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            ease: 'easeOut',
          }}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: '0',
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
          }}
        />
      ))}
    </div>
  )
}

export default function CartPanel() {
  const cartOpen = useUIStore((s) => s.cartOpen)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const setPage = useUIStore((s) => s.setPage)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)

  const { items, updateItem, removeItem, getTotal, getItemCount, addItem } = useCartStore()
  const user = useAuthStore((s) => s.user)

  const total = getTotal()
  const itemCount = getItemCount()

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountType, setDiscountType] = useState<string>('')
  const [discountLabel, setDiscountLabel] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([])
  const [addingSuggestedId, setAddingSuggestedId] = useState<string | null>(null)
  const [quantityAnimating, setQuantityAnimating] = useState<string | null>(null)
  const [removingItemId, setRemovingItemId] = useState<string | null>(null)
  const [freeShippingCelebration, setFreeShippingCelebration] = useState(false)
  const [displayedTotal, setDisplayedTotal] = useState(0)
  const [emptyCartSuggestions, setEmptyCartSuggestions] = useState<SuggestedProduct[]>([])
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([])

  // Shipping zone state
  const [shippingZones, setShippingZones] = useState<Array<{
    id: string
    nameAr: string
    region: string
    price: number
    freeAbove: number | null
    estimatedDays: string
  }>>([])
  const [selectedZone, setSelectedZone] = useState<string>('')

  // Shipping calculation state (declared early since used in effects below)
  const [apiShippingCost, setApiShippingCost] = useState<number | null>(null)
  const [apiFreeAbove, setApiFreeAbove] = useState<number | null>(null)
  const [apiEstimatedDays, setApiEstimatedDays] = useState<string>('3-5')

  const prevTotalRef = useRef(total)
  const totalAnimFrameRef = useRef<number | null>(null)

  // Animate total price counting up/down
  useEffect(() => {
    const prevTotal = prevTotalRef.current
    prevTotalRef.current = total

    if (prevTotal === total) {
      setDisplayedTotal(total)
      return
    }

    const startValue = displayedTotal
    const endValue = total
    const duration = 500
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased
      setDisplayedTotal(current)

      if (progress < 1) {
        totalAnimFrameRef.current = requestAnimationFrame(animate)
      }
    }

    totalAnimFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (totalAnimFrameRef.current) {
        cancelAnimationFrame(totalAnimFrameRef.current)
      }
    }
  }, [total])

  // Free shipping celebration
  useEffect(() => {
    const threshold = apiFreeAbove || DEFAULT_FREE_SHIPPING_THRESHOLD
    if (total >= threshold && !freeShippingCelebration) {
      setFreeShippingCelebration(true)
      const timer = setTimeout(() => setFreeShippingCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [total, freeShippingCelebration, apiFreeAbove])

  // Fetch suggested products from API
  useEffect(() => {
    if (cartOpen && suggestedProducts.length === 0) {
      const fetchSuggestions = async () => {
        try {
          const res = await fetch('/api/products?limit=6&sort=random')
          const data = await res.json()
          if (data.success) {
            const prods = data.data.products || data.data
            // Filter out products already in cart
            const cartProductIds = new Set(items.map((item) => item.productId))
            const filtered = prods.filter(
              (p: SuggestedProduct) => !cartProductIds.has(p.id)
            )
            setSuggestedProducts(filtered.slice(0, 3))
          }
        } catch {
          // Silently fail - suggestions will not show
        }
      }
      fetchSuggestions()
    }
  }, [cartOpen, items, suggestedProducts.length])

  // Fetch empty cart suggestions
  useEffect(() => {
    if (cartOpen && items.length === 0 && emptyCartSuggestions.length === 0) {
      const fetchEmptySuggestions = async () => {
        try {
          const res = await fetch('/api/products?limit=4&featured=true')
          const data = await res.json()
          if (data.success) {
            const prods = data.data.products || data.data
            setEmptyCartSuggestions(prods.slice(0, 4))
          }
        } catch {
          // Silently fail - suggestions will not show
        }
      }
      fetchEmptySuggestions()
    }
  }, [cartOpen, items.length, emptyCartSuggestions.length])

  // Fetch available coupons from API
  useEffect(() => {
    if (cartOpen && availableCoupons.length === 0) {
      const fetchCoupons = async () => {
        try {
          const res = await fetch('/api/discounts/auto-apply')
          const data = await res.json()
          if (data.success && data.data?.length > 0) {
            const coupons = data.data.map((d: { code: string; descriptionAr?: string; type: string; value: number }) => ({
              code: d.code,
              label: d.descriptionAr || (d.type === 'percentage' ? `خصم ${d.value}%` : d.type === 'fixed' ? `خصم ${d.value} ج.م` : 'توصيل مجاني'),
            }))
            setAvailableCoupons(coupons)
          }
        } catch {
          // Coupons not available
        }
      }
      fetchCoupons()
    }
  }, [cartOpen, availableCoupons.length])

  // Fetch shipping zones on cart open
  useEffect(() => {
    if (cartOpen && shippingZones.length === 0) {
      const fetchZones = async () => {
        try {
          const res = await fetch('/api/shipping/zones')
          const data = await res.json()
          if (data.success && data.data?.length > 0) {
            setShippingZones(data.data)
          }
        } catch {
          // Use defaults
        }
      }
      fetchZones()
    }
  }, [cartOpen, shippingZones.length])

  // Calculate shipping via API when zone changes
  useEffect(() => {
    if (!selectedZone || items.length === 0) {
      setApiShippingCost(null)
      return
    }
    const calcShipping = async () => {
      try {
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: selectedZone, cartTotal: total }),
        })
        const data = await res.json()
        if (data.success) {
          setApiShippingCost(data.data.shippingCost)
          setApiFreeAbove(data.data.freeAbove)
          setApiEstimatedDays(data.data.estimatedDays)
        }
      } catch {
        setApiShippingCost(null)
      }
    }
    calcShipping()
  }, [selectedZone, total, items.length])

  // Calculate estimated delivery based on API or default
  const estimatedDelivery = (() => {
    const days = apiEstimatedDays || '3-5'
    const parts = days.split('-')
    const maxDays = parseInt(parts[1]) || parseInt(parts[0]) || 5
    const now = new Date()
    let daysAdded = 0
    const delivery = new Date(now)
    while (daysAdded < maxDays) {
      delivery.setDate(delivery.getDate() + 1)
      const dow = delivery.getDay()
      if (dow !== 5 && dow !== 6) daysAdded++
    }
    return delivery.toLocaleDateString('ar-EG', {
      month: 'long',
      day: 'numeric',
    })
  })()

  const shippingThreshold = apiFreeAbove || DEFAULT_FREE_SHIPPING_THRESHOLD
  const shippingProgress = Math.min((total / shippingThreshold) * 100, 100)
  const remainingForFreeShipping = Math.max(shippingThreshold - total, 0)

  const handleCheckout = () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      setCartOpen(false)
      return
    }
    setPage('checkout')
    setCartOpen(false)
  }

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error('يرجى إدخال كود الخصم')
      return
    }
    setApplyingCoupon(true)
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: total,
          userId: user?.id,
        }),
      })
      const data = await res.json()
      if (data.success && data.data.valid) {
        const d = data.data.discount
        const amt = data.data.discountAmount
        setCouponApplied(true)
        setCouponError(false)
        setDiscountAmount(amt)
        setDiscountType(d.type)
        setDiscountLabel(d.descriptionAr || `${d.type === 'percentage' ? d.value + '%' : d.type === 'fixed' ? amt + ' ج.م' : 'توصيل مجاني'}`)
        toast.success('تم تطبيق كود الخصم بنجاح!')
      } else {
        setCouponError(true)
        setCouponApplied(false)
        setDiscountAmount(0)
        toast.error(data.data?.error || 'كود الخصم غير صالح')
        setTimeout(() => setCouponError(false), 2000)
      }
    } catch {
      setCouponError(true)
      setCouponApplied(false)
      toast.error('فشل التحقق من كود الخصم')
      setTimeout(() => setCouponError(false), 2000)
    } finally {
      setApplyingCoupon(false)
    }
  }, [couponCode, total, user?.id])

  const handleQuickCoupon = (code: string) => {
    setCouponCode(code)
    // Auto-apply after setting
    setTimeout(() => handleApplyCoupon(), 100)
  }

  const handleAddSuggested = async (product: SuggestedProduct) => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      setCartOpen(false)
      return
    }
    setAddingSuggestedId(product.id)
    try {
      await addItem(product.id, 1)
      toast.success(`تمت إضافة "${product.nameAr}" إلى السلة`)
    } catch {
      toast.error('فشل إضافة المنتج للسلة')
    } finally {
      setAddingSuggestedId(null)
    }
  }

  const handleQuantityChange = (itemId: string, newQty: number) => {
    setQuantityAnimating(itemId)
    updateItem(itemId, newQty)
    setTimeout(() => setQuantityAnimating(null), 300)
  }

  const handleRemoveItem = (itemId: string) => {
    setRemovingItemId(itemId)
    setTimeout(() => {
      removeItem(itemId)
      setRemovingItemId(null)
    }, 300)
  }

  // Staggered animation variants for cart items
  const cartItemVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        delay: i * 0.06,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
    exit: {
      opacity: 0,
      x: -40,
      scale: 0.9,
      height: 0,
      marginBottom: 0,
      padding: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  }

  // Calculate shipping cost based on zone or default
  const shippingCost = apiShippingCost !== null
    ? apiShippingCost
    : (total >= DEFAULT_FREE_SHIPPING_THRESHOLD ? 0 : 50)
  // Calculate final total with coupon
  const finalTotal = couponApplied
    ? total - discountAmount + (discountType === 'free_shipping' ? 0 : shippingCost)
    : total + shippingCost

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col dark-glow-card bg-card dark:bg-[#252220]"
      >
        {/* Header with premium styling */}
        <SheetHeader className="p-4 pb-0 border-b border-border/30">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-bl from-[#D4A574] to-[#b8885a] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            سلة التسوق
            {itemCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-normal bg-[#D4A574]/10 text-[#D4A574] border border-[#D4A574]/20"
              >
                {itemCount} منتج
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Enhanced Empty Cart State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="relative mb-6"
            >
              {/* Decorative circles */}
              <div className="absolute -inset-10 rounded-full bg-[#D4A574]/5 dark:bg-[#D4A574]/8" />
              <div className="absolute -inset-20 rounded-full bg-[#C4A4A4]/5 dark:bg-[#C4A4A4]/3" />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="relative"
              >
                {/* Shopping bag illustration */}
                <div className="relative w-32 h-32 mx-auto">
                  {/* Bag body */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 rounded-b-2xl bg-gradient-to-b from-[#D4A574]/20 to-[#D4A574]/5 dark:from-[#D4A574]/15 dark:to-[#D4A574]/5 border-2 border-[#D4A574]/25 dark:border-[#D4A574]/20 shadow-lg shadow-[#D4A574]/10" />
                  {/* Bag handle */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-10 rounded-t-full border-t-2 border-x-2 border-[#D4A574]/25 dark:border-[#D4A574]/20" />
                  {/* Gold shimmer on bag */}
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 rounded-b-2xl bg-gradient-to-r from-transparent via-[#D4A574]/10 to-transparent"
                  />
                  {/* Sparkle decorations */}
                  <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -top-3 -right-3"
                  >
                    <span className="text-xl">✨</span>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-1 -left-4"
                  >
                    <span className="text-sm">💫</span>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute top-0 -left-2"
                  >
                    <span className="text-xs">⭐</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.h3
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-bold text-xl text-foreground mb-2"
            >
              السلة فارغة
            </motion.h3>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm mb-2 max-w-[250px]"
            >
              لم تضيفي أي منتجات بعد
            </motion.p>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#D4A574] text-xs mb-6 font-medium"
            >
              اكتشفي تشكيلتنا المميزة واختاري ما يناسبك!
            </motion.p>
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Button
                className="gap-2 rounded-xl bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white shadow-lg shadow-[#D4A574]/20 hover:shadow-xl hover:shadow-[#D4A574]/30 transition-all px-8 h-11"
                onClick={() => {
                  setPage('shop')
                  setCartOpen(false)
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                تصفحي المنتجات
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground gap-1 w-full"
                onClick={() => {
                  setPage('wishlist')
                  setCartOpen(false)
                }}
              >
                <Heart className="h-4 w-4" />
                تصفحي المفضلة
              </Button>
            </motion.div>

            {/* Suggested products in empty cart */}
            {emptyCartSuggestions.length > 0 && (
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 w-full"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4A574]" />
                  <span className="text-xs font-bold">قد يعجبك</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {emptyCartSuggestions.map((product) => {
                    const parsedImages: string[] = safeJsonParse<string[]>(product.images)
                    const prodImage = parsedImages[0] || '/products/dress-1.png'
                    const discountedPrice =
                      product.discount > 0
                        ? product.price * (1 - product.discount / 100)
                        : product.price
                    return (
                      <motion.button
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-2.5 rounded-xl bg-card border border-border/20 hover:border-[#D4A574]/20 transition-colors text-right flex flex-col"
                        onClick={() => {
                          navigateToProduct(product.id)
                          setCartOpen(false)
                        }}
                      >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
                          <Image
                            src={prodImage}
                            alt={product.nameAr}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <p className="text-[11px] font-semibold line-clamp-1 text-foreground">
                          {product.nameAr}
                        </p>
                        <p className="text-xs font-bold text-[#D4A574] mt-0.5">
                          {discountedPrice.toFixed(0)} ج.م
                        </p>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 overflow-hidden px-4">
              <div className="py-4 space-y-4">
                {/* Free Shipping Progress Bar - Enhanced */}
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-4 rounded-xl bg-gradient-to-l from-[#D4A574]/8 to-[#C4A4A4]/8 dark:from-[#D4A574]/5 dark:to-[#C4A4A4]/5 border border-[#D4A574]/15 dark:border-[#D4A574]/10 space-y-3 overflow-hidden"
                >
                  {/* Confetti celebration */}
                  <ConfettiSparkle active={freeShippingCelebration} />

                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-6 w-6 rounded-full bg-[#D4A574]/15 flex items-center justify-center">
                      <Truck className="h-3.5 w-3.5 text-[#D4A574]" />
                    </div>
                    {remainingForFreeShipping > 0 ? (
                      <span className="text-muted-foreground">
                        أضيفي{' '}
                        <span className="font-bold text-[#D4A574] text-sm">
                          {remainingForFreeShipping.toFixed(0)} ج.م
                        </span>{' '}
                        للحصول على شحن مجاني
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <PartyPopper className="h-3.5 w-3.5" />
                        تهانينا! الشحن مجاني 🎉
                      </span>
                    )}
                  </div>

                  {/* Enhanced progress bar */}
                  <div className="h-3 rounded-full bg-muted/80 dark:bg-[#2A2522] overflow-hidden relative shadow-inner">
                    {/* Animated gradient background behind the progress */}
                    <div className="absolute inset-0 animate-shipping-gradient bg-gradient-to-l from-[#D4A574] via-[#E8C9A0] to-[#D4A574] opacity-10" />
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ width: `${shippingProgress}%` }}
                      initial={false}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    >
                      {/* Main gradient fill */}
                      <div className="absolute inset-0 bg-gradient-to-l from-[#D4A574] via-[#E8C9A0] to-[#D4A574]" />
                      {/* Animated shimmer on the bar */}
                      <div className="absolute inset-0 animate-shimmer-slide bg-gradient-to-l from-transparent via-white/30 to-transparent" />
                      {/* Shine effect */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
                    </motion.div>
                  </div>

                  {/* Threshold marker */}
                  <div className="flex justify-between text-[10px] text-muted-foreground/60">
                    <span>0 ج.م</span>
                    <span>{shippingThreshold.toFixed(0)} ج.م</span>
                  </div>
                </motion.div>

                {/* Cart Items - Enhanced with staggered animations */}
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const images: string[] = safeJsonParse<string[]>(item.product.images)
                    const mainImage = images[0] || '/products/dress-1.png'
                    const itemPrice =
                      item.product.discount > 0
                        ? item.product.price * (1 - item.product.discount / 100)
                        : item.product.price
                    const isLowStock = item.product.stock <= 5 && item.product.stock > 0

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        custom={index}
                        variants={cartItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`group flex gap-3 p-3.5 rounded-xl bg-card border border-border/30 shadow-sm hover:border-[#D4A574]/25 dark:hover:border-[#D4A574]/30 hover:shadow-md hover:shadow-[#D4A574]/5 dark:hover:shadow-[#D4A574]/5 transition-all duration-300 ${
                          removingItemId === item.id ? 'opacity-0 -translate-x-10 scale-95' : ''
                        }`}
                      >
                        {/* Product Image - Enhanced */}
                        <button
                          onClick={() => {
                            navigateToProduct(item.productId)
                            setCartOpen(false)
                          }}
                          className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 group/img border border-border/30 dark:border-border/20"
                        >
                          <Image
                            src={mainImage}
                            alt={item.product.nameAr}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                          />
                          {/* Subtle image overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                          {/* Quantity badge on image */}
                          {item.quantity > 1 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-bl from-[#D4A574] to-[#b8885a] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                              {item.quantity}
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-[#D4A574] transition-colors">
                            {item.product.nameAr}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.size && (
                              <span className="text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md font-medium">
                                المقاس: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="text-[10px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md font-medium">
                                اللون: {item.color}
                              </span>
                            )}
                            {/* Low stock badge */}
                            {isLowStock && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md font-medium flex items-center gap-0.5">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {item.product.stock} متبقي
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center border border-border/60 rounded-lg overflow-hidden bg-muted/30">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                                }
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent/50 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <motion.span
                                key={item.quantity}
                                initial={false}
                                animate={{ scale: 1, color: 'inherit' }}
                                transition={{ duration: 0.3 }}
                                className="h-7 min-w-[32px] flex items-center justify-center text-xs font-semibold border-x border-border/60 bg-background"
                              >
                                {item.quantity}
                              </motion.span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    Math.min(item.product.stock, item.quantity + 1)
                                  )
                                }
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent/50 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-left">
                              <motion.span
                                key={itemPrice * item.quantity}
                                initial={false}
                                animate={{ scale: 1 }}
                                className="font-bold text-sm text-[#D4A574] inline-block"
                              >
                                {(itemPrice * item.quantity).toFixed(0)} ج.م
                              </motion.span>
                              {item.product.discount > 0 && (
                                <span className="text-[10px] text-muted-foreground line-through block">
                                  {(item.product.price * item.quantity).toFixed(0)} ج.م
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all self-center"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Coupon Code - Enhanced */}
                <div className="p-4 rounded-xl bg-card border border-border/30 dark:border-border/20 space-y-3 dark-glow-card">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="h-5 w-5 rounded-full bg-[#D4A574]/10 flex items-center justify-center">
                      <Tag className="h-3 w-3 text-[#D4A574]" />
                    </div>
                    كود الخصم
                  </div>

                  {/* Available coupon chips - fetched from API */}
                  {!couponApplied && availableCoupons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {availableCoupons.map((coupon) => (
                        <motion.button
                          key={coupon.code}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickCoupon(coupon.code)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-[#D4A574]/8 dark:bg-[#D4A574]/10 border border-[#D4A574]/15 text-[#D4A574] hover:bg-[#D4A574]/15 transition-colors font-medium"
                        >
                          {coupon.label} - {coupon.code}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value)
                        if (couponError) setCouponError(false)
                      }}
                      placeholder="أدخلي كود الخصم"
                      className={`h-9 text-sm rounded-lg transition-all duration-300 ${
                        couponError
                          ? 'border-destructive ring-2 ring-destructive/20'
                          : couponApplied
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-border/50 focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20'
                      }`}
                      dir="ltr"
                      disabled={couponApplied}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 rounded-lg shrink-0 border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || applyingCoupon}
                    >
                      {applyingCoupon ? '...' : couponApplied ? (
                        <motion.div
                          initial={false}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          مُطبّق
                        </motion.div>
                      ) : (
                        'تطبيق'
                      )}
                    </Button>
                  </div>
                  <AnimatePresence>
                    {couponApplied && (
                      <motion.p
                        initial={false}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        تم تطبيق الخصم بنجاح - {discountLabel}
                      </motion.p>
                    )}
                    {couponError && (
                      <motion.p
                        initial={false}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        كود الخصم غير صالح، حاولي مرة أخرى
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Estimated Delivery - Enhanced */}
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-card border border-border/30 dark:border-border/20">
                  <div className="h-7 w-7 rounded-full bg-[#D4A574]/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-3.5 w-3.5 text-[#D4A574]" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    التوصيل المتوقع:{' '}
                    <span className="font-semibold text-foreground">{estimatedDelivery}</span>
                  </span>
                </div>

                {/* Frequently Bought Together - fetched from API */}
                {suggestedProducts.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-[#D4A574]" />
                      <span className="text-xs font-bold">يشترى معاً</span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {suggestedProducts.map((product) => {
                        const parsedImages: string[] = safeJsonParse<string[]>(product.images)
                        const prodImage = parsedImages[0] || '/products/dress-1.png'
                        const discountedPrice =
                          product.discount > 0
                            ? product.price * (1 - product.discount / 100)
                            : product.price
                        return (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex gap-2.5 p-2.5 rounded-xl bg-card border border-border/20 min-w-[170px] shrink-0 cursor-pointer hover:border-[#D4A574]/20 transition-colors"
                            onClick={() => {
                              navigateToProduct(product.id)
                              setCartOpen(false)
                            }}
                          >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={prodImage}
                                alt={product.nameAr}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-[11px] font-semibold line-clamp-1 text-foreground">
                                {product.nameAr}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <p className="text-xs font-bold text-[#D4A574]">
                                  {discountedPrice.toFixed(0)} ج.م
                                </p>
                                {product.discount > 0 && (
                                  <span className="text-[9px] text-muted-foreground line-through">
                                    {product.price.toFixed(0)} ج.م
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 px-1.5 text-[9px] text-primary hover:text-primary/80 w-fit mt-0.5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddSuggested(product)
                                }}
                                disabled={addingSuggestedId === product.id}
                              >
                                + أضيفي للسلة
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}


              </div>
            </ScrollArea>

            {/* Cart Summary - Enhanced with Order Breakdown */}
            <div className="border-t border-border/50 p-4 space-y-3 bg-card dark:bg-[#252220] dark-glow-card">
              {/* Shipping Zone Selector */}
              {shippingZones.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin className="h-3 w-3 text-[#D4A574]" />
                    <span>منطقة الشحن</span>
                  </div>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="w-full h-8 text-xs rounded-lg border-border/50 focus:ring-[#D4A574]/30">
                      <SelectValue placeholder="اختاري منطقة الشحن" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingZones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.region}>
                          {zone.nameAr} - {zone.price.toFixed(0)} ج.م
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Order Summary Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Receipt className="h-3.5 w-3.5 text-[#D4A574]" />
                  <span className="text-xs font-semibold">ملخص الطلب</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي ({itemCount} منتج)</span>
                  <span className="font-medium">{total.toFixed(0)} ج.م</span>
                </div>
                <Separator className="bg-border/30" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-3 w-3" />
                    الشحن
                    {selectedZone && (
                      <span className="text-[10px] text-[#D4A574]">
                        ({shippingZones.find(z => z.region === selectedZone)?.nameAr || 'المنطقة المختارة'})
                      </span>
                    )}
                  </span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {shippingCost === 0 ? (
                      <span className="flex items-center gap-1">
                        <PartyPopper className="h-3 w-3" />
                        مجاني
                      </span>
                    ) : `${shippingCost.toFixed(0)} ج.م`}
                  </span>
                </div>
                {couponApplied && (
                  <>
                    <Separator className="bg-border/30" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Tag className="h-3 w-3" />
                        الخصم
                      </span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        -{discountAmount.toFixed(0)} ج.م
                      </span>
                    </div>
                  </>
                )}
                <Separator className="bg-border/30" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">الإجمالي</span>
                  <motion.span
                    key={finalTotal}
                    initial={false}
                    animate={{ scale: 1 }}
                    className="font-bold text-lg text-[#D4A574]"
                  >
                    {displayedTotal > 0 ? Math.round(couponApplied ? displayedTotal - discountAmount + (discountType === 'free_shipping' ? 0 : shippingCost) : displayedTotal + shippingCost).toFixed(0) : finalTotal.toFixed(0)} ج.م
                  </motion.span>
                </div>
                {/* Est. delivery in summary */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                  <CalendarDays className="h-3 w-3" />
                  <span>توصيل متوقع: {estimatedDelivery}</span>
                </div>
              </div>
              <Button
                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white shadow-lg shadow-[#D4A574]/20 hover:shadow-xl hover:shadow-[#D4A574]/30 transition-all"
                onClick={handleCheckout}
              >
                إتمام الشراء
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 border-border/50"
                onClick={() => {
                  setPage('shop')
                  setCartOpen(false)
                }}
              >
                متابعة التسوق
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
