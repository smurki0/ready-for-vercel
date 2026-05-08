'use client'

import { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Moon,
  Sun,
  Package,
  LogOut,
  Shield,
  UserCircle,
  Heart,
  GitCompareArrows,
  Instagram,
  Twitter,
  MessageCircle,
  Globe,
  Settings,
  Loader2,
  Sparkles,
  ChevronDown,
  Home,
  SlidersHorizontal,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCompareStore } from '@/stores/compare-store'
import { useTheme } from 'next-themes'
import NotificationBell from '@/components/donatella/notification-bell'

const navLinks = [
  { key: 'home' as const, label: 'الرئيسية' },
  { key: 'shop' as const, label: 'المتجر' },
  { key: 'outfit-builder' as const, label: 'مصمم الإطلالات' },
  { key: 'lookbook' as const, label: 'لوبوك' },
  { key: 'wishlist' as const, label: 'المفضلة', needsAuth: true },
  { key: 'orders' as const, label: 'الطلبات', needsAuth: true },
  { key: 'contact' as const, label: 'تواصلي معنا' },
]

interface SearchSuggestion {
  id: string
  nameAr: string
  price: number
  discount: number
  images: string | string[]
}

export default function Navbar() {
  const { currentPage, setPage, setCartOpen, searchQuery, setSearchQuery, mobileMenuOpen, setMobileMenuOpen, setAuthModalTab, setSelectedCategory, setAdvancedSearchOpen } = useUIStore()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const wishlistItems = useWishlistStore((s) => s.items)
  const compareProductIds = useCompareStore((s) => s.compareProductIds)
  const { theme, setTheme } = useTheme()

  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const prevItemCountRef = useRef(0)
  const [cartPulse, setCartPulse] = useState(false)

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const itemCount = getItemCount()
  const wishlistCount = wishlistItems.length
  const compareCount = compareProductIds.length

  // Scroll detection with threshold
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navbar background opacity based on scroll
  const bgOpacity = Math.min(scrollY / 200, 1)

  // Cart pulse animation when count changes
  useEffect(() => {
    if (prevItemCountRef.current !== itemCount && prevItemCountRef.current !== 0) {
      setCartPulse(true)
      const timer = setTimeout(() => setCartPulse(false), 600)
      return () => clearTimeout(timer)
    }
    prevItemCountRef.current = itemCount
  }, [itemCount])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [searchOpen])

  // Navigate to shop when searching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && currentPage !== 'shop') {
        setPage('shop')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, currentPage, setPage])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch search suggestions with debounce
  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`)
        const data = await res.json()
        if (data.success && data.data?.products) {
          setSuggestions(data.data.products)
          setShowSuggestions(true)
        }
      } catch {
        setSuggestions([])
      } finally {
        setSuggestionsLoading(false)
      }
    }, 300)
  }, [])

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    fetchSuggestions(value)
  }, [setSearchQuery, fetchSuggestions])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((product: SearchSuggestion) => {
    setShowSuggestions(false)
    setSearchQuery('')
    useUIStore.getState().navigateToProduct(product.id)
  }, [])

  // Handle view all results
  const handleViewAllResults = useCallback(() => {
    setShowSuggestions(false)
    if (currentPage !== 'shop') {
      setPage('shop')
    }
  }, [currentPage, setPage])

  const handleNavClick = useCallback((key: string, needsAuth?: boolean) => {
    if (needsAuth && !user) {
      setAuthModalTab('login')
      setPage('auth')
      return
    }
    if (key === 'wishlist') {
      setPage('wishlist')
      return
    }
    setPage(key as typeof currentPage)
    setSelectedCategory(null)
    setMobileMenuOpen(false)
  }, [user, setAuthModalTab, setPage, setSelectedCategory, setMobileMenuOpen])

  const handleLogout = useCallback(async () => {
    await logout()
    setPage('home')
  }, [logout, setPage])

  // Get product image from suggestion
  const getProductImage = useCallback((images: string | string[]) => {
    if (Array.isArray(images)) return images[0] || ''
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed[0] || '' : images
    } catch {
      return images
    }
  }, [])

  // Get product price after discount
  const getDiscountedPrice = useCallback((price: number, discount: number) => {
    return discount > 0 ? price * (1 - discount / 100) : price
  }, [])

  // Memoized social links
  const socialLinks = useMemo(() => [
    { icon: Instagram, label: 'إنستغرام', href: '#' },
    { icon: Twitter, label: 'تويتر', href: '#' },
    { icon: MessageCircle, label: 'واتساب', href: '#' },
    { icon: Globe, label: 'الموقع', href: '#' },
  ], [])

  return (
    <>
      {/* Top Gradient Line */}
      <div className="fixed top-0 inset-x-0 z-[60] h-[2px] bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574]" />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-[2px] inset-x-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-2xl shadow-lg shadow-black/5 shadow-[0_4px_30px_rgba(212,165,116,0.06)] border-b border-border/60'
            : 'bg-background/60 backdrop-blur-md border-b border-border/20'
        }`}
      >
        {/* Bottom glow line on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-l from-transparent via-[#D4A574]/70 to-transparent origin-center"
            />
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.button
              onClick={() => setPage('home')}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="group relative text-xl sm:text-2xl font-bold tracking-wider transition-all duration-300"
            >
              <span className="bg-clip-text text-foreground group-hover:text-transparent group-hover:bg-gradient-to-l group-hover:from-[#D4A574] group-hover:via-[#C4A4A4] group-hover:to-[#D4A574] transition-all duration-500 relative">
                DONATELLA
                {/* Shimmer effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </span>
              <span className="absolute -bottom-1 right-0 h-[1px] w-0 bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] group-hover:w-full transition-all duration-500" />
            </motion.button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.button
                  key={link.key}
                  onClick={() => handleNavClick(link.key, link.needsAuth)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentPage === link.key
                      ? 'text-[#D4A574]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#D4A574]/5'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Active indicator */}
                  {currentPage === link.key && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#D4A574]/12 rounded-xl shadow-[0_0_12px_rgba(212,165,116,0.1)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {/* Hover underline - RTL: slides from left to right */}
                  <span className="absolute bottom-1 right-4 left-4 h-[1.5px] bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300 [button:hover>&]:scale-x-100" />
                </motion.button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Animated Search Bar - Desktop */}
              <div ref={searchContainerRef} className="hidden md:block relative">
                <motion.div
                  className="relative"
                  animate={{ width: searchOpen ? 340 : 220 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <motion.div
                    animate={{ rotate: searchOpen ? 90 : 0, scale: searchOpen ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                  <motion.div
                    animate={{
                      boxShadow: searchOpen
                        ? '0 0 0 2px rgba(212,165,116,0.2), 0 4px 12px rgba(212,165,116,0.08)'
                        : '0 0 0 0 transparent',
                    }}
                    transition={{ duration: 0.3 }}
                    className="rounded-full"
                  >
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => {
                        setAdvancedSearchOpen(true)
                        setSearchOpen(true)
                      }}
                      onBlur={() => setSearchOpen(false)}
                      placeholder="ابحثي عن منتج..."
                      className="h-9 w-full text-sm rounded-full pr-9 pl-4 bg-secondary/50 border-border/40 focus:border-[#D4A574]/50 focus:ring-2 focus:ring-[#D4A574]/20 transition-all"
                    />
                  </motion.div>
                  {/* Search expand glow effect */}
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-1 rounded-full bg-[#D4A574]/5 -z-10 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Search Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 inset-x-0 bg-background rounded-2xl border border-border/50 shadow-xl shadow-black/10 overflow-hidden z-50"
                    >
                      {/* Loading */}
                      {suggestionsLoading && (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-[#D4A574]" />
                          <span className="mr-2 text-sm text-muted-foreground">جاري البحث...</span>
                        </div>
                      )}

                      {/* Suggestions */}
                      {!suggestionsLoading && suggestions.length > 0 && (
                        <>
                          <ScrollArea className="max-h-72">
                            <div className="p-2">
                              {suggestions.map((product, i) => (
                                <motion.button
                                  key={product.id}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  onClick={() => handleSuggestionClick(product)}
                                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors text-right"
                                >
                                  {/* Thumbnail */}
                                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border/30">
                                    {getProductImage(product.images) ? (
                                      <img
                                        src={getProductImage(product.images)}
                                        alt={product.nameAr}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center">
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{product.nameAr}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-bold text-[#D4A574]">
                                        {getDiscountedPrice(product.price, product.discount).toFixed(0)} ج.م
                                      </span>
                                      {product.discount > 0 && (
                                        <span className="text-[10px] text-muted-foreground line-through">
                                          {product.price} ج.م
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </ScrollArea>
                          <Separator />
                          <div className="p-2">
                            <button
                              onClick={handleViewAllResults}
                              className="w-full text-center py-2 text-sm font-medium text-[#D4A574] hover:text-[#D4A574]/80 hover:bg-[#D4A574]/5 rounded-xl transition-colors"
                            >
                              عرض جميع النتائج
                            </button>
                          </div>
                        </>
                      )}

                      {/* No results */}
                      {!suggestionsLoading && searchQuery.trim() && suggestions.length === 0 && (
                        <div className="py-6 text-center">
                          <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Search Toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setAdvancedSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Dark Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </motion.div>
                </Button>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* Wishlist - Quick access */}
              {user && wishlistCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full relative hidden sm:flex"
                    onClick={() => handleNavClick('wishlist', true)}
                  >
                    <Heart className="h-4 w-4" />
                    <Badge className="absolute -top-1 -left-1 h-4.5 min-w-4.5 flex items-center justify-center p-0 text-[9px] rounded-full bg-[#C4A4A4]/80 text-white border-0 font-bold">
                      {wishlistCount}
                    </Badge>
                  </Button>
                </motion.div>
              )}

              {/* Mini Cart Icon with enhanced animations */}
              <motion.div
                animate={cartPulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full relative group/cart"
                  onClick={() => setCartOpen(true)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </motion.div>
                  {itemCount > 0 && (
                    <motion.div
                      key={itemCount}
                      initial={cartPulse ? { scale: 0.3 } : false}
                      animate={{ scale: 1 }}
                      transition={cartPulse ? { type: 'spring', stiffness: 600, damping: 12 } : undefined}
                    >
                      <Badge className="absolute -top-1.5 -left-1.5 h-5.5 min-w-5.5 flex items-center justify-center p-0 text-[10px] rounded-full bg-gradient-to-bl from-[#D4A574] to-[#b8885a] text-white border-0 shadow-md shadow-[#D4A574]/40 font-bold">
                        {itemCount}
                      </Badge>
                    </motion.div>
                  )}
                  {/* Pulse ring animation */}
                  <AnimatePresence>
                    {cartPulse && (
                      <>
                        <motion.span
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.7 }}
                          className="absolute -top-1.5 -left-1.5 h-5.5 w-5.5 rounded-full bg-[#D4A574]/30"
                        />
                        <motion.span
                          initial={{ scale: 1, opacity: 0.4 }}
                          animate={{ scale: 3.5, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.9, delay: 0.1 }}
                          className="absolute -top-1.5 -left-1.5 h-5.5 w-5.5 rounded-full bg-[#D4A574]/20"
                        />
                      </>
                    )}
                  </AnimatePresence>
                  {/* Cart tooltip */}
                  {itemCount > 0 && (
                    <span className="absolute -bottom-8 right-1/2 translate-x-1/2 text-[10px] text-muted-foreground bg-background/95 backdrop-blur-sm px-2 py-0.5 rounded-md opacity-0 group-hover/cart:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow border border-border/30">
                      {itemCount} منتج
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* User Dropdown - Enhanced */}
              {user ? (
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full relative"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-bl from-[#D4A574] to-[#C4A4A4] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-[#D4A574]/20">
                        {user.name.charAt(0)}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl border-border/50 shadow-xl">
                    {/* User info header */}
                    <div className="px-2 py-2 mb-1 rounded-lg bg-gradient-to-l from-[#D4A574]/5 via-transparent to-[#C4A4A4]/5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-bl from-[#D4A574] to-[#C4A4A4] flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground/60 px-2">الحساب</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setPage('profile')} className="gap-2.5 cursor-pointer rounded-lg">
                      <UserCircle className="h-4 w-4 text-[#D4A574]/70" />
                      حسابي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPage('orders')} className="gap-2.5 cursor-pointer rounded-lg">
                      <Package className="h-4 w-4 text-[#D4A574]/70" />
                      طلباتي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPage('wishlist')} className="gap-2.5 cursor-pointer rounded-lg">
                      <Heart className="h-4 w-4 text-[#D4A574]/70" />
                      المفضلة
                      {wishlistCount > 0 && (
                        <Badge className="mr-auto h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-[#D4A574]/15 text-[#D4A574] border-0">
                          {wishlistCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] text-muted-foreground/60 px-2">الإدارة</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setPage('admin')} className="gap-2.5 cursor-pointer rounded-lg">
                          <Shield className="h-4 w-4 text-[#D4A574]/70" />
                          لوحة التحكم
                          <Sparkles className="h-3 w-3 text-[#D4A574]/40 mr-auto" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPage('admin')} className="gap-2.5 cursor-pointer rounded-lg">
                          <Settings className="h-4 w-4 text-[#D4A574]/70" />
                          إعدادات المتجر
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="gap-2.5 text-destructive cursor-pointer rounded-lg focus:text-destructive">
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => {
                    setAuthModalTab('login')
                    setPage('auth')
                  }}
                >
                  <User className="h-4 w-4" />
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? 'close' : 'menu'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay - Enhanced Slide-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 z-50 w-[85%] max-w-sm h-full md:hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-background">
                {/* Header gradient line at top */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574]" />
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }} />
                {/* Subtle animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-bl from-[#D4A574]/[0.02] via-transparent to-[#C4A4A4]/[0.02]" />
                {/* Decorative circles */}
                <div className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-[#D4A574]/5 blur-2xl" />
                <div className="absolute bottom-32 -right-10 w-40 h-40 rounded-full bg-[#C4A4A4]/5 blur-2xl" />
              </div>

              <div className="relative h-full flex flex-col">
                {/* Header with decorative logo */}
                <div className="p-5 border-b border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-l from-[#D4A574] via-[#C4A4A4] to-[#D4A574]">
                      DONATELLA
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-[1px] bg-gradient-to-l from-transparent via-[#D4A574]/40 to-transparent" />
                </div>

                {/* Search bar in mobile drawer */}
                <div className="px-4 pt-4 pb-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={mobileSearchInputRef}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="ابحثي عن منتج..."
                      className="h-10 w-full text-sm rounded-xl pr-9 pl-4 bg-secondary/50 border-border/40 focus:border-[#D4A574]/50"
                    />
                  </div>
                </div>

                {/* User Info Section */}
                {user ? (
                  <div className="px-4 pb-3 border-b border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-bl from-[#D4A574] to-[#C4A4A4] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-[#D4A574]/40 ring-offset-2 ring-offset-background">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setPage('profile')
                        }}
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pb-3 border-b border-border/20">
                    <Button
                      className="w-full rounded-xl bg-gradient-to-l from-[#D4A574] to-[#C4A4A4] text-white border-0 hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setAuthModalTab('login')
                        setPage('auth')
                      }}
                    >
                      تسجيل الدخول
                    </Button>
                  </div>
                )}

                {/* Nav Links */}
                <ScrollArea className="flex-1">
                  <nav className="p-3 space-y-0.5">
                    {/* Home link with icon */}
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.02 }}
                      whileHover={{ x: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavClick('home')}
                      className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                        currentPage === 'home'
                          ? 'bg-[#D4A574]/12 text-[#D4A574] shadow-[inset_0_0_0_1px_rgba(212,165,116,0.15)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-[#D4A574]/5'
                      }`}
                    >
                      <Home className="h-4 w-4" />
                      <span>الرئيسية</span>
                      {currentPage === 'home' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-1.5 w-1.5 rounded-full bg-[#D4A574] shadow-[0_0_6px_rgba(212,165,116,0.5)] mr-auto"
                        />
                      )}
                    </motion.button>

                    {navLinks.filter(l => l.key !== 'home').map((link, i) => (
                      <motion.button
                        key={link.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (i + 1) * 0.04 }
                        }
                        whileHover={{ x: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavClick(link.key, link.needsAuth)}
                        className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                          currentPage === link.key
                            ? 'bg-[#D4A574]/12 text-[#D4A574] shadow-[inset_0_0_0_1px_rgba(212,165,116,0.15)]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-[#D4A574]/5 hover:shadow-[inset_0_0_0_1px_rgba(212,165,116,0.08)]'
                        }`}
                      >
                        <span>{link.label}</span>
                        {currentPage === link.key && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-1.5 w-1.5 rounded-full bg-[#D4A574] shadow-[0_0_6px_rgba(212,165,116,0.5)]"
                          />
                        )}
                      </motion.button>
                    ))}

                    <Separator className="my-2 opacity-50" />

                    {/* Wishlist with count */}
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ x: -4 }}
                      onClick={() => handleNavClick('wishlist', true)}
                      className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4" />
                        <span>المفضلة</span>
                      </div>
                      {wishlistCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-[#D4A574]/15 text-[#D4A574] border-0">
                          {wishlistCount}
                        </Badge>
                      )}
                    </motion.button>

                    {/* Cart with count */}
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.24 }}
                      whileHover={{ x: -4 }}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setCartOpen(true)
                      }}
                      className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="h-4 w-4" />
                        <span>سلة المشتريات</span>
                      </div>
                      {itemCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-gradient-to-bl from-[#D4A574] to-[#b8885a] text-white border-0">
                          {itemCount}
                        </Badge>
                      )}
                    </motion.button>

                    {/* Compare with count */}
                    {compareCount > 0 && (
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28 }}
                        whileHover={{ x: -4 }}
                        onClick={() => {
                          setMobileMenuOpen(false)
                          setPage('compare')
                        }}
                        className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <GitCompareArrows className="h-4 w-4" />
                          <span>مقارنة المنتجات</span>
                        </div>
                        <Badge className="h-5 min-w-5 px-1.5 text-[10px] rounded-full bg-[#C4A4A4]/15 text-[#C4A4A4] border-0">
                          {compareCount}
                        </Badge>
                      </motion.button>
                    )}

                    {/* Admin Section */}
                    {user && isAdmin() && (
                      <>
                        <Separator className="my-2 opacity-50" />
                        <div className="px-2 py-1">
                          <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">الإدارة</span>
                        </div>
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.32 }}
                          whileHover={{ x: -4 }}
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setPage('admin')
                          }}
                          className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all flex items-center gap-3"
                        >
                          <Shield className="h-4 w-4 text-[#D4A574]/60" />
                          <span>لوحة التحكم</span>
                          <Sparkles className="h-3 w-3 text-[#D4A574]/40 mr-auto" />
                        </motion.button>
                        <motion.button
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.36 }}
                          whileHover={{ x: -4 }}
                          onClick={() => {
                            setMobileMenuOpen(false)
                            setPage('admin')
                          }}
                          className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all flex items-center gap-3"
                        >
                          <Settings className="h-4 w-4 text-[#D4A574]/60" />
                          <span>إعدادات المتجر</span>
                        </motion.button>
                      </>
                    )}
                  </nav>
                </ScrollArea>

                {/* Bottom Section */}
                <div className="border-t border-border/30 p-4 space-y-4">
                  {/* Dark Mode Toggle */}
                  {mounted && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
                      </div>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        className="data-[state=checked]:bg-[#D4A574]"
                      />
                    </div>
                  )}

                  {/* Social Media Links */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">تابعينا</p>
                    <div className="flex items-center gap-3">
                      {socialLinks.map((social) => (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-[#D4A574] hover:bg-[#D4A574]/10 transition-all"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={social.label}
                        >
                          <social.icon className="h-3.5 w-3.5" />
                        </motion.a>
                      ))}
                    </div>
                  </div>

                  {/* Logout button for logged-in users */}
                  {user && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
