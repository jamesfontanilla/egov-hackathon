<script setup lang="ts">
const authStore = useAuthStore();
const budgetStore = useBudgetStore();

const form = reactive({
  fiscal_year: new Date().getFullYear(),
  barangay_name: '',
  parent_lgu_id: '',
  estimated_national_nta: 0,
  estimated_city_rpt_share: 0,
  estimated_local_fees: 0,
});

const totalBudget = computed(() => form.estimated_national_nta + form.estimated_city_rpt_share + form.estimated_local_fees);
const skCeiling = computed(() => totalBudget.value * 0.10);
const calamityCeiling = computed(() => totalBudget.value * 0.05);
const generalFund = computed(() => totalBudget.value - skCeiling.value - calamityCeiling.value);

const submitting = ref(false);
const error = ref('');

async function handleSubmit() {
  if (totalBudget.value <= 0) {
    error.value = 'At least one revenue field must be greater than 0';
    return;
  }
  submitting.value = true;
  error.value = '';
  try {
    const budget = await budgetStore.createBudget(form);
    navigateTo(`/budgets/${budget.id}`);
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || 'Failed to create budget';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Create New Budget</h1>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <!-- Basic Info -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
          <select v-model="form.fiscal_year" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
            <option :value="new Date().getFullYear() + 1">{{ new Date().getFullYear() + 1 }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Barangay Name</label>
          <input v-model="form.barangay_name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Brgy. Poblacion" />
        </div>
      </div>

      <!-- Revenue Inputs -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-700">Revenue Estimates</h3>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Estimated National NTA (₱)</label>
          <input v-model.number="form.estimated_national_nta" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Estimated City RPT Share (₱)</label>
          <input v-model.number="form.estimated_city_rpt_share" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Estimated Local Fees (₱)</label>
          <input v-model.number="form.estimated_local_fees" type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <!-- Calculated Preview -->
      <div class="bg-gray-50 rounded-lg p-4 space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Calculated Allocations</h3>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Total Approved Budget</span>
          <span class="font-bold text-gray-900">₱{{ totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">SK Allocation Ceiling (10% — RA 10742)</span>
          <span class="font-medium text-green-700">₱{{ skCeiling.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Calamity Fund Ceiling (5% — RA 10121)</span>
          <span class="font-medium text-orange-700">₱{{ calamityCeiling.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
        <div class="flex justify-between text-sm border-t pt-2 mt-2">
          <span class="text-gray-600">General Fund Available</span>
          <span class="font-medium text-blue-700">₱{{ generalFund.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
        </div>
      </div>

      <div v-if="error" class="bg-danger-50 text-danger-700 text-sm p-3 rounded-lg">{{ error }}</div>

      <div class="flex gap-3">
        <button type="submit" :disabled="submitting" class="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50">
          {{ submitting ? 'Creating...' : 'Create Budget (DRAFT)' }}
        </button>
        <NuxtLink to="/budgets" class="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
