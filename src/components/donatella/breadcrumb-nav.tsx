'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ChevronLeft } from 'lucide-react'
import { useUIStore, type PageType } from '@/stores/ui-store'

interface BreadcrumbItem {
  label: string
  page: PageType
  onClick?: () => void
}

interface ProductInfo {
  nameAr: string
  categoryId: string | null
  categoryName: string | null
  productId: string
}

export default function BreadcrumbNav() {
  const currentPage = useUIStore((s) => s.currentPage)
  const selectedProductId = useUIStore((s) => s.selectedProductId)
  const selectedCategory = useUIStore((s) => s.selectedCategory)
  const setPage = useUIStore((s) => s.setPage)
  const navigateToShop = useUIStore((s) => s.navigateToShop)

  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)
  const fetchedProductIdRef = useRef<string | null>(null)
  const fetchedCategoryRef = useRef<string | null>(null)

  // Fetch product info when on product page
  useEffect(() => {
    if (currentPage === 'product' && selectedProductId) {
      // Skip if already fetched for this product
      if (fetchedProductIdRef.current === selectedProductId) return
      fetchedProductIdRef.current = selectedProductId

      fetch(`/api/products/${selectedProductId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProductInfo({
              nameAr: data.data.nameAr,
              categoryId: data.data.categoryId || null,
              categoryName: data.data.category?.nameAr || null,
              productId: selectedProductId,
            })
          }
        })
        .catch(() => {
          // silently fail
        })
    }
  }, [currentPage, selectedProductId])

  // Fetch category name when on shop page with category filter
  useEffect(() => {
    if (currentPage === 'shop' && selectedCategory) {
      // Skip if already fetched for this category
      if (fetchedCategoryRef.current === selectedCategory) return
      fetchedCategoryRef.current = selectedCategory

      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const cat = data.data.find(
              (c: { id: string; nameAr: string }) => c.id === selectedCategory
            )
            if (cat) setCategoryName(cat.nameAr)
          }
        })
        .catch(() => {
          // silently fail
        })
    }
  }, [currentPage, selectedCategory])

  // Don't show on home page
  if (currentPage === 'home') return null

  // Only use product info if it matches the current product
  const currentProductInfo =
    currentPage === 'product' && productInfo?.productId === selectedProductId
      ? productInfo
      : null

  // Only use category name if on relevant pages
  const currentCategoryName =
    (currentPage === 'shop' || currentPage === 'product') ? categoryName : null

  // Build breadcrumb items based on current page
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with home
  breadcrumbs.push({
    label: 'الرئيسية',
    page: 'home',
    onClick: () => setPage('home'),
  })

  // Page-specific breadcrumb trails
  switch (currentPage) {
    case 'shop':
      breadcrumbs.push({
        label: 'المتجر',
        page: 'shop',
        onClick: () => navigateToShop(),
      })
      if (selectedCategory && currentCategoryName) {
        breadcrumbs.push({
          label: currentCategoryName,
          page: 'shop',
          onClick: () => navigateToShop(selectedCategory),
        })
      }
      break
    case 'product':
      breadcrumbs.push({
        label: 'المتجر',
        page: 'shop',
        onClick: () => navigateToShop(),
      })
      if (currentProductInfo?.categoryName) {
        breadcrumbs.push({
          label: currentProductInfo.categoryName,
          page: 'shop',
          onClick: () => navigateToShop(currentProductInfo.categoryId || undefined),
        })
      }
      if (currentProductInfo?.nameAr) {
        breadcrumbs.push({
          label: currentProductInfo.nameAr,
          page: 'product',
        })
      }
      break
    case 'wishlist':
      breadcrumbs.push({ label: 'المفضلة', page: 'wishlist' })
      break
    case 'orders':
      breadcrumbs.push({ label: 'الطلبات', page: 'orders' })
      break
    case 'profile':
      breadcrumbs.push({ label: 'الملف الشخصي', page: 'profile' })
      break
    case 'checkout':
      breadcrumbs.push({ label: 'السلة والشراء', page: 'checkout' })
      break
    case 'contact':
      breadcrumbs.push({ label: 'تواصلي معنا', page: 'contact' })
      break
    case 'compare':
      breadcrumbs.push({ label: 'مقارنة المنتجات', page: 'compare' })
      break
    case 'outfit-builder':
      breadcrumbs.push({ label: 'مصمم الإطلالات', page: 'outfit-builder' })
      break
    case 'lookbook':
      breadcrumbs.push({ label: 'لوبوك', page: 'lookbook' })
      break
    case 'auth':
      breadcrumbs.push({ label: 'تسجيل الدخول', page: 'auth' })
      break
    case 'admin':
    case 'admin-products':
    case 'admin-orders':
    case 'admin-users':
    case 'admin-categories':
    case 'admin-settings':
      breadcrumbs.push({
        label: 'لوحة التحكم',
        page: 'admin',
        onClick: () => setPage('admin'),
      })
      break
    case 'cart':
      breadcrumbs.push({ label: 'السلة', page: 'cart' })
      break
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="pt-20 pb-2"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center flex-wrap gap-1.5 text-sm"
            dir="rtl"
            aria-label="التنقل التفصيلي"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const isFirst = index === 0

              return (
                <motion.div
                  key={`${item.page}-${index}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.06 }}
                  className="flex items-center gap-1.5"
                >
                  {index > 0 && (
                    <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  {isFirst ? (
                    // Home icon for first breadcrumb item
                    item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-[#D4A574] transition-colors duration-200 group"
                        aria-label="الرئيسية"
                      >
                        <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
                        <span>{item.label}</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Home className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </span>
                    )
                  ) : isLast ? (
                    // Current page — gold color, not clickable
                    <span className="text-[#D4A574] font-semibold">{item.label}</span>
                  ) : (
                    // Middle items — clickable, muted
                    item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="text-muted-foreground hover:text-[#D4A574] transition-colors duration-200"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">{item.label}</span>
                    )
                  )}
                </motion.div>
              )
            })}
          </nav>

          {/* Decorative gradient line at bottom */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="mt-3 h-px bg-gradient-to-l from-transparent via-[#D4A574]/30 dark:via-[#D4A574]/20 to-transparent origin-right"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
