import { defineStore } from 'pinia';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  language: 'en' | 'fil';
  isTyping: boolean;
  credits: { total: number; remaining: number } | null;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [],
    language: 'en',
    isTyping: false,
    credits: null,
  }),

  getters: {
    hasLowCredits: (state) => state.credits !== null && state.credits.remaining < 20,
    hasNoCredits: (state) => state.credits !== null && state.credits.remaining <= 0,
  },

  actions: {
    addMessage(message: ChatMessage) {
      this.messages.push(message);
    },

    setTyping(typing: boolean) {
      this.isTyping = typing;
    },

    setLanguage(lang: 'en' | 'fil') {
      this.language = lang;
    },

    setCredits(credits: { total: number; remaining: number }) {
      this.credits = credits;
    },

    clearMessages() {
      this.messages = [];
    },
  },
});
