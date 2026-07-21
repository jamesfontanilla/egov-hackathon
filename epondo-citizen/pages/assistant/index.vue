<template>
  <div class="flex flex-col h-[calc(100vh-64px)]">
    <!-- Header bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-primary-500 text-white">
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold">🤖 {{ t('assistant.title') }}</span>
      </div>
      <div class="flex items-center gap-3">
        <!-- Credits -->
        <span v-if="chatStore.credits" class="text-sm bg-white/20 px-2 py-0.5 rounded">
          {{ t('assistant.credits') }}: {{ chatStore.credits.remaining }}/{{ chatStore.credits.total }}
        </span>
        <!-- Language toggle -->
        <LanguageToggle />
      </div>
    </div>

    <!-- Low credits warning -->
    <div v-if="chatStore.hasLowCredits && !chatStore.hasNoCredits" class="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-700">
      ⚠️ {{ t('assistant.lowCredits') }}
    </div>
    <div v-if="chatStore.hasNoCredits" class="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
      🚫 {{ t('assistant.noCredits') }}
    </div>

    <!-- Chat Window -->
    <ChatWindow />

    <!-- Suggested Questions (when no messages) -->
    <SuggestedQuestions v-if="chatStore.messages.length === 0" @select="handleSuggestion" />

    <!-- Chat Input -->
    <ChatInput :disabled="chatStore.hasNoCredits" @send="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store';
import { useAssistant } from '~/composables/useAssistant';
import { useTranslator } from '~/composables/useTranslator';

definePageMeta({ layout: 'app', middleware: ['citizen-auth'] });

const chatStore = useChatStore();
const { sendMessage, checkCredits } = useAssistant();
const { t } = useTranslator();

function handleSend(message: string) {
  sendMessage(message);
}

function handleSuggestion(question: string) {
  sendMessage(question);
}

onMounted(() => {
  checkCredits();
});
</script>
