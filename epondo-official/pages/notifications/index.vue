<script setup lang="ts">
const notifications = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { client } = useApi();
    const { data } = await client.get('/api/notifications');
    notifications.value = data.data || [];
  } catch { /* ignore */ }
  loading.value = false;
});

const eventIcon: Record<string, string> = {
  BUDGET_SUBMITTED: '📤',
  BUDGET_APPROVED: '✅',
  BUDGET_REJECTED: '❌',
  LARGE_DISBURSEMENT: '💸',
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">🔔 Notifications</h1>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="notifications.length === 0" class="text-center py-12 text-gray-500">
      <p>No notifications yet.</p>
      <p class="text-sm mt-1">SMS notifications will appear here when budget events occur.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
      >
        <span class="text-lg">{{ eventIcon[notif.trigger_event] || '📱' }}</span>
        <div class="flex-1">
          <p class="text-sm text-gray-900">{{ notif.message_body }}</p>
          <div class="flex items-center gap-3 mt-2">
            <span class="text-xs text-gray-400">{{ new Date(notif.sent_at).toLocaleString() }}</span>
            <span class="text-xs text-gray-400">→ {{ notif.recipient_mobile }}</span>
            <span :class="['text-xs px-2 py-0.5 rounded-full', notif.emessage_status_code === 201 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
              {{ notif.emessage_status_code === 201 ? 'Delivered' : 'Failed' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
