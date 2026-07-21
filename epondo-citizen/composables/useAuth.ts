export function useAuth() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  function loginWithEGov() {
    // Redirect to backend SSO login
    window.location.href = `${config.public.apiBase}/api/auth/login`;
  }

  async function handleCallback(code: string) {
    try {
      const { client } = useApi();
      const { data } = await client.post('/api/auth/callback', { code });
      authStore.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  }

  async function fetchProfile() {
    try {
      const { client } = useApi();
      const { data } = await client.get('/api/auth/me');
      authStore.setUser(data);
      return data;
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  }

  return {
    loginWithEGov,
    handleCallback,
    fetchProfile,
  };
}

import { useAuthStore } from '~/stores/auth.store';
import { useApi } from '~/composables/useApi';
