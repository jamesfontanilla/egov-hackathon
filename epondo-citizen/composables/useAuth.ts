export function useAuth() {
  const config = useRuntimeConfig();

  function loginWithEGov() {
    window.location.href = `${config.public.apiBase}/api/auth/login`;
  }

  async function fetchProfile() {
    try {
      const { client } = useApi();
      const { data } = await client.get('/api/auth/me');
      if (data.success && data.data) {
        const authStore = useAuthStore();
        authStore.setUser(data.data);
      }
      return data.data;
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  }

  return {
    loginWithEGov,
    fetchProfile,
  };
}

import { useAuthStore } from '~/stores/auth.store';
