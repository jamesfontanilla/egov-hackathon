<template>
  <div class="text-center">
    <!-- Step 1: Ready to verify -->
    <div v-if="status === 'idle'" class="space-y-4">
      <div class="text-5xl">📸</div>
      <h3 class="text-lg font-semibold text-gray-800">Face Liveness Verification</h3>
      <p class="text-gray-500 text-sm max-w-sm mx-auto">
        We need to verify your identity using the PhilSys National ID system. This requires a live face scan.
      </p>
      <button
        @click="startVerification"
        :disabled="loading"
        class="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
      >
        {{ loading ? 'Loading...' : 'Start Face Verification' }}
      </button>
    </div>

    <!-- Step 2: In progress -->
    <div v-if="status === 'in_progress'" class="space-y-4">
      <LoadingDots />
      <p class="text-gray-500">Face liveness check in progress...</p>
      <p class="text-xs text-gray-400">Please follow the on-screen instructions.</p>
    </div>

    <!-- Step 3: Success -->
    <div v-if="status === 'completed'" class="space-y-4">
      <div class="text-5xl">✅</div>
      <h3 class="text-lg font-semibold text-green-700">Liveness Check Passed</h3>
      <p class="text-gray-500 text-sm">Session ID: {{ sessionId?.slice(0, 8) }}...</p>
    </div>

    <!-- Step 4: Error -->
    <div v-if="status === 'error'" class="space-y-4">
      <div class="text-5xl">❌</div>
      <h3 class="text-lg font-semibold text-red-700">Verification Failed</h3>
      <p class="text-red-500 text-sm">{{ errorMessage }}</p>
      <button
        @click="reset"
        class="text-primary-500 hover:text-primary-600 font-medium text-sm"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi';

const emit = defineEmits<{
  complete: [data: { sessionId: string; photoUrl: string }];
  error: [message: string];
}>();

const { client } = useApi();
const status = ref<'idle' | 'in_progress' | 'completed' | 'error'>('idle');
const loading = ref(false);
const sessionId = ref('');
const errorMessage = ref('');

async function startVerification() {
  loading.value = true;
  status.value = 'in_progress';

  try {
    // 1. Get the pubkey from backend
    const { data } = await client.get('/api/identity/liveness/pubkey');
    const pubkey = data.data.pubkey;

    // 2. Call the Face Liveness SDK
    // window.eKYC() is loaded from the SDK script in nuxt.config.ts
    const eKYC = (window as any).eKYC;
    if (!eKYC) {
      throw new Error('Face Liveness SDK not loaded. Please refresh the page.');
    }

    const response = await eKYC().start({ pubkey });

    // 3. SDK response: { status: "COMPLETED", result: { photo, session_id, photo_url } }
    if (response.status === 'COMPLETED') {
      sessionId.value = response.result.session_id;
      const photoUrl = response.result.photo_url;

      status.value = 'completed';
      emit('complete', { sessionId: sessionId.value, photoUrl });
    } else {
      throw new Error('Liveness check was not completed.');
    }
  } catch (error: any) {
    status.value = 'error';
    errorMessage.value = error.message || 'Liveness check error or cancelled.';
    emit('error', errorMessage.value);
  } finally {
    loading.value = false;
  }
}

function reset() {
  status.value = 'idle';
  sessionId.value = '';
  errorMessage.value = '';
}
</script>
