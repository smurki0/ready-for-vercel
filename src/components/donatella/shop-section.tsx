'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal, X, ChevronLeft, ChevronRight, PackageOpen,
  LayoutGrid, List, Home, GitCompareArrows, Trash2,
  Star, Truck, TrendingUp, Sparkles, Tag, Crown, Flame, Filter,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ProductCard from './product-card'
import { useUIStore } from '@/stores/ui-store'
import { useCompareStore } from '@/stores/compare-store'
import { safeJsonParse } from '@/lib/utils'
import Image from 'next/image'

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
  createdAt?: string
}

interface Category {
  id: string
  nameAr: string
  nameEn: string
  slug: string
}

const sortOptions = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'discount', label: 'أعلى خصم' },
]

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const availableColors = [
  { name: 'أسود', value: 'أسود', hex: '#1a1a1a' },
  { name: 'أبيض', value: 'أبيض', hex: '#f5f5f5' },
  { name: 'أحمر', value: 'أحمر', hex: '#dc2626' },
  { name: 'أزرق', value: 'أزرق', hex: '#2563eb' },
  { name: 'أخضر', value: 'أخضر', hex: '#16a34a' },
  { name: 'بيج', value: 'بيج', hex: '#d4a574' },
  { name: 'وردي', value: 'وردي', hex: '#ec4899' },
  { name: 'ذهبي', value: 'ذهبي', hex: '#d4a574' },
]

const quickFilters = [
  { id: 'bestseller', label: 'الأكثر مبيعاً', icon: TrendingUp },
  { id: 'new', label: 'جديد', icon: Sparkles },
  { id: 'discount', label: 'بخصم', icon: Tag },
  { id: 'featured', label: 'مميز', icon: Crown },
]

// Star rating display component
function StarRating({ rating, count }: { rating: number; count: number }) {
  if (count === 0) {
    return (
      <span className="text-[10px] text-muted-foreground">لا توجد تقييمات</span>
    )
  }
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.floor(rating)
              ? 'text-[#D4A574] fill-[#D4A574]'
              : star <= rating
                ? 'text-[#D4A574] fill-[#D4A574]/50'
                : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground mr-1">({rating.toFixed(1)}) · {count} تقييم</span>
    </div>
  )
}

