<template>
  <div class="max-w-md mx-auto px-4 py-12">
    <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
      <span class="text-4xl block mb-4">📧</span>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
      <p class="text-gray-500 mb-6">We sent a 6-digit OTP to your email address.</p>

      <OtpInput @complete="handleOtpComplete" />

      <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-sm mt-4">✅ Verified successfully!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReportStore } from '~/stores/report.store';
import { useReport } from '~/composables/useReport';

definePageMeta({ layout: 'default', middleware: ['citizen-auth'] });

const reportStore = useReportStore();
const { confirmOtp } = useReport();
const error = ref('');
const success = ref(false);

async function handleOtpComplete(otp: string) {
  error.value = '';
  try {
    await confirmOtp(reportStore.complainant.email, otp);
    reportStore.setOtpVerified(true);
    success.value = true;
    setTimeout(() => {
      navigateTo('/report/submit');
    }, 1000);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Invalid OTP. Please try again.';
  }
}
</script>
