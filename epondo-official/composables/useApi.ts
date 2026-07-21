import axios, { type AxiosInstance } from 'axios';

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const client: AxiosInstance = axios.create({
    baseURL: config.public.apiUrl as string,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((cfg) => {
    if (authStore.token) {
      cfg.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return cfg;
  });

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
