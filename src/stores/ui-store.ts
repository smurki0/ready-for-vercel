import { create } from 'zustand';

export type PageType =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'auth'
  | 'orders'
  | 'wishlist'
  | 'profile'
  | 'compare'
  | 'contact'
  | 'admin'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-users'
  | 'admin-categories'
  | 'admin-settings'
  | 'outfit-builder'
  | 'lookbook';

interface UIState {
  currentPage: PageType;
  selectedProductId: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  priceRange: [number, number];
  sortBy: string;
  cartOpen: boolean;
  authModalTab: 'login' | 'register';
  mobileMenuOpen: boolean;
  quickViewProductId: string | null;
  selectedSizes: string[];
  selectedColors: string[];
  viewMode: 'grid' | 'list';
  advancedSearchOpen: boolean;

  setPage: (page: PageType) => void;
  setSelectedProduct: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: string) => void;
  setCartOpen: (open: boolean) => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
  setMobileMenuOpen: (open: boolean) => void;
  navigateToProduct: (id: string) => void;
  navigateToShop: (category?: string) => void;
  setQuickViewProductId: (id: string | null) => void;
  setSelectedSizes: (sizes: string[]) => void;
  setSelectedColors: (colors: string[]) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setAdvancedSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  searchQuery: '',
  selectedCategory: null,
  priceRange: [0, 5000],
  sortBy: 'newest',
  cartOpen: false,
  authModalTab: 'login',
  mobileMenuOpen: false,
  quickViewProductId: null,
  selectedSizes: [],
  selectedColors: [],
  viewMode: 'grid',
  advancedSearchOpen: false,

  setPage: (page) => set({ currentPage: page, mobileMenuOpen: false }),
  setSelectedProduct: (id) => set({ selectedProductId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setCartOpen: (open) => set({ cartOpen: open }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  navigateToProduct: (id) => set({ currentPage: 'product', selectedProductId: id }),
  navigateToShop: (category) => set({ 
    currentPage: 'shop', 
    selectedCategory: category || null,
  }),
  setQuickViewProductId: (id) => set({ quickViewProductId: id }),
  setSelectedSizes: (sizes) => set({ selectedSizes: sizes }),
  setSelectedColors: (colors) => set({ selectedColors: colors }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAdvancedSearchOpen: (open) => set({ advancedSearchOpen: open }),
}));
