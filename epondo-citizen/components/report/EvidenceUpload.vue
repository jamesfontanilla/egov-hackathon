<template>
  <div>
    <label class="block text-sm font-medium text-gray-600 mb-2">Evidence (up to 3 files)</label>

    <!-- Drop zone -->
    <div
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
      ]"
      @click="triggerFileInput"
    >
      <input ref="fileInput" type="file" class="hidden" accept=".jpg,.jpeg,.png,.pdf" multiple @change="handleFileSelect" />
      <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p class="text-sm text-gray-500">Drag & drop files here, or click to browse</p>
      <p class="text-xs text-gray-400 mt-1">JPG, PNG, PDF • Max 5MB each • Up to 3 files</p>
    </div>

    <!-- Previews -->
    <div v-if="files.length > 0" class="mt-4 grid grid-cols-3 gap-3">
      <div v-for="(file, index) in files" :key="index" class="relative group">
        <div class="bg-gray-100 rounded-lg p-3 text-center aspect-square flex items-center justify-center">
          <img v-if="file.preview" :src="file.preview" class="w-full h-full object-cover rounded" :alt="file.name" />
          <div v-else class="text-gray-500">
            <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="text-xs">{{ file.name }}</span>
          </div>
        </div>
        <button
          @click="removeFile(index)"
          class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  update: [evidences: string[]];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);
const files = ref<Array<{ name: string; preview: string | null; url: string }>>([]);

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    processFiles(Array.from(input.files));
  }
}

function handleDrop(event: DragEvent) {
  dragging.value = false;
  if (event.dataTransfer?.files) {
    processFiles(Array.from(event.dataTransfer.files));
  }
}

function processFiles(newFiles: File[]) {
  const remainingSlots = 3 - files.value.length;
  const filesToAdd = newFiles.slice(0, remainingSlots);

  for (const file of filesToAdd) {
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5MB).`);
      continue;
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      alert(`${file.name} is not a supported format.`);
      continue;
    }

    // Create preview
    let preview: string | null = null;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    // In a real app, upload to backend here and get URL back
    // For now, use local object URL as placeholder
    files.value.push({ name: file.name, preview, url: preview || file.name });
  }

  emitUrls();
}

function removeFile(index: number) {
  const file = files.value[index];
  if (file.preview) URL.revokeObjectURL(file.preview);
  files.value.splice(index, 1);
  emitUrls();
}

function emitUrls() {
  emit('update', files.value.map(f => f.url));
}
</script>
