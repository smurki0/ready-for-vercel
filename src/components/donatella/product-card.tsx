'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Eye, Clock, Flame, GitCompareArrows, Star, Truck, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCompareStore } from '@/stores/compare-store'
import { toast } from 'sonner'
import { safeJsonParse } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    nameAr: string
    nameEn: string
    price: number
    discount: number
    images: string | string[]
    stock: number
    categoryId: string
    colors?: string | string[]
    createdAt?: string
    avgRating?: number
    reviewCount?: number
    category?: { nameAr: string; nameEn: string; slug: string }
    // ─── Controllable Card Fields ───────────────────────────────
    subtitleAr?: string
    brand?: string
    badgeTextAr?: string
    isNew?: boolean
    freeShipping?: boolean
    freeShippingThreshold?: number
    tags?: string | string[]
  }
}

function isNewProduct(createdAt?: string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return created >= sevenDaysAgo
}

function getStockLabel(stock: number): { text: string; color: string; dotColor: string } | null {
  if (stock === 0) return { text: 'نفذ المخزون', color: 'text-destructive', dotColor: '#ef4444' }
  if (stock <= 3) return { text: `${stock} متبقي`, color: 'text-red-500 dark:text-red-400', dotColor: '#ef4444' }
  if (stock <= 10) return { text: `${stock} متبقي`, color: 'text-orange-500 dark:text-orange-400', dotColor: '#f97316' }
  return null
}

// Parse color names to CSS color values
function parseColors(colors: string | string[] | undefined): { name: string; css: string }[] {
  if (!colors) return []
  const parsed = safeJsonParse<string[]>(colors)
  if (!Array.isArray(parsed) || parsed.length === 0) return []

  const colorMap: Record<string, string> = {
    'أسود': '#1a1a1a',
    'أبيض': '#f5f5f5',
    'أحمر': '#dc2626',
    'أزرق': '#2563eb',
    'أخضر': '#16a34a',
    'وردي': '#ec4899',
    'بنفسجي': '#7c3aed',
    'بيج': '#d4a574',
    'ذهبي': '#d4a574',
    'فضي': '#9ca3af',
    'بني': '#92400e',
    'رمادي': '#6b7280',
    'كحلي': '#1e3a5f',
    'فستقي': '#86efac',
    'مرجاني': '#fb7185',
    'زيتي': '#4d7c0f',
    'عنابي': '#7f1d1d',
    'سماوي': '#38bdf8',
    'برتقالي': '#f97316',
    'أصفر': '#eab308',
    'تركواز': '#2dd4bf',
    'خمري': '#881337',
    'موف': '#a855f7',
    'نيلي': '#4338ca',
    'زهرى': '#f472b6',
  }

  return parsed.map((c) => ({
    name: c,
    css: colorMap[c] || '#9ca3af',
  }))
}

