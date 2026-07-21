<template>
  <div class="border-t border-gray-200 bg-white px-4 py-3">
    <div class="flex items-center gap-3 max-w-3xl mx-auto">
      <input
        v-model="message"
        type="text"
        :placeholder="t('assistant.placeholder')"
        :disabled="disabled"
        class="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
        @keyup.enter="send"
      />
      <button
        @click="send"
        :disabled="!message.trim() || disabled"
        class="bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :aria-label="t('assistant.send')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslator } from '~/composables/useTranslator';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  send: [message: string];
}>();

const { t } = useTranslator();
const message = ref('');

function send() {
  const trimmed = message.value.trim();
  if (!trimmed) return;
  emit('send', trimmed);
  message.value = '';
}
</script>
