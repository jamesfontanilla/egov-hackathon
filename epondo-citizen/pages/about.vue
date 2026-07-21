<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">About ePondo</h1>

    <div class="prose prose-lg max-w-none space-y-6">
      <p class="text-gray-600 text-lg">
        ePondo is a public transparency platform for local governance in the Philippines.
        It enables citizens to track their barangay's budget, report issues, and access
        AI-powered budget analysis through local email/password authentication and government APIs.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-lg text-gray-800 mb-2">📊 Budget Tracking</h3>
          <p class="text-gray-600">View how funds are allocated across SK, Calamity, and General funds in your barangay.</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-lg text-gray-800 mb-2">🛡️ Verified Reports</h3>
          <p class="text-gray-600">File geotagged complaints with OTP verification for accountability.</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-lg text-gray-800 mb-2">🤖 AI Assistant</h3>
          <p class="text-gray-600">Ask questions about local budget laws and regulations in English or Filipino.</p>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-lg text-gray-800 mb-2">🔗 Blockchain Anchored</h3>
          <p class="text-gray-600">All budget approvals are recorded on eGovchain for tamper-proof audit trails.</p>
        </div>
      </div>

      <div class="mt-10 bg-blue-50 p-6 rounded-lg">
        <h3 class="font-semibold text-lg text-blue-800 mb-2">Government APIs Used</h3>
        <div class="flex flex-wrap gap-2">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">National ID</span>
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Face Liveness</span>
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">COMPASS</span>
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">eMessage</span>
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">eReport</span>
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">eGov AI</span>
        </div>
      </div>

      <div class="mt-8 text-center text-gray-500 text-sm">
        <p>Built for eGovHackathon 2026 • Department of Information and Communications Technology (DICT)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });
</script>
