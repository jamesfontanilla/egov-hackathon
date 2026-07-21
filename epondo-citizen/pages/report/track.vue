<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <NuxtLink to="/report" class="text-primary-500 hover:text-primary-600 flex items-center gap-1 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </NuxtLink>

    <h1 class="text-2xl font-bold text-gray-800 mb-6">Track Your Report</h1>

    <!-- Search -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('report.caseNumber') }}</label>
      <div class="flex gap-3">
        <input
          v-model="caseNumber"
          type="text"
          :placeholder="t('report.trackPlaceholder')"
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @keyup.enter="trackReport"
        />
        <button
          @click="trackReport"
          :disabled="!caseNumber || loading"
          class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Track
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-8">
      <LoadingDots />
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
      {{ error }}
    </div>

    <!-- Case Data -->
    <CaseTracker v-if="caseData" :case-data="caseData" />
  </div>
</template>

<script setup lang="ts">
import { useReport } from '~/composables/useReport';
import { useTranslator } from '~/composables/useTranslator';

definePageMeta({ layout: 'default', middleware: ['citizen-auth'] });

const { t } = useTranslator();
const { trackReport: trackReportApi } = useReport();
const caseNumber = ref('');
const caseData = ref<any>(null);
const loading = ref(false);
const error = ref('');

async function trackReport() {
  if (!caseNumber.value) return;
  loading.value = true;
  error.value = '';
  caseData.value = null;

  try {
    const data = await trackReportApi(caseNumber.value);
    caseData.value = data;
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Report not found. Please check your case number.';
  } finally {
    loading.value = false;
  }
}
</script>
