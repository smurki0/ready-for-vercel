'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ArrowRight,
  Check,
  ArrowUpRight,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Ruler,
  Package,
  Clock,
  CreditCard,
  MapPin,
  GitCompareArrows,
  ZoomIn,
  X,
  ChevronDown,
  ShoppingBag,
  RulerIcon,
  FileText,
  MessageSquare,
  TruckIcon,
  ArrowDown,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Bell,
  CheckCircle2,
  Mail,
  Loader2,
  Tag,
  CalendarDays,
  PartyPopper,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCompareStore } from '@/stores/compare-store'
import { toast } from 'sonner'
import { safeJsonParse } from '@/lib/utils'
import ProductCard from './product-card'
import ProductReviews from './product-reviews'
import SocialShare from './social-share'
import SizeQuiz from './size-quiz'
import { addRecentlyViewedId } from './recently-viewed'

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
  category: { nameAr: string; nameEn: string; slug: string } | null
  createdAt?: string
  // ─── Extended Fields ──────────────────────────────────────
  subtitleAr?: string | null
  brand?: string | null
  badgeTextAr?: string | null
  isNew?: boolean
  freeShipping?: boolean
  freeShippingThreshold?: number | null
  sku?: string | null
  tags?: string | string[]
  materialAr?: string | null
  weight?: number | null
  minOrderQty?: number
  maxOrderQty?: number | null
  shippingTimeAr?: string | null
  videoUrl?: string | null
  careAr?: string | null
  returnPolicyAr?: string | null
}

function ShimmerImage({ src, alt, fill, className }: { src: string; alt: string; fill?: boolean; className?: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-[shimmer_1.5s_ease-in-out_infinite] rounded-xl" />
      )}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          className={`${className || ''} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={400}
          height={600}
          unoptimized
          className={`${className || ''} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  )
}

