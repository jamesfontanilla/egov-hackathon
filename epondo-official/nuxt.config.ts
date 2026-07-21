export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000',
    },
  },
  app: {
    head: {
      title: 'ePondo — Official Dashboard',
      meta: [
        { name: 'description', content: 'Local Governance Financial Compliance System' },
      ],
    },
  },
});
