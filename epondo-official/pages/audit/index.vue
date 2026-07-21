<script setup lang="ts">
const logs = ref<any[]>([]);
const loading = ref(true);
const page = ref(1);
const total = ref(0);

async function fetchLogs() {
  loading.value = true;
  try {
    const { client } = useApi();
    const { data } = await client.get('/api/audit/logs', { params: { page: page.value, limit: 20 } });
    logs.value = data.data;
    total.value = data.pagination.total;
  } catch { /* ignore */ }
  loading.value = false;
}

onMounted(fetchLogs);

const actionIcon: Record<string, string> = {
  BUDGET_CREATED: '📝',
  BUDGET_SUBMITTED: '📤',
  BUDGET_APPROVED: '✅',
  BUDGET_REJECTED: '❌',
  BUDGET_ARCHIVED: '📦',
  DISBURSEMENT_CREATED: '💸',
  DISBURSEMENT_APPROVED: '✓',
  LIVENESS_SESSION_CREATED: '📸',
  LIVENESS_RESULT_CHECKED: '🔍',
  IDENTITY_VERIFIED: '🆔',
  COMPASS_SYNC: '🧭',
  USER_LOGIN: '🔑',
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">🔗 Audit Trail</h1>
    <p class="text-sm text-gray-500 mb-6">Immutable log of all system actions and blockchain anchoring events</p>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="log in logs"
        :key="log.id"
        class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
      >
        <span class="text-xl">{{ actionIcon[log.action] || '📋' }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-medium text-gray-900">{{ log.action }}</span>
            <span v-if="log.api_name" class="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
              {{ log.api_name }}
            </span>
          </div>
          <p class="text-xs text-gray-500">
            {{ log.entity_type }} • {{ log.entity_id?.slice(0, 8) }}...
          </p>
          <p v-if="log.metadata" class="text-xs text-gray-400 mt-1 font-mono truncate">
            {{ typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata) }}
          </p>
        </div>
        <span class="text-xs text-gray-400 whitespace-nowrap">
          {{ new Date(log.created_at).toLocaleString() }}
        </span>
      </div>

      <!-- Pagination -->
      <div v-if="total > 20" class="flex justify-center gap-2 pt-4">
        <button @click="page--; fetchLogs()" :disabled="page <= 1" class="px-3 py-1 border rounded text-sm disabled:opacity-30">Prev</button>
        <span class="px-3 py-1 text-sm text-gray-600">Page {{ page }}</span>
        <button @click="page++; fetchLogs()" :disabled="logs.length < 20" class="px-3 py-1 border rounded text-sm disabled:opacity-30">Next</button>
      </div>
    </div>
  </div>
</template>
