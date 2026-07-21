<template>
  <div class="space-y-4">
    <!-- Report Type -->
    <div>
      <label class="block text-sm font-medium text-gray-600 mb-1">Report Type</label>
      <select
        v-model="form.reportType"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">Select Type</option>
        <option v-for="type in reportTypes" :key="type.code" :value="type.code">{{ type.name }}</option>
      </select>
    </div>

    <!-- Short description -->
    <div>
      <label class="block text-sm font-medium text-gray-600 mb-1">Short Description (max 200 characters)</label>
      <input
        v-model="form.excerpt"
        type="text"
        maxlength="200"
        placeholder="Brief summary of the issue"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <p class="text-xs text-gray-400 mt-1">{{ form.excerpt.length }}/200</p>
    </div>

    <!-- Full message -->
    <div>
      <label class="block text-sm font-medium text-gray-600 mb-1">Full Complaint Details (max 2000 characters)</label>
      <textarea
        v-model="form.message"
        maxlength="2000"
        rows="5"
        placeholder="Describe the issue in detail..."
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />
      <p class="text-xs text-gray-400 mt-1">{{ form.message.length }}/2000</p>
    </div>

    <!-- Evidence Upload -->
    <EvidenceUpload @update="handleEvidenceUpdate" />
  </div>
</template>

<script setup lang="ts">
import { useReport } from '~/composables/useReport';

const emit = defineEmits<{
  update: [data: Record<string, any>];
}>();

const { getReportTypes } = useReport();
const reportTypes = ref<any[]>([]);

const form = reactive({
  reportType: '',
  excerpt: '',
  message: '',
  evidences: [] as string[],
});

watch(form, () => {
  emit('update', { ...form });
}, { deep: true });

function handleEvidenceUpdate(evidences: string[]) {
  form.evidences = evidences;
}

onMounted(async () => {
  try {
    const data = await getReportTypes();
    reportTypes.value = data.report_types || data || [];
  } catch (e) {
    console.error('Error loading report types:', e);
  }
});
</script>
