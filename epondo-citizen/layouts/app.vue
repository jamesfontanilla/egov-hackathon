<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <PublicHeader />
    <main class="flex-1">
      <slot />
    </main>
    <PublicFooter />
    <MobileNav />
  </div>
</template>
