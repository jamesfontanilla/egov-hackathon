<template>
  <footer class="bg-gray-800 text-gray-300 py-8 hidden md:block">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-white font-semibold mb-3">🇵🇭 ePondo</h3>
          <p class="text-sm">Transparent Local Governance for Every Filipino. Powered by local authentication and government APIs.</p>
        </div>
        <div>
          <h3 class="text-white font-semibold mb-3">Quick Links</h3>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/projects" class="hover:text-white transition-colors">View Projects</NuxtLink></li>
            <li><NuxtLink to="/report" class="hover:text-white transition-colors">File a Report</NuxtLink></li>
            <li><NuxtLink to="/assistant" class="hover:text-white transition-colors">AI Assistant</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-white transition-colors">About</NuxtLink></li>
          </ul>
        </div>
        <div>
          <h3 class="text-white font-semibold mb-3">Powered By</h3>
          <p class="text-sm">National ID • Face Liveness • COMPASS • eMessage • eReport • eGov AI</p>
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
        Built for eGovHackathon 2026 • DICT
      </div>
    </div>
  </footer>
</template>
