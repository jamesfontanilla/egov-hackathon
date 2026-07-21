<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-gray-800">{{ mode === 'login' ? 'Login to ePondo' : 'Create your ePondo account' }}</h1>
        <p class="text-gray-500 mt-2">Use your local email and password.</p>
      </div>

      <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
        {{ errorMessage }}
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="mode === 'register'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input v-model="firstName" required autocomplete="given-name" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input v-model="lastName" required autocomplete="family-name" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="email" required type="email" autocomplete="email" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" required type="password" minlength="8" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
          <p v-if="mode === 'register'" class="text-xs text-gray-400 mt-1">At least 8 characters.</p>
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Mobile <span class="font-normal text-gray-400">(optional)</span></label>
          <input v-model="mobile" type="tel" autocomplete="tel" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account' }}
        </button>
      </form>

      <button class="w-full mt-4 text-primary-500 hover:text-primary-600 text-sm font-medium" @click="toggleMode">
        {{ mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Log in' }}
      </button>

      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
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
import { useApi } from '~/composables/useApi';

definePageMeta({ layout: 'default' });

const route = useRoute();
const authStore = useAuthStore();
const mode = ref<'login' | 'register'>('login');
const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const mobile = ref('');
const loading = ref(false);
const errorMessage = ref('');

onMounted(() => {
  authStore.loadFromStorage();
  if (authStore.isLoggedIn) navigateTo('/');
});

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  errorMessage.value = '';
}

async function handleSubmit() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const { client } = useApi();
    const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode.value === 'login'
      ? { email: email.value, password: password.value }
      : {
          email: email.value,
          password: password.value,
          first_name: firstName.value,
          last_name: lastName.value,
          mobile: mobile.value,
        };
    const { data } = await client.post(endpoint, payload);

    authStore.setAuth(data.data.token, data.data.user);
    navigateTo('/');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error?.message || 'Unable to authenticate. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>