// Color swatch with tooltip
function ColorSwatch({ swatch, index }: { swatch: { name: string; css: string }; index: number }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div
        className="rounded-full border-2 border-border/50 shadow-sm cursor-pointer"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: swatch.css,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{
          scale: 1.3,
          borderColor: 'rgba(212, 165, 116, 0.8)',
          boxShadow: '0 0 8px rgba(212, 165, 116, 0.3)',
        }}
      />
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 bg-popover text-popover-foreground text-[10px] font-medium rounded shadow-lg border border-border whitespace-nowrap"
          >
            {swatch.name}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const setQuickViewProductId = useUIStore((s) => s.setQuickViewProductId)
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const addItemWishlist = useWishlistStore((s) => s.addItem)
  const removeItemWishlist = useWishlistStore((s) => s.removeItem)
  const setPage = useUIStore((s) => s.setPage)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore()

  const images: string[] = safeJsonParse<string[]>(product.images)
  const mainImage = images[0] || '/products/dress-1.png'
  const discountedPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price
  const savings = product.discount > 0 ? product.price - discountedPrice : 0
  const inWishlist = isInWishlist(product.id)
  // "New" badge: manual override OR auto-detect from createdAt
  const isNew = product.isNew || isNewProduct(product.createdAt)
  const stockInfo = getStockLabel(product.stock)
  const isSoldOut = product.stock === 0

  // Tags parsing
  const productTags = safeJsonParse<string[]>(product.tags)

  // Free shipping: manual override OR auto-detect from price threshold
  const hasFreeShipping = product.freeShipping || (product.freeShippingThreshold ? discountedPrice >= product.freeShippingThreshold : discountedPrice >= 300)

  // Star rating from real review data
  const ratingData = {
    avg: product.avgRating ?? 0,
    count: product.reviewCount ?? 0,
  }

  // Color swatches - parse all colors
  const allColorSwatches = parseColors(product.colors)
  const displaySwatches = allColorSwatches.slice(0, 5)
  const remainingCount = allColorSwatches.length - 5

  // Add to cart animation state
  const [cartAnimating, setCartAnimating] = useState(false)
  const [showCheckFlash, setShowCheckFlash] = useState(false)

  // Wishlist bounce animation state
  const [wishlistBounce, setWishlistBounce] = useState(false)

  // Compare animation state
  const [compareBounce, setCompareBounce] = useState(false)

  // Price flash animation for discounted items
  const [priceFlashing, setPriceFlashing] = useState(false)

  // Mouse position for gradient border effect
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  // Trigger price flash on mount for discounted products
  useEffect(() => {
    if (product.discount > 0) {
      const timer = setTimeout(() => setPriceFlashing(true), 500)
      return () => clearTimeout(timer)
    }
  }, [product.discount])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    try {
      setCartAnimating(true)
      await addItem(product.id, 1)
      // Show green checkmark flash
      setShowCheckFlash(true)
      // Show pop animation
      setTimeout(() => {
        setShowCheckFlash(false)
        setCartAnimating(false)
        toast.success('تمت الإضافة إلى السلة')
      }, 800)
    } catch {
      setCartAnimating(false)
      toast.error('فشل إضافة المنتج للسلة')
    }
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    setWishlistBounce(true)
    setTimeout(() => setWishlistBounce(false), 400)
    try {
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuickViewProductId(product.id)
  }

  const inCompare = isInCompare(product.id)

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCompareBounce(true)
    setTimeout(() => setCompareBounce(false), 400)
    if (inCompare) {
      removeFromCompare(product.id)
      toast.success('تمت الإزالة من المقارنة')
    } else {
      addToCompare(product.id)
      toast.success('تمت الإضافة للمقارنة')
    }
  }

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.category?.slug) {
      navigateToShop(product.category.slug)
    } else {
      navigateToShop()
    }
  }

  // Star rating display
  const renderStars = useCallback(() => {
    if (ratingData.count === 0) {
      return (
        <span className="text-[10px] text-muted-foreground font-medium">
          لا توجد تقييمات
        </span>
      )
    }

    const fullStars = Math.floor(ratingData.avg)
    const hasHalf = ratingData.avg - fullStars >= 0.3
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center" dir="ltr">
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star key={`full-${i}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
          {hasHalf && (
            <div className="relative">
              <Star className="h-3 w-3 text-gray-300 dark:text-gray-600" />
              <div className="absolute inset-0 overflow-hidden w-[50%]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </div>
            </div>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star key={`empty-${i}`} className="h-3 w-3 text-gray-300 dark:text-gray-600" />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          ({ratingData.avg}) · {ratingData.count} تقييم
        </span>
      </div>
    )
  }, [ratingData])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className={`group cursor-pointer rounded-2xl bg-card border overflow-hidden transition-all duration-300 hover:shadow-lg relative ${
        isSoldOut ? 'opacity-85' : 'hover:border-[#D4A574]/30'
      } ${cartAnimating ? 'animate-cart-pop' : ''} ${
        inCompare ? 'border-[#D4A574]/50 shadow-[0_0_12px_rgba(212,165,116,0.15)]' : 'border-border/50'
      }`}
      onClick={() => navigateToProduct(product.id)}
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-follow gradient border on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: isSoldOut
            ? 'none'
            : `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 165, 116, 0.12), rgba(196, 164, 164, 0.06), transparent 70%)`,
        }}
      />

      {/* Hover golden border glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          boxShadow: isSoldOut
            ? 'none'
            : '0 0 15px rgba(212, 165, 116, 0.15), 0 0 30px rgba(212, 165, 116, 0.08), inset 0 0 15px rgba(212, 165, 116, 0.03)',
        }}
      />

      {/* Golden ring when in compare mode */}
      {inCompare && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-[#D4A574]/40 z-20 pointer-events-none" />
      )}

      {/* Green checkmark flash overlay */}
      <AnimatePresence>
        {showCheckFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-emerald-500/10 backdrop-blur-[1px]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.4 }}
              className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <Check className="h-7 w-7 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">
        <Image
          src={mainImage}
          alt={product.nameAr}
          fill
          unoptimized
          className={`object-cover transition-transform duration-1000 ease-out group-hover:scale-110 ${
            isSoldOut ? 'grayscale' : ''
          }`}
        />

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <>
            <div className="absolute inset-0 bg-gray-500/40 z-10" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-destructive/90 text-white px-6 py-2 rotate-45 -rotate-12 text-sm font-bold tracking-wide shadow-lg">
                نفذ المخزون
              </div>
            </div>
          </>
        )}

        {/* Hover image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.discount > 0 && (
            <Badge className="bg-destructive text-white font-medium text-xs shadow-sm animate-pulse">
              -{product.discount}%
            </Badge>
          )}
          {product.badgeTextAr && (
            <Badge className="bg-purple-600/90 text-white font-medium text-[10px] shadow-sm">
              {product.badgeTextAr}
            </Badge>
          )}
          {isNew && !product.badgeTextAr && (
            <Badge className="bg-[#D4A574] text-white font-medium text-xs shadow-sm flex items-center gap-1">
              <Flame className="h-3 w-3" />
              جديد
            </Badge>
          )}
          {hasFreeShipping && !isSoldOut && (
            <Badge className="bg-emerald-600/90 text-white font-medium text-[10px] shadow-sm flex items-center gap-1">
              <Truck className="h-2.5 w-2.5" />
              شحن مجاني
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 h-9 w-9 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 opacity-80 group-hover:opacity-100 z-20"
          onClick={handleWishlistToggle}
        >
          <motion.div
            animate={wishlistBounce ? { scale: [1, 1.4, 0.9, 1.2, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                inWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              }`}
            />
          </motion.div>
        </Button>

        {/* Compare Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 left-14 h-9 w-9 rounded-full backdrop-blur-sm transition-all duration-200 opacity-80 group-hover:opacity-100 z-20 ${
            inCompare
              ? 'bg-primary/20 text-primary hover:bg-primary/30'
              : 'bg-background/70 hover:bg-background/90 text-muted-foreground'
          }`}
          onClick={handleCompare}
        >
          <motion.div
            animate={compareBounce ? { scale: [1, 1.3, 0.9, 1.15, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <GitCompareArrows className="h-4 w-4" />
          </motion.div>
        </Button>

        {/* Quick View Button - appears on hover */}
        {!isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
            <Button
              className="bg-white/90 dark:bg-foreground/90 backdrop-blur-sm text-charcoal dark:text-background hover:bg-white dark:hover:bg-foreground rounded-xl gap-2 shadow-xl px-6 py-2.5 font-semibold translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
              نظرة سريعة
            </Button>
          </div>
        )}

        {/* Add to Cart - slides up on hover */}
        {!isSoldOut && (
          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
            <Button
              className="w-full rounded-xl bg-primary/90 backdrop-blur-sm text-primary-foreground hover:bg-primary gap-2 shadow-lg"
              size="sm"
              onClick={handleAddToCart}
              disabled={cartAnimating}
            >
              <AnimatePresence mode="wait">
                {cartAnimating ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    تمت الإضافة!
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    أضيفي للسلة
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {/* Category label with pill background */}
        {product.category && (
          <button
            onClick={handleCategoryClick}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4A574]/10 dark:bg-[#D4A574]/15 text-[10px] font-medium text-[#D4A574] hover:bg-[#D4A574]/20 transition-colors duration-200"
          >
            {product.category.nameAr}
          </button>
        )}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-[#D4A574] transition-colors duration-200">
          {product.nameAr}
        </h3>

        {/* Subtitle */}
        {product.subtitleAr && (
          <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">
            {product.subtitleAr}
          </p>
        )}

        {/* Brand */}
        {product.brand && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
            {product.brand}
          </span>
        )}

        {/* Star Rating */}
        {renderStars()}

        {/* Color Swatches */}
        {allColorSwatches.length > 0 && (
          <div className="flex items-center gap-1.5">
            {displaySwatches.map((swatch, i) => (
              <ColorSwatch key={i} swatch={swatch} index={i} />
            ))}
            {remainingCount > 0 && (
              <span className="text-[10px] text-muted-foreground font-medium mr-1">
                +{remainingCount}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {productTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {productTags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D4A574]/10 dark:bg-[#D4A574]/15 text-[#D4A574] dark:text-[#E8C9A0] font-medium">
                {tag}
              </span>
            ))}
            {productTags.length > 3 && (
              <span className="text-[9px] text-muted-foreground">+{productTags.length - 3}</span>
            )}
          </div>
        )}

        {/* Price section with discount enhancements */}
        <motion.div
          className={`flex items-center justify-between rounded-lg p-1.5 -mx-1 transition-colors duration-300 ${
            priceFlashing && product.discount > 0 ? 'animate-price-flash' : ''
          } ${product.discount > 0 ? 'bg-gradient-to-l from-[#D4A574]/8 via-transparent to-[#C4A4A4]/8 dark:from-[#D4A574]/10 dark:via-transparent dark:to-[#C4A4A4]/10' : ''}`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${product.discount > 0 ? 'text-[#D4A574]' : 'text-primary'}`}>
              {discountedPrice.toFixed(0)} ج.م
            </span>
            {product.discount > 0 && (
              <span className="text-muted-foreground line-through text-sm">
                {product.price.toFixed(0)} ج.م
              </span>
            )}
          </div>
          {/* Savings badge for discounted items */}
          {savings > 0 && (
            <Badge className="bg-emerald-600/90 text-white text-[9px] px-1.5 py-0 h-5 font-medium">
              وفّري {savings.toFixed(0)} ج.م
            </Badge>
          )}
        </motion.div>

        {/* Stock Indicator with dot and pulse */}
        {stockInfo && !isSoldOut && (
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                product.stock <= 3 ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: stockInfo.dotColor }}
            />
            <span className={`text-[11px] font-medium ${stockInfo.color} ${product.stock <= 3 ? 'animate-pulse' : ''}`}>
              {stockInfo.text}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
