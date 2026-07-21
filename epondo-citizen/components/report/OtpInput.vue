<template>
  <div>
    <div class="flex gap-2 justify-center">
      <input
        v-for="(_, index) in digits"
        :key="index"
        :ref="el => setInputRef(el, index)"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        :value="digits[index]"
        @input="handleInput($event, index)"
        @keydown="handleKeydown($event, index)"
        @paste="handlePaste"
      />
    </div>
    <div v-if="timer > 0" class="text-center mt-3 text-sm text-gray-500">
      Resend OTP in {{ timer }}s
    </div>
    <button
      v-else
      @click="$emit('resend')"
      class="block mx-auto mt-3 text-primary-500 hover:text-primary-600 text-sm font-medium"
    >
      Resend OTP
    </button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  complete: [otp: string];
  resend: [];
}>();

const digits = reactive(['', '', '', '', '', '']);
const inputRefs: (HTMLInputElement | null)[] = [];
const timer = ref(60);
let interval: ReturnType<typeof setInterval> | null = null;

function setInputRef(el: any, index: number) {
  inputRefs[index] = el as HTMLInputElement;
}

function handleInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, '');

  digits[index] = value.slice(-1);

  if (value && index < 5) {
    inputRefs[index + 1]?.focus();
  }

  checkComplete();
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace' && !digits[index] && index > 0) {
    inputRefs[index - 1]?.focus();
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text')?.replace(/\D/g, '') || '';

  for (let i = 0; i < 6 && i < pastedData.length; i++) {
    digits[i] = pastedData[i];
  }

  const nextEmpty = digits.findIndex(d => !d);
  if (nextEmpty >= 0) {
    inputRefs[nextEmpty]?.focus();
  } else {
    inputRefs[5]?.focus();
  }

  checkComplete();
}

function checkComplete() {
  const otp = digits.join('');
  if (otp.length === 6 && digits.every(d => d)) {
    emit('complete', otp);
  }
}

onMounted(() => {
  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else if (interval) {
      clearInterval(interval);
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});
</script>
