import { create } from 'zustand';

export interface CartItemType {
  id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
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

interface CartState {
  items: CartItemType[];
  loading: boolean;

  setItems: (items: CartItemType[]) => void;
  setLoading: (loading: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        set({ items: data.data, loading: false });
      } else {
        set({ items: [], loading: false });
      }
    } catch {
      set({ items: [], loading: false });
    }
  },

  addItem: async (productId, quantity, size, color) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, size, color }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchCart();
      } else {
        set({ loading: false });
        throw new Error(data.error || 'فشل إضافة المنتج للسلة');
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateItem: async (id, quantity) => {
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchCart();
      }
    } catch {
      // silently fail
    }
  },

  removeItem: async (id) => {
    try {
      const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await get().fetchCart();
      }
    } catch {
      // silently fail
    }
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((total, item) => {
      const price = item.product.discount > 0
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
