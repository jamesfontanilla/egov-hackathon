<script setup lang="ts">
const loading = ref(true);
const syncing = ref(false);
const compassData = ref<any>(null);
const lgsfData = ref<any>(null);
const lguId = ref('');

onMounted(async () => {
  try {
    const { client } = useApi();
    // For demo, try first available LGU
    // In production, this would come from the CBO's assigned LGU
    const { data: budgets } = await client.get('/api/budgets');
    if (budgets.data?.[0]?.parent_lgu_id) {
      lguId.value = budgets.data[0].parent_lgu_id;
      const { data } = await client.get(`/api/compass/nca/${lguId.value}`);
      compassData.value = data.data;
    }
  } catch { /* ignore */ }
  loading.value = false;
});

async function triggerSync() {
  if (!lguId.value) return;
  syncing.value = true;
  try {
    const { client } = useApi();
    const { data } = await client.post(`/api/compass/sync/${lguId.value}`, {
      budgetYear: new Date().getFullYear(),
    });
    compassData.value = {
      macroNtaCeiling: data.data.newCeiling,
      lastSyncedAt: data.data.syncedAt,
    };
    alert(`Sync complete! ${data.data.recordsFetched} records fetched. Ceiling: ₱${data.data.newCeiling?.toLocaleString()}`);
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Sync failed');
  } finally {
    syncing.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">🧭 DBM COMPASS Data</h1>
        <p class="text-sm text-gray-500">National budget execution data for macro ceiling validation</p>
      </div>
      <button
        @click="triggerSync"
        :disabled="syncing || !lguId"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {{ syncing ? 'Syncing...' : '🔄 Sync Now' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else>
      <!-- Macro Ceiling Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Macro NTA Ceiling</p>
          <p class="text-2xl font-bold text-gray-900">₱{{ compassData?.macroNtaCeiling?.toLocaleString() || '—' }}</p>
          <p class="text-xs text-gray-400 mt-2">From DBM COMPASS NCA records</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">LGSF Allocation</p>
          <p class="text-2xl font-bold text-gray-900">₱{{ compassData?.macroLgsfAllocation?.toLocaleString() || '—' }}</p>
          <p class="text-xs text-gray-400 mt-2">Local Government Support Fund</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Last Synced</p>
          <p class="text-lg font-medium text-gray-900">
            {{ compassData?.lastSyncedAt ? new Date(compassData.lastSyncedAt).toLocaleString() : 'Never' }}
          </p>
          <p class="text-xs text-gray-400 mt-2">Auto-refreshes every 24h</p>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">About COMPASS Data</h2>
        <div class="text-sm text-gray-600 space-y-2">
          <p>COMPASS (Centralized Open Monitoring Platform for Appropriations and Spending Statistics) provides:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>SAAODB</strong> — Statement of Appropriations, Allotments, Obligations, and Disbursements</li>
            <li><strong>NCA</strong> — Notice of Cash Allocation (used for macro ceiling)</li>
            <li><strong>SARO</strong> — Special Allotment Release Order</li>
            <li><strong>LGSF</strong> — Local Government Support Fund allocations</li>
          </ul>
          <p class="mt-3 text-xs text-gray-400">
            The macro NTA ceiling is cross-referenced when approving barangay budgets to ensure local estimates don't exceed national allocations.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
