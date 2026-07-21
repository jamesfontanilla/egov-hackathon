<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <span class="text-5xl mb-4 block">🛡️</span>
      <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ t('report.title') }}</h1>
      <p class="text-gray-600 text-lg max-w-xl mx-auto">
        {{ t('report.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink
        to="/report/submit"
        class="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all text-center group"
      >
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ t('report.newReport') }}</h2>
        <p class="text-gray-500">File a new geotagged complaint with evidence and OTP verification.</p>
      </NuxtLink>

      <NuxtLink
        to="/report/track"
        class="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all text-center group"
      >
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ t('report.trackReport') }}</h2>
        <p class="text-gray-500">Check the status of an existing report using your case number.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslator } from '~/composables/useTranslator';

definePageMeta({ layout: 'default', middleware: ['citizen-auth'] });
const { t } = useTranslator();
</script>
