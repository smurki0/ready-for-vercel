'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductCard from './product-card'
import { useUIStore } from '@/stores/ui-store'
import { toast } from 'sonner'

interface Product {
  id: string
  nameAr: string
  nameEn: string
  price: number
  discount: number
  images: string | string[]
  stock: number
  categoryId: string
  category?: { nameAr: string; nameEn: string; slug: string }
}

const STORAGE_KEY = 'donatella-recently-viewed'

function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function addRecentlyViewedId(id: string) {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentlyViewedIds()
    const filtered = existing.filter((eid) => eid !== id)
    const updated = [id, ...filtered].slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // silently fail
  }
}

export { addRecentlyViewedId }

export default function RecentlyViewed() {
  const currentPage = useUIStore((s) => s.currentPage)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const fetchProducts = useCallback(async () => {
    const ids = getRecentlyViewedIds()
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const results = await Promise.all(
        ids.slice(0, 6).map(async (id) => {
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
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, fetchProducts])

  const updateScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollRight(scrollLeft > -scrollWidth + clientWidth + 10)
    setCanScrollLeft(scrollLeft < -10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons)
    updateScrollButtons()
    return () => el.removeEventListener('scroll', updateScrollButtons)
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    const currentScroll = scrollRef.current.scrollLeft
    const newScroll = direction === 'left'
      ? currentScroll - scrollAmount
      : currentScroll + scrollAmount
    scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' })
  }

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setProducts([])
      toast.success('تم مسح السجل')
    } catch {
      toast.error('حدث خطأ')
    }
  }

  // Hide section entirely if empty and not loading
  if (!loading && products.length === 0) return null

  return (
    <>
      {/* Subtle divider before section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <section className="py-12 sm:py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B6F6F]/20 to-[#D4A574]/20 dark:from-[#8B6F6F]/15 dark:to-[#D4A574]/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#8B6F6F]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  شاهدتِ مؤخراً
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  المنتجات التي تصفحتها
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Navigation arrows */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-border/50"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-border/50"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Clear history button */}
              {!loading && products.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  مسح السجل
                </Button>
              )}
            </div>
          </motion.div>

          {/* Scrollable product row */}
          <div className="relative group/scroll">
            {/* Right gradient fade */}
            <div className="absolute right-0 top-0 bottom-4 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-300"
              style={{ opacity: canScrollRight ? 1 : 0 }} />
            {/* Left gradient fade */}
            <div className="absolute left-0 top-0 bottom-4 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300"
              style={{ opacity: canScrollLeft ? 1 : 0 }} />

            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="min-w-[200px] sm:min-w-[240px] snap-start">
                      <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse mb-3" />
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  ))
                : products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="min-w-[200px] sm:min-w-[240px] snap-start"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
