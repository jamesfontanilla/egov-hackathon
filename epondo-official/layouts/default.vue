<script setup lang="ts">
const authStore = useAuthStore();
const route = useRoute();

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Budgets', path: '/budgets', icon: '💰' },
    { label: 'Disbursements', path: '/disbursements', icon: '📄' },
  ];

  if (authStore.isCbo) {
    items.push(
      { label: 'COMPASS', path: '/compass', icon: '🧭' },
      { label: 'Audit Trail', path: '/audit', icon: '🔗' },
    );
  }

  items.push({ label: 'Notifications', path: '/notifications', icon: '🔔' });
  return items;
});

function handleLogout() {
  authStore.logout();
  navigateTo('/login');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-primary-700">🇵🇭 ePondo</h1>
        <p class="text-xs text-gray-500 mt-1">Financial Compliance System</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="route.path.startsWith(item.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
            {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.fullName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.user?.role }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full text-left text-sm text-gray-500 hover:text-danger-500 px-2 py-1">
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Mobile header -->
      <header class="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-primary-700">🇵🇭 ePondo</h1>
        <span class="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">{{ authStore.user?.role }}</span>
      </header>

      <main class="flex-1 p-4 md:p-8 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
