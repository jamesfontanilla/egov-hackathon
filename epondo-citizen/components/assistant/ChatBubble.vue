<template>
  <div :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
    <div
      :class="[
        'max-w-[80%] md:max-w-[70%] rounded-xl px-4 py-3',
        message.role === 'user'
          ? 'bg-primary-500 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      ]"
    >
      <!-- User message -->
      <p v-if="message.role === 'user'" class="text-sm whitespace-pre-wrap">{{ message.content }}</p>

      <!-- AI message (markdown) -->
      <div
        v-else
        class="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-primary-500"
        v-html="renderedContent"
      />

      <!-- Timestamp -->
      <p :class="['text-xs mt-1', message.role === 'user' ? 'text-blue-200' : 'text-gray-400']">
        {{ formatTime(message.timestamp) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';
import type { ChatMessage } from '~/stores/chat.store';

const props = defineProps<{
  message: ChatMessage;
}>();

const renderedContent = computed(() => {
  if (props.message.role === 'user') return '';
  return marked(props.message.content || '');
});

function formatTime(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}
</script>
