import { useAuthStore } from '~/stores/auth.store';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  authStore.loadFromStorage();
});
