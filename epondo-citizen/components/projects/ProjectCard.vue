<template>
  <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-semibold text-gray-800 line-clamp-2">{{ project.projectName || project.name }}</h3>
      <span :class="fundBadgeClass" class="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ml-2">
        {{ project.fundCategory || 'General' }}
      </span>
    </div>

    <p class="text-sm text-gray-500 mb-3">{{ project.barangayName || 'Unknown Barangay' }}</p>

    <div class="flex items-center justify-between">
      <p class="text-lg font-bold text-primary-500">
        ₱{{ formatAmount(project.amount || 0) }}
      </p>
      <span :class="statusClass" class="px-2 py-0.5 rounded-full text-xs font-medium">
        {{ project.status || 'Active' }}
      </span>
    </div>

    <NuxtLink
      v-if="project.barangayCode"
      :to="`/projects/${project.barangayCode}`"
      class="mt-3 block text-primary-500 hover:text-primary-600 text-sm font-medium"
    >
      View Details →
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  project: Record<string, any>;
}>();

const fundBadgeClass = computed(() => {
  switch (props.project.fundCategory?.toUpperCase()) {
    case 'SK': return 'bg-green-100 text-green-700';
    case 'CALAMITY': return 'bg-orange-100 text-orange-700';
    default: return 'bg-blue-100 text-blue-700';
  }
});

const statusClass = computed(() => {
  switch (props.project.status?.toUpperCase()) {
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'OPERATIVE': return 'bg-blue-100 text-blue-700';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-700';
    default: return 'bg-yellow-100 text-yellow-700';
  }
});

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-PH').format(amount);
}
</script>
