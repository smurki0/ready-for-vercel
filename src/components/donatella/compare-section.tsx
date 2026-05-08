'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GitCompareArrows,
  Trash2,
  ShoppingCart,
  Check,
  Package,
  Tag,
  Palette,
  Ruler,
  BarChart3,
  FileText,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCompareStore } from '@/stores/compare-store'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { safeJsonParse } from '@/lib/utils'

interface Product {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string | null
  price: number
  discount: number
  images: string | string[]
  sizes: string | string[]
  colors: string | string[]
  stock: number
  categoryId: string
  category: { nameAr: string; nameEn: string; slug: string } | null
}

function CompareRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 items-start py-3 border-b border-border/30 dark:border-[#3A3532]/30 last:border-b-0">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pr-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(var(--compare-cols), minmax(0, 1fr))` }}>
        {children}
      </div>
    </div>
  )
}

function ProductCompareCard({
  product,
  onRemove,
}: {
  product: Product
  onRemove: () => void
}) {
  const images: string[] = safeJsonParse<string[]>(product.images)
  const sizes: string[] = safeJsonParse<string[]>(product.sizes)
  const colors: string[] = safeJsonParse<string[]>(product.colors)
  const discountedPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const setPage = useUIStore((s) => s.setPage)

  const handleAddToCart = async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }
    try {
      await addItem(product.id, 1)
      toast.success('تمت الإضافة إلى السلة')
    } catch {
      toast.error('فشل إضافة المنتج للسلة')
    }
  }

  return (
    <div className="flex flex-col items-center text-center gap-3">
      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-secondary/30 dark:bg-[#2A2522]/50">
        <Image
          src={images[0] || '/products/dress-1.png'}
          alt={product.nameAr}
          fill
          unoptimized
          className="object-cover"
        />
        {product.discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-destructive text-white text-xs font-bold shadow-md">
            -{product.discount}%
          </Badge>
        )}
      </div>

      {/* Product Name */}
      <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">
        {product.nameAr}
      </h3>

      {/* Price */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="font-bold text-primary text-lg">
          {discountedPrice.toFixed(0)} ج.م
        </span>
        {product.discount > 0 && (
          <span className="text-muted-foreground line-through text-xs">
            {product.price.toFixed(0)} ج.م
          </span>
        )}
      </div>

      {/* Category */}
      {product.category && (
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-[#D4A574]" />
          <span className="text-xs text-muted-foreground">{product.category.nameAr}</span>
        </div>
      )}

      {/* Stock Status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            product.stock === 0
              ? 'bg-destructive'
              : product.stock <= 5
                ? 'bg-orange-500'
                : 'bg-emerald-500'
          }`}
        />
        <span
          className={`text-xs font-medium ${
            product.stock === 0
              ? 'text-destructive'
              : product.stock <= 5
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {product.stock === 0 ? 'نفذ المخزون' : product.stock <= 5 ? `${product.stock} متبقي` : 'متوفر'}
        </span>
      </div>

      {/* Sizes */}
      <div className="w-full">
        <p className="text-[10px] text-muted-foreground mb-1">المقاسات</p>
        <div className="flex flex-wrap gap-1 justify-center">
          {sizes.length > 0 ? (
            sizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center justify-center h-7 min-w-[32px] px-2 rounded-md border border-border/50 dark:border-[#3A3532]/50 text-[10px] font-medium text-muted-foreground dark:text-muted-foreground bg-secondary/20 dark:bg-[#2A2522]/40"
              >
                {size}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Colors */}
      <div className="w-full">
        <p className="text-[10px] text-muted-foreground mb-1">الألوان</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {colors.length > 0 ? (
            colors.map((color) => (
              <div
                key={color}
                className="h-6 w-6 rounded-full border-2 border-border/30 dark:border-[#3A3532]/40 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))
          ) : (
            <span className="text-[10px] text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="w-full">
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
          {product.descriptionAr || 'لا يوجد وصف'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full mt-auto">
        <Button
          size="sm"
          className="flex-1 rounded-xl gap-1.5 text-xs h-8"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          أضيفي للسلة
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
          إزالة
        </Button>
      </div>
    </div>
  )
}

// Floating Compare Bar
export function CompareFloatingBar() {
  const { compareProductIds, clearCompare, removeFromCompare } = useCompareStore()
  const setPage = useUIStore((s) => s.setPage)

  if (compareProductIds.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-lg mx-auto sm:mx-0"
      >
        <Card className="rounded-2xl border-primary/20 dark:border-[#D4A574]/20 shadow-2xl shadow-primary/10 dark:shadow-[#D4A574]/10 bg-card/95 dark:bg-[#231F1C]/95 backdrop-blur-md overflow-hidden dark-glow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GitCompareArrows className="h-5 w-5 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  مقارنة المنتجات
                </p>
                <p className="text-xs text-muted-foreground">
                  {compareProductIds.length} من 3 منتجات
                </p>
              </div>

              {/* Product Thumbnails */}
              <div className="flex gap-1.5">
                {compareProductIds.map((id) => (
                  <motion.div
                    key={id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative h-10 w-10 rounded-lg bg-secondary/30 border border-border/30 flex items-center justify-center"
                  >
                    <span className="text-[8px] font-bold text-muted-foreground truncate px-0.5">
                      {id.slice(-3)}
                    </span>
                    <button
                      onClick={() => removeFromCompare(id)}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm hover:bg-destructive/80 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive"
                  onClick={clearCompare}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  إزالة الكل
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-xl gap-1.5 text-xs font-semibold"
                  onClick={() => setPage('compare')}
                  disabled={compareProductIds.length < 2}
                >
                  <GitCompareArrows className="h-3.5 w-3.5" />
                  مقارنة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default function CompareSection() {
  const { compareProductIds, removeFromCompare, clearCompare } = useCompareStore()
  const navigateToShop = useUIStore((s) => s.navigateToShop)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      if (compareProductIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const results = await Promise.all(
          compareProductIds.map(async (id) => {
            const res = await fetch(`/api/products/${id}`)
            const data = await res.json()
            return data.success ? data.data : null
          })
        )
        setProducts(results.filter(Boolean) as Product[])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [compareProductIds])

  const colCount = Math.max(products.length, 1)

  if (compareProductIds.length === 0) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative mb-6 mx-auto w-fit">
            <div className="h-32 w-32 rounded-full bg-secondary/50 flex items-center justify-center">
              <GitCompareArrows className="h-14 w-14 text-muted-foreground/30" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">لا توجد منتجات للمقارنة</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            أضيفي منتجين أو أكثر للمقارنة بين مواصفاتهم وأسعارهم
          </p>
          <Button
            onClick={() => navigateToShop()}
            className="gap-2 rounded-xl"
          >
            <ShoppingCart className="h-4 w-4" />
            تصفحي المتجر
          </Button>
        </motion.div>
      </div>
    )
  }

  if (compareProductIds.length < 2) {
    return (
      <div className="pt-6 pb-16 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative mb-6 mx-auto w-fit">
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
              <GitCompareArrows className="h-14 w-14 text-primary/50" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">أضيفي منتجاً آخر للمقارنة</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            تحتاجين منتجين على الأقل لإجراء المقارنة
          </p>
          <Button
            onClick={() => navigateToShop()}
            className="gap-2 rounded-xl"
          >
            <ShoppingCart className="h-4 w-4" />
            تصفحي المتجر
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-6 pb-24 min-h-screen relative">
      {/* Dark mode dot pattern */}
      <div className="absolute inset-0 -z-10 hidden dark:block dark-dot-pattern opacity-20" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitCompareArrows className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">مقارنة المنتجات</h1>
              <p className="text-muted-foreground text-sm mt-1">
                مقارنة {products.length} منتجات جنباً إلى جنب
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={clearCompare}
            >
              <Trash2 className="h-4 w-4" />
              إزالة الكل
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => navigateToShop()}
            >
              <ArrowLeft className="h-4 w-4" />
              متابعة التسوق
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {compareProductIds.map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded-lg" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl border-border/50 dark:border-[#3A3532]/60 overflow-hidden dark-glow-card">
              <CardContent className="p-4 sm:p-6">
                {/* Product Cards Header Row */}
                <div
                  className="grid gap-4 mb-6"
                  style={{
                    gridTemplateColumns: `140px repeat(${colCount}, minmax(0, 1fr))`,
                  }}
                >
                  {/* Empty corner */}
                  <div />

                  {/* Product Cards */}
                  {products.map((product) => (
                    <ProductCompareCard
                      key={product.id}
                      product={product}
                      onRemove={() => removeFromCompare(product.id)}
                    />
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Comparison Table */}
                <div
                  className="space-y-0"
                  style={{ '--compare-cols': colCount } as React.CSSProperties}
                >
                  {/* Price Row */}
                  <CompareRow
                    label="السعر"
                    icon={<Tag className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => {
                      const dp = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price
                      return (
                        <div key={p.id} className="text-center">
                          <span className="font-bold text-primary dark:text-[#D4A0A0] text-lg">
                            {dp.toFixed(0)} ج.م
                          </span>
                          {p.discount > 0 && (
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <span className="text-muted-foreground line-through text-xs">
                                {p.price.toFixed(0)} ج.م
                              </span>
                              <Badge className="bg-destructive/10 text-destructive text-[10px] font-bold">
                                وفّري {((p.price - dp)).toFixed(0)} ج.م
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CompareRow>

                  {/* Category Row */}
                  <CompareRow
                    label="التصنيف"
                    icon={<Package className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="text-center">
                        <span className="text-sm text-foreground">
                          {p.category?.nameAr || '—'}
                        </span>
                      </div>
                    ))}
                  </CompareRow>

                  {/* Stock Row */}
                  <CompareRow
                    label="حالة المخزون"
                    icon={<BarChart3 className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className={`gap-1 text-xs ${
                            p.stock === 0
                              ? 'bg-destructive/10 text-destructive'
                              : p.stock <= 5
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.stock === 0
                                ? 'bg-destructive'
                                : p.stock <= 5
                                  ? 'bg-orange-500'
                                  : 'bg-emerald-500'
                            }`}
                          />
                          {p.stock === 0 ? 'نفذ المخزون' : p.stock <= 5 ? `${p.stock} متبقي` : 'متوفر'}
                        </Badge>
                      </div>
                    ))}
                  </CompareRow>

                  {/* Sizes Row */}
                  <CompareRow
                    label="المقاسات المتاحة"
                    icon={<Ruler className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => {
                      const sizes: string[] = safeJsonParse<string[]>(p.sizes)
                      return (
                        <div key={p.id} className="flex flex-wrap gap-1 justify-center">
                          {sizes.length > 0 ? (
                            sizes.map((size) => (
                              <span
                                key={size}
                                className="inline-flex items-center justify-center h-7 min-w-[36px] px-2 rounded-lg border border-border/50 dark:border-[#3A3532]/50 text-xs font-medium text-muted-foreground dark:text-muted-foreground bg-secondary/20 dark:bg-[#2A2522]/40"
                              >
                                {size}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      )
                    })}
                  </CompareRow>

                  {/* Colors Row */}
                  <CompareRow
                    label="الألوان المتاحة"
                    icon={<Palette className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => {
                      const colors: string[] = safeJsonParse<string[]>(p.colors)
                      return (
                        <div key={p.id} className="flex flex-wrap gap-2 justify-center">
                          {colors.length > 0 ? (
                            colors.map((color) => (
                              <div
                                key={color}
                                className="h-7 w-7 rounded-full border-2 border-border/30 shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      )
                    })}
                  </CompareRow>

                  {/* Description Row */}
                  <CompareRow
                    label="الوصف"
                    icon={<FileText className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {p.descriptionAr || 'لا يوجد وصف متاح'}
                        </p>
                      </div>
                    ))}
                  </CompareRow>

                  {/* Discount Row */}
                  <CompareRow
                    label="الخصم"
                    icon={<Tag className="h-4 w-4 text-[#D4A574]" />}
                  >
                    {products.map((p) => (
                      <div key={p.id} className="text-center">
                        {p.discount > 0 ? (
                          <Badge className="bg-destructive text-white font-bold text-sm">
                            {p.discount}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">بدون خصم</span>
                        )}
                      </div>
                    ))}
                  </CompareRow>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
