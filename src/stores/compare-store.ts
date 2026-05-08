import { create } from 'zustand'
import { toast } from 'sonner'

const MAX_COMPARE = 3

interface CompareState {
  compareProductIds: string[]
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  isInCompare: (id: string) => boolean
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareProductIds: [],

  addToCompare: (id: string) => {
    const { compareProductIds } = get()
    if (compareProductIds.includes(id)) {
      toast.info('المنتج موجود بالفعل في المقارنة')
      return
    }
    if (compareProductIds.length >= MAX_COMPARE) {
      toast.error(`يمكنك مقارنة ${MAX_COMPARE} منتجات كحد أقصى`)
      return
    }
    set({ compareProductIds: [...compareProductIds, id] })
    toast.success('تمت الإضافة للمقارنة')
  },

  removeFromCompare: (id: string) => {
    set({ compareProductIds: get().compareProductIds.filter((pid) => pid !== id) })
  },

  clearCompare: () => {
    set({ compareProductIds: [] })
  },

  isInCompare: (id: string) => {
    return get().compareProductIds.includes(id)
  },
}))
