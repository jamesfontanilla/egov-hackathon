<template>
  <section class="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <span class="text-6xl mb-4 block">🇵🇭</span>
      <h1 class="text-4xl md:text-5xl font-bold mb-4">ePondo</h1>
      <p class="text-xl md:text-2xl font-light mb-2">Transparent Local Governance for Every Filipino</p>
      <p class="text-base md:text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
        Track your barangay's budget, report issues, and ask questions powered by eGov APIs.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/projects"
          class="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          📊 View Projects
        </NuxtLink>
        <NuxtLink
          to="/report"
          class="bg-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors"
        >
          🛡️ File a Report
        </NuxtLink>
        <NuxtLink
          to="/assistant"
          class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
        >
          🤖 Ask AI
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
