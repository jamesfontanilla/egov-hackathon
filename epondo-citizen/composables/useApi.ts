import axios, { type AxiosInstance } from 'axios';

export function useApi() {
  const config = useRuntimeConfig();

  const client: AxiosInstance = axios.create({
    baseURL: config.public.apiBase as string,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests (only if available)
  client.interceptors.request.use((reqConfig) => {
    if (import.meta.client) {
      const token = localStorage.getItem('epondo_token');
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return reqConfig;
  });

  // Handle 401 responses — only redirect if on a protected page
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && import.meta.client) {
        // Only redirect to login if the current page requires auth
        // Don't redirect on public pages like /projects
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/projects', '/about', '/login', '/callback'];
        const isPublicPage = publicPaths.some(p => currentPath === p || currentPath.startsWith('/projects/'));

        if (!isPublicPage) {
          localStorage.removeItem('epondo_token');
          localStorage.removeItem('epondo_user');
          navigateTo('/login');
        }
      }
      return Promise.reject(error);
    }
  );

  return { client };
}
