import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../services/api';

interface UserInfo {
  username: string;
  nickname?: string;
  email?: string | null;
  avatar?: string | null;
}

interface AuthStore {
  token: string | null;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const res = await api.login({ username, password });
          localStorage.setItem('auth-token', res.access_token);
          set({
            token: res.access_token,
            user: {
              username: res.user_info.username || username,
              nickname: res.user_info.nickname,
              email: res.user_info.email,
              avatar: res.user_info.avatar,
            },
            loading: false,
          });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          throw e;
        }
      },

      register: async (username, password, email) => {
        set({ loading: true, error: null });
        try {
          await api.register({ username, password, email });
          set({ loading: false });
        } catch (e) {
          set({ loading: false, error: (e as Error).message });
          throw e;
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({ token: null, user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'japanese-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
