<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Public Projects</h1>
    <p class="text-gray-600 mb-8">Browse local government projects and track how funds are being used.</p>

    <!-- Barangay Selector -->
    <BarangaySelector @select="handleBarangaySelect" />

    <!-- View Toggle -->
    <div class="flex items-center gap-4 my-6">
      <button
        @click="view = 'map'"
        :class="[view === 'map' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700']"
        class="px-4 py-2 rounded-lg font-medium transition-colors"
      >
        🗺️ Map View
      </button>
      <button
        @click="view = 'list'"
        :class="[view === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700']"
        class="px-4 py-2 rounded-lg font-medium transition-colors"
      >
        📋 List View
      </button>
    </div>

    <!-- Map View -->
    <div v-if="view === 'map'" class="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <ProjectMap :projects="projects" @marker-click="goToBarangay" />
    </div>

    <!-- List View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
      <div v-if="projects.length === 0 && !loading" class="col-span-full text-center py-12 text-gray-500">
        No projects found. Try selecting a different location.
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingDots />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi';

definePageMeta({ layout: 'default' });

const { client } = useApi();
const view = ref<'map' | 'list'>('list');
const projects = ref<any[]>([]);
const loading = ref(false);

async function fetchProjects() {
  loading.value = true;
  try {
    const { data } = await client.get('/api/budgets', {
      params: { status: 'OPERATIVE,ARCHIVED', public: 'true' },
    });
    projects.value = data.data || data.budgets || [];
  } catch (e: any) {
    // Don't crash on auth errors — projects page is public
    // Budget data just won't show until user logs in
    console.error('Error fetching projects:', e.message);
    projects.value = [];
  } finally {
    loading.value = false;
  }
}

function handleBarangaySelect(barangay: { code: string; name: string }) {
  if (barangay.code) {
    navigateTo(`/projects/${barangay.code}`);
  }
}

function goToBarangay(project: any) {
  if (project.barangayCode) {
    navigateTo(`/projects/${project.barangayCode}`);
  }
}

onMounted(fetchProjects);
</script>
