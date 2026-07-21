<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <NuxtLink to="/assistant" class="text-primary-500 hover:text-primary-600 flex items-center gap-1 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to AI Assistant
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">📜 Laws & Regulations</h1>
      <p class="text-gray-500">Ask questions about Philippine budget laws and local governance regulations.</p>
      <p class="text-xs text-gray-400 mt-1">Powered by eGov AI — Laws & Regulations</p>
    </div>

    <!-- Pre-built queries -->
    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
      <h3 class="font-medium text-gray-700 mb-3">Common Questions</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="q in preBuiltQueries"
          :key="q"
          @click="askQuestion(q)"
          class="text-left bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors"
        >
          {{ q }}
        </button>
      </div>
    </div>

    <!-- Input -->
    <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Ask a Question</label>
      <div class="flex gap-3">
        <input
          v-model="query"
          type="text"
          placeholder="What does RA 7160 say about..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @keyup.enter="askQuestion(query)"
        />
        <button
          @click="askQuestion(query)"
          :disabled="!query || loading"
          class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          Ask
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-8">
      <LoadingDots />
    </div>

    <!-- Response -->
    <div v-if="response" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-lg">🤖</span>
        <span class="font-medium text-gray-700">AI Response</span>
      </div>
      <div class="prose prose-sm max-w-none text-gray-700" v-html="renderedResponse" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked';
import { useAssistant } from '~/composables/useAssistant';

definePageMeta({ layout: 'default', middleware: ['citizen-auth'] });

const { sendLawsQuery } = useAssistant();
const query = ref('');
const response = ref('');
const loading = ref(false);

const preBuiltQueries = [
  'What does RA 7160 say about barangay budget preparation?',
  'What are the penalties for exceeding SK allocation?',
  'What is the role of the City Budget Officer in budget approval?',
  'What does RA 10742 say about SK fund allocation?',
];

const renderedResponse = computed(() => {
  if (!response.value) return '';
  return marked(response.value);
});

async function askQuestion(q: string) {
  if (!q) return;
  loading.value = true;
  response.value = '';

  try {
    response.value = await sendLawsQuery(q);
  } catch (e: any) {
    response.value = 'Error: Could not get a response. Please try again.';
  } finally {
    loading.value = false;
    query.value = '';
  }
}
</script>
