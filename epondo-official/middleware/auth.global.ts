export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Load token from localStorage on first visit
  if (!authStore.isAuthenticated) {
    authStore.loadFromStorage();
  }

  const publicPages = ['/login', '/callback'];
  const isPublicPage = publicPages.some(p => to.path.startsWith(p));

  if (!authStore.isAuthenticated && !isPublicPage) {
    return navigateTo('/login');
  }

  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }
});
