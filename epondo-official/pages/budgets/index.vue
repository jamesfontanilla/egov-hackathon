<script setup lang="ts">
const budgetStore = useBudgetStore();
const authStore = useAuthStore();

onMounted(() => budgetStore.fetchBudgets());

const statusColor: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-warning-50 text-warning-700',
  OPERATIVE: 'bg-success-50 text-success-700',
  ARCHIVED: 'bg-primary-50 text-primary-700',
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Budgets</h1>
      <NuxtLink
        v-if="authStore.isTreasurer"
        to="/budgets/create"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
      >
        + New Budget
      </NuxtLink>
    </div>

    <div v-if="budgetStore.loading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="budgetStore.budgets.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg">No budgets found</p>
      <p class="text-sm mt-1">Create your first budget to get started.</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 font-medium text-gray-500">Barangay</th>
            <th class="text-left px-6 py-3 font-medium text-gray-500">Fiscal Year</th>
            <th class="text-right px-6 py-3 font-medium text-gray-500">Total Budget</th>
            <th class="text-center px-6 py-3 font-medium text-gray-500">Status</th>
            <th class="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="budget in budgetStore.budgets" :key="budget.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ budget.barangay_name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ budget.fiscal_year }}</td>
            <td class="px-6 py-4 text-right text-gray-900 font-medium">₱{{ budget.total_approved_budget?.toLocaleString() }}</td>
            <td class="px-6 py-4 text-center">
              <span :class="['text-xs px-2.5 py-1 rounded-full font-medium', statusColor[budget.budget_status]]">
                {{ budget.budget_status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/budgets/${budget.id}`" class="text-primary-600 hover:underline text-sm">
                View
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
