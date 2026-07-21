<template>
  <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
    <h3 class="font-semibold text-gray-800 mb-4">Select Location</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Region -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Region</label>
        <select
          v-model="selectedRegion"
          @change="onRegionChange"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select Region</option>
          <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
        </select>
      </div>

      <!-- Province -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Province</label>
        <select
          v-model="selectedProvince"
          @change="onProvinceChange"
          :disabled="!selectedRegion"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Select Province</option>
          <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
        </select>
      </div>

      <!-- Municipality -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Municipality</label>
        <select
          v-model="selectedMunicipality"
          @change="onMunicipalityChange"
          :disabled="!selectedProvince"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Select Municipality</option>
          <option v-for="m in municipalities" :key="m.code" :value="m.code">{{ m.name }}</option>
        </select>
      </div>

      <!-- Barangay -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Barangay</label>
        <select
          v-model="selectedBarangay"
          @change="onBarangayChange"
          :disabled="!selectedMunicipality"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Select Barangay</option>
          <option v-for="b in barangays" :key="b.code" :value="b.code">{{ b.name }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReport } from '~/composables/useReport';

const emit = defineEmits<{
  select: [barangay: { code: string; name: string }];
}>();

const { getRegions, getProvinces, getMunicipalities, getBarangays } = useReport();

const regions = ref<any[]>([]);
const provinces = ref<any[]>([]);
const municipalities = ref<any[]>([]);
const barangays = ref<any[]>([]);

const selectedRegion = ref('');
const selectedProvince = ref('');
const selectedMunicipality = ref('');
const selectedBarangay = ref('');

async function loadRegions() {
  try {
    const data = await getRegions();
    regions.value = data.regions || data || [];
  } catch (e) {
    console.error('Error loading regions:', e);
  }
}

async function onRegionChange() {
  selectedProvince.value = '';
  selectedMunicipality.value = '';
  selectedBarangay.value = '';
  provinces.value = [];
  municipalities.value = [];
  barangays.value = [];

  if (selectedRegion.value) {
    try {
      const data = await getProvinces(selectedRegion.value);
      provinces.value = data.provinces || data || [];
    } catch (e) {
      console.error('Error loading provinces:', e);
    }
  }
}

async function onProvinceChange() {
  selectedMunicipality.value = '';
  selectedBarangay.value = '';
  municipalities.value = [];
  barangays.value = [];

  if (selectedProvince.value) {
    try {
      const data = await getMunicipalities(selectedProvince.value);
      municipalities.value = data.municipalities || data || [];
    } catch (e) {
      console.error('Error loading municipalities:', e);
    }
  }
}

async function onMunicipalityChange() {
  selectedBarangay.value = '';
  barangays.value = [];

  if (selectedMunicipality.value) {
    try {
      const data = await getBarangays(selectedMunicipality.value);
      barangays.value = data.barangays || data || [];
    } catch (e) {
      console.error('Error loading barangays:', e);
    }
  }
}

function onBarangayChange() {
  if (selectedBarangay.value) {
    const barangay = barangays.value.find((b: any) => b.code === selectedBarangay.value);
    emit('select', { code: selectedBarangay.value, name: barangay?.name || '' });
  }
}

onMounted(loadRegions);
</script>
