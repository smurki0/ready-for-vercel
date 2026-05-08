'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Clock, Sparkles, ShoppingBag, Heart, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/stores/ui-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { safeJsonParse } from '@/lib/utils'
import { toast } from 'sonner'
import { useSiteSettings } from '@/hooks/use-site-settings'

interface Product {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
  category: { nameAr: string } | null
  createdAt: string
  stock: number
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  return `منذ ${diffDays} يوم`
}

function MasonryProductCard({
  product,
  index,
}: {
  product: Product
  index: number
}) {
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setCartOpen)

  const images: string[] = safeJsonParse<string[]>(product.images)
  const mainImage = images[0] || '/products/dress-1.png'
  const hasDiscount = product.discount > 0
  const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price
  const isWished = isInWishlist(product.id)

  // Vary card heights for masonry effect
  const heightClass = index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      layout
      className="group relative"
    >
      <div className="relative rounded-2xl overflow-hidden bg-secondary/30 border border-border/30 hover:border-[#D4A574]/30 transition-all duration-300 hover:shadow-lg">
        {/* Image */}
        <div className={`relative ${heightClass} overflow-hidden`}>
          <Image
            src={mainImage}
            alt={product.nameAr}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* NEW badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: index * 0.05 }}
            className="absolute top-3 right-3"
          >
            <Badge className="bg-[#D4A574] text-white border-0 gap-1 shadow-md text-xs font-bold">
              <Sparkles className="h-3 w-3" />
              جديد
            </Badge>
          </motion.div>

          {/* Time ago badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="gap-1 text-[10px] bg-white/90 dark:bg-black/60 backdrop-blur-sm text-foreground border-0 shadow-sm">
              <Clock className="h-3 w-3" />
              {getTimeAgo(product.createdAt)}
            </Badge>
          </div>

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-red-500 text-white border-0 text-xs font-bold shadow-md">
                -{product.discount}%
              </Badge>
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-lg bg-white/90 dark:bg-black/60 backdrop-blur-sm border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  navigateToProduct(product.id)
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-lg bg-white/90 dark:bg-black/60 backdrop-blur-sm border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleWishlist(product.id)
                  toast.success(isWished ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة')
                }}
              >
                <Heart className={`h-4 w-4 ${isWished ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg bg-[#D4A574] hover:bg-[#C9956A] text-white border-0"
                onClick={(e) => {
                  e.stopPropagation()
                  addItem(product.id, 1)
                  setCartOpen(true)
                  toast.success('تمت الإضافة للسلة')
                }}
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Product info */}
        <div className="p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category?.nameAr || ''}</p>
          <h4 className="font-medium text-sm line-clamp-1 mb-2 group-hover:text-[#D4A574] transition-colors">
            {product.nameAr}
          </h4>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#D4A574]">{finalPrice.toFixed(0)} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{product.price.toFixed(0)} ج.م</span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-orange-500 mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              باقي {product.stock} فقط
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function RecentlyAddedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { getSetting } = useSiteSettings()

  const fetchProducts = useCallback(async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const res = await fetch(`/api/products?limit=12&sort=newest`)
      const data = await res.json()
      if (data.success) {
        // Filter to products from last 7 days
        const recent = (data.data as Product[]).filter(
          (p: Product) => new Date(p.createdAt) >= new Date(sevenDaysAgo)
        )
        // If no recent products, show the newest ones anyway
        setProducts(recent.length > 0 ? recent : (data.data as Product[]).slice(0, 8))
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4A574]/3 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B6F6F] mb-4 shadow-lg"
          >
            <Clock className="h-7 w-7 text-white" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{getSetting('recentlyAddedTitle', 'أضيف حديثاً')}</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            {getSetting('recentlyAddedSubtitle', 'آخر المنتجات التي أضفناها — كوني أول من يكتشفها')}
          </p>
          <div className="w-20 h-0.5 mx-auto mt-4 bg-gradient-to-l from-transparent via-[#D4A574] to-transparent" />
        </motion.div>

        {/* Masonry Grid */}
        {loading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <Skeleton className={`rounded-2xl ${i % 3 === 0 ? 'h-72' : i % 3 === 1 ? 'h-56' : 'h-64'}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            <AnimatePresence>
              {products.map((product, index) => (
                <div key={product.id} className="break-inside-avoid mb-4">
                  <MasonryProductCard product={product} index={index} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* View all button */}
        {products.length > 8 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10"
              onClick={() => useUIStore.getState().navigateToShop()}
            >
              عرض الكل
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
