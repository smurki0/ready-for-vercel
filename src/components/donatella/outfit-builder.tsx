'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shirt,
  Gem,
  ShoppingBag,
  Plus,
  X,
  ArrowLeft,
  Sparkles,
  Check,
  ChevronLeft,
  RotateCcw,
  Wand2,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { safeJsonParse } from '@/lib/utils'

interface OutfitProduct {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
  sizes: string | string[]
  colors: string | string[]
  categoryId: string
  category?: { nameAr: string; slug: string }
  stock: number
}

interface OutfitSlot {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  selectedProductId: string | null
}

const defaultSlots: OutfitSlot[] = [
  {
    id: 'main',
    label: 'القطعة الرئيسية',
    icon: <Shirt className="h-6 w-6" />,
    description: 'فستان، بلوزة، أو عباية',
    selectedProductId: null,
  },
  {
    id: 'accessory',
    label: 'الإكسسوار',
    icon: <Gem className="h-6 w-6" />,
    description: 'حقيبة، مجوهرات، أو حزام',
    selectedProductId: null,
  },
  {
    id: 'shoes',
    label: 'الحذاء/الحقيبة',
    icon: <ShoppingBag className="h-6 w-6" />,
    description: 'حذاء أو حقيبة يد',
    selectedProductId: null,
  },
]

