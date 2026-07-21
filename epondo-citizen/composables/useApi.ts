import axios, { type AxiosInstance } from 'axios';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const client: AxiosInstance = axios.create({
    baseURL: config.public.apiBase as string,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  client.interceptors.request.use((reqConfig) => {
    const token = authStore.token;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  });

  // Handle 401 responses
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authStore.logout();
        navigateTo('/login');
      }
      return Promise.reject(error);
    }
  );

  return { client };
}

// Import store here to avoid circular dependency at module level
import { useAuthStore } from '~/stores/auth.store';
