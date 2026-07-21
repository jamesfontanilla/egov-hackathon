<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();
const budgetStore = useBudgetStore();

const budgetId = route.params.id as string;
const showLivenessModal = ref(false);
const showRejectModal = ref(false);
const rejectReason = ref('');
const actionLoading = ref('');
const livenessToken = ref('');
const livenessUrl = ref('');

onMounted(() => budgetStore.fetchBudget(budgetId));

const budget = computed(() => budgetStore.currentBudget);

const statusColor: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-warning-50 text-warning-700',
  OPERATIVE: 'bg-success-50 text-success-700',
  ARCHIVED: 'bg-primary-50 text-primary-700',
};

// Start submission flow (creates liveness session)
async function startSubmission() {
  actionLoading.value = 'submit';
  try {
    const { client } = useApi();
    const { data } = await client.post('/api/identity/liveness/create', {
      action: 'close',
      delay: 2000,
    });
    livenessToken.value = data.data.token;
    livenessUrl.value = data.data.url;
    showLivenessModal.value = true;
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Failed to create liveness session');
  } finally {
    actionLoading.value = '';
  }
}

// After liveness check completes
async function completeLiveness() {
  actionLoading.value = 'submit';
  showLivenessModal.value = false;
  try {
    // Poll liveness result
    const { client } = useApi();
    const { data: livenessResult } = await client.get(`/api/identity/liveness/result/${livenessToken.value}`);

    if (!livenessResult.data.verified) {
      alert(`Liveness check failed. Score: ${livenessResult.data.score}. Minimum: 95.0. Please try again.`);
      return;
    }

    // Submit budget
    await budgetStore.submitBudget(budgetId, livenessToken.value);
    alert('Budget submitted successfully! CBO has been notified via SMS.');
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Submission failed');
  } finally {
    actionLoading.value = '';
  }
}

async function handleApprove() {
  if (!confirm('Approve this budget? This will enable disbursements and anchor the state on eGovchain.')) return;
  actionLoading.value = 'approve';
  try {
    await budgetStore.approveBudget(budgetId);
    alert('Budget approved! Treasurer has been notified via SMS. Blockchain hash recorded.');
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Approval failed');
  } finally {
    actionLoading.value = '';
  }
}

