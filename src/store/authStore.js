import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de autenticação usando Zustand
 * Persiste o estado do usuário no localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user, loading: false }),
      
      clearUser: () => set({ user: null, loading: false }),
      
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
