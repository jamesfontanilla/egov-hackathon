<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="text-center">
      <LoadingDots />
      <p class="mt-4 text-gray-500">Completing login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useAuthStore } from '~/stores/auth.store';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { handleCallback } = useAuth();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code as string;
  if (code) {
    try {
      await handleCallback(code);
      const redirect = (route.query.redirect as string) || '/';
      navigateTo(redirect);
    } catch {
      navigateTo('/login?error=auth_failed');
    }
  } else {
    navigateTo('/login');
  }
});
</script>