async function handleReject() {
  if (!rejectReason.value.trim()) return;
  actionLoading.value = 'reject';
  try {
    await budgetStore.rejectBudget(budgetId, rejectReason.value);
    showRejectModal.value = false;
    rejectReason.value = '';
    alert('Budget returned to DRAFT. Treasurer has been notified.');
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Rejection failed');
  } finally {
    actionLoading.value = '';
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <NuxtLink to="/budgets" class="text-sm text-primary-600 hover:underline mb-4 inline-block">← Back to Budgets</NuxtLink>

    <div v-if="!budget" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ budget.barangay_name }}</h1>
          <p class="text-gray-500 text-sm">Fiscal Year {{ budget.fiscal_year }}</p>
        </div>
        <span :class="['text-sm px-3 py-1 rounded-full font-medium', statusColor[budget.budget_status]]">
          {{ budget.budget_status }}
        </span>
      </div>

      <!-- Revenue Breakdown -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Revenue Breakdown</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500">National NTA</p>
            <p class="text-lg font-bold">₱{{ Number(budget.estimated_national_nta).toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500">City RPT Share</p>
            <p class="text-lg font-bold">₱{{ Number(budget.estimated_city_rpt_share).toLocaleString() }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500">Local Fees</p>
            <p class="text-lg font-bold">₱{{ Number(budget.estimated_local_fees).toLocaleString() }}</p>
          </div>
        </div>
        <div class="border-t pt-4 flex justify-between items-center">
          <span class="text-sm font-medium text-gray-600">Total Approved Budget</span>
          <span class="text-xl font-bold text-gray-900">₱{{ Number(budget.total_approved_budget).toLocaleString() }}</span>
        </div>
      </div>

      <!-- Statutory Caps -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Statutory Allocation Caps</h2>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">SK Allocation (10% — RA 10742)</span>
              <span class="font-medium text-green-700">₱{{ Number(budget.sk_allocation_ceiling).toLocaleString() }}</span>
            </div>
            <div class="h-3 bg-green-100 rounded-full">
              <div class="h-full bg-green-500 rounded-full" style="width: 10%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Calamity Fund (5% — RA 10121)</span>
              <span class="font-medium text-orange-700">₱{{ Number(budget.calamity_allocation_ceiling).toLocaleString() }}</span>
            </div>
            <div class="h-3 bg-orange-100 rounded-full">
              <div class="h-full bg-orange-500 rounded-full" style="width: 5%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Blockchain Badge -->
      <div v-if="budget.egovchain_tx_hash" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">🔗 Blockchain Verification</h2>
        <div class="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 break-all">
          {{ budget.egovchain_tx_hash }}
        </div>
        <p class="text-xs text-gray-400 mt-2">Anchored on eGovchain (Hyperledger Besu)</p>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Actions</h2>

        <!-- Treasurer: Submit (DRAFT only) -->
        <div v-if="authStore.isTreasurer && budget.budget_status === 'DRAFT'" class="flex gap-3">
          <NuxtLink :to="`/budgets/${budget.id}`" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Edit Budget
          </NuxtLink>
          <button
            @click="startSubmission"
            :disabled="actionLoading === 'submit'"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {{ actionLoading === 'submit' ? 'Processing...' : 'Submit for Review' }}
          </button>
        </div>

        <!-- CBO: Approve/Reject (SUBMITTED only) -->
        <div v-if="authStore.isCbo && budget.budget_status === 'SUBMITTED'" class="flex gap-3">
          <button
            @click="handleApprove"
            :disabled="!!actionLoading"
            class="bg-success-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {{ actionLoading === 'approve' ? 'Approving...' : '✓ Approve' }}
          </button>
          <button
            @click="showRejectModal = true"
            :disabled="!!actionLoading"
            class="bg-danger-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            ✗ Reject
          </button>
        </div>

        <!-- Treasurer: Create Disbursement (OPERATIVE) -->
        <div v-if="authStore.isTreasurer && budget.budget_status === 'OPERATIVE'">
          <NuxtLink :to="`/disbursements/create?budgetId=${budget.id}`" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
            + Create Disbursement
          </NuxtLink>
        </div>

        <p v-if="budget.budget_status === 'ARCHIVED'" class="text-sm text-gray-500">This budget is archived and immutable.</p>
      </div>
    </div>

    <!-- Liveness Modal -->
    <div v-if="showLivenessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 class="text-lg font-bold mb-4">Face Liveness Verification</h3>
        <p class="text-sm text-gray-600 mb-4">Complete the face liveness check to verify your identity. A new window will open.</p>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <p class="text-xs text-gray-500 mb-2">Session Token:</p>
          <p class="font-mono text-xs break-all">{{ livenessToken }}</p>
        </div>
        <div class="flex gap-3">
          <a :href="livenessUrl" target="_blank" class="flex-1 bg-primary-600 text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700">
            Open Liveness Check
          </a>
          <button @click="completeLiveness" class="flex-1 bg-success-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600">
            I Completed the Check
          </button>
        </div>
        <button @click="showLivenessModal = false" class="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold mb-4">Reject Budget</h3>
        <label class="block text-sm text-gray-600 mb-2">Rejection Reason</label>
        <textarea v-model="rejectReason" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4" placeholder="Explain why this budget is being returned..."></textarea>
        <div class="flex gap-3">
          <button @click="handleReject" :disabled="!rejectReason.trim() || actionLoading === 'reject'" class="flex-1 bg-danger-500 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
            {{ actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Rejection' }}
          </button>
          <button @click="showRejectModal = false" class="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
