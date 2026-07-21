<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Back button -->
    <NuxtLink to="/projects" class="text-primary-500 hover:text-primary-600 flex items-center gap-1 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Projects
    </NuxtLink>

    <div v-if="loading" class="flex justify-center py-12">
      <LoadingDots />
    </div>

    <div v-else>
      <!-- Barangay Header -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ barangayData?.name || 'Barangay' }}</h1>
        <p class="text-gray-500 mb-6">Budget summary and project status</p>

        <!-- Budget Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-sm text-blue-600 font-medium">Total Budget</p>
            <p class="text-2xl font-bold text-blue-800">₱{{ formatAmount(barangayData?.totalBudget || 0) }}</p>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <p class="text-sm text-green-600 font-medium">SK Fund Ceiling</p>
            <p class="text-2xl font-bold text-green-800">₱{{ formatAmount(barangayData?.skCeiling || 0) }}</p>
            <div class="mt-2 bg-green-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" :style="{ width: `${barangayData?.skUtilization || 0}%` }" />
            </div>
            <p class="text-xs text-green-600 mt-1">{{ barangayData?.skUtilization || 0 }}% utilized</p>
          </div>
          <div class="bg-orange-50 rounded-lg p-4">
            <p class="text-sm text-orange-600 font-medium">Calamity Fund Ceiling</p>
            <p class="text-2xl font-bold text-orange-800">₱{{ formatAmount(barangayData?.calamityCeiling || 0) }}</p>
            <div class="mt-2 bg-orange-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" :style="{ width: `${barangayData?.calamityUtilization || 0}%` }" />
            </div>
            <p class="text-xs text-orange-600 mt-1">{{ barangayData?.calamityUtilization || 0 }}% utilized</p>
          </div>
        </div>

        <!-- Blockchain badge -->
        <div v-if="barangayData?.blockchainHash" class="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">🔗 Blockchain Verified</span>
          <code class="text-xs">{{ barangayData.blockchainHash.slice(0, 16) }}...</code>
        </div>
      </div>

      <!-- Disbursements / Projects -->
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Active Projects & Disbursements</h2>
      <div class="space-y-4">
        <div
          v-for="item in disbursements"
          :key="item.id"
          class="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h3 class="font-semibold text-gray-800">{{ item.projectName }}</h3>
            <p class="text-gray-500 text-sm">{{ item.description }}</p>
            <div class="flex gap-2 mt-2">
              <span :class="fundBadgeClass(item.fundCategory)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ item.fundCategory }}
              </span>
              <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {{ item.status }}
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-gray-800">₱{{ formatAmount(item.amount) }}</p>
            <NuxtLink
              to="/report"
              class="text-red-500 hover:text-red-600 text-sm font-medium mt-1 inline-block"
            >
              Report a Problem →
            </NuxtLink>
          </div>
        </div>

        <div v-if="disbursements.length === 0" class="text-center py-8 text-gray-500">
          No active projects found for this barangay.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi';

definePageMeta({ layout: 'default' });

const route = useRoute();
const { client } = useApi();
const loading = ref(true);
const barangayData = ref<any>(null);
const disbursements = ref<any[]>([]);

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PH').format(amount);
}

function fundBadgeClass(category: string): string {
  switch (category?.toUpperCase()) {
    case 'SK': return 'bg-green-100 text-green-700';
    case 'CALAMITY': return 'bg-orange-100 text-orange-700';
    default: return 'bg-blue-100 text-blue-700';
  }
}

async function fetchBarangayData() {
  loading.value = true;
  try {
    const barangayCode = route.params.barangay as string;
    const { data } = await client.get('/api/budgets', {
      params: { barangay_code: barangayCode, public: true },
    });
    // Process the response
    if (data.budget) {
      barangayData.value = data.budget;
      disbursements.value = data.budget.disbursements || [];
    } else if (Array.isArray(data)) {
      barangayData.value = data[0] || {};
      disbursements.value = data[0]?.disbursements || [];
    } else {
      barangayData.value = data;
      disbursements.value = data.disbursements || [];
    }
  } catch (e) {
    console.error('Error fetching barangay data:', e);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchBarangayData);
</script>
