<template>
  <section class="py-16 px-4 bg-primary-500 text-white">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-4">Ready to make your barangay more transparent?</h2>
      <p class="text-blue-100 mb-8">Browse projects, file reports, or ask the AI assistant about local budget laws.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/projects" class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Get Started
        </NuxtLink>
        <NuxtLink to="/about" class="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
          Learn More
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
