<script setup lang="ts">
definePageMeta({ layout: 'auth' });

const route = useRoute();
const authStore = useAuthStore();
const error = ref('');
const loading = ref(true);

onMounted(async () => {
  const exchangeCode = route.query.code as string;
  if (!exchangeCode) {
    error.value = 'No exchange code received from eGov SSO';
    loading.value = false;
    return;
  }

  try {
    const { client } = useApi();
    const { data } = await client.post('/api/auth/callback', {
      exchange_code: exchangeCode,
    });
    authStore.setAuth(data.data.token, data.data.user);
    navigateTo('/dashboard');
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || 'Authentication failed';
    loading.value = false;
  }
});
</script>

<template>
  <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
    <div v-if="loading">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600">Verifying your identity...</p>
    </div>
    <div v-else-if="error">
      <p class="text-danger-500 font-medium mb-4">{{ error }}</p>
      <NuxtLink to="/login" class="text-primary-600 hover:underline text-sm">Back to login</NuxtLink>
    </div>
  </div>
</template>
