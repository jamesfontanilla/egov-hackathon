<script setup lang="ts">
definePageMeta({ layout: 'auth' });

const config = useRuntimeConfig();
const loading = ref(false);

function loginWithEgov() {
  loading.value = true;
  // In production: redirect to eGovPH SSO authorization URL
  // For hackathon demo: simulate with a mock exchange code
  window.location.href = `${config.public.apiUrl}/api/auth/login`;
}

// Demo login (for development without real eGov SSO)
async function demoLogin(role: string) {
  loading.value = true;
  try {
    const { client } = useApi();
    const { data } = await client.post('/api/auth/callback', {
      exchange_code: 'demo_exchange_code',
      role,
    });
    const authStore = useAuthStore();
    authStore.setAuth(data.data.token, data.data.user);
    navigateTo('/dashboard');
  } catch (err) {
    alert('Login failed. Ensure backend is running.');
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
        <p class="text-gray-500 text-sm">Local Governance Financial Compliance System</p>
      </div>

      <button
        @click="loginWithEgov"
        :disabled="loading"
        class="w-full bg-egov-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span v-if="loading">Connecting...</span>
        <span v-else>Login with eGov SSO</span>
      </button>

      <!-- Demo login section (development only) -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-xs text-gray-400 text-center mb-4">Demo Login (Development)</p>
        <div class="grid grid-cols-2 gap-2">
          <button @click="demoLogin('TREASURER')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors">
            Treasurer
          </button>
          <button @click="demoLogin('CAPTAIN')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors">
            Captain
          </button>
          <button @click="demoLogin('CBO_AUDITOR')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors">
            CBO Auditor
          </button>
          <button @click="demoLogin('CITIZEN')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors">
            Citizen
          </button>
        </div>
      </div>
    </div>

    <p class="text-center text-xs text-gray-400 mt-6">
      Built for eGovHackathon 2026 • DICT
    </p>
  </div>
</template>
