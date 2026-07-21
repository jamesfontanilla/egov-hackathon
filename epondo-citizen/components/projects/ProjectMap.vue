<template>
  <div ref="mapContainer" class="w-full h-[400px] md:h-[500px]" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
  projects: Array<Record<string, any>>;
}>();

const emit = defineEmits<{
  markerClick: [project: Record<string, any>];
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let markersLayer: any = null;

onMounted(async () => {
  if (!mapContainer.value) return;

  // Dynamically import leaflet (client-side only)
  const L = await import('leaflet');

  map = L.map(mapContainer.value).setView([12.8797, 121.7740], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  addMarkers(L);
});

watch(() => props.projects, async () => {
  if (!map) return;
  const L = await import('leaflet');
  addMarkers(L);
});

function addMarkers(L: any) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  for (const project of props.projects) {
    if (project.latitude && project.longitude) {
      const marker = L.marker([project.latitude, project.longitude]);
      marker.bindPopup(`
        <div class="p-2">
          <strong>${project.projectName || project.name || 'Project'}</strong><br/>
          <span>₱${new Intl.NumberFormat('en-PH').format(project.amount || 0)}</span><br/>
          <em>${project.fundCategory || 'General'} • ${project.status || 'Active'}</em>
        </div>
      `);
      marker.on('click', () => emit('markerClick', project));
      markersLayer.addLayer(marker);
    }
  }
}

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