export default function ProductDetail() {
  const selectedProductId = useUIStore((s) => s.selectedProductId)
  const setPage = useUIStore((s) => s.setPage)
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)

  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const addItemWishlist = useWishlistStore((s) => s.addItem)
  const removeItemWishlist = useWishlistStore((s) => s.removeItem)

  const { addToCompare, isInCompare } = useCompareStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [imageLoading, setImageLoading] = useState(true)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  // Shipping zone state
  const [shippingZones, setShippingZones] = useState<Array<{
    id: string
    nameAr: string
    nameEn: string
    region: string
    price: number
    freeAbove: number | null
    estimatedDays: string
  }>>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [shippingCost, setShippingCost] = useState<number>(50)
  const [estimatedDeliveryRange, setEstimatedDeliveryRange] = useState<string>('3-5')
  const [freeShippingAbove, setFreeShippingAbove] = useState<number | null>(null)
  const [isFreeShipping, setIsFreeShipping] = useState(false)

  // Discount code state
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountError, setDiscountError] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountLabel, setDiscountLabel] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)

  // Frequently Bought Together state
  const [fbtProducts, setFbtProducts] = useState<Product[]>([])
  const [fbtSelected, setFbtSelected] = useState<Set<string>>(new Set())

  // Add-to-cart animation state
  const [cartAdded, setCartAdded] = useState(false)

  // Back-in-stock notification state
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySubmitting, setNotifySubmitting] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  // Fullscreen lightbox zoom state
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 })
  const [isLightboxDragging, setIsLightboxDragging] = useState(false)
  const lightboxDragStart = useRef({ x: 0, y: 0 })
  const lightboxPanStart = useRef({ x: 0, y: 0 })

  const relatedRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Fetch shipping zones on mount
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/shipping/zones')
        const data = await res.json()
        if (data.success && data.data?.length > 0) {
          setShippingZones(data.data)
        }
      } catch {
        // Use default values
      }
    }
    fetchZones()
  }, [])

  // Calculate shipping when zone or price changes
  useEffect(() => {
    if (!product) return
    const calculateShipping = async () => {
      if (!selectedZone) {
        setShippingCost(50)
        setEstimatedDeliveryRange('3-5')
        setFreeShippingAbove(null)
        setIsFreeShipping(false)
        return
      }
      try {
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: selectedZone, cartTotal: discountedPrice * quantity }),
        })
        const data = await res.json()
        if (data.success) {
          setShippingCost(data.data.shippingCost)
          setEstimatedDeliveryRange(data.data.estimatedDays)
          setFreeShippingAbove(data.data.freeAbove)
          setIsFreeShipping(data.data.isFree)
        }
      } catch {
        // Keep defaults
      }
    }
    calculateShipping()
  }, [selectedZone, product, quantity])

  // Calculate estimated delivery date from range
  const estimatedDeliveryDate = (() => {
    const parts = estimatedDeliveryRange.split('-')
    const minDays = parseInt(parts[0]) || 3
    const maxDays = parseInt(parts[1]) || 5
    const now = new Date()
    // Skip weekends for business days
    let daysAdded = 0
    let minDate = new Date(now)
    while (daysAdded < minDays) {
      minDate.setDate(minDate.getDate() + 1)
      const dow = minDate.getDay()
      if (dow !== 5 && dow !== 6) daysAdded++ // Friday=5, Saturday=6 in Egypt
    }
    daysAdded = 0
    let maxDate = new Date(now)
    while (daysAdded < maxDays) {
      maxDate.setDate(maxDate.getDate() + 1)
      const dow = maxDate.getDay()
      if (dow !== 5 && dow !== 6) daysAdded++
    }
    const format = (d: Date) => d.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })
    return `${format(minDate)} - ${format(maxDate)}`
  })()

  useEffect(() => {
    if (!selectedProductId) return
    const fetchProduct = async () => {
      setLoading(true)
      setImageLoading(true)
      try {
        const res = await fetch(`/api/products/${selectedProductId}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
          // Track recently viewed
          addRecentlyViewedId(data.data.id)
          // Fetch related products from same category
          if (data.data.categoryId) {
            const relRes = await fetch(`/api/products?category=${data.data.categoryId}&limit=6`)
            const relData = await relRes.json()
            if (relData.success) {
              const prods = (relData.data.products || relData.data).filter(
                (p: Product) => p.id !== data.data.id
              )
              setRelatedProducts(prods.slice(0, 6))
            }
          }
          // Fetch frequently bought together (products from other categories)
          const fbtRes = await fetch('/api/products?limit=4&sort=random')
          const fbtData = await fbtRes.json()
          if (fbtData.success) {
            const prods = (fbtData.data.products || fbtData.data).filter(
              (p: Product) => p.id !== data.data.id
            )
            setFbtProducts(prods.slice(0, 3))
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [selectedProductId])

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize(null)
    setSelectedColor(null)
    setQuantity(1)
    setMainImage(0)
    setImageLoading(true)
    setActiveTab('description')
    setLightboxZoom(1)
    setLightboxPan({ x: 0, y: 0 })
    setNotifySuccess(false)
    setNotifyError('')
    setDiscountApplied(false)
    setDiscountError(false)
    setDiscountAmount(0)
    setDiscountCode('')
    setCartAdded(false)
    setFbtSelected(new Set())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedProductId])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }, [])

  const scrollToRelated = () => {
    relatedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Fullscreen lightbox zoom handlers
  const handleLightboxWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.15 : 0.15
    setLightboxZoom((prev) => Math.max(1, Math.min(4, prev + delta)))
  }, [])

  const handleLightboxMouseDown = useCallback((e: React.MouseEvent) => {
    if (lightboxZoom > 1) {
      setIsLightboxDragging(true)
      lightboxDragStart.current = { x: e.clientX, y: e.clientY }
      lightboxPanStart.current = { ...lightboxPan }
    }
  }, [lightboxZoom, lightboxPan])

  const handleLightboxMouseMove = useCallback((e: React.MouseEvent) => {
    if (isLightboxDragging && lightboxZoom > 1) {
      const dx = e.clientX - lightboxDragStart.current.x
      const dy = e.clientY - lightboxDragStart.current.y
      setLightboxPan({
        x: lightboxPanStart.current.x + dx,
        y: lightboxPanStart.current.y + dy,
      })
    }
  }, [isLightboxDragging, lightboxZoom])

  const handleLightboxMouseUp = useCallback(() => {
    setIsLightboxDragging(false)
  }, [])

  // Reset lightbox zoom when changing images
  const handleLightboxImageChange = useCallback((index: number) => {
    setMainImage(index)
    setLightboxZoom(1)
    setLightboxPan({ x: 0, y: 0 })
  }, [])

  // Handle pinch to zoom on touch devices
  const lastTouchDistance = useRef(0)
  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      lastTouchDistance.current = dist
    }
  }, [])

  const handleLightboxTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const delta = (dist - lastTouchDistance.current) * 0.005
      setLightboxZoom((prev) => Math.max(1, Math.min(4, prev + delta)))
      lastTouchDistance.current = dist
    }
  }, [])

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user?.email) {
      setNotifyEmail(user.email)
    }
  }, [user])

  if (loading) {
    return (
      <div className="pt-6 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-r from-muted via-muted/50 to-muted animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted animate-[shimmer_1.5s_ease-in-out_infinite]" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">المنتج غير موجود</p>
          <Button onClick={() => navigateToShop()}>العودة للمتجر</Button>
        </div>
      </div>
    )
  }

  const images: string[] = safeJsonParse<string[]>(product.images)
  const sizes: string[] = safeJsonParse<string[]>(product.sizes)
  const colors: string[] = safeJsonParse<string[]>(product.colors)
  const discountedPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price
  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  const handleCompare = () => {
    addToCompare(product.id)
  }

  const isNewArrival = product.createdAt
    ? new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : false

  const handleAddToCart = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
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
      setCartAdded(true)
      toast.success('تمت الإضافة إلى السلة', {
        icon: <ShoppingCart className="h-4 w-4 text-[#D4A574]" />,
      })
      setTimeout(() => {
        setCartAdded(false)
        setCartOpen(true)
      }, 600)
    } catch {
      toast.error('فشل إضافة المنتج للسلة')
    } finally {
      setAddingToCart(false)
    }
  }

  // Discount validation handler
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('يرجى إدخال كود الخصم')
      return
    }
    setApplyingDiscount(true)
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          cartTotal: discountedPrice * quantity,
          userId: user?.id,
        }),
      })
      const data = await res.json()
      if (data.success && data.data.valid) {
        const d = data.data.discount
        const amt = data.data.discountAmount
        setDiscountApplied(true)
        setDiscountError(false)
        setDiscountAmount(amt)
        setDiscountLabel(d.descriptionAr || `${d.type === 'percentage' ? d.value + '%' : d.type === 'fixed' ? amt + ' ج.م' : 'توصيل مجاني'}`)
        toast.success('تم تطبيق كود الخصم بنجاح!')
      } else {
        setDiscountError(true)
        setDiscountApplied(false)
        setDiscountAmount(0)
        toast.error(data.data?.error || 'كود الخصم غير صالح')
        setTimeout(() => setDiscountError(false), 2000)
      }
    } catch {
      setDiscountError(true)
      setDiscountApplied(false)
      toast.error('فشل التحقق من كود الخصم')
      setTimeout(() => setDiscountError(false), 2000)
    } finally {
      setApplyingDiscount(false)
    }
  }

  // Add FBT product to cart
  const handleAddFbt = async (prodId: string) => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    try {
      await addItem(prodId, 1)
      toast.success('تمت الإضافة إلى السلة')
    } catch {
      toast.error('فشل إضافة المنتج للسلة')
    }
  }

  // Add all FBT selected products
  const handleAddAllFbt = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    try {
      for (const prodId of fbtSelected) {
        await addItem(prodId, 1)
      }
      await addItem(product.id, quantity, selectedSize || undefined, selectedColor || undefined)
      toast.success(`تمت إضافة ${fbtSelected.size + 1} منتجات إلى السلة`)
      setCartOpen(true)
    } catch {
      toast.error('فشل إضافة المنتجات للسلة')
    }
  }

  const handleQuickBuy = () => {
    handleAddToCart()
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
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

  // Back-in-stock notification handler
  const handleNotifySubmit = async () => {
    if (!notifyEmail.trim()) {
      setNotifyError('يرجى إدخال البريد الإلكتروني')
      return
    }
    setNotifyError('')
    setNotifySubmitting(true)
    try {
      const res = await fetch('/api/notifications/back-in-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          email: notifyEmail,
          size: selectedSize || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifySuccess(true)
        if (data.data?.alreadySignedUp) {
          toast.info('أنت مسجل بالفعل في قائمة الإشعارات لهذا المنتج')
        } else {
          toast.success('تم تسجيلك في قائمة الإشعارات')
        }
      } else {
        setNotifyError(data.error || 'حدث خطأ')
      }
    } catch {
      setNotifyError('حدث خطأ في الاتصال')
    } finally {
      setNotifySubmitting(false)
    }
  }

  return (
    <div className="pt-6 pb-16 min-h-screen">
      {/* Floating Back to Shop Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => navigateToShop()}
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2 pl-4 pr-3"
        >
          <ArrowUpRight className="h-4 w-4" />
          العودة للمتجر
        </Button>
      </motion.div>

      {/* Size Guide Dialog */}
      <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-lg font-bold">دليل المقاسات</DialogTitle>
            <DialogDescription className="text-right text-muted-foreground">
              استخدمي هذا الدليل لاختيار المقاس المناسب لك
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              جميع المقاسات بالسنتيمتر. للحصول على أفضل نتيجة، خذي قياساتك وقارنيها بالجدول أدناه.
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-right font-semibold text-foreground">المقاس</th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">محيط الصدر</th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">محيط الخصر</th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">محيط الورك</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', chest: '80-84', waist: '60-64', hip: '88-92' },
                    { size: 'S', chest: '84-88', waist: '64-68', hip: '92-96' },
                    { size: 'M', chest: '88-92', waist: '68-72', hip: '96-100' },
                    { size: 'L', chest: '92-96', waist: '72-76', hip: '100-104' },
                    { size: 'XL', chest: '96-100', waist: '76-80', hip: '104-108' },
                    { size: 'XXL', chest: '100-104', waist: '80-84', hip: '108-112' },
                    { size: '38', chest: '82-86', waist: '62-66', hip: '90-94' },
                    { size: '40', chest: '86-90', waist: '66-70', hip: '94-98' },
                    { size: '42', chest: '90-94', waist: '70-74', hip: '98-102' },
                    { size: '44', chest: '94-98', waist: '74-78', hip: '102-106' },
                    { size: '46', chest: '98-102', waist: '78-82', hip: '106-110' },
                    { size: '48', chest: '102-106', waist: '82-86', hip: '110-114' },
                  ].map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-4 py-2.5 font-medium text-foreground">{row.size}</td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{row.chest}</td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{row.waist}</td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#D4A574]/10 dark:bg-[#D4A574]/15 border border-[#D4A574]/20 dark:border-[#D4A574]/30">
              <Star className="h-4 w-4 text-[#D4A574] mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                نصيحة: إذا كنتِ بين مقاسين، ننصح باختيار المقاس الأكبر لراحة أفضل
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer with Zoom */}
      <Dialog open={fullscreenOpen} onOpenChange={(open) => {
        setFullscreenOpen(open)
        if (!open) {
          setLightboxZoom(1)
          setLightboxPan({ x: 0, y: 0 })
        }
      }}>
        <DialogContent className="sm:max-w-5xl p-0 gap-0 bg-black/98 border-none overflow-hidden" dir="rtl">
          <DialogHeader className="absolute top-4 right-4 z-10">
            <DialogTitle className="sr-only">عرض الصورة بالحجم الكامل</DialogTitle>
            <DialogDescription className="sr-only">عرض الصورة بالحجم الكامل مع إمكانية التكبير</DialogDescription>
          </DialogHeader>
          {/* Close button with animation */}
          <motion.button
            onClick={() => setFullscreenOpen(false)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </motion.button>

          {/* Zoom controls */}
          <div className="absolute top-4 right-14 z-10 flex gap-2">
            <button
              onClick={() => setLightboxZoom((prev) => Math.min(4, prev + 0.5))}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white text-lg font-bold"
            >
              +
            </button>
            <button
              onClick={() => setLightboxZoom((prev) => Math.max(1, prev - 0.5))}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white text-lg font-bold"
            >
              −
            </button>
            {lightboxZoom > 1 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => {
                  setLightboxZoom(1)
                  setLightboxPan({ x: 0, y: 0 })
                }}
                className="h-8 px-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white text-xs"
              >
                إعادة تعيين
              </motion.button>
            )}
          </div>

          {/* Zoom level indicator */}
          {lightboxZoom > 1 && (
            <div className="absolute top-16 right-14 z-10">
              <div className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">{Math.round(lightboxZoom * 100)}%</span>
              </div>
            </div>
          )}

          {/* Main image area with zoom */}
          <div
            className="relative aspect-[3/4] w-full overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleLightboxWheel}
            onMouseDown={handleLightboxMouseDown}
            onMouseMove={handleLightboxMouseMove}
            onMouseUp={handleLightboxMouseUp}
            onMouseLeave={handleLightboxMouseUp}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            style={{ touchAction: 'none' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mainImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  style={{
                    transform: `scale(${lightboxZoom}) translate(${lightboxPan.x / lightboxZoom}px, ${lightboxPan.y / lightboxZoom}px)`,
                    transition: isLightboxDragging ? 'none' : 'transform 0.2s ease-out',
                  }}
                  className="w-full h-full"
                >
                  <Image
                    src={images[mainImage] || '/products/dress-1.png'}
                    alt={product.nameAr}
                    fill
                    unoptimized
                    className="object-contain"
                    draggable={false}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Scroll/pinch to zoom hint */}
            {lightboxZoom === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
              >
                <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <ZoomIn className="h-3.5 w-3.5 text-white" />
                  <span className="text-white text-xs">مرري التمرير أو اضغطي + للتكبير</span>
                </div>
              </motion.div>
            )}

            {/* Image counter in fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
                <span className="text-white text-sm font-medium">{mainImage + 1}/{images.length}</span>
              </div>
            </div>

            {/* Navigation arrows in fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => handleLightboxImageChange((mainImage + 1) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors group/arrow"
                >
                  <ChevronLeft className="h-6 w-6 text-white group-hover/arrow:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => handleLightboxImageChange((mainImage - 1 + images.length) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors group/arrow"
                >
                  <ChevronRight className="h-6 w-6 text-white group-hover/arrow:scale-110 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip in fullscreen - Enhanced with golden border */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-black/60 items-center justify-center">
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleLightboxImageChange(i)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-300 ${
                    mainImage === i
                      ? 'border-[#D4A574] opacity-100 ring-2 ring-[#D4A574]/30 shadow-lg shadow-[#D4A574]/20'
                      : 'border-white/20 opacity-50 hover:opacity-80 hover:border-white/40'
                  }`}
                >
                  <Image src={img} alt={`${product.nameAr} - ${i + 1}`} fill unoptimized className="object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Gallery - Enhanced with zoom panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Image with Zoom */}
              <div className="flex-1">
                <div
                  ref={imageContainerRef}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary/30 mb-0 group cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onClick={() => setFullscreenOpen(true)}
                >
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
                        className={`object-cover transition-transform duration-300 ${
                          isZooming ? 'scale-[2.5]' : 'group-hover:scale-105'
                        }`}
                        style={isZooming ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
                        onLoad={() => setImageLoading(false)}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Zoom indicator - Enhanced */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                      <ZoomIn className="h-3.5 w-3.5 text-[#D4A574]" />
                      <span className="text-xs font-medium text-foreground">تكبير</span>
                    </div>
                  </motion.div>

                  {/* Fullscreen indicator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="h-3.5 w-3.5 text-[#D4A574]" />
                      <span className="text-xs font-medium text-foreground">عرض كامل</span>
                    </div>
                  </motion.div>

                  {/* Zoom lens indicator when zooming */}
                  {isZooming && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute z-10 pointer-events-none"
                      style={{
                        left: `${zoomPosition.x}%`,
                        top: `${zoomPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-[#D4A574]/60 bg-[#D4A574]/10 backdrop-blur-sm" />
                    </motion.div>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-foreground">{mainImage + 1}/{images.length}</span>
                    </div>
                  </div>

                  {/* Shimmer overlay */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/20 to-muted/50 animate-[shimmer_1.5s_ease-in-out_infinite] pointer-events-none" />
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {product.discount > 0 && (
                      <Badge className="bg-destructive text-white font-medium shadow-md">
                        خصم {product.discount}%
                      </Badge>
                    )}
                    {isNewArrival && (
                      <Badge className="bg-emerald-500 dark:bg-emerald-600 text-white font-medium shadow-md">
                        جديد
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Zoom Preview Panel - Shows on desktop when hovering */}
              {isZooming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -10 }}
                  className="hidden lg:block w-80 h-[300px] rounded-2xl overflow-hidden bg-secondary/30 border border-border/30 shadow-xl sticky top-24"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={images[mainImage] || '/products/dress-1.png'}
                      alt={`${product.nameAr} - تكبير`}
                      fill
                      unoptimized
                      className="object-cover"
                      style={{
                        transform: `scale(2.5)`,
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                      <ZoomIn className="h-3 w-3 text-[#D4A574]" />
                      <span className="text-[10px] text-foreground font-medium">2.5x تكبير</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Thumbnails Strip - Enhanced with golden border and larger size */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 mt-4">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setMainImage(i)
                      setImageLoading(true)
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${
                      mainImage === i
                        ? 'border-[#D4A574] ring-2 ring-[#D4A574]/25 shadow-lg shadow-[#D4A574]/15'
                        : 'border-border/30 opacity-60 hover:opacity-100 hover:border-[#D4A574]/30'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.nameAr} - ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                    {/* Active indicator dot */}
                    {mainImage === i && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-t-full bg-[#D4A574]" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info - Sticky on Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6 md:sticky md:top-24 md:self-start"
          >
            <div>
              {product.category && (
                <p className="text-sm text-primary font-medium mb-2">
                  {product.category.nameAr}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {product.nameAr}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {discountedPrice.toFixed(0)} ج.م
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {product.price.toFixed(0)} ج.م
                  </span>
                  <Badge className="bg-destructive/10 text-destructive border-0">
                    وفّري {((product.price - discountedPrice) * quantity).toFixed(0)} ج.م
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            {product.descriptionAr && (
              <p className="text-muted-foreground leading-relaxed">
                {product.descriptionAr}
              </p>
            )}

            {/* Size Selector - Enhanced */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">المقاس</h3>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-xs text-[#D4A574] hover:text-[#D4A574]/80 transition-colors"
                    >
                      <Ruler className="h-3.5 w-3.5" />
                      دليل المقاسات
                    </button>
                  </div>
                  {selectedSize && (
                    <button
                      onClick={() => setSelectedSize(null)}
                      className="text-xs text-primary hover:underline"
                    >
                      إزالة الاختيار
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative h-10 min-w-[44px] px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {size}
                      {selectedSize === size && (
                        <motion.div
                          layoutId="sizeCheck"
                          className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector - Enhanced */}
            {colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">اللون</h3>
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="text-xs text-primary hover:underline"
                    >
                      إزالة الاختيار
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative h-10 w-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedColor === color
                          ? 'border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Check className="h-4 w-4 text-white drop-shadow-md" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions - Conditional on stock */}
            <AnimatePresence mode="wait">
              {product.stock === 0 ? (
                <motion.div
                  key="out-of-stock"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Out of Stock Badge */}
                  <div className="flex items-center gap-2 text-destructive">
                    <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    <span className="text-sm font-medium">نفذ المخزون</span>
                  </div>

                  {/* Back-in-Stock Notification Section */}
                  <div className="relative p-5 rounded-2xl border border-[#D4A574]/20 dark:border-[#D4A574]/30 bg-gradient-to-br from-[#D4A574]/5 via-[#C4A4A4]/5 to-[#D4A574]/5 dark:from-[#D4A574]/10 dark:via-[#C4A4A4]/10 dark:to-[#D4A574]/10 overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#D4A574]/5 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#C4A4A4]/5 translate-y-1/2 -translate-x-1/2" />

                    <div className="relative space-y-4">
                      {/* Header with Bell icon */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] flex items-center justify-center shadow-lg shadow-[#D4A574]/25"
                          >
                            <Bell className="h-5 w-5 text-white" />
                          </motion.div>
                          {/* Pulse ring */}
                          <motion.div
                            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute inset-0 rounded-xl border-2 border-[#D4A574]/40"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground">أعلمني عند التوفر</h3>
                          <p className="text-xs text-muted-foreground">سنرسل لك إشعاراً فور توفر المنتج</p>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {notifySuccess ? (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-3 py-3"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                            >
                              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </motion.div>
                            <p className="text-sm font-medium text-foreground text-center">تم التسجيل بنجاح!</p>
                            <p className="text-xs text-muted-foreground text-center">سنرسل لك إشعاراً فور توفر المنتج</p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                          >
                            {/* Email input */}
                            <div className="relative">
                              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="email"
                                value={notifyEmail}
                                onChange={(e) => {
                                  setNotifyEmail(e.target.value)
                                  setNotifyError('')
                                }}
                                placeholder="أدخلي بريدك الإلكتروني"
                                className="w-full h-11 pr-10 pl-4 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4A574]/40 focus:border-[#D4A574]/60 transition-all"
                                dir="ltr"
                              />
                            </div>

                            {/* Error message */}
                            {notifyError && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-destructive"
                              >
                                {notifyError}
                              </motion.p>
                            )}

                            {/* Submit button */}
                            <Button
                              onClick={handleNotifySubmit}
                              disabled={notifySubmitting}
                              className="w-full h-11 rounded-xl gap-2 text-sm font-medium shadow-lg shadow-[#D4A574]/20"
                              style={{
                                background: 'linear-gradient(135deg, #D4A574 0%, #C9956A 100%)',
                              }}
                            >
                              {notifySubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Bell className="h-4 w-4" />
                              )}
                              {notifySubmitting ? 'جاري التسجيل...' : 'أعلمني عند التوفر'}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Wishlist, Compare, Share for out-of-stock */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl shrink-0"
                      onClick={handleWishlistToggle}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          inWishlist ? 'fill-destructive text-destructive' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-11 w-11 rounded-xl shrink-0 ${inCompare ? 'bg-primary/10 border-primary/30' : ''}`}
                      onClick={handleCompare}
                    >
                      <GitCompareArrows className={`h-5 w-5 ${inCompare ? 'text-primary' : ''}`} />
                    </Button>
                    <SocialShare productName={product.nameAr} productId={product.id} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="in-stock"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Quantity */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">الكمية</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-10 w-10 flex items-center justify-center hover:bg-accent/50 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="h-10 w-12 flex items-center justify-center text-sm font-medium border-x border-border">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="h-10 w-10 flex items-center justify-center hover:bg-accent/50 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.stock} متوفر في المخزون
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Enhanced with cart animation */}
                  <div className="flex gap-3 pt-2">
                    <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                      <Button
                        className={`w-full h-12 rounded-xl gap-2 text-base transition-all duration-300 ${
                          cartAdded
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : ''
                        }`}
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                      >
                        <AnimatePresence mode="wait">
                          {cartAdded ? (
                            <motion.div
                              key="added"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-5 w-5" />
                              تمت الإضافة
                            </motion.div>
                          ) : (
                            <motion.div
                              key="add"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="h-5 w-5" />
                              {addingToCart ? 'جاري الإضافة...' : 'أضيفي للسلة'}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl shrink-0"
                      onClick={handleWishlistToggle}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          inWishlist ? 'fill-destructive text-destructive' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-12 w-12 rounded-xl shrink-0 ${inCompare ? 'bg-primary/10 border-primary/30' : ''}`}
                      onClick={handleCompare}
                    >
                      <GitCompareArrows className={`h-5 w-5 ${inCompare ? 'text-primary' : ''}`} />
                    </Button>
                    <SocialShare productName={product.nameAr} productId={product.id} />
                  </div>

                  {/* Quick Buy Button */}
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl gap-2 border-[#D4A574]/30 hover:bg-[#D4A574]/5 hover:border-[#D4A574]/50 text-[#D4A574]"
                    onClick={handleQuickBuy}
                    disabled={addingToCart}
                  >
                    <Zap className="h-4 w-4" />
                    شراء سريع
                  </Button>

                  {/* Stock Warning */}
                  {product.stock <= 3 && product.stock > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-destructive font-medium animate-pulse flex items-center gap-1"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-destructive" />
                      باقي {product.stock} فقط - اطلبي الآن!
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Anchor link to related products */}
            <button
              onClick={scrollToRelated}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <span>المنتجات المشابهة</span>
              <ArrowDown className="h-4 w-4" />
            </button>

            <Separator className="bg-border/50" />

            {/* Shipping Zone Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#D4A574]" />
                <h3 className="font-semibold text-sm">منطقة الشحن</h3>
              </div>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full rounded-xl border-border/50 focus:ring-[#D4A574]/30 h-10">
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

              {/* Shipping zone info */}
              {selectedZone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-[#D4A574]/5 dark:bg-[#D4A574]/8 border border-[#D4A574]/15 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">تكلفة الشحن</span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <PartyPopper className="h-3 w-3" />
                        مجاني
                      </span>
                    ) : (
                      <span className="font-bold text-[#D4A574]">{shippingCost.toFixed(0)} ج.م</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">التوصيل المتوقع</span>
                    <span className="font-semibold text-foreground">{estimatedDeliveryDate}</span>
                  </div>
                  {freeShippingAbove && !isFreeShipping && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">شحن مجاني فوق</span>
                      <span className="font-medium text-[#D4A574]">{freeShippingAbove.toFixed(0)} ج.م</span>
                    </div>
                  )}
                  {isFreeShipping && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>الشحن مجاني لهذه المنطقة!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Discount Code Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#D4A574]" />
                <h3 className="font-semibold text-sm">كود الخصم</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value)
                    if (discountError) setDiscountError(false)
                  }}
                  placeholder="أدخلي كود الخصم"
                  className={`h-10 text-sm rounded-xl transition-all duration-300 ${
                    discountError
                      ? 'border-destructive ring-2 ring-destructive/20'
                      : discountApplied
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-border/50 focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20'
                  }`}
                  dir="ltr"
                  disabled={discountApplied}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl shrink-0 border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
                  onClick={handleApplyDiscount}
                  disabled={discountApplied || applyingDiscount}
                >
                  {applyingDiscount ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : discountApplied ? (
                    <motion.div
                      initial={{ scale: 0 }}
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
                {discountApplied && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    تم تطبيق الخصم بنجاح - {discountLabel}
                  </motion.p>
                )}
                {discountError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-destructive flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    كود الخصم غير صالح
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Estimated Delivery Date - Prominent */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="p-4 rounded-xl bg-gradient-to-l from-[#D4A574]/8 to-[#C4A4A4]/8 dark:from-[#D4A574]/5 dark:to-[#C4A4A4]/5 border border-[#D4A574]/15 space-y-2"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#D4A574]" />
                <span className="text-sm font-semibold">التوصيل المتوقع</span>
              </div>
              <p className="text-lg font-bold text-foreground">{estimatedDeliveryDate}</p>
              <p className="text-xs text-muted-foreground">
                {selectedZone
                  ? `شحن إلى ${shippingZones.find(z => z.region === selectedZone)?.nameAr || 'المنطقة المختارة'}`
                  : 'اختاري منطقة الشحن لمعرفة موعد التوصيل'}
              </p>
              {selectedZone && !isFreeShipping && (
                <p className="text-xs text-[#D4A574]">
                  تكلفة الشحن: {shippingCost.toFixed(0)} ج.م
                </p>
              )}
              {isFreeShipping && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <PartyPopper className="h-3 w-3" />
                  الشحن مجاني!
                </p>
              )}
            </motion.div>

            <Separator className="bg-border/50" />

            {/* Delivery Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-sm">معلومات التوصيل والضمان</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Shipping */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-[#C4A4A4]/30 dark:hover:border-[#C4A4A4]/40 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center shrink-0">
                    <Truck className="h-4.5 w-4.5 text-[#D4A574]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">شحن مجاني</p>
                    <p className="text-xs text-muted-foreground mt-0.5">للطلبات فوق {freeShippingAbove?.toFixed(0) || '300'} ج.م</p>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-[#C4A4A4]/30 dark:hover:border-[#C4A4A4]/40 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center shrink-0">
                    <Clock className="h-4.5 w-4.5 text-[#D4A574]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">توصيل خلال {estimatedDeliveryRange} أيام عمل</p>
                    <p className="text-xs text-muted-foreground mt-0.5">داخل جمهورية مصر العربية</p>
                  </div>
                </div>

                {/* Return Policy */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-[#C4A4A4]/30 dark:hover:border-[#C4A4A4]/40 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center shrink-0">
                    <RotateCcw className="h-4.5 w-4.5 text-[#D4A574]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">إرجاع مجاني</p>
                    <p className="text-xs text-muted-foreground mt-0.5">خلال 14 يوم من الاستلام</p>
                  </div>
                </div>

                {/* Authenticity */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-[#C4A4A4]/30 dark:hover:border-[#C4A4A4]/40 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center shrink-0">
                    <Shield className="h-4.5 w-4.5 text-[#D4A574]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">منتج أصلي 100%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ضمان الأصالة والجودة</p>
                  </div>
                </div>
              </div>

              {/* Additional delivery details */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>التوصيل متوفر لجميع محافظات مصر</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-3.5 w-3.5 shrink-0" />
                  <span>تغليف فاخر مجاني مع كل طلب</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  <span>الدفع عند الاستلام متاح</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Frequently Bought Together */}
        {fbtProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#D4A574]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">يشترى معاً</h2>
                <p className="text-sm text-muted-foreground">أضيفي هذه المنتجات معاً وفري أكثر</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current product - always first */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-4 rounded-2xl border-2 border-[#D4A574]/30 bg-[#D4A574]/5 dark:bg-[#D4A574]/8"
              >
                <div className="absolute -top-2 right-3">
                  <Badge className="bg-[#D4A574] text-white text-[10px]">المنتج الحالي</Badge>
                </div>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 mt-2">
                  <Image
                    src={images[0] || '/products/dress-1.png'}
                    alt={product.nameAr}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <p className="text-sm font-semibold line-clamp-1 text-foreground">{product.nameAr}</p>
                <p className="text-sm font-bold text-[#D4A574] mt-1">{discountedPrice.toFixed(0)} ج.م</p>
              </motion.div>

              {/* Plus sign */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-[#D4A574]/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-[#D4A574]" />
                </div>
              </div>

              {/* FBT Products */}
              {fbtProducts.map((fbtProd, i) => {
                const fbtImages: string[] = safeJsonParse<string[]>(fbtProd.images)
                const fbtImage = fbtImages[0] || '/products/dress-1.png'
                const fbtPrice = fbtProd.discount > 0
                  ? fbtProd.price * (1 - fbtProd.discount / 100)
                  : fbtProd.price
                const isSelected = fbtSelected.has(fbtProd.id)
                return (
                  <motion.div
                    key={fbtProd.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i + 1) * 0.1 }}
                    onClick={() => {
                      const newSet = new Set(fbtSelected)
                      if (isSelected) newSet.delete(fbtProd.id)
                      else newSet.add(fbtProd.id)
                      setFbtSelected(newSet)
                    }}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-[#D4A574] bg-[#D4A574]/5 dark:bg-[#D4A574]/8 shadow-md shadow-[#D4A574]/10'
                        : 'border-border/30 bg-card hover:border-[#D4A574]/30 hover:bg-[#D4A574]/3'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 right-3"
                      >
                        <div className="h-5 w-5 rounded-full bg-[#D4A574] flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </motion.div>
                    )}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
                      <Image
                        src={fbtImage}
                        alt={fbtProd.nameAr}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {fbtProd.discount > 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-destructive text-white text-[10px]">خصم {fbtProd.discount}%</Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold line-clamp-1 text-foreground">{fbtProd.nameAr}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold text-[#D4A574]">{fbtPrice.toFixed(0)} ج.م</p>
                      {fbtProd.discount > 0 && (
                        <span className="text-xs text-muted-foreground line-through">{fbtProd.price.toFixed(0)} ج.م</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Add All Button */}
            {fbtSelected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-l from-[#D4A574]/8 to-[#C4A4A4]/8 dark:from-[#D4A574]/5 dark:to-[#C4A4A4]/5 border border-[#D4A574]/15"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    إضافة {fbtSelected.size + 1} منتجات للسلة
                  </p>
                  <p className="text-xs text-muted-foreground">
                    المجموع: {(
                      discountedPrice +
                      fbtProducts
                        .filter(p => fbtSelected.has(p.id))
                        .reduce((sum, p) => sum + (p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price), 0)
                    ).toFixed(0)} ج.م
                  </p>
                </div>
                <Button
                  className="rounded-xl gap-2 bg-gradient-to-l from-[#D4A574] to-[#b8885a] text-white shadow-lg shadow-[#D4A574]/20 hover:shadow-xl"
                  onClick={handleAddAllFbt}
                >
                  <ShoppingCart className="h-4 w-4" />
                  أضيفي الكل
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Product Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
            <TabsList className="w-full h-auto p-1 rounded-xl bg-muted/50 border border-border/50 flex-wrap">
              <TabsTrigger
                value="description"
                className="rounded-lg gap-2 data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 text-sm font-medium"
              >
                <FileText className="h-4 w-4" />
                الوصف
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-lg gap-2 data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 text-sm font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                التقييمات
              </TabsTrigger>
              {product.careAr && (
                <TabsTrigger
                  value="care"
                  className="rounded-lg gap-2 data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  العناية
                </TabsTrigger>
              )}
              <TabsTrigger
                value="shipping"
                className="rounded-lg gap-2 data-[state=active]:bg-[#D4A574] data-[state=active]:text-white data-[state=active]:shadow-md px-6 py-2.5 text-sm font-medium"
              >
                <TruckIcon className="h-4 w-4" />
                الشحن والإرجاع
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#D4A574]" />
                    </div>
                    وصف المنتج
                  </h3>
                  {product.descriptionAr ? (
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                      {product.descriptionAr}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      لا يوجد وصف متاح لهذا المنتج.
                    </p>
                  )}
                </div>

                <Separator className="bg-border/50" />

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">التصنيف</p>
                    <p className="text-sm font-medium text-foreground">{product.category?.nameAr || '-'}</p>
                  </div>
                  {product.brand && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">العلامة التجارية</p>
                      <p className="text-sm font-medium text-foreground">{product.brand}</p>
                    </div>
                  )}
                  {product.sku && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">كود المنتج</p>
                      <p className="text-sm font-medium text-foreground font-mono" dir="ltr">{product.sku}</p>
                    </div>
                  )}
                  {product.materialAr && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">الخامة</p>
                      <p className="text-sm font-medium text-foreground">{product.materialAr}</p>
                    </div>
                  )}
                  {product.weight && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">الوزن</p>
                      <p className="text-sm font-medium text-foreground">{product.weight} كجم</p>
                    </div>
                  )}
                  {sizes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">المقاسات المتاحة</p>
                      <p className="text-sm font-medium text-foreground">{sizes.join(' · ')}</p>
                    </div>
                  )}
                  {colors.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">الألوان المتاحة</p>
                      <div className="flex gap-1.5 mt-1">
                        {colors.slice(0, 6).map((color) => (
                          <div
                            key={color}
                            className="h-5 w-5 rounded-full border border-border/50 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Tags */}
                  {(() => {
                    const tags = safeJsonParse<string[]>(product.tags)
                    if (!Array.isArray(tags) || tags.length === 0) return null
                    return (
                      <div className="space-y-1 col-span-2 sm:col-span-3">
                        <p className="text-xs text-muted-foreground">الوسوم</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4A574]/10 dark:bg-[#D4A574]/15 text-[#D4A574] dark:text-[#E8C9A0] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </motion.div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductReviews productId={product.id} />
              </motion.div>
            </TabsContent>

            {/* Care Instructions Tab */}
            {product.careAr && (
              <TabsContent value="care" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-[#D4A574]" />
                    </div>
                    تعليمات العناية
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {product.careAr}
                  </p>
                </motion.div>
              </TabsContent>
            )}

            {/* Shipping & Returns Tab */}
            <TabsContent value="shipping" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 space-y-8"
              >
                {/* Shipping Info */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#D4A574]/10 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-[#D4A574]" />
                    </div>
                    معلومات الشحن
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                      <Truck className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {product.freeShipping ? 'شحن مجاني لهذا المنتج' : `شحن مجاني للطلبات فوق ${product.freeShippingThreshold || 500} ج.م`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">الشحن القياسي يبدأ من 35 ج.م حسب المنطقة</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                      <Clock className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {product.shippingTimeAr || 'التوصيل خلال 2-5 أيام عمل'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">ضمن المحافظات الرئيسية</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                      <MapPin className="h-5 w-5 text-[#D4A574] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">توصيل لجميع المناطق</p>
                        <p className="text-xs text-muted-foreground mt-0.5">قد يستغرق التوصيل للمناطق النائية وقتاً أطول</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Return Policy */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#C4A4A4]/10 flex items-center justify-center">
                      <RotateCcw className="h-4 w-4 text-[#C4A4A4]" />
                    </div>
                    سياسة الإرجاع
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    {product.returnPolicyAr ? (
                      <p className="leading-relaxed">{product.returnPolicyAr}</p>
                    ) : (
                      <>
                        <p>نقدم لكِ سياسة إرجاع مرنة لضمان رضاكِ التام:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>إرجاع مجاني خلال 14 يوم من تاريخ الاستلام</li>
                          <li>يجب أن يكون المنتج بحالته الأصلية مع جميع البطاقات والتغليف</li>
                          <li>المنتجات المستخدمة أو المتضررة غير قابلة للإرجاع</li>
                          <li>سيتم استرداد المبلغ خلال 5-7 أيام عمل بعد استلام المنتج المرتجع</li>
                          <li>المنتجات المخفضة نهائية ولا تقبل الإرجاع ما لم يكن بها عيب مصنعي</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Size Guide */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#8B6F6F]/10 flex items-center justify-center">
                      <RulerIcon className="h-4 w-4 text-[#8B6F6F]" />
                    </div>
                    دليل المقاسات
                  </h3>
                  <Button
                    variant="outline"
                    className="rounded-xl gap-2 border-[#D4A574]/30 hover:bg-[#D4A574]/5 text-[#D4A574]"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    <Ruler className="h-4 w-4" />
                    عرض دليل المقاسات
                  </Button>

                  {/* Size Recommendation Quiz */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-[#D4A574]" />
                      <span className="text-sm font-semibold text-foreground">غير متأكدة من مقاسك؟</span>
                    </div>
                    <SizeQuiz compact onClose={() => {}} />
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* You Might Also Like Section */}
        {relatedProducts.length > 0 && (
          <motion.div
            ref={relatedRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 sm:mt-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#D4A574]/10 dark:bg-[#D4A574]/15 flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#D4A574]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    قد يعجبك أيضاً
                  </h2>
                  <p className="text-sm text-muted-foreground">منتجات مشابهة قد تنال إعجابك</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigateToShop(product.categoryId)}
                className="text-primary hover:text-primary/80 gap-1 text-sm"
              >
                عرض الكل
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 6).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className="group relative">
                    <ProductCard product={p} />
                    {/* Quick action buttons on hover */}
                    <div className="absolute bottom-16 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 rounded-lg text-[10px] gap-1 bg-background/90 backdrop-blur-sm border-border/50 hover:bg-[#D4A574]/5 hover:border-[#D4A574]/30 hover:text-[#D4A574]"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCompare(p.id)
                        }}
                      >
                        <GitCompareArrows className="h-3 w-3" />
                        إضافة للمقارنة
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 rounded-lg text-[10px] gap-1 bg-[#D4A574] hover:bg-[#D4A574]/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Quick buy - navigate to product
                          useUIStore.getState().navigateToProduct(p.id)
                        }}
                      >
                        <Zap className="h-3 w-3" />
                        شراء سريع
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
