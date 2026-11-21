// src/store/userStore.ts
import { create } from 'zustand'
import type { UserInfo } from '../types/resume'

interface UserStore {
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void

  isVip: () => boolean
  remainingFreeQuota: () => number
  hasQuota: () => boolean
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  isVip: () => {
    const { user } = get()
    if (!user) return false
    return user.vipExpireAt > Date.now()
  },

  remainingFreeQuota: () => {
    const { user } = get()
    if (!user) return 0
    return user.aiQuotaToday
  },

  hasQuota: () => {
    const { user, isVip, remainingFreeQuota } = get()
    if (!user) return false
    if (isVip()) return true
    return remainingFreeQuota() > 0 || user.aiQuotaExtra > 0
  },
}))
