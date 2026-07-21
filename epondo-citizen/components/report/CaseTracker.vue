<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <!-- Case header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-500">Case Number</p>
        <p class="text-xl font-bold text-gray-800">{{ caseData.case_number || caseData.caseNumber }}</p>
      </div>
      <span :class="statusBadgeClass" class="px-3 py-1 rounded-full text-sm font-medium">
        {{ caseData.status }}
      </span>
    </div>

    <!-- Timeline -->
    <div class="space-y-4 mb-6">
      <div v-for="(event, index) in timeline" :key="index" class="flex gap-4">
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-3 h-3 rounded-full',
              event.active ? 'bg-primary-500' : event.completed ? 'bg-green-500' : 'bg-gray-300'
            ]"
          />
          <div v-if="index < timeline.length - 1" class="w-0.5 h-8 bg-gray-200" />
        </div>
        <div class="pb-4">
          <p :class="['font-medium text-sm', event.active || event.completed ? 'text-gray-800' : 'text-gray-400']">
            {{ event.label }}
          </p>
          <p v-if="event.date" class="text-xs text-gray-500">{{ formatDate(event.date) }}</p>
          <p v-if="event.description" class="text-xs text-gray-500 mt-1">{{ event.description }}</p>
        </div>
      </div>
    </div>

    <!-- Original complaint -->
    <div class="border-t border-gray-200 pt-4">
      <h4 class="font-medium text-gray-800 mb-2">Complaint Details</h4>
      <p class="text-sm text-gray-600">{{ caseData.excerpt || caseData.message }}</p>
      <div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
        <span v-if="caseData.barangay_name">📍 {{ caseData.barangay_name }}</span>
        <span v-if="caseData.report_type">📋 {{ caseData.report_type }}</span>
      </div>
    </div>

    <!-- Mini map -->
    <div v-if="caseData.latitude && caseData.longitude" class="mt-4">
      <div ref="miniMap" class="w-full h-[200px] rounded-lg border border-gray-200" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  caseData: Record<string, any>;
}>();

const miniMap = ref<HTMLElement | null>(null);
let map: any = null;

const statusBadgeClass = computed(() => {
  switch (props.caseData.status?.toLowerCase()) {
    case 'resolved': return 'bg-green-100 text-green-700';
    case 'under review': case 'in_progress': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-blue-100 text-blue-700';
  }
});

const timeline = computed(() => {
  const status = props.caseData.status?.toLowerCase();
  return [
    { label: 'Submitted', completed: true, active: status === 'submitted', date: props.caseData.created_at, description: '' },
    { label: 'Under Review', completed: ['under review', 'in_progress', 'resolved'].includes(status), active: status === 'under review' || status === 'in_progress', date: props.caseData.reviewed_at, description: '' },
    { label: 'Resolved', completed: status === 'resolved', active: status === 'resolved', date: props.caseData.resolved_at, description: props.caseData.resolution || '' },
  ];
});

function formatDate(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

onMounted(async () => {
  if (miniMap.value && props.caseData.latitude && props.caseData.longitude) {
    const L = await import('leaflet');
    map = L.map(miniMap.value).setView([props.caseData.latitude, props.caseData.longitude], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    L.marker([props.caseData.latitude, props.caseData.longitude]).addTo(map);
  }
});

onBeforeUnmount(() => {
  if (map) { map.remove(); map = null; }
});
</script>
