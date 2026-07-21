<template>
  <button
    @click="toggle"
    class="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-sm transition-colors"
    :aria-label="`Switch to ${chatStore.language === 'en' ? 'Filipino' : 'English'}`"
  >
    <span class="font-medium">{{ chatStore.language === 'en' ? 'EN' : 'FIL' }}</span>
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store';
import { useTranslator } from '~/composables/useTranslator';

const chatStore = useChatStore();
const { setLanguage } = useTranslator();

function toggle() {
  const newLang = chatStore.language === 'en' ? 'fil' : 'en';
  chatStore.setLanguage(newLang);
  setLanguage(newLang);
}
</script>
