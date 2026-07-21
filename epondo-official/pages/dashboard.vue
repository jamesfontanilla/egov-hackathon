<script setup lang="ts">
const authStore = useAuthStore();
const budgetStore = useBudgetStore();

onMounted(async () => {
  await budgetStore.fetchBudgets();
});

const activeBudget = computed(() => {
  return budgetStore.budgets.find(b => b.budget_status !== 'ARCHIVED') || budgetStore.budgets[0];
});

const skUsed = ref(0);
const calamityUsed = ref(0);

// Fetch disbursement totals for active budget
watch(activeBudget, async (budget) => {
  if (budget?.budget_status === 'OPERATIVE') {
    try {
      const { client } = useApi();
      const { data } = await client.get(`/api/budgets/${budget.id}/disbursements`);
      const disbursements = data.data || [];
      skUsed.value = disbursements
        .filter((d: any) => d.fund_category === 'SK_FUND' && d.status !== 'REJECTED')
        .reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
      calamityUsed.value = disbursements
        .filter((d: any) => d.fund_category === 'CALAMITY_FUND' && d.status !== 'REJECTED')
        .reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);
    } catch { /* ignore */ }
  }
}, { immediate: true });

const statusColor: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-warning-50 text-warning-700',
  OPERATIVE: 'bg-success-50 text-success-700',
  ARCHIVED: 'bg-primary-50 text-primary-700',
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        Welcome back, {{ authStore.user?.firstName }}
      </h1>
      <p class="text-gray-500 text-sm mt-1">
        {{ authStore.isCbo ? 'City Budget Office Dashboard' : 'Barangay Budget Management' }}
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500 mb-1">Active Budget</p>
        <p class="text-lg font-bold text-gray-900">
          {{ activeBudget ? `FY ${activeBudget.fiscal_year}` : 'None' }}
        </p>
        <span v-if="activeBudget" :class="['text-xs px-2 py-0.5 rounded-full font-medium', statusColor[activeBudget.budget_status]]">
          {{ activeBudget.budget_status }}
        </span>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500 mb-1">SK Fund (10%)</p>
        <p class="text-lg font-bold text-gray-900">
          ₱{{ skUsed.toLocaleString() }} / ₱{{ (activeBudget?.sk_allocation_ceiling || 0).toLocaleString() }}
        </p>
        <div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="activeBudget && skUsed / activeBudget.sk_allocation_ceiling > 0.9 ? 'bg-danger-500' : skUsed / (activeBudget?.sk_allocation_ceiling || 1) > 0.7 ? 'bg-warning-500' : 'bg-success-500'"
            :style="{ width: `${Math.min((skUsed / (activeBudget?.sk_allocation_ceiling || 1)) * 100, 100)}%` }"
          ></div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500 mb-1">Calamity Fund (5%)</p>
        <p class="text-lg font-bold text-gray-900">
          ₱{{ calamityUsed.toLocaleString() }} / ₱{{ (activeBudget?.calamity_allocation_ceiling || 0).toLocaleString() }}
        </p>
        <div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="activeBudget && calamityUsed / activeBudget.calamity_allocation_ceiling > 0.9 ? 'bg-danger-500' : calamityUsed / (activeBudget?.calamity_allocation_ceiling || 1) > 0.7 ? 'bg-warning-500' : 'bg-success-500'"
            :style="{ width: `${Math.min((calamityUsed / (activeBudget?.calamity_allocation_ceiling || 1)) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 class="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink v-if="authStore.isTreasurer" to="/budgets/create" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          + Create Budget
        </NuxtLink>
        <NuxtLink to="/disbursements" class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          View Disbursements
        </NuxtLink>
        <NuxtLink v-if="authStore.isCbo" to="/compass" class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          🧭 COMPASS Data
        </NuxtLink>
      </div>
    </div>

    <!-- Budget List (CBO sees pending reviews) -->
    <div v-if="authStore.isCbo && budgetStore.submittedBudgets.length > 0" class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-sm font-semibold text-gray-700 mb-4">⏳ Pending Reviews ({{ budgetStore.submittedBudgets.length }})</h2>
      <div class="space-y-3">
        <div
          v-for="budget in budgetStore.submittedBudgets"
          :key="budget.id"
          class="flex items-center justify-between p-3 bg-warning-50 rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-900">{{ budget.barangay_name }}</p>
            <p class="text-xs text-gray-500">FY{{ budget.fiscal_year }} • ₱{{ budget.total_approved_budget?.toLocaleString() }}</p>
          </div>
          <NuxtLink :to="`/budgets/${budget.id}`" class="text-sm text-primary-600 hover:underline font-medium">
            Review →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
