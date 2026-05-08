'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Zap, Heart, Feather, Briefcase, Sparkles, RefreshCw, Loader2 } from 'lucide-react'
import ProductCard from './product-card'
import { useSiteSettings } from '@/hooks/use-site-settings'

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
  createdAt: string
  category?: { nameAr: string; nameEn: string; slug: string }
}

interface StyleOption {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  gradient: string
  borderHover: string
  categorySlug: string
  description: string
}

const styleOptions: StyleOption[] = [
  {
    id: 'classic',
    label: 'كلاسيكي أنيق',
    icon: <Crown className="h-7 w-7" />,
    color: '#D4A574',
    gradient: 'from-[#D4A574]/15 to-[#b8885a]/10',
    borderHover: 'hover:border-[#D4A574]/60',
    categorySlug: 'dresses',
    description: 'أناقة خالدة لا تتغير',
  },
  {
    id: 'modern',
    label: 'عصري جريء',
    icon: <Zap className="h-7 w-7" />,
    color: '#8B6F6F',
    gradient: 'from-[#8B6F6F]/15 to-[#6b5555]/10',
    borderHover: 'hover:border-[#8B6F6F]/60',
    categorySlug: 'casual',
    description: 'جرأة في كل تفصيلة',
  },
  {
    id: 'romantic',
    label: 'رومانسي ناعم',
    icon: <Heart className="h-7 w-7" />,
    color: '#C4A4A4',
    gradient: 'from-[#C4A4A4]/15 to-[#a88e8e]/10',
    borderHover: 'hover:border-[#C4A4A4]/60',
    categorySlug: 'dresses',
    description: 'نعومة وأنوثة ساحرة',
  },
  {
    id: 'new',
    label: 'جديد',
    icon: <Feather className="h-7 w-7" />,
    color: '#b8885a',
    gradient: 'from-[#b8885a]/15 to-[#9a7348]/10',
    borderHover: 'hover:border-[#b8885a]/60',
    categorySlug: 'accessories',
    description: 'حرية بلا حدود',
  },
  {
    id: 'formal',
    label: 'رسمي راقي',
    icon: <Briefcase className="h-7 w-7" />,
    color: '#6b5555',
    gradient: 'from-[#6b5555]/15 to-[#5a4545]/10',
    borderHover: 'hover:border-[#6b5555]/60',
    categorySlug: 'evening',
    description: 'رقي في كل مناسبة',
  },
]

export default function StyleRecommendations() {
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const { getSetting } = useSiteSettings()

  // Fetch categories to get the correct categoryId by slug
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          const map: Record<string, string> = {}
          for (const cat of data.data) {
            map[cat.slug] = cat.id
          }
          setCategoryMap(map)
        }
      } catch {
        // silently fail
      }
    }
    fetchCategories()
  }, [])

  const handleStyleSelect = async (style: StyleOption) => {
    setSelectedStyle(style)
    setIsLoading(true)
    setProducts([])

    // Simulate AI "thinking" time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Fetch products by category
    try {
      const categoryId = categoryMap[style.categorySlug]
      if (categoryId) {
        const res = await fetch(`/api/products?category=${categoryId}&limit=4`)
        const data = await res.json()
        if (data.success) {
          const prods = data.data.products || data.data
          setProducts(Array.isArray(prods) ? prods.slice(0, 4) : [])
        }
      }
    } catch {
      // silently fail
    }

    setIsLoading(false)
  }

  const handleReset = () => {
    setSelectedStyle(null)
    setProducts([])
    setIsLoading(false)
  }

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4A574]/5 via-[#C4A4A4]/5 to-[#8B6F6F]/5 dark:from-[#D4A574]/3 dark:via-[#C4A4A4]/3 dark:to-[#8B6F6F]/3" />

      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#D4A574]/8 dark:bg-[#D4A574]/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#C4A4A4]/8 dark:bg-[#C4A4A4]/4 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#8B6F6F]/5 dark:bg-[#8B6F6F]/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Gold gradient icon container */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-[#D4A574] to-transparent" />
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#b8885a] shadow-lg shadow-[#D4A574]/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-[#D4A574] to-transparent" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {getSetting('styleRecTitle', 'استشارة الأناقة الذكية')}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            {getSetting('styleRecSubtitle', 'دعينا نساعدكِ في اختيار الأسلوب المثالي')}
          </p>

          {/* Decorative line divider */}
          <div className="mt-6 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4A574] to-transparent" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedStyle ? (
            /* Style Preference Selector */
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  اكتشفي أسلوبكِ
                </h3>
                <p className="text-muted-foreground text-sm">
                  اختاري الأسلوب الذي يعبر عنكِ
                </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {styleOptions.map((style, i) => (
                  <motion.button
                    key={style.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: `0 8px 30px ${style.color}20, 0 4px 12px ${style.color}15`,
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleStyleSelect(style)}
                    className={`group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${style.gradient} dark:from-[${style.color}]/8 dark:to-[${style.color}]/5 border border-border/50 ${style.borderHover} dark:hover:border-[${style.color}]/40 backdrop-blur-sm transition-all duration-300 cursor-pointer`}
                  >
                    {/* Icon circle */}
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${style.color}, ${style.color}cc)`,
                        boxShadow: `0 4px 15px ${style.color}30`,
                      }}
                    >
                      <div className="text-white">{style.icon}</div>
                    </div>

                    <h4 className="font-bold text-foreground text-sm sm:text-base mb-1">
                      {style.label}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {style.description}
                    </p>

                    {/* Hover glow effect */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: `0 0 20px ${style.color}15, inset 0 0 20px ${style.color}08`,
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : isLoading ? (
            /* Loading State */
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                className="relative h-20 w-20 mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute inset-0 rounded-full border-4 border-t-transparent"
                  style={{ borderColor: `${selectedStyle.color}40`, borderTopColor: 'transparent' }}
                />
                <div
                  className="absolute inset-2 rounded-full border-4 border-b-transparent"
                  style={{ borderColor: `${selectedStyle.color}30`, borderBottomColor: 'transparent' }}
                />
              </motion.div>

              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#D4A574]" />
                <p className="text-foreground font-semibold text-lg">
                  جارٍ تحليل أسلوبكِ
                </p>
              </div>

              <p className="text-muted-foreground text-sm">
                {selectedStyle.label} - نبحث عن أفضل القطع لكِ
              </p>

              {/* Animated dots */}
              <div className="flex items-center gap-2 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: selectedStyle.color }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Recommended Products */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Selected style badge + change button */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${selectedStyle.color}, ${selectedStyle.color}cc)`,
                    }}
                  >
                    <div className="text-white scale-75">{selectedStyle.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {selectedStyle.label}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      قطع مختارة بعناية لأسلوبكِ
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200 text-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  تغيير الأسلوب
                </motion.button>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">
                    لا توجد منتجات متاحة لهذا الأسلوب حالياً
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