// List view product card
function ProductListCard({ product }: { product: Product }) {
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const images: string[] = safeJsonParse<string[]>(product.images)
  const mainImage = images[0] || '/products/dress-1.png'
  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
  const avgRating = product.avgRating ?? 0
  const reviewCount = product.reviewCount ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="group flex gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-[#D4A574]/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigateToProduct(product.id)}
    >
      {/* Image */}
      <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden bg-secondary/30 shrink-0">
        <Image
          src={mainImage}
          alt={product.nameAr}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-destructive text-white text-[10px] shadow-sm">
            -{product.discount}%
          </Badge>
        )}
      </div>
      {/* Details */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          {product.category && (
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {product.category.nameAr}
            </p>
          )}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-[#D4A574] transition-colors duration-200 mb-2">
            {product.nameAr}
          </h3>
          <StarRating rating={avgRating} count={reviewCount} />
          {product.descriptionAr && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {product.descriptionAr}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-base">
              {discountedPrice.toFixed(0)} ج.م
            </span>
            {product.discount > 0 && (
              <span className="text-muted-foreground line-through text-xs">
                {product.price.toFixed(0)} ج.م
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {discountedPrice >= 300 && (
              <Badge variant="secondary" className="text-[10px] gap-1 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 border-0">
                <Truck className="h-3 w-3" />
                شحن مجاني
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Pagination helper
function generatePagination(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export default function ShopSection() {
  const {
    searchQuery,
    selectedCategory,
    sortBy,
    priceRange,
    selectedSizes,
    selectedColors,
    viewMode,
    setSelectedCategory,
    setSortBy,
    setPriceRange,
    setSearchQuery,
    setSelectedSizes,
    setSelectedColors,
    setViewMode,
    setPage: setGlobalPage,
  } = useUIStore()

  const compareProductIds = useCompareStore((s) => s.compareProductIds)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch {
        // silently fail
      }
    }
    fetchCategories()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      if (sortBy) params.set('sort', sortBy)
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
      if (priceRange[1] < 5000) params.set('maxPrice', priceRange[1].toString())
      if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','))
      if (selectedColors.length > 0) params.set('colors', selectedColors.join(','))
      if (activeQuickFilter === 'featured') params.set('featured', 'true')
      if (activeQuickFilter === 'discount') {
        // sort by discount is already handled
      }

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        const result = data.data
        let prods: Product[] = result.products || result

        // Apply quick filters client-side if needed
        if (activeQuickFilter === 'new') {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          prods = prods.filter((p) => p.createdAt && new Date(p.createdAt) >= sevenDaysAgo)
        }
        if (activeQuickFilter === 'discount') {
          prods = prods.filter((p) => p.discount > 0)
        }

        setProducts(prods)
        setTotalPages(result.pagination?.totalPages || 1)
        setTotalProducts(result.pagination?.total || (result.products || result).length)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, selectedCategory, sortBy, priceRange, selectedSizes, selectedColors, activeQuickFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, sortBy, priceRange, selectedSizes, selectedColors])

  const startItem = (page - 1) * 12 + 1
  const endItem = Math.min(page * 12, totalProducts)

  // Active filters count for mobile badge
  const activeFilterCount = [
    selectedCategory,
    searchQuery,
    priceRange[0] > 0 || priceRange[1] < 5000,
    selectedSizes.length > 0,
    selectedColors.length > 0,
    activeQuickFilter,
  ].filter(Boolean).length

  const resetAllFilters = () => {
    setSelectedCategory(null)
    setLocalSearch('')
    setSearchQuery('')
    setPriceRange([0, 5000])
    setSortBy('newest')
    setSelectedSizes([])
    setSelectedColors([])
    setActiveQuickFilter(null)
  }

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size]
    setSelectedSizes(newSizes)
  }

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color]
    setSelectedColors(newColors)
  }

  // Find selected category name
  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.nameAr

  // Render filter sidebar content (shared between desktop and mobile)
  const renderFilterContent = () => (
    <div className="space-y-1">
      {/* Quick Filters */}
      <div className="pb-4 mb-4 border-b border-border/50">
        <h3 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#D4A574]" />
          فلاتر سريعة
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickFilters.map((qf) => (
            <motion.button
              key={qf.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveQuickFilter(activeQuickFilter === qf.id ? null : qf.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                activeQuickFilter === qf.id
                  ? 'bg-[#D4A574]/10 border-[#D4A574]/30 text-[#D4A574]'
                  : 'bg-card border-border/50 text-muted-foreground hover:border-[#D4A574]/20 hover:text-foreground'
              }`}
            >
              <qf.icon className="h-3.5 w-3.5" />
              {qf.label}
            </motion.button>
          ))}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'price', 'sizes', 'colors']} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories" className="border-b border-border/50">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A574]" />
              التصنيفات
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pb-2">
              <motion.button
                whileHover={{ x: -4 }}
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-between ${
                  !selectedCategory
                    ? 'bg-[#D4A574]/10 text-[#D4A574] font-medium border border-[#D4A574]/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                }`}
              >
                <span>الكل</span>
                <Badge variant="secondary" className="text-[10px] h-5">
                  {totalProducts}
                </Badge>
              </motion.button>
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ x: -4 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-[#D4A574]/10 text-[#D4A574] font-medium border border-[#D4A574]/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                  }`}
                >
                  <span>{cat.nameAr}</span>
                </motion.button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-b border-border/50">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C4A4A4]" />
              نطاق السعر
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-2 space-y-3 pb-2">
              <Slider
                value={priceRange}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="bg-secondary/80 px-2 py-1 rounded-md">{priceRange[0]} ج.م</span>
                <span className="bg-secondary/80 px-2 py-1 rounded-md">{priceRange[1]} ج.م</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sizes */}
        <AccordionItem value="sizes" className="border-b border-border/50">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8B6F6F]" />
              المقاسات
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pb-2">
              {availableSizes.map((size) => (
                <motion.button
                  key={size}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSize(size)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    selectedSizes.includes(size)
                      ? 'bg-[#D4A574] text-white border-[#D4A574] shadow-sm shadow-[#D4A574]/20'
                      : 'bg-card text-muted-foreground border-border/50 hover:border-[#D4A574]/30 hover:text-foreground'
                  }`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Colors */}
        <AccordionItem value="colors" className="border-b border-border/50">
          <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A574]" />
              الألوان
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pb-2">
              {availableColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleColor(color.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all duration-200 border ${
                    selectedColors.includes(color.value)
                      ? 'bg-[#D4A574]/10 border-[#D4A574]/30 text-foreground font-medium'
                      : 'bg-card border-border/50 text-muted-foreground hover:border-[#D4A574]/20'
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full shrink-0 border-2 border-white/50 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="truncate">{color.name}</span>
                  {selectedColors.includes(color.value) && (
                    <X className="h-3 w-3 mr-auto text-[#D4A574]" />
                  )}
                </motion.button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Reset All Filters */}
      {(selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000 || activeQuickFilter) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            onClick={resetAllFilters}
          >
            <Trash2 className="h-4 w-4" />
            إزالة جميع الفلاتر
          </Button>
        </motion.div>
      )}
    </div>
  )

  return (
    <section className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative overflow-hidden rounded-3xl"
        >
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#D4A574]/10 via-[#C4A4A4]/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#D4A574]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-[#C4A4A4]/5 blur-2xl pointer-events-none" />

          <div className="relative px-6 py-6 sm:px-8 sm:py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4" dir="rtl">
              <button
                onClick={() => setGlobalPage('home')}
                className="hover:text-[#D4A574] transition-colors flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                الرئيسية
              </button>
              <ChevronLeft className="h-3 w-3 rotate-180" />
              <span className="text-foreground font-medium">المتجر</span>
              {selectedCategoryName && (
                <>
                  <ChevronLeft className="h-3 w-3 rotate-180" />
                  <span className="text-[#D4A574] font-medium">{selectedCategoryName}</span>
                </>
              )}
            </nav>

            {/* Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  المتجر
                </h1>
                <p className="text-muted-foreground text-sm">
                  تصفحي مجموعتنا المميزة من الأزياء النسائية الفاخرة
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Product Count Badge */}
                <motion.div
                  key={totalProducts}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/20"
                >
                  <PackageOpen className="h-4 w-4 text-[#D4A574]" />
                  <span className="text-sm font-semibold text-[#D4A574]">
                    {totalProducts}
                  </span>
                  <span className="text-xs text-muted-foreground">منتج</span>
                </motion.div>

                {/* Compare Link */}
                {compareProductIds.length > 0 && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => setGlobalPage('compare')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    <span className="text-sm font-medium">مقارنة</span>
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {compareProductIds.length}
                    </Badge>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="ابحثي عن منتج..."
                className="w-full h-10 rounded-xl border border-input bg-background px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574]/30 focus:border-[#D4A574]/50 transition-all"
              />
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => {
                  setLocalSearch('')
                  setSearchQuery('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl text-sm">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-border rounded-xl overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className={`h-10 w-10 rounded-none ${viewMode === 'grid' ? 'bg-[#D4A574] hover:bg-[#b8885a]' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className={`h-10 w-10 rounded-none ${viewMode === 'list' ? 'bg-[#D4A574] hover:bg-[#b8885a]' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 sm:hidden rounded-xl relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-[#D4A574] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {(selectedCategory || searchQuery || priceRange[0] > 0 || priceRange[1] < 5000 || selectedSizes.length > 0 || selectedColors.length > 0 || activeQuickFilter) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              <span className="text-xs text-muted-foreground ml-1">الفلاتر النشطة:</span>

              {activeQuickFilter && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => setActiveQuickFilter(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4A574]/10 text-[#D4A574] border border-[#D4A574]/20 hover:bg-[#D4A574] hover:text-white transition-all duration-200"
                >
                  {quickFilters.find((qf) => qf.id === activeQuickFilter)?.label}
                  <X className="h-3 w-3" />
                </motion.button>
              )}

              {selectedCategory && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  {selectedCategoryName || 'تصنيف'}
                  <X className="h-3 w-3" />
                </motion.button>
              )}

              {searchQuery && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => {
                    setLocalSearch('')
                    setSearchQuery('')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  بحث: {searchQuery}
                  <X className="h-3 w-3" />
                </motion.button>
              )}

              {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => setPriceRange([0, 5000])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  {priceRange[0]} - {priceRange[1]} ج.م
                  <X className="h-3 w-3" />
                </motion.button>
              )}

              {selectedSizes.map((size) => (
                <motion.button
                  key={size}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => toggleSize(size)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#8B6F6F]/10 text-[#8B6F6F] border border-[#8B6F6F]/20 hover:bg-[#8B6F6F] hover:text-white transition-all duration-200"
                >
                  مقاس: {size}
                  <X className="h-3 w-3" />
                </motion.button>
              ))}

              {selectedColors.map((color) => {
                const colorData = availableColors.find((c) => c.value === color)
                return (
                  <motion.button
                    key={color}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => toggleColor(color)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/50"
                      style={{ backgroundColor: colorData?.hex || '#888' }}
                    />
                    {colorData?.name || color}
                    <X className="h-3 w-3" />
                  </motion.button>
                )
              })}

              <button
                onClick={resetAllFilters}
                className="text-xs text-destructive hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                إزالة الكل
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Count */}
        {!loading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mb-4"
          >
            عرض {startItem}-{endItem} من {totalProducts} منتج
          </motion.div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden sm:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#D4A574]" />
                    الفلاتر
                  </h3>
                  {(selectedCategory || selectedSizes.length > 0 || selectedColors.length > 0) && (
                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-[#D4A574] hover:underline"
                    >
                      إعادة تعيين
                    </button>
                  )}
                </div>
                {renderFilterContent()}
              </div>
            </div>
          </aside>

          {/* Mobile Filters Sheet */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/40 sm:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 z-50 w-80 h-full bg-background border-l border-border shadow-xl sm:hidden flex flex-col"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-[#D4A574]" />
                      الفلاتر
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      {renderFilterContent()}
                    </div>
                  </ScrollArea>
                  {/* Apply Filters Button */}
                  <div className="p-4 border-t border-border">
                    <Button
                      className="w-full bg-[#D4A574] hover:bg-[#b8885a] text-white gap-2"
                      onClick={() => setShowFilters(false)}
                    >
                      تطبيق الفلاتر
                      {activeFilterCount > 0 && (
                        <Badge className="bg-white/20 text-white h-5 px-2 text-[10px]">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Area */}
          <div className="flex-1">
            {loading ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="aspect-[3/4] rounded-2xl mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2 rounded-lg" />
                      <Skeleton className="h-5 w-1/2 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4">
                      <Skeleton className="w-28 h-36 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-1/3 rounded-lg" />
                        <Skeleton className="h-5 w-2/3 rounded-lg" />
                        <Skeleton className="h-3 w-full rounded-lg" />
                        <Skeleton className="h-6 w-1/4 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative mb-6">
                  <div className="h-32 w-32 rounded-full bg-secondary/50 flex items-center justify-center">
                    <PackageOpen className="h-14 w-14 text-muted-foreground/30" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <X className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                  لم يتم العثور على منتجات تطابق بحثك. جربي البحث بكلمات مختلفة أو إزالة بعض الفلاتر
                </p>
                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  إعادة تعيين الفلاتر
                </Button>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  {viewMode === 'grid' ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6"
                    >
                      {products.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {products.map((product, i) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                        >
                          <ProductListCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10"
                  >
                    <div className="flex flex-col items-center gap-4">
                      {/* Page info */}
                      <p className="text-sm text-muted-foreground">
                        الصفحة <span className="font-semibold text-foreground">{page}</span> من <span className="font-semibold text-foreground">{totalPages}</span>
                      </p>

                      {/* Pagination buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* First page */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-xs"
                          disabled={page <= 1}
                          onClick={() => setPage(1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <ChevronRight className="h-3 w-3 -mr-2" />
                        </Button>

                        {/* Previous page */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Page numbers with ellipsis */}
                        {generatePagination(page, totalPages).map((p, idx) =>
                          p === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          ) : (
                            <motion.div key={p} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant={page === p ? 'default' : 'outline'}
                                size="icon"
                                className={`h-9 w-9 rounded-lg ${
                                  page === p ? 'bg-[#D4A574] hover:bg-[#b8885a] text-white' : ''
                                }`}
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </Button>
                            </motion.div>
                          )
                        )}

                        {/* Next page */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          disabled={page >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Last page */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-xs"
                          disabled={page >= totalPages}
                          onClick={() => setPage(totalPages)}
                        >
                          <ChevronLeft className="h-3 w-3" />
                          <ChevronLeft className="h-4 w-4 -mr-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
