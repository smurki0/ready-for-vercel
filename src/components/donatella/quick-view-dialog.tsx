'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Clock,
  Bookmark,
  Award,
  Gem,
  Sparkles,
  AlertTriangle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import SocialShare from './social-share'
import { safeJsonParse } from '@/lib/utils'

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
  avgRating?: number
  reviewCount?: number
  category: { nameAr: string; nameEn: string; slug: string } | null
}

interface RelatedProduct {
  id: string
  nameAr: string
  images: string | string[]
  price: number
  discount: number
}

// Limited stock countdown timer
function StockCountdown({ stock }: { stock: number }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (stock >= 5) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-destructive/8 border border-destructive/20 rounded-xl p-3 flex items-center gap-3"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AlertTriangle className="h-4 w-4 text-destructive" />
      </motion.div>
      <div className="flex-1">
        <p className="text-xs font-bold text-destructive">
          مخزون محدود - {stock} فقط متبقي!
        </p>
        <p className="text-[10px] text-destructive/70">اطلبي الآن قبل نفاد الكمية</p>
      </div>
      <div className="flex gap-1" dir="ltr">
        {[
          { val: timeLeft.hours, label: 'س' },
          { val: timeLeft.minutes, label: 'د' },
          { val: timeLeft.seconds, label: 'ث' },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <div className="bg-destructive/10 rounded-md px-1.5 py-0.5 min-w-[28px]">
              <span className="text-xs font-bold text-destructive font-mono">
                {String(item.val).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[8px] text-destructive/60">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Quality badges component
function QualityBadges() {
  const badges = [
    { icon: <Award className="h-3 w-3" />, label: 'جودة فاخرة' },
    { icon: <Gem className="h-3 w-3" />, label: 'مستورد' },
    { icon: <Sparkles className="h-3 w-3" />, label: 'صنع يدوي' },
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D4A574]/8 text-[#D4A574] border border-[#D4A574]/15"
        >
          {badge.icon}
          {badge.label}
        </span>
      ))}
    </div>
  )
}

// Delivery estimation with city-specific timing
function DeliveryEstimation() {
  const cities = [
    { name: 'القاهره', days: '1-2' },
    { name: 'الاسكندرية', days: '2-3' },
    { name: 'دمنهور', days: '2-3' },
    { name: 'المنصوره', days: '2-3' },
    { name: 'كفر الدوار', days: '3-5' },
  ]

  return (
    <div className="bg-secondary/20 rounded-xl p-3 border border-border/30">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-3.5 w-3.5 text-[#D4A574]" />
        <span className="text-xs font-semibold text-foreground">التوصيل المتوقع</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {cities.map((city) => (
          <div key={city.name} className="flex items-center justify-between text-[10px] px-2 py-1 rounded-lg bg-background/50">
            <span className="text-muted-foreground">{city.name}</span>
            <span className="font-semibold text-[#D4A574]">{city.days} يوم</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function QuickViewDialog() {
  const quickViewProductId = useUIStore((s) => s.quickViewProductId)
  const setQuickViewProductId = useUIStore((s) => s.setQuickViewProductId)
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const setPage = useUIStore((s) => s.setPage)

  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const addItemWishlist = useWishlistStore((s) => s.addItem)
  const removeItemWishlist = useWishlistStore((s) => s.removeItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [savedForLater, setSavedForLater] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])

  const open = !!quickViewProductId

  useEffect(() => {
    if (!quickViewProductId) {
      setProduct(null)
      return
    }
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/${quickViewProductId}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
          // Fetch related products from same category
          if (data.data.categoryId) {
            const relRes = await fetch(`/api/products?categoryId=${data.data.categoryId}&limit=4`)
            const relData = await relRes.json()
            if (relData.success) {
              const items = relData.data.products || relData.data
              setRelatedProducts(
                items
                  .filter((p: Product) => p.id !== data.data.id)
                  .slice(0, 4)
              )
            }
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [quickViewProductId])

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize(null)
    setSelectedColor(null)
    setQuantity(1)
    setMainImage(0)
    setAddedToCart(false)
    setSavedForLater(false)
  }, [quickViewProductId])

  const handleClose = () => {
    setQuickViewProductId(null)
  }

  const handleViewFull = () => {
    if (quickViewProductId) {
      navigateToProduct(quickViewProductId)
      handleClose()
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      handleClose()
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    if (!product) return
    const sizes = safeJsonParse<string[]>(product.sizes)
    const colors = safeJsonParse<string[]>(product.colors)
    if (sizes.length > 0 && !selectedSize) {
      toast.error('يرجى اختيار المقاس')
      return
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error('يرجى اختيار اللون')
      return
    }
    setAddingToCart(true)
    try {
      await addItem(product.id, quantity, selectedSize || undefined, selectedColor || undefined)
      setAddedToCart(true)
      toast.success('تمت الإضافة إلى السلة')
      setTimeout(() => {
        setCartOpen(true)
        handleClose()
      }, 800)
    } catch {
      toast.error('فشل إضافة المنتج للسلة')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      handleClose()
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    if (!product) return
    try {
      const inWishlist = isInWishlist(product.id)
      if (inWishlist) {
        await removeItemWishlist(product.id)
        toast.success('تمت الإزالة من المفضلة')
      } else {
        await addItemWishlist(product.id)
        toast.success('تمت الإضافة إلى المفضلة')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleSaveForLater = () => {
    if (!product) return
    setSavedForLater(true)
    toast.success('تم الحفظ لوقت لاحق')
  }

  if (!product && !loading) return null

  const images = product ? safeJsonParse<string[]>(product.images) : []
  const sizes = product ? safeJsonParse<string[]>(product.sizes) : []
  const colors = product ? safeJsonParse<string[]>(product.colors) : []
  const discountedPrice = product
    ? product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price
    : 0
  const inWishlist = product ? isInWishlist(product.id) : false
  const savingsAmount = product && product.discount > 0
    ? product.price - discountedPrice
    : 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl" dir="rtl">
        <DialogTitle className="sr-only">عرض سريع للمنتج</DialogTitle>
        {loading ? (
          <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-3 border-[#D4A574] border-t-transparent rounded-full"
              />
              <span className="text-sm text-muted-foreground">جاري التحميل...</span>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Images Side */}
            <div className="p-4 md:p-6 bg-gradient-to-br from-secondary/30 to-secondary/10 relative">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 left-3 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Main Image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-background">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[mainImage] || '/products/dress-1.png'}
                      alt={product.nameAr}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Discount badge */}
                {product.discount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <Badge className="absolute top-3 right-3 bg-destructive text-white font-bold shadow-lg">
                      خصم {product.discount}%
                    </Badge>
                  </motion.div>
                )}

                {/* Image count indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                    {mainImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setMainImage(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        mainImage === i
                          ? 'border-[#D4A574] ring-2 ring-[#D4A574]/30 shadow-md'
                          : 'border-border/50 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.nameAr} - ${i + 1}`} fill unoptimized className="object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Side */}
            <div className="p-4 md:p-6 flex flex-col overflow-y-auto">
              {/* Category */}
              {product.category && (
                <p className="text-xs text-[#D4A574] font-semibold mb-1 uppercase tracking-wide">{product.category.nameAr}</p>
              )}

              {/* Product Name */}
              <h2 className="text-xl font-bold text-foreground leading-tight mb-2">{product.nameAr}</h2>

              {/* Quality Badges */}
              <div className="mb-3">
                <QualityBadges />
              </div>

              {/* Rating */}
              {(product.reviewCount ?? 0) > 0 ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const avg = product.avgRating ?? 0
                      return (
                        <Star key={star} className={`h-4 w-4 ${star <= Math.floor(avg) ? 'text-[#D4A574] fill-[#D4A574]' : star <= avg ? 'text-[#D4A574] fill-[#D4A574]/50' : 'text-muted-foreground/30'}`} />
                      )
                    })}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.avgRating ?? 0}) · {product.reviewCount} تقييم</span>
                </div>
              ) : (
                <div className="mb-3">
                  <span className="text-xs text-muted-foreground">لا توجد تقييمات بعد</span>
                </div>
              )}

              {/* Limited Stock Countdown */}
              <div className="mb-3">
                <StockCountdown stock={product.stock} />
              </div>

              {/* Price Section */}
              <div className="bg-secondary/40 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#D4A574]">{discountedPrice.toFixed(0)} ج.م</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-base text-muted-foreground line-through">{product.price.toFixed(0)} ج.م</span>
                      <Badge className="bg-destructive/10 text-destructive text-xs font-bold">
                        وفّري {savingsAmount.toFixed(0)} ج.م
                      </Badge>
                    </>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-xs text-destructive/80 mt-1">
                    السعر يشمل الضريبة · العرض ساري حتى نفاد الكمية
                  </p>
                )}
              </div>

              {/* Delivery Estimation */}
              <div className="mb-3">
                <DeliveryEstimation />
              </div>

              {/* Description */}
              {product.descriptionAr && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {product.descriptionAr}
                </p>
              )}

              <Separator className="mb-3" />

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">المقاس</h3>
                    {selectedSize && (
                      <span className="text-xs text-[#D4A574]">المحدد: {selectedSize}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <motion.button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-10 min-w-[44px] px-3 rounded-xl border text-sm font-medium transition-all ${
                          selectedSize === size
                            ? 'border-[#D4A574] bg-[#D4A574]/10 text-[#D4A574] ring-1 ring-[#D4A574]/30 shadow-sm'
                            : 'border-border text-muted-foreground hover:border-[#D4A574]/50 hover:text-foreground'
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">اللون</h3>
                    {selectedColor && (
                      <span className="text-xs text-[#D4A574]">المحدد: {selectedColor}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <motion.button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`relative h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color
                            ? 'border-[#D4A574] scale-110 ring-2 ring-[#D4A574]/30 ring-offset-2 ring-offset-background shadow-md'
                            : 'border-border hover:border-[#D4A574]/50'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {selectedColor === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">الكمية</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 flex items-center justify-center hover:bg-accent/50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="h-10 w-12 flex items-center justify-center text-sm font-bold border-x border-border bg-secondary/20">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="h-10 w-10 flex items-center justify-center hover:bg-accent/50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    product.stock === 0
                      ? 'text-destructive'
                      : product.stock <= 5
                        ? 'text-orange-500 dark:text-orange-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      product.stock === 0 ? 'bg-destructive' : product.stock <= 5 ? 'bg-orange-500' : 'bg-emerald-500 dark:bg-emerald-400'
                    }`} />
                    {product.stock > 0 ? `${product.stock} متوفر` : 'نفذ المخزون'}
                  </span>
                </div>
              </div>

              {/* Actions - Add to Cart + Save for Later */}
              <div className="flex gap-2">
                <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                  <Button
                    className="w-full h-12 rounded-xl gap-2 text-base font-semibold bg-gradient-to-r from-[#D4A574] to-[#b8885a] hover:from-[#b8885a] hover:to-[#9a7348] shadow-md shadow-[#D4A574]/20 transition-all"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                  >
                    <AnimatePresence mode="wait">
                      {addedToCart ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-5 w-5" />
                          تمت الإضافة!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          {addingToCart ? 'جاري الإضافة...' : 'أضيفي للسلة'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
                {/* Save for Later button */}
                <Button
                  variant="outline"
                  className="h-12 px-4 rounded-xl shrink-0 border-[#D4A574]/30 hover:bg-[#D4A574]/10 gap-1.5"
                  onClick={handleSaveForLater}
                  disabled={savedForLater}
                >
                  {savedForLater ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Bookmark className={`h-4 w-4 ${savedForLater ? 'fill-[#D4A574] text-[#D4A574]' : 'text-muted-foreground'}`} />
                  )}
                  <span className="text-xs">{savedForLater ? 'تم الحفظ' : 'حفظ لاحقاً'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0 border-[#D4A574]/30 hover:bg-[#D4A574]/10"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`h-5 w-5 transition-colors ${inWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-[#D4A574]'}`} />
                </Button>
                {product && <SocialShare productName={product.nameAr} productId={product.id} />}
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-secondary/20">
                  <Truck className="h-4 w-4 text-[#D4A574] mb-1" />
                  <span className="text-[10px] text-muted-foreground">شحن مجاني</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-secondary/20">
                  <ShieldCheck className="h-4 w-4 text-[#D4A574] mb-1" />
                  <span className="text-[10px] text-muted-foreground">منتج أصلي</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-secondary/20">
                  <RotateCcw className="h-4 w-4 text-[#D4A574] mb-1" />
                  <span className="text-[10px] text-muted-foreground">إرجاع مجاني</span>
                </div>
              </div>

              {/* Customers also viewed mini carousel */}
              {relatedProducts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/30">
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#D4A574]" />
                    شاهدته عميلات أخرى
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {relatedProducts.map((relProduct) => {
                      const relImages = safeJsonParse<string[]>(relProduct.images)
                      const relDiscountedPrice = relProduct.discount > 0
                        ? relProduct.price * (1 - relProduct.discount / 100)
                        : relProduct.price
                      return (
                        <motion.button
                          key={relProduct.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setQuickViewProductId(relProduct.id)
                          }}
                          className="flex items-center gap-2 bg-secondary/20 rounded-lg p-1.5 pr-2 shrink-0 border border-border/30 hover:border-[#D4A574]/30 transition-colors"
                        >
                          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0">
                            <Image
                              src={relImages[0] || '/products/dress-1.png'}
                              alt={relProduct.nameAr}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="text-right min-w-0">
                            <p className="text-[10px] font-medium text-foreground truncate max-w-[80px]">
                              {relProduct.nameAr}
                            </p>
                            <p className="text-[10px] font-bold text-[#D4A574]">
                              {relDiscountedPrice.toFixed(0)} ج.م
                            </p>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* View full details link */}
              <Button
                variant="ghost"
                className="w-full mt-3 text-[#D4A574] hover:text-[#b8885a] hover:bg-[#D4A574]/5 text-sm font-medium"
                onClick={handleViewFull}
              >
                عرض تفاصيل المنتج الكاملة ←
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
