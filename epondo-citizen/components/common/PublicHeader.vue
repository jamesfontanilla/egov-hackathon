<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl">🇵🇭</span>
          <span class="text-xl font-bold text-primary-500">ePondo</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink to="/projects" class="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            Projects
          </NuxtLink>
          <NuxtLink to="/report" class="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            Report
          </NuxtLink>
          <NuxtLink to="/assistant" class="text-gray-600 hover:text-primary-500 font-medium transition-colors">
            AI Assistant
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            Login
          </NuxtLink>
        </nav>

        <!-- Mobile menu button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4 space-y-2">
        <NuxtLink to="/projects" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" @click="mobileMenuOpen = false">
          Projects
        </NuxtLink>
        <NuxtLink to="/report" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" @click="mobileMenuOpen = false">
          Report
        </NuxtLink>
        <NuxtLink to="/assistant" class="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded" @click="mobileMenuOpen = false">
          AI Assistant
        </NuxtLink>
        <NuxtLink
          to="/login"
          class="block px-3 py-2 bg-primary-500 text-white rounded text-center"
          @click="mobileMenuOpen = false"
        >
          Login
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false);
</script>
