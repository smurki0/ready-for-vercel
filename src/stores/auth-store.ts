import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        set({ user: data.data, loading: false });
        return true;
      }
      set({ loading: false });
      throw new Error(data.error || 'فشل تسجيل الدخول');
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        // Auto login after registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email, password: userData.password }),
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          set({ user: loginData.data, loading: false });
          return true;
        }
      }
      set({ loading: false });
      throw new Error(data.error || 'فشل إنشاء الحساب');
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },

  checkAuth: async () => {
    if (get().initialized) return;
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        set({ user: data.data, initialized: true });
      } else {
        set({ user: null, initialized: true });
      }
    } catch {
      set({ user: null, initialized: true });
    }
  },

  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },
}));
