import { defineStore } from 'pinia';

interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile?: string;
  gender?: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isCitizen: (state) => state.user?.role === 'CITIZEN',
  },

  actions: {
    setAuth(token: string, user: User) {
      this.token = token;
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem('epondo_token', token);
        localStorage.setItem('epondo_user', JSON.stringify(user));
      }
    },

    setUser(user: User) {
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem('epondo_user', JSON.stringify(user));
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('epondo_token');
        const userStr = localStorage.getItem('epondo_user');
        if (token) this.token = token;
        if (userStr) {
          try {
            this.user = JSON.parse(userStr);
          } catch {
            this.user = null;
          }
        }
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem('epondo_token');
        localStorage.removeItem('epondo_user');
      }
    },
  },
});
