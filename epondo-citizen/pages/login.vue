<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div class="mb-6">
        <span class="text-5xl">🇵🇭</span>
        <h1 class="text-2xl font-bold text-gray-800 mt-4">Login to ePondo</h1>
        <p class="text-gray-500 mt-2">Sign in with your eGovPH account to file reports and access the AI assistant.</p>
      </div>

      <button
        @click="handleLogin"
        class="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Login with eGovPH
      </button>

      <p class="text-xs text-gray-400 mt-6">
        By logging in, you agree to the ePondo terms of service. Your identity is verified through the Philippine national digital ID system.
      </p>

      <div class="mt-6 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500">Don't need to login?</p>
        <NuxtLink to="/projects" class="text-primary-500 hover:text-primary-600 font-medium text-sm">
          Browse projects without an account →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: 'default' });

const { loginWithEGov } = useAuth();

function handleLogin() {
  loginWithEGov();
}
</script>
