<script setup lang="ts">
definePageMeta({ layout: false });

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadFromStorage();
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard');
  } else {
    navigateTo('/login');
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-gray-500">Redirecting...</p>
  </div>
</template>
