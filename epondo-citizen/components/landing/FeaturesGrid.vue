<template>
  <section class="py-16 px-4 bg-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">Why ePondo?</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center p-6 rounded-xl bg-blue-50 border border-blue-100">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('features.budget') }}</h3>
          <p class="text-gray-600">{{ t('features.budgetDesc') }}</p>
        </div>
        <div class="text-center p-6 rounded-xl bg-green-50 border border-green-100">
          <div class="text-4xl mb-4">🛡️</div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('features.verified') }}</h3>
          <p class="text-gray-600">{{ t('features.verifiedDesc') }}</p>
        </div>
        <div class="text-center p-6 rounded-xl bg-purple-50 border border-purple-100">
          <div class="text-4xl mb-4">🔗</div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('features.blockchain') }}</h3>
          <p class="text-gray-600">{{ t('features.blockchainDesc') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useTranslator } from '~/composables/useTranslator';
const { t } = useTranslator();
</script>
