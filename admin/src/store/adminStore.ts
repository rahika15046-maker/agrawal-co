import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface AdminUser { _id: string; name: string; email: string; role: string; }

interface AdminStore {
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (!['admin', 'superadmin'].includes(data.user.role)) {
          throw new Error('Insufficient permissions');
        }
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        set({ user: null, token: null });
        window.location.href = '/login';
      },
    }),
    { name: 'agrawal-admin' }
  )
);
