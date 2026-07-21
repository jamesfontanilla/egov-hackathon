<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div class="mb-6">
        <span class="text-5xl">🇵🇭</span>
        <h1 class="text-2xl font-bold text-gray-800 mt-4">Login to ePondo</h1>
        <p class="text-gray-500 mt-2">
          Sign in with your eGovPH account.
        </p>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Exchange code input (hackathon demo) -->
      <div class="text-left mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">eGovPH Exchange Code</label>
        <input
          v-model="exchangeCode"
          type="text"
          placeholder="Paste exchange code from eGovPH"
          class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @keyup.enter="handleLogin"
        />
        <p class="text-xs text-gray-400 mt-1">
          Get a code from the <a href="https://platforms.e.gov.ph/dashboard/api-catalogs/egov-sso" target="_blank" class="text-primary-500 underline">eGovPH test panel</a> using test account: josie@yopmail.com
        </p>
      </div>

      <button
        @click="handleLogin"
        :disabled="!exchangeCode || loading"
        class="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        <span v-if="loading">Authenticating...</span>
        <span v-else>Login with eGovPH</span>
      </button>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500">Don't need to login?</p>
        <NuxtLink to="/projects" class="text-primary-500 hover:text-primary-600 font-medium text-sm">
          Browse projects without an account →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

definePageMeta({ layout: 'default' });

const route = useRoute();
const authStore = useAuthStore();
const exchangeCode = ref('');
const loading = ref(false);
const errorMessage = ref('');

onMounted(() => {
  authStore.loadFromStorage();
  if (authStore.isLoggedIn) {
    navigateTo('/');
  }
  const error = route.query.error as string;
  if (error === 'auth_failed') errorMessage.value = 'Authentication failed. Please try again.';
  if (error === 'no_code') errorMessage.value = 'No exchange code received.';
});

async function handleLogin() {
  if (!exchangeCode.value) return;
  loading.value = true;
  errorMessage.value = '';

  try {
    const { client } = useApi();
    const { data } = await client.post('/api/auth/callback', {
      exchange_code: exchangeCode.value,
    });

    if (data.success) {
      authStore.setAuth(data.data.token, data.data.user);
      navigateTo('/');
    } else {
      errorMessage.value = data.error?.message || 'Login failed.';
    }
  } catch (error: any) {
    const apiError = error.response?.data?.error;
    errorMessage.value = apiError?.code === 'EGOV_PARTNER_FORBIDDEN'
      ? 'eGovPH denied this partner application. Ask the eGov administrator to enable SSO_AUTHENTICATION for this partner.'
      : apiError?.message || 'Authentication failed. Check your exchange code.';
  } finally {
    loading.value = false;
  }
}

import { useApi } from '~/composables/useApi';
</script>
