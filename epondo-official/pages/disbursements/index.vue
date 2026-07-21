<script setup lang="ts">
const budgetStore = useBudgetStore();
const disbursements = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  await budgetStore.fetchBudgets();
  // Fetch disbursements for operative budgets
  const operative = budgetStore.budgets.find(b => b.budget_status === 'OPERATIVE');
  if (operative) {
    try {
      const { client } = useApi();
      const { data } = await client.get(`/api/budgets/${operative.id}/disbursements`);
      disbursements.value = data.data || [];
    } catch { /* ignore */ }
  }
  loading.value = false;
});

const fundBadge: Record<string, string> = {
  SK_FUND: 'bg-green-100 text-green-700',
  CALAMITY_FUND: 'bg-orange-100 text-orange-700',
  GENERAL_FUND: 'bg-blue-100 text-blue-700',
};

const statusBadge: Record<string, string> = {
  PENDING: 'bg-warning-50 text-warning-700',
  APPROVED: 'bg-success-50 text-success-700',
  REJECTED: 'bg-danger-50 text-danger-700',
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Disbursements</h1>
      <NuxtLink
        v-if="budgetStore.operativeBudgets.length > 0"
        :to="`/disbursements/create?budgetId=${budgetStore.operativeBudgets[0]?.id}`"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
      >
        + New Disbursement
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="disbursements.length === 0" class="text-center py-12 text-gray-500">
      <p>No disbursements yet.</p>
      <p class="text-sm mt-1">Disbursements can be created once a budget is OPERATIVE.</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 font-medium text-gray-500">Project</th>
            <th class="text-left px-6 py-3 font-medium text-gray-500">Fund</th>
            <th class="text-right px-6 py-3 font-medium text-gray-500">Amount</th>
            <th class="text-left px-6 py-3 font-medium text-gray-500">Payee</th>
            <th class="text-center px-6 py-3 font-medium text-gray-500">Status</th>
            <th class="text-left px-6 py-3 font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="d in disbursements" :key="d.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ d.project_name }}</td>
            <td class="px-6 py-4">
              <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', fundBadge[d.fund_category]]">
                {{ d.fund_category.replace('_FUND', '') }}
              </span>
            </td>
            <td class="px-6 py-4 text-right font-medium">₱{{ parseFloat(d.amount).toLocaleString() }}</td>
            <td class="px-6 py-4 text-gray-600">{{ d.payee_supplier_name }}</td>
            <td class="px-6 py-4 text-center">
              <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusBadge[d.status]]">
                {{ d.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500 text-xs">{{ new Date(d.created_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
