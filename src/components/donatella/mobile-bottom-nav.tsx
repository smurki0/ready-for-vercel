'use client'

import { motion } from 'framer-motion'
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  page: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, page: 'home' },
  { id: 'shop', label: 'المتجر', icon: ShoppingBag, page: 'shop' },
  { id: 'cart', label: 'السلة', icon: ShoppingCart, page: 'cart' },
  { id: 'wishlist', label: 'المفضلة', icon: Heart, page: 'wishlist' },
  { id: 'account', label: 'حسابي', icon: User, page: 'profile' },
]

export default function MobileBottomNav() {
  const currentPage = useUIStore((s) => s.currentPage)
  const setPage = useUIStore((s) => s.setPage)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const cartItems = useCartStore((s) => s.items)
  const getItemCount = useCartStore((s) => s.getItemCount)

  const itemCount = getItemCount()

  const handleNavClick = (item: NavItem) => {
    if (item.page === 'cart') {
      setCartOpen(true)
    } else {
      setPage(item.page as Parameters<typeof setPage>[0])
    }
  }

  const isActive = (item: NavItem): boolean => {
    if (item.page === 'cart') return false // Cart opens a panel, not a page
    return currentPage === item.page
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Golden gradient top border line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4A574] to-transparent" />

      {/* Glassmorphism background */}
      <div className="bg-background/90 backdrop-blur-xl border-t border-[#D4A574]/10">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] touch-manipulation"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors duration-300 ${
                      active
                        ? 'text-[#D4A574]'
                        : 'text-muted-foreground'
                    }`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  {/* Cart count badge */}
                  {item.id === 'cart' && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #D4A574, #C4945A)',
                        boxShadow: '0 1px 4px rgba(212, 165, 116, 0.4)',
                      }}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </motion.div>

                {/* Label text */}
                <span
                  className={`text-[10px] leading-tight transition-colors duration-300 ${
                    active
                      ? 'text-[#D4A574] font-semibold'
                      : 'text-muted-foreground font-medium'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {active && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#D4A574]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
