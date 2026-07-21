<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
    <div class="flex items-center justify-around py-2">
      <NuxtLink to="/projects" class="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-primary-500" active-class="text-primary-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span class="text-xs">Projects</span>
      </NuxtLink>
      <NuxtLink to="/report" class="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-primary-500" active-class="text-primary-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span class="text-xs">Report</span>
      </NuxtLink>
      <NuxtLink to="/assistant" class="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-primary-500" active-class="text-primary-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span class="text-xs">AI</span>
      </NuxtLink>
      <NuxtLink to="/login" class="flex flex-col items-center gap-1 px-3 py-1 text-gray-500 hover:text-primary-500" active-class="text-primary-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs">Profile</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
