<script setup lang="ts">
const route = useRoute();
const budgetId = route.query.budgetId as string;

const form = reactive({
  project_name: '',
  project_description: '',
  fund_category: 'GENERAL_FUND',
  amount: 0,
  payee_supplier_name: '',
  voucher_reference: '',
  authorized_by_philsys_id: '',
  liveness_session_id: '',
  voucher_file_url: '',
  ai_extracted_data: null as any,
});

const livenessToken = ref('');
const livenessUrl = ref('');
const showLiveness = ref(false);
const submitting = ref(false);
const error = ref('');
const extracting = ref(false);

// Start liveness before submission
async function startVerification() {
  if (!form.project_name || !form.amount || !form.payee_supplier_name || !form.voucher_reference) {
    error.value = 'Please fill all required fields';
    return;
  }
  error.value = '';
  try {
    const { client } = useApi();
    const { data } = await client.post('/api/identity/liveness/create', { action: 'close', delay: 2000 });
    livenessToken.value = data.data.token;
    livenessUrl.value = data.data.url;
    showLiveness.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || 'Failed to start verification';
  }
}

async function completeLivenessAndSubmit() {
  showLiveness.value = false;
  submitting.value = true;
  error.value = '';

  try {
    const { client } = useApi();
    // Check liveness result
    const { data: livenessResult } = await client.get(`/api/identity/liveness/result/${livenessToken.value}`);
    if (!livenessResult.data.verified) {
      error.value = `Liveness failed. Score: ${livenessResult.data.score}. Required: 95.0`;
      return;
    }

    form.liveness_session_id = livenessToken.value;
    form.authorized_by_philsys_id = livenessToken.value; // Using liveness token as proxy

    // Create disbursement
    const { data } = await client.post(`/api/budgets/${budgetId}/disbursements`, form);
    alert('Disbursement created successfully!');
    navigateTo('/disbursements');
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || 'Disbursement creation failed';
  } finally {
    submitting.value = false;
  }
}

// Document extraction via eGov AI
async function extractDocument(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  extracting.value = true;
  try {
    const { client } = useApi();
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post('/api/ai/extract-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    form.ai_extracted_data = data.data;
    alert('Document parsed! Review extracted data below.');
  } catch {
    alert('Document extraction failed. Please fill fields manually.');
  } finally {
    extracting.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <NuxtLink to="/disbursements" class="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back</NuxtLink>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Disbursement</h1>

    <form @submit.prevent="startVerification" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
        <input v-model="form.project_name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea v-model="form.project_description" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fund Category *</label>
          <select v-model="form.fund_category" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="GENERAL_FUND">General Fund</option>
            <option value="SK_FUND">SK Fund (10%)</option>
            <option value="CALAMITY_FUND">Calamity Fund (5%)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Amount (₱) *</label>
          <input v-model.number="form.amount" type="number" min="0.01" step="0.01" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Payee / Supplier *</label>
        <input v-model="form.payee_supplier_name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Voucher Reference *</label>
        <input v-model="form.voucher_reference" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="DV-2026-001" />
      </div>

      <!-- Document Upload -->
      <div class="border border-dashed border-gray-300 rounded-lg p-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Upload Voucher (AI Extraction)</label>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" @change="extractDocument" class="text-sm" />
        <p v-if="extracting" class="text-xs text-primary-600 mt-2">🤖 Extracting document data...</p>
        <div v-if="form.ai_extracted_data" class="mt-2 bg-green-50 rounded p-2 text-xs text-green-700">
          ✓ AI extraction complete
        </div>
      </div>

      <div v-if="error" class="bg-danger-50 text-danger-700 text-sm p-3 rounded-lg">{{ error }}</div>

      <button type="submit" :disabled="submitting" class="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50">
        {{ submitting ? 'Creating...' : 'Verify Identity & Create Disbursement' }}
      </button>
    </form>

    <!-- Liveness Modal -->
    <div v-if="showLiveness" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 class="text-lg font-bold mb-4">Face Liveness Verification</h3>
        <p class="text-sm text-gray-600 mb-4">Complete the liveness check to authorize this disbursement.</p>
        <div class="flex gap-3">
          <a :href="livenessUrl" target="_blank" class="flex-1 bg-primary-600 text-white text-center py-2.5 rounded-lg text-sm font-medium">
            Open Liveness Check
          </a>
          <button @click="completeLivenessAndSubmit" class="flex-1 bg-success-500 text-white py-2.5 rounded-lg text-sm font-medium">
            Done — Submit
          </button>
        </div>
        <button @click="showLiveness = false" class="w-full mt-3 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  </div>
</template>
