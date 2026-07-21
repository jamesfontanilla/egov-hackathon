<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h1>
    <p class="text-gray-500 mb-8">
      Verify your identity using the Philippine National ID (PhilSys) to unlock full platform features.
    </p>

    <IdentityVerification @verified="handleVerified" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: ['citizen-auth'] });

function handleVerified(result: any) {
  // Could update user profile to mark as verified
  console.log('Identity verified:', result);
}
</script>
