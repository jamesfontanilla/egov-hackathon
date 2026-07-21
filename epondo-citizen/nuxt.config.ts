// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-01',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ePondo — Transparent Local Governance',
      short_name: 'ePondo',
      theme_color: '#1a56db',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
  },

  app: {
    head: {
      title: 'ePondo — Transparent Local Governance',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Track your barangay budget, report issues, and ask questions powered by eGov APIs.' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' },
      ],
    },
  },
});
