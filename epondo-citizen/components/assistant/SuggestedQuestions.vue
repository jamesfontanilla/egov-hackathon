<template>
  <div class="px-4 py-4 border-t border-gray-100 bg-gray-50">
    <p class="text-xs text-gray-500 font-medium mb-2">Suggested Questions:</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="q in questions"
        :key="q"
        @click="emit('select', q)"
        class="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
      >
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store';

const emit = defineEmits<{
  select: [question: string];
}>();

const chatStore = useChatStore();

const questionsEn = [
  'What is the SK 10% allocation under RA 10742?',
  'How is the calamity fund calculated?',
  'Can I check my barangay\'s budget status?',
  'What laws govern local government budgets?',
];

const questionsFil = [
  'Ano ang 10% SK allocation sa RA 10742?',
  'Paano kinakalkula ang calamity fund?',
  'Pwede ko bang tingnan ang budget ng barangay namin?',
  'Anong batas ang sumasaklaw sa budget ng LGU?',
];

const questions = computed(() =>
  chatStore.language === 'fil' ? questionsFil : questionsEn
);
</script>
