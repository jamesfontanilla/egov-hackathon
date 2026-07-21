<template>
  <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-6 space-y-4">
    <!-- Welcome message -->
    <div v-if="chatStore.messages.length === 0" class="bg-blue-50 rounded-xl p-5 max-w-lg mx-auto text-center">
      <p class="text-gray-700">{{ t('assistant.welcome') }}</p>
      <ul class="mt-3 text-sm text-gray-600 text-left space-y-1">
        <li>• SK Fund allocation</li>
        <li>• Calamity Fund rules</li>
        <li>• Project spending in your area</li>
        <li>• Philippine budget laws</li>
      </ul>
      <NuxtLink to="/assistant/laws" class="mt-3 inline-block text-primary-500 hover:text-primary-600 text-sm font-medium">
        📜 Browse Laws & Regulations →
      </NuxtLink>
    </div>

    <!-- Messages -->
    <ChatBubble
      v-for="msg in chatStore.messages"
      :key="msg.id"
      :message="msg"
    />

    <!-- Typing indicator -->
    <div v-if="chatStore.isTyping" class="flex items-start gap-2">
      <div class="bg-gray-100 rounded-xl px-4 py-3">
        <LoadingDots />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store';
import { useTranslator } from '~/composables/useTranslator';

const chatStore = useChatStore();
const { t } = useTranslator();
const chatContainer = ref<HTMLElement | null>(null);

// Auto-scroll to bottom on new messages
watch(() => chatStore.messages.length, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
});
</script>
