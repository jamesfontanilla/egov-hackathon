<template>
  <div class="space-y-6">
    <!-- Step 1: Face Liveness -->
    <div v-if="step === 1" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <FaceLiveness @complete="handleLivenessComplete" @error="handleLivenessError" />
    </div>

    <!-- Step 2: Submit for verification -->
    <div v-if="step === 2" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Confirm Your Information</h3>
      <p class="text-sm text-gray-500 mb-4">
        Your face liveness check passed. Now we'll verify your identity against the National ID system.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input v-model="form.first_name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <input v-model="form.last_name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Middle Name</label>
          <input v-model="form.middle_name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Suffix</label>
          <input v-model="form.suffix" type="text" placeholder="Jr., Sr., III..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Birth Date</label>
          <input v-model="form.birth_date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <button
        @click="submitVerification"
        :disabled="verifying || !form.first_name || !form.last_name || !form.birth_date"
        class="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
      >
        {{ verifying ? 'Verifying...' : 'Verify My Identity' }}
      </button>

      <p v-if="verifyError" class="text-red-500 text-sm mt-3">{{ verifyError }}</p>
    </div>

    <!-- Step 3: Verified -->
    <div v-if="step === 3" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
      <div class="text-5xl mb-4">🛡️</div>
      <h3 class="text-xl font-bold text-green-700 mb-2">Identity Verified</h3>
      <p class="text-gray-500 text-sm">Your identity has been verified against the Philippine National ID system.</p>
      <p class="text-xs text-gray-400 mt-2">Reference: {{ verifyResult?.reference }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi';
import { useAuthStore } from '~/stores/auth.store';

const emit = defineEmits<{
  verified: [result: any];
}>();

const { client } = useApi();
const authStore = useAuthStore();

const step = ref(1);
const livenessSessionId = ref('');
const verifying = ref(false);
const verifyError = ref('');
const verifyResult = ref<any>(null);

// Pre-fill from auth store
const form = reactive({
  first_name: authStore.user?.firstName || '',
  middle_name: '',
  last_name: authStore.user?.lastName || '',
  suffix: '',
  birth_date: '',
});

function handleLivenessComplete(data: { sessionId: string; photoUrl: string }) {
  livenessSessionId.value = data.sessionId;
  step.value = 2;
}

function handleLivenessError(message: string) {
  console.error('Liveness error:', message);
}

async function submitVerification() {
  verifying.value = true;
  verifyError.value = '';

  try {
    // Send to backend: personal info + face_liveness_session_id
    const { data } = await client.post('/api/identity/verify', {
      first_name: form.first_name,
      middle_name: form.middle_name || undefined,
      last_name: form.last_name,
      suffix: form.suffix || undefined,
      birth_date: form.birth_date,
      face_liveness_session_id: livenessSessionId.value,
    });

    if (data.success) {
      verifyResult.value = data.data;
      step.value = 3;
      emit('verified', data.data);
    } else {
      verifyError.value = data.error?.message || 'Verification failed.';
    }
  } catch (error: any) {
    verifyError.value = error.response?.data?.error?.message || 'Verification failed. Please try again.';
  } finally {
    verifying.value = false;
  }
}
</script>
