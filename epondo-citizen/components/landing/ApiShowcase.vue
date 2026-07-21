<template>
  <section class="py-16 px-4 bg-gray-50">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Powered by 6 eGov APIs</h2>
      <p class="text-gray-600 mb-8">Built on the official Philippine government digital infrastructure.</p>

      <div class="flex flex-wrap justify-center gap-3">
        <span
          v-for="api in apis"
          :key="api"
          class="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm"
        >
          {{ api }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const apis = [
  '🪪 National ID (eVerify)',
  '📸 Face Liveness',
  '🧭 COMPASS',
  '📩 eMessage',
  '📝 eReport',
  '🤖 eGov AI',
];
</script>
