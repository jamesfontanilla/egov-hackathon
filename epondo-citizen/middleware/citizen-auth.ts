import { useAuthStore } from '~/stores/auth.store';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Load from storage if not loaded
  if (!authStore.token) {
    authStore.loadFromStorage();
  }

  if (!authStore.isLoggedIn) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
