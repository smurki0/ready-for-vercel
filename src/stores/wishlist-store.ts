import { create } from 'zustand';

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    nameAr: string;
    nameEn: string;
    price: number;
    discount: number;
    images: string | string[];
    stock: number;
  };
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;

  setItems: (items: WishlistItem[]) => void;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  setItems: (items) => set({ items }),

  fetchWishlist: async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (data.success) {
        set({ items: data.data });
      }
    } catch {
      // silently fail
    }
  },

  addItem: async (productId) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchWishlist();
      }
    } catch {
      // silently fail
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchWishlist();
      }
    } catch {
      // silently fail
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.productId === productId);
  },
}));
