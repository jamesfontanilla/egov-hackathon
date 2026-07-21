<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

definePageMeta({ layout: 'auth' });

const authStore = useAuthStore();
const { client } = useApi();
const mode = ref<'login' | 'register'>('login');
const email = ref('');
const password = ref('');
const firstName = ref('');
const lastName = ref('');
const role = ref('TREASURER');
const loading = ref(false);
const errorMessage = ref('');

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  errorMessage.value = '';
}

async function handleSubmit() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode.value === 'login'
      ? { email: email.value, password: password.value }
      : {
          email: email.value,
          password: password.value,
          first_name: firstName.value,
          last_name: lastName.value,
          role: role.value,
        };
    const { data } = await client.post(endpoint, payload);
    authStore.setAuth(data.data.token, data.data.user);
    navigateTo('/dashboard');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error?.message || 'Unable to authenticate. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-700 mb-2">🇵🇭 ePondo</h1>
        <p class="text-gray-500 text-sm">Local email/password authentication</p>
      </div>

      <div v-if="errorMessage" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
        {{ errorMessage }}
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="mode === 'register'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input v-model="firstName" required class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input v-model="lastName" required class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="email" required type="email" autocomplete="email" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" required type="password" minlength="8" autocomplete="current-password" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select v-model="role" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
            <option value="TREASURER">Treasurer</option>
            <option value="CAPTAIN">Captain</option>
            <option value="CBO_AUDITOR">CBO Auditor</option>
            <option value="CITIZEN">Citizen</option>
          </select>
          <p class="text-xs text-gray-400 mt-1">Role selection is enabled for this local development demo.</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account' }}
        </button>
      </form>

      <button class="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium" @click="toggleMode">
        {{ mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Log in' }}
      </button>
    </div>

    <p class="text-center text-xs text-gray-400 mt-6">Built for eGovHackathon 2026 • DICT</p>
  </div>
</template>
