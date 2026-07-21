<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="text-center">
      <LoadingDots />
      <p class="mt-4 text-gray-500">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

definePageMeta({ layout: 'default' });

const route = useRoute();
const authStore = useAuthStore();
const message = ref('Completing login...');

onMounted(() => {
  // eGovPH SSO callback: backend redirects here with token & user in query params
  const token = route.query.token as string;
  const userStr = route.query.user as string;
  const error = route.query.error as string;

  if (error) {
    message.value = 'Login failed. Redirecting...';
    setTimeout(() => navigateTo('/login?error=' + error), 1500);
    return;
  }

  if (token && userStr) {
    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      authStore.setAuth(token, user);
      message.value = 'Login successful! Redirecting...';
      setTimeout(() => navigateTo('/'), 500);
    } catch {
      message.value = 'Error processing login. Redirecting...';
      setTimeout(() => navigateTo('/login?error=parse_error'), 1500);
    }
  } else {
    message.value = 'No credentials received. Redirecting...';
    setTimeout(() => navigateTo('/login'), 1500);
  }
});
</script>