export default function OutfitBuilder() {
  const setPage = useUIStore((s) => s.setPage)
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const addItem = useCartStore((s) => s.addItem)
  const user = useAuthStore((s) => s.user)
  const setAuthModalTab = useUIStore((s) => s.setAuthModalTab)
  const setCartOpen = useUIStore((s) => s.setCartOpen)

  const [slots, setSlots] = useState<OutfitSlot[]>(defaultSlots)
  const [products, setProducts] = useState<OutfitProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSlot, setActiveSlot] = useState<string | null>('main')
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=20')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data.products || data.data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const getProductImage = useCallback((product: OutfitProduct) => {
    const imgs = safeJsonParse<string[]>(product.images)
    return imgs[0] || '/products/dress-1.png'
  }, [])

  const getDiscountedPrice = useCallback((product: OutfitProduct) => {
    return product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
  }, [])

  const getSelectedProducts = useCallback(() => {
    return slots
      .map((slot) => products.find((p) => p.id === slot.selectedProductId))
      .filter(Boolean) as OutfitProduct[]
  }, [slots, products])

  const getTotalPrice = useCallback(() => {
    return getSelectedProducts().reduce((total, p) => total + getDiscountedPrice(p), 0)
  }, [getSelectedProducts, getDiscountedPrice])

  const getOriginalPrice = useCallback(() => {
    return getSelectedProducts().reduce((total, p) => total + p.price, 0)
  }, [getSelectedProducts])

  const getSavings = useCallback(() => {
    return getOriginalPrice() - getTotalPrice()
  }, [getOriginalPrice, getTotalPrice])

  const handleSelectProduct = useCallback((slotId: string, productId: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, selectedProductId: slot.selectedProductId === productId ? null : productId }
          : slot
      )
    )
  }, [])

  const handleClearSlot = useCallback((slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, selectedProductId: null } : slot
      )
    )
  }, [])

  const handleReset = useCallback(() => {
    setSlots(defaultSlots)
    setActiveSlot('main')
  }, [])

  const handleAddOutfitToCart = useCallback(async () => {
    if (!user) {
      setAuthModalTab('login')
      setPage('auth')
      toast.error('يرجى تسجيل الدخول أولاً')
      return
    }

    const selectedProducts = getSelectedProducts()
    if (selectedProducts.length === 0) {
      toast.error('يرجى اختيار قطعة واحدة على الأقل')
      return
    }

    setAddingToCart(true)
    try {
      for (const product of selectedProducts) {
        await addItem(product.id, 1)
      }
      toast.success(`تمت إضافة ${selectedProducts.length} قطع إلى السلة`)
      setCartOpen(true)
    } catch {
      toast.error('حدث خطأ أثناء إضافة المنتجات')
    } finally {
      setAddingToCart(false)
    }
  }, [user, getSelectedProducts, addItem, setAuthModalTab, setPage, setCartOpen])

  // Filter products for each slot based on category mapping
  const getProductsForSlot = useCallback((slotId: string) => {
    if (slotId === 'main') {
      return products.slice(0, 8)
    } else if (slotId === 'accessory') {
      return products.slice(4, 12)
    } else {
      return products.slice(8, 16)
    }
  }, [products])

  const selectedCount = slots.filter((s) => s.selectedProductId).length

  return (
    <div className="pt-6 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20 mb-4">
            <Wand2 className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-medium text-[#D4A574]">صمّمي إطلالتك</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">مصمم الإطلالات</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            اختاري القطع المناسبة لكل فئة وصمّمي إطلالتك المثالية، ثم أضيفيها جميعاً لسلتك بنقرة واحدة
          </p>
          <div className="h-[1px] w-32 mx-auto mt-6 bg-gradient-to-l from-transparent via-[#D4A574]/50 to-transparent" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Slots */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Slot Cards */}
            {slots.map((slot, idx) => {
              const selectedProduct = slot.selectedProductId
                ? products.find((p) => p.id === slot.selectedProductId)
                : null
              const isActive = activeSlot === slot.id

              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'border-[#D4A574]/40 shadow-lg shadow-[#D4A574]/5'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  {/* Slot Header */}
                  <button
                    className="w-full flex items-center gap-3 p-4 text-right"
                    onClick={() => setActiveSlot(isActive ? null : slot.id)}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#D4A574]/15 text-[#D4A574]' : 'bg-secondary/50 text-muted-foreground'
                    }`}>
                      {slot.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm ${isActive ? 'text-[#D4A574]' : 'text-foreground'}`}>
                        {slot.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">{slot.description}</p>
                    </div>
                    {selectedProduct && (
                      <Badge className="bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20">
                        <Check className="h-3 w-3 ml-1" />
                        محدد
                      </Badge>
                    )}
                    <ChevronLeft className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? '-rotate-90' : ''}`} />
                  </button>

                  {/* Selected Product Preview */}
                  {selectedProduct && !isActive && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#D4A574]/5 border border-[#D4A574]/15">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={getProductImage(selectedProduct)}
                            alt={selectedProduct.nameAr}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{selectedProduct.nameAr}</p>
                          <p className="text-xs text-[#D4A574] font-bold">
                            {getDiscountedPrice(selectedProduct).toFixed(0)} ج.م
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); handleClearSlot(slot.id) }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Product Grid for Active Slot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Separator className="bg-border/50" />
                        <div className="p-4">
                          {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-xl" />
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {getProductsForSlot(slot.id).map((product, i) => {
                                const isSelected = slot.selectedProductId === product.id
                                return (
                                  <motion.button
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleSelectProduct(slot.id, product.id)}
                                    className={`relative rounded-xl overflow-hidden border-2 transition-all text-right ${
                                      isSelected
                                        ? 'border-[#D4A574] shadow-md shadow-[#D4A574]/15'
                                        : 'border-transparent hover:border-border'
                                    }`}
                                  >
                                    <div className="relative aspect-square bg-secondary/30">
                                      <Image
                                        src={getProductImage(product)}
                                        alt={product.nameAr}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                      />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-[#D4A574]/20 flex items-center justify-center">
                                          <div className="h-8 w-8 rounded-full bg-[#D4A574] flex items-center justify-center">
                                            <Check className="h-4 w-4 text-white" />
                                          </div>
                                        </div>
                                      )}
                                      {product.discount > 0 && (
                                        <Badge className="absolute top-2 right-2 bg-destructive text-white text-[10px]">
                                          -{product.discount}%
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="p-2">
                                      <p className="text-xs font-medium truncate">{product.nameAr}</p>
                                      <p className="text-xs text-[#D4A574] font-bold mt-0.5">
                                        {getDiscountedPrice(product).toFixed(0)} ج.م
                                      </p>
                                    </div>
                                  </motion.button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {/* Reset Button */}
            {selectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <Button
                  variant="ghost"
                  className="gap-2 text-muted-foreground hover:text-destructive"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                  إعادة تعيين الإطلالة
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Outfit Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Outfit Preview Card */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 sticky top-24">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D4A574]" />
                <h3 className="font-bold text-foreground">ملخص الإطلالة</h3>
              </div>

              {selectedCount === 0 ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                    <Shirt className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">لم تختاري أي قطع بعد</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">اختاري من القائمة لبدء تصميم إطلالتك</p>
                </div>
              ) : (
                <>
                  {/* Selected Products */}
                  <div className="space-y-3">
                    {slots.map((slot) => {
                      const product = slot.selectedProductId
                        ? products.find((p) => p.id === slot.selectedProductId)
                        : null
                      return (
                        <div key={slot.id}>
                          {product ? (
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/30">
                              <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={getProductImage(product)}
                                  alt={product.nameAr}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">{slot.label}</p>
                                <p className="text-sm font-medium truncate">{product.nameAr}</p>
                                <p className="text-xs text-[#D4A574] font-bold">
                                  {getDiscountedPrice(product).toFixed(0)} ج.م
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                                onClick={() => handleClearSlot(slot.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-border/50">
                              <div className="h-14 w-14 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0 text-muted-foreground/30">
                                <Plus className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{slot.label}</p>
                                <p className="text-xs text-muted-foreground/60">لم يتم الاختيار</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <Separator className="bg-border/50" />

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">عدد القطع</span>
                      <span className="font-medium">{selectedCount}</span>
                    </div>
                    {getSavings() > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          التوفير
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          -{getSavings().toFixed(0)} ج.م
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">الإجمالي</span>
                      <span className="text-xl font-bold text-[#D4A574]">{getTotalPrice().toFixed(0)} ج.م</span>
                    </div>
                    {getSavings() > 0 && (
                      <p className="text-[10px] text-muted-foreground/60 text-center">
                        وفّري {getSavings().toFixed(0)} ج.م عند شراء الإطلالة كاملة
                      </p>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    className="w-full rounded-xl gap-2 h-11 text-base bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] text-white border-0 hover:opacity-90 transition-opacity"
                    onClick={handleAddOutfitToCart}
                    disabled={addingToCart || selectedCount === 0}
                  >
                    {addingToCart ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        أضيفي الإطلالة للسلة
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Back Button */}
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 border-[#D4A574]/30 hover:bg-[#D4A574]/5 hover:border-[#D4A574]/50 text-[#D4A574]"
              onClick={() => setPage('home')}
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للرئيسية
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
