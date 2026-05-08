'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
  Share2,
  Copy,
  MessageCircle,
  Mail,
  Twitter,
  Bell,
  BellOff,
  ChevronDown,
  ShoppingCart,
  X,
  Tag,
  ArrowUpDown,
  Filter,
  Check,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import ProductCard from './product-card'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'
import { useEffect, useState, useMemo } from 'react'
import { safeJsonParse } from '@/lib/utils'

type WishlistSortOption = 'date' | 'price_low' | 'price_high' | 'name'

interface CategoryInfo {
  id: string
  nameAr: string
}

export default function WishlistSection() {
  const setPage = useUIStore((s) => s.setPage)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const user = useAuthStore((s) => s.user)
  const { items, loading, fetchWishlist, removeItem } = useWishlistStore()
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setCartOpen)

  const [addingAll, setAddingAll] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<WishlistSortOption>('date')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [priceDropNotifications, setPriceDropNotifications] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('priceDropNotifications')
      return saved ? new Set(JSON.parse(saved)) : new Set<string>()
    }
    return new Set<string>()
  })

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data.map((c: { id: string; nameAr: string }) => ({ id: c.id, nameAr: c.nameAr })))
        }
      } catch {
        // silently fail
      }
    }
    fetchCategories()
  }, [])

  // Save price drop notifications to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('priceDropNotifications', JSON.stringify([...priceDropNotifications]))
    }
  }, [priceDropNotifications])

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user, fetchWishlist])

  // Sort and filter items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Filter by category
    if (selectedCategory) {
      result = result.filter((item) => {
        const imgs: string[] = safeJsonParse<string[]>(item.product.images)
        // Use category from product if available - for now filter client-side by checking product data
        return true // We'll need category data from the wishlist API
      })
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => {
          const priceA = a.product.discount > 0 ? a.product.price * (1 - a.product.discount / 100) : a.product.price
          const priceB = b.product.discount > 0 ? b.product.price * (1 - b.product.discount / 100) : b.product.price
          return priceA - priceB
        })
        break
      case 'price_high':
        result.sort((a, b) => {
          const priceA = a.product.discount > 0 ? a.product.price * (1 - a.product.discount / 100) : a.product.price
          const priceB = b.product.discount > 0 ? b.product.price * (1 - b.product.discount / 100) : b.product.price
          return priceB - priceA
        })
        break
      case 'name':
        result.sort((a, b) => a.product.nameAr.localeCompare(b.product.nameAr, 'ar'))
        break
      case 'date':
      default:
        // Default order (date added)
        break
    }

    return result
  }, [items, sortBy, selectedCategory])

  // Unique categories in wishlist items (derived from what we have)
  const wishlistCategories = useMemo(() => {
    const catSet = new Set<string>()
    // We don't have categoryId in the wishlist store items, so we'll show all categories from API
    return categories
  }, [categories])

  const handleRemoveAll = async () => {
    try {
      for (const item of items) {
        await removeItem(item.productId)
      }
      toast.success('تمت إزالة جميع المنتجات من المفضلة')
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleAddAllToCart = async () => {
    if (items.length === 0) return
    setAddingAll(true)
    try {
      for (const item of items) {
        if (item.product.stock > 0) {
          await addItem(item.productId, 1)
        }
      }
      toast.success('تمت إضافة المنتجات المتوفرة إلى السلة')
      setCartOpen(true)
    } catch {
      toast.error('حدث خطأ أثناء الإضافة للسلة')
    } finally {
      setAddingAll(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1)
      toast.success('تمت الإضافة إلى السلة')
      setCartOpen(true)
    } catch {
      toast.error('فشل إضافة المنتج للسلة')
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId)
      toast.success('تمت الإزالة من المفضلة')
    } catch {
      toast.error('حدث خطأ')
    }
    setRemoveConfirmId(null)
  }

  const handleCopyLink = async () => {
    const shareUrl = `https://donatella.sa/wishlist/${user?.id || 'share'}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('تم نسخ رابط المفضلة')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('تم نسخ رابط المفضلة')
    }
  }

  const handleShareWhatsApp = () => {
    const text = `مفضلتي من DONATELLA ✨\n${items.slice(0, 5).map((i) => `- ${i.product.nameAr}`).join('\n')}\n\nتصفحي المجموعة: https://donatella.sa`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleShareEmail = () => {
    const subject = 'مفضلتي من DONATELLA ✨'
    const body = `مرحباً!\n\nأردت مشاركة مفضلتي من DONATELLA معك:\n\n${items.slice(0, 5).map((i) => `- ${i.product.nameAr} (${(i.product.discount > 0 ? i.product.price * (1 - i.product.discount / 100) : i.product.price).toFixed(0)} ج.م)`).join('\n')}\n\nتصفحي المجموعة: https://donatella.sa`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  const handleShareTwitter = () => {
    const text = `مفضلتي من DONATELLA ✨ تصفحي أجمل قطع الموضة الراقية! https://donatella.sa`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const togglePriceDropNotification = (productId: string) => {
    setPriceDropNotifications((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
        toast.success('تم إلغاء إشعار انخفاض السعر')
      } else {
        newSet.add(productId)
        toast.success('سيتم إشعارك عند انخفاض السعر')
      }
      return newSet
    })
  }

  const sortLabels: Record<WishlistSortOption, string> = {
    date: 'تاريخ الإضافة',
    price_low: 'السعر: من الأقل',
    price_high: 'السعر: من الأعلى',
    name: 'الاسم',
  }

  if (!user) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative mb-6 mx-auto w-fit">
            <div className="h-32 w-32 rounded-full bg-secondary/50 flex items-center justify-center">
              <Heart className="h-14 w-14 text-muted-foreground/30" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-muted-foreground text-sm mb-6">
            يجب تسجيل الدخول لعرض المفضلة
          </p>
          <Button
            onClick={() => {
              setAuthModalTab('login')
              setPage('auth')
            }}
          >
            تسجيل الدخول
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-6 pb-16 min-h-screen">
      {/* Share Wishlist Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right text-lg font-bold">مشاركة المفضلة</DialogTitle>
            <DialogDescription className="text-right text-muted-foreground">
              شاركي مفضلتي مع صديقاتك
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-5">
            {/* Wishlist Preview Card */}
            <div className="rounded-xl border border-[#D4A574]/20 dark:border-[#D4A574]/30 bg-gradient-to-bl from-[#D4A574]/5 dark:from-[#D4A574]/10 to-transparent p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#D4A574]/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-[#D4A574] fill-[#D4A574]" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">مفضلتي من DONATELLA</h3>
                  <p className="text-xs text-muted-foreground">{items.length} منتج</p>
                </div>
              </div>
              {items.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {items.slice(0, 4).map((item) => {
                    const imgs: string[] = safeJsonParse<string[]>(item.product.images)
                    return (
                      <div key={item.id} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50">
                        <Image
                          src={imgs[0] || '/products/dress-1.png'}
                          alt={item.product.nameAr}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )
                  })}
                  {items.length > 4 && (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">+{items.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sharing Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">مشاركة عبر</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Copy Link */}
                <Button
                  variant="outline"
                  className="h-auto py-3 rounded-xl gap-3 justify-start hover:bg-[#D4A574]/5 hover:border-[#D4A574]/30 transition-colors"
                  onClick={handleCopyLink}
                >
                  <div className="h-9 w-9 rounded-lg bg-[#D4A574]/10 flex items-center justify-center shrink-0">
                    <Copy className="h-4 w-4 text-[#D4A574]" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">نسخ الرابط</p>
                    <p className="text-[10px] text-muted-foreground">انسخي رابط المفضلة</p>
                  </div>
                </Button>

                {/* WhatsApp */}
                <Button
                  variant="outline"
                  className="h-auto py-3 rounded-xl gap-3 justify-start hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-200 dark:hover:border-green-800 transition-colors"
                  onClick={handleShareWhatsApp}
                >
                  <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">واتساب</p>
                    <p className="text-[10px] text-muted-foreground">أرسلي عبر واتساب</p>
                  </div>
                </Button>

                {/* Email */}
                <Button
                  variant="outline"
                  className="h-auto py-3 rounded-xl gap-3 justify-start hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  onClick={handleShareEmail}
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">البريد الإلكتروني</p>
                    <p className="text-[10px] text-muted-foreground">أرسلي عبر الإيميل</p>
                  </div>
                </Button>

                {/* Twitter */}
                <Button
                  variant="outline"
                  className="h-auto py-3 rounded-xl gap-3 justify-start hover:bg-sky-50 dark:hover:bg-sky-950/20 hover:border-sky-200 dark:hover:border-sky-800 transition-colors"
                  onClick={handleShareTwitter}
                >
                  <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                    <Twitter className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">تويتر</p>
                    <p className="text-[10px] text-muted-foreground">غرّدي عن مفضلتيك</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeConfirmId} onOpenChange={(open) => !open && setRemoveConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">إزالة من المفضلة</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكدة من إزالة هذا المنتج من المفضلة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
              onClick={() => removeConfirmId && handleRemoveItem(removeConfirmId)}
            >
              إزالة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">المفضلة</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {items.length > 0
                  ? `${items.length} منتج في المفضلة`
                  : 'منتجاتك المفضلة في مكان واحد'}
              </p>
            </div>
            {items.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 hover:bg-[#D4A574]/5 hover:border-[#D4A574]/30"
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 className="h-4 w-4 text-[#D4A574]" />
                  مشاركة المفضلة
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleRemoveAll}
                >
                  <Trash2 className="h-4 w-4" />
                  إزالة الكل
                </Button>
                <Button
                  className="rounded-xl gap-2"
                  onClick={handleAddAllToCart}
                  disabled={addingAll}
                >
                  {addingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  إضافة الكل للسلة
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filters and Sort */}
        {items.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 text-sm"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortLabels[sortBy]}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                {(Object.entries(sortLabels) as [WishlistSortOption, string][]).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setSortBy(key)}
                    className="gap-2 cursor-pointer"
                  >
                    {sortBy === key && <Check className="h-3 w-3 text-[#D4A574]" />}
                    <span className={sortBy === key ? 'text-[#D4A574] font-medium' : ''}>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter Chips */}
            {wishlistCategories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    !selectedCategory
                      ? 'bg-[#D4A574] text-white border-[#D4A574]'
                      : 'border-border/50 text-muted-foreground hover:border-[#D4A574]/30 hover:text-foreground'
                  }`}
                >
                  الكل
                </button>
                {wishlistCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-[#D4A574] text-white border-[#D4A574]'
                        : 'border-border/50 text-muted-foreground hover:border-[#D4A574]/30 hover:text-foreground'
                    }`}
                  >
                    {cat.nameAr}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] rounded-2xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6">
              <div className="h-32 w-32 rounded-full bg-secondary/50 flex items-center justify-center">
                <Heart className="h-14 w-14 text-muted-foreground/30" />
              </div>
              <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">0</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              لا توجد منتجات في المفضلة
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              لم تقومي بإضافة أي منتجات إلى المفضلة بعد. تصفحي المتجر وأضيفي ما يعجبك!
            </p>
            <Button
              onClick={() => setPage('shop')}
              className="gap-2 rounded-xl"
            >
              <ShoppingBag className="h-4 w-4" />
              تسوقي الآن
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item, i) => {
                const imgs: string[] = safeJsonParse<string[]>(item.product.images)
                const discountedPrice = item.product.discount > 0
                  ? item.product.price * (1 - item.product.discount / 100)
                  : item.product.price
                const inStock = item.product.stock > 0
                const hasPriceNotification = priceDropNotifications.has(item.productId)

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group"
                  >
                    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#D4A574]/30 relative">
                      {/* Product Image */}
                      <div
                        className="relative aspect-[3/4] overflow-hidden bg-secondary/30 cursor-pointer"
                        onClick={() => {
                          useUIStore.getState().navigateToProduct(item.productId)
                        }}
                      >
                        <Image
                          src={imgs[0] || '/products/dress-1.png'}
                          alt={item.product.nameAr}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Discount Badge */}
                        {item.product.discount > 0 && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-destructive text-white font-medium text-xs shadow-sm">
                              <Tag className="h-3 w-3 ml-1" />
                              خصم {item.product.discount}%
                            </Badge>
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {!inStock && (
                          <div className="absolute inset-0 bg-gray-500/30 z-10 flex items-center justify-center">
                            <Badge className="bg-destructive/90 text-white text-xs px-3">نفذ المخزون</Badge>
                          </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 gap-2 z-20">
                          {inStock && (
                            <Button
                              size="sm"
                              className="rounded-xl gap-1.5 text-xs h-8 px-3 bg-white/90 dark:bg-foreground/90 text-charcoal dark:text-background hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddToCart(item.productId)
                              }}
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              أضيفي للسلة
                            </Button>
                          )}
                        </div>

                        {/* Price Drop Notification Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePriceDropNotification(item.productId)
                          }}
                          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background/90 z-20"
                          title={hasPriceNotification ? 'إلغاء إشعار انخفاض السعر' : 'إشعار انخفاض السعر'}
                        >
                          {hasPriceNotification ? (
                            <Bell className="h-3.5 w-3.5 text-[#D4A574] fill-[#D4A574]" />
                          ) : (
                            <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-2">
                        <h3
                          className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-[#D4A574] transition-colors cursor-pointer"
                          onClick={() => {
                            useUIStore.getState().navigateToProduct(item.productId)
                          }}
                        >
                          {item.product.nameAr}
                        </h3>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {discountedPrice.toFixed(0)} ج.م
                          </span>
                          {item.product.discount > 0 && (
                            <span className="text-muted-foreground line-through text-xs">
                              {item.product.price.toFixed(0)} ج.م
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-destructive'}`} />
                          <span className={`text-[10px] font-medium ${inStock ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                            {inStock ? 'متوفر' : 'نفذ المخزون'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          {inStock && (
                            <Button
                              size="sm"
                              className="flex-1 h-8 rounded-lg text-xs gap-1.5"
                              onClick={() => handleAddToCart(item.productId)}
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              أضيفي للسلة
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => setRemoveConfirmId(item.productId)}
                          >
                            <X className="h-3.5 w-3.5" />
                            إزالة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
