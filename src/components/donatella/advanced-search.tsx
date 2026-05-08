'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ShoppingBag,
  Shirt,
  Gem,
  Sparkles,
  ArrowLeft,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/stores/ui-store'
import { safeJsonParse } from '@/lib/utils'

interface SearchProduct {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
  category?: { nameAr: string }
}

const popularSearches = [
  { label: 'فساتين سهرة', icon: Sparkles },
  { label: 'إكسسوارات ذهبية', icon: Gem },
  { label: 'ملابس يومية', icon: Shirt },
  { label: 'عبايات', icon: ShoppingBag },
]

const categoryQuickLinks = [
  { id: 'dresses', label: 'فساتين', icon: Sparkles, color: '#D4A574' },
  { id: 'accessories', label: 'إكسسوارات', icon: Gem, color: '#C4A4A4' },
  { id: 'everyday', label: 'يومي', icon: Shirt, color: '#8B6F6F' },
  { id: 'abayas', label: 'عبايات', icon: ShoppingBag, color: '#b8885a' },
]

const RECENT_SEARCHES_KEY = 'donatella-recent-searches'
const MAX_RECENT_SEARCHES = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addRecentSearch(query: string) {
  try {
    const current = getRecentSearches()
    const filtered = current.filter((s) => s !== query)
    filtered.unshift(query)
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed))
  } catch {
    // silently fail
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // silently fail
  }
}

export default function AdvancedSearch() {
  const advancedSearchOpen = useUIStore((s) => s.advancedSearchOpen)
  const setAdvancedSearchOpen = useUIStore((s) => s.setAdvancedSearchOpen)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const setPage = useUIStore((s) => s.setPage)
  const navigateToProduct = useUIStore((s) => s.navigateToProduct)
  const navigateToShop = useUIStore((s) => s.navigateToShop)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches on open
  useEffect(() => {
    if (advancedSearchOpen) {
      setRecentSearches(getRecentSearches())
      setQuery('')
      setResults([])
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [advancedSearchOpen])

  // Fetch search results
  const fetchResults = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=8`)
        const data = await res.json()
        if (data.success) {
          setResults(data.data.products || data.data)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    fetchResults(value)
  }, [fetchResults])

  const handleSearch = useCallback((searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) return
    addRecentSearch(q.trim())
    setRecentSearches(getRecentSearches())
    setSearchQuery(q)
    setAdvancedSearchOpen(false)
    setPage('shop')
  }, [query, setSearchQuery, setAdvancedSearchOpen, setPage])

  const handleProductClick = useCallback((product: SearchProduct) => {
    addRecentSearch(query)
    setAdvancedSearchOpen(false)
    navigateToProduct(product.id)
  }, [query, setAdvancedSearchOpen, navigateToProduct])

  const handleCategoryClick = useCallback((categoryId: string) => {
    setAdvancedSearchOpen(false)
    navigateToShop(categoryId)
  }, [setAdvancedSearchOpen, navigateToShop])

  const handlePopularSearch = useCallback((label: string) => {
    setQuery(label)
    fetchResults(label)
  }, [fetchResults])

  const handleClearRecent = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  const handleRemoveRecent = useCallback((search: string) => {
    const current = getRecentSearches().filter((s) => s !== search)
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(current))
    } catch {
      // silently fail
    }
    setRecentSearches(current)
  }, [])

  const getProductImage = useCallback((images: string | string[]) => {
    const parsed = safeJsonParse<string[]>(images)
    return parsed[0] || '/products/dress-1.png'
  }, [])

  const getDiscountedPrice = useCallback((price: number, discount: number) => {
    return discount > 0 ? price * (1 - discount / 100) : price
  }, [])

  return (
    <AnimatePresence>
      {advancedSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl"
          dir="rtl"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-[#D4A574]/5 blur-3xl" />
            <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-[#C4A4A4]/5 blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full shrink-0"
                onClick={() => setAdvancedSearchOpen(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D4A574] pointer-events-none" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="ابحثي عن فستان، إكسسوار، عباية..."
                  className="h-12 text-base rounded-xl pr-11 pl-11 bg-secondary/50 border-border/40 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20"
                />
                {query && (
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                    onClick={() => { setQuery(''); setResults([]) }}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button
                className="h-12 px-6 rounded-xl bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] text-white border-0 hover:opacity-90"
                onClick={() => handleSearch()}
              >
                بحث
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 -mx-4 px-4">
              <AnimatePresence mode="wait">
                {/* Search Results */}
                {query.trim() && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pb-8"
                  >
                    {loading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-[#D4A574]" />
                        <span className="mr-2 text-muted-foreground">جاري البحث...</span>
                      </div>
                    )}

                    {!loading && results.length > 0 && (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          {results.length} نتيجة لـ &quot;{query}&quot;
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {results.map((product, i) => (
                            <motion.button
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => handleProductClick(product)}
                              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-[#D4A574]/30 hover:bg-[#D4A574]/5 transition-all text-right"
                            >
                              <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-secondary/30">
                                <Image
                                  src={getProductImage(product.images)}
                                  alt={product.nameAr}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{product.nameAr}</p>
                                {product.category && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{product.category.nameAr}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-bold text-[#D4A574]">
                                    {getDiscountedPrice(product.price, product.discount).toFixed(0)} ج.م
                                  </span>
                                  {product.discount > 0 && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {product.price} ج.م
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/5"
                          onClick={() => handleSearch()}
                        >
                          عرض جميع النتائج
                        </Button>
                      </>
                    )}

                    {!loading && results.length === 0 && query.trim() && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground">لا توجد نتائج لـ &quot;{query}&quot;</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">جرّبي كلمات بحث مختلفة</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Default View (no query) */}
                {!query.trim() && (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 pb-8"
                  >
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">اختياراتك الأخيرة</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-destructive gap-1 h-7"
                            onClick={handleClearRecent}
                          >
                            <Trash2 className="h-3 w-3" />
                            مسح الكل
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search) => (
                            <motion.div
                              key={search}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="group flex items-center gap-1"
                            >
                              <Badge
                                className="cursor-pointer bg-secondary/80 hover:bg-[#D4A574]/10 hover:text-[#D4A574] border-border/50 transition-colors px-3 py-1.5 text-sm font-normal"
                                onClick={() => { setQuery(search); fetchResults(search) }}
                              >
                                {search}
                              </Badge>
                              <button
                                className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-destructive/10 transition-all"
                                onClick={() => handleRemoveRecent(search)}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-[#D4A574]" />
                        <h3 className="text-sm font-semibold text-foreground">عمليات البحث الشائعة</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                          <Badge
                            key={search.label}
                            className="cursor-pointer bg-[#D4A574]/10 text-[#D4A574] border-[#D4A574]/20 hover:bg-[#D4A574]/20 transition-colors px-3 py-1.5 text-sm font-medium gap-1.5"
                            onClick={() => handlePopularSearch(search.label)}
                          >
                            <search.icon className="h-3.5 w-3.5" />
                            {search.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Category Quick Links */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">تصفحي الأقسام</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {categoryQuickLinks.map((cat) => (
                          <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-[#D4A574]/30 bg-card transition-all"
                          >
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: cat.color + '15' }}
                            >
                              <cat.icon className="h-5 w-5" style={{ color: cat.color }} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{cat.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
