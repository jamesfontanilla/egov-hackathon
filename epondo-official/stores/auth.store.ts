import { defineStore } from 'pinia';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'TREASURER' | 'CAPTAIN' | 'CBO_AUDITOR' | 'CITIZEN';
  barangayPsgc: string;
  municipalityPsgc: string;
  mobile: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isTreasurer: (state) => state.user?.role === 'TREASURER',
    isCaptain: (state) => state.user?.role === 'CAPTAIN',
    isCbo: (state) => state.user?.role === 'CBO_AUDITOR',
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },

  actions: {
    setAuth(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem('epondo_token', token);
        localStorage.setItem('epondo_user', JSON.stringify(user));
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('epondo_token');
        const userStr = localStorage.getItem('epondo_user');
        if (token && userStr) {
          this.token = token;
          this.user = JSON.parse(userStr);
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
