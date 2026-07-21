<template>
  <div class="h-screen flex flex-col bg-white">
    <header class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-primary-500 text-white">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="text-white hover:text-primary-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <span class="text-lg font-semibold">🤖 ePondo AI Assistant</span>
      </div>
      <slot name="header-right" />
    </header>
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
