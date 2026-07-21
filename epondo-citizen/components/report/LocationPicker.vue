<template>
  <div class="space-y-4">
    <!-- Cascading dropdowns -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Region</label>
        <select v-model="form.regionCode" @change="onRegionChange" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
          <option value="">Select Region</option>
          <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Province</label>
        <select v-model="form.provinceCode" @change="onProvinceChange" :disabled="!form.regionCode" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100">
          <option value="">Select Province</option>
          <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
        <select v-model="form.municipalityCode" @change="onMunicipalityChange" :disabled="!form.provinceCode" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100">
          <option value="">Select Municipality</option>
          <option v-for="m in municipalities" :key="m.code" :value="m.code">{{ m.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Barangay</label>
        <select v-model="form.barangayCode" @change="onBarangayChange" :disabled="!form.municipalityCode" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100">
          <option value="">Select Barangay</option>
          <option v-for="b in barangays" :key="b.code" :value="b.code">{{ b.name }}</option>
        </select>
      </div>
    </div>

    <!-- Map -->
    <div>
      <label class="block text-sm font-medium text-gray-600 mb-1">Pin Location on Map</label>
      <div ref="mapContainer" class="w-full h-[300px] rounded-lg border border-gray-300" />
      <p class="text-xs text-gray-400 mt-1">
        Drag the marker to pinpoint the exact location. Lat: {{ form.latitude?.toFixed(5) || '—' }}, Lng: {{ form.longitude?.toFixed(5) || '—' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReport } from '~/composables/useReport';

const emit = defineEmits<{
  update: [data: Record<string, any>];
}>();

const { getRegions, getProvinces, getMunicipalities, getBarangays } = useReport();

const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let marker: any = null;

const regions = ref<any[]>([]);
const provinces = ref<any[]>([]);
const municipalities = ref<any[]>([]);
const barangays = ref<any[]>([]);

const form = reactive({
  regionCode: '',
  regionName: '',
  provinceCode: '',
  provinceName: '',
  municipalityCode: '',
  municipalityName: '',
  barangayCode: '',
  barangayName: '',
  latitude: 14.5995 as number | null,
  longitude: 120.9842 as number | null,
});

// Watch form changes to emit updates
watch(form, () => {
  emit('update', { ...form });
}, { deep: true });

async function loadRegions() {
  try {
    const data = await getRegions();
    regions.value = data.regions || data || [];
  } catch (e) {
    console.error('Error loading regions:', e);
  }
}

async function onRegionChange() {
  form.provinceCode = '';
  form.municipalityCode = '';
  form.barangayCode = '';
  provinces.value = [];
  municipalities.value = [];
  barangays.value = [];

  const region = regions.value.find((r: any) => r.code === form.regionCode);
  form.regionName = region?.name || '';

  if (form.regionCode) {
    const data = await getProvinces(form.regionCode);
    provinces.value = data.provinces || data || [];
  }
}

async function onProvinceChange() {
  form.municipalityCode = '';
  form.barangayCode = '';
  municipalities.value = [];
  barangays.value = [];

  const province = provinces.value.find((p: any) => p.code === form.provinceCode);
  form.provinceName = province?.name || '';

  if (form.provinceCode) {
    const data = await getMunicipalities(form.provinceCode);
    municipalities.value = data.municipalities || data || [];
  }
}

async function onMunicipalityChange() {
  form.barangayCode = '';
  barangays.value = [];

  const municipality = municipalities.value.find((m: any) => m.code === form.municipalityCode);
  form.municipalityName = municipality?.name || '';

  if (form.municipalityCode) {
    const data = await getBarangays(form.municipalityCode);
    barangays.value = data.barangays || data || [];
  }
}

function onBarangayChange() {
  const barangay = barangays.value.find((b: any) => b.code === form.barangayCode);
  form.barangayName = barangay?.name || '';
}

onMounted(async () => {
  await loadRegions();

  // Initialize map
  if (mapContainer.value) {
    const L = await import('leaflet');

    map = L.map(mapContainer.value).setView([form.latitude || 14.5995, form.longitude || 120.9842], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    marker = L.marker([form.latitude || 14.5995, form.longitude || 120.9842], { draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      form.latitude = pos.lat;
      form.longitude = pos.lng;
    });
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>
