import { useChatStore } from '~/stores/chat.store';
import { useApi } from '~/composables/useApi';

export function useAssistant() {
  const chatStore = useChatStore();
  const { client } = useApi();

  async function sendMessage(prompt: string) {
    // 1. Add user message
    chatStore.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    });

    // 2. Set typing
    chatStore.setTyping(true);

    try {
      let processedPrompt = prompt;

      // 3. Translate if Filipino
      if (chatStore.language === 'fil') {
        const { data: translated } = await client.post('/api/ai/translate', {
          prompt,
          source_lang: 'fil',
          target_lang: 'en',
        });
        processedPrompt = translated.translated || translated.result || prompt;
      }

      // 4. Send to AI
      const { data: aiResponse } = await client.post('/api/ai/assistant', {
        prompt: processedPrompt,
        category: 'PH',
      });

      // Backend returns: { success, data: { ...eGovAI response } }
      // eGovAI response might have: response, result, answer, data, or content field
      const aiData = aiResponse.data || aiResponse;
      let responseContent = aiData.response || aiData.result || aiData.answer || aiData.data || aiData.content || aiData.message || JSON.stringify(aiData);

      // 5. Translate response back if Filipino
      if (chatStore.language === 'fil' && responseContent) {
        const { data: translatedBack } = await client.post('/api/ai/translate', {
          prompt: responseContent,
          source_lang: 'en',
          target_lang: 'fil',
        });
        responseContent = translatedBack.translated || translatedBack.result || responseContent;
      }

      // 6. Add AI response
      chatStore.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      chatStore.addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      });
    } finally {
      chatStore.setTyping(false);
    }
  }

  async function sendLawsQuery(prompt: string) {
    chatStore.setTyping(true);
    try {
      let processedPrompt = prompt;

      if (chatStore.language === 'fil') {
        const { data: translated } = await client.post('/api/ai/translate', {
          prompt,
          source_lang: 'fil',
          target_lang: 'en',
        });
        processedPrompt = translated.translated || translated.result || prompt;
      }

      const { data } = await client.post('/api/ai/laws', {
        prompt: processedPrompt,
        category: 'PH',
      });

      const aiData = data.data || data;
      let responseContent = aiData.response || aiData.result || aiData.answer || aiData.data || aiData.content || aiData.message || JSON.stringify(aiData);

      if (chatStore.language === 'fil' && responseContent) {
        const { data: translatedBack } = await client.post('/api/ai/translate', {
          prompt: responseContent,
          source_lang: 'en',
          target_lang: 'fil',
        });
        responseContent = translatedBack.translated || translatedBack.result || responseContent;
      }

      return responseContent;
    } finally {
      chatStore.setTyping(false);
    }
  }

  async function checkCredits() {
    try {
      const { data } = await client.get('/api/ai/credits');
      chatStore.setCredits({
        total: data.credits_total,
        remaining: data.credits_remaining,
      });
      return data;
    } catch {
      return null;
    }
  }

  return {
    sendMessage,
    sendLawsQuery,
    checkCredits,
  };
}
