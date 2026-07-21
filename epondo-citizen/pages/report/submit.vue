<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <NuxtLink to="/report" class="text-primary-500 hover:text-primary-600 flex items-center gap-1 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </NuxtLink>

    <h1 class="text-2xl font-bold text-gray-800 mb-6">File a Report</h1>

    <!-- Step Indicator -->
    <div class="flex items-center justify-between mb-8">
      <div v-for="step in 4" :key="step" class="flex items-center">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
            reportStore.currentStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
          ]"
        >
          {{ step }}
        </div>
        <span class="hidden sm:inline ml-2 text-sm" :class="reportStore.currentStep >= step ? 'text-primary-500 font-medium' : 'text-gray-400'">
          {{ stepLabels[step - 1] }}
        </span>
        <div v-if="step < 4" class="w-8 md:w-16 h-0.5 mx-2" :class="reportStore.currentStep > step ? 'bg-primary-500' : 'bg-gray-200'" />
      </div>
    </div>

    <!-- Step 1: Location -->
    <div v-if="reportStore.currentStep === 1" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">📍 {{ t('report.step1') }}</h2>
      <LocationPicker @update="handleLocationUpdate" />
      <div class="flex justify-end mt-6">
        <button
          @click="nextStep"
          :disabled="!locationValid"
          class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('report.next') }} →
        </button>
      </div>
    </div>

    <!-- Step 2: Details -->
    <div v-if="reportStore.currentStep === 2" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">📋 {{ t('report.step2') }}</h2>
      <ComplaintForm @update="handleDetailsUpdate" />
      <div class="flex justify-between mt-6">
        <button @click="prevStep" class="text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          ← {{ t('report.previous') }}
        </button>
        <button
          @click="nextStep"
          :disabled="!detailsValid"
          class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('report.next') }} →
        </button>
      </div>
    </div>

    <!-- Step 3: Verification -->
    <div v-if="reportStore.currentStep === 3" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">✅ {{ t('report.step3') }}</h2>

      <!-- Pre-filled complainant info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input v-model="reportStore.complainant.firstName" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <input v-model="reportStore.complainant.lastName" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Middle Name</label>
          <input v-model="reportStore.complainant.middleName" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Gender</label>
          <select v-model="reportStore.complainant.gender" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Mobile</label>
          <input v-model="reportStore.complainant.mobile" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input v-model="reportStore.complainant.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <!-- OTP Section -->
      <div class="border-t border-gray-200 pt-6">
        <div v-if="!otpSent">
          <button
            @click="requestOtpHandler"
            :disabled="!reportStore.complainant.email || otpLoading"
            class="bg-accent-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-accent-600 disabled:opacity-50 transition-colors"
          >
            {{ t('report.requestOtp') }}
          </button>
        </div>
        <div v-else-if="!reportStore.otpVerified">
          <p class="text-sm text-gray-600 mb-3">Enter the 6-digit OTP sent to {{ reportStore.complainant.email }}</p>
          <OtpInput @complete="handleOtpVerify" />
          <p v-if="otpError" class="text-red-500 text-sm mt-2">{{ otpError }}</p>
        </div>
        <div v-else class="text-green-600 font-medium">
          ✅ Email verified successfully!
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <button @click="prevStep" class="text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          ← {{ t('report.previous') }}
        </button>
        <button
          @click="submitReportHandler"
          :disabled="!reportStore.otpVerified || submitting"
          class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('report.submit') }}
        </button>
      </div>
    </div>

    <!-- Step 4: Confirmation -->
    <div v-if="reportStore.currentStep === 4" class="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
      <span class="text-5xl block mb-4">✅</span>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Report Submitted Successfully</h2>
      <p class="text-gray-500 mb-4">You will receive updates via email and SMS.</p>

      <div class="bg-green-50 border border-green-200 rounded-lg p-4 inline-block mb-6">
        <p class="text-sm text-green-600 font-medium">{{ t('report.caseNumber') }}</p>
        <p class="text-2xl font-bold text-green-800">{{ reportStore.submittedCaseNumber }}</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/report/track" class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
          Track This Report
        </NuxtLink>
        <button @click="startNew" class="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          File Another
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReportStore } from '~/stores/report.store';
import { useAuthStore } from '~/stores/auth.store';
import { useReport } from '~/composables/useReport';
import { useTranslator } from '~/composables/useTranslator';

definePageMeta({ layout: 'default', middleware: ['citizen-auth'] });

const reportStore = useReportStore();
const authStore = useAuthStore();
const { requestOtp, confirmOtp, submitReport } = useReport();
const { t } = useTranslator();

const stepLabels = [t('report.step1'), t('report.step2'), t('report.step3'), t('report.step4')];
const otpSent = ref(false);
const otpLoading = ref(false);
const otpError = ref('');
const submitting = ref(false);

// Pre-fill complainant from auth
onMounted(() => {
  if (authStore.user) {
    reportStore.setComplainant({
      firstName: authStore.user.firstName,
      lastName: authStore.user.lastName,
      middleName: authStore.user.middleName || '',
      email: authStore.user.email,
      mobile: authStore.user.mobile || '',
      gender: authStore.user.gender || '',
    });
  }
});

const locationValid = computed(() =>
  reportStore.location.regionCode && reportStore.location.barangayCode
);

const detailsValid = computed(() =>
  reportStore.details.reportType && reportStore.details.excerpt && reportStore.details.message
);

function nextStep() {
  reportStore.setStep(reportStore.currentStep + 1);
}

function prevStep() {
  reportStore.setStep(reportStore.currentStep - 1);
}

function handleLocationUpdate(location: any) {
  reportStore.setLocation(location);
}

function handleDetailsUpdate(details: any) {
  reportStore.setDetails(details);
}

async function requestOtpHandler() {
  otpLoading.value = true;
  try {
    await requestOtp(reportStore.complainant.email);
    otpSent.value = true;
  } catch (e: any) {
    otpError.value = e.response?.data?.message || 'Failed to send OTP.';
  } finally {
    otpLoading.value = false;
  }
}

async function handleOtpVerify(otp: string) {
  otpError.value = '';
  try {
    await confirmOtp(reportStore.complainant.email, otp);
    reportStore.setOtpVerified(true);
  } catch (e: any) {
    otpError.value = e.response?.data?.message || 'Invalid OTP. Try again.';
  }
}

async function submitReportHandler() {
  submitting.value = true;
  try {
    const payload = {
      // Location
      psgc_code: reportStore.location.barangayCode,
      province_name: reportStore.location.provinceName,
      municipality_code: reportStore.location.municipalityCode,
      municipality_name: reportStore.location.municipalityName,
      barangay_code: reportStore.location.barangayCode,
      barangay_name: reportStore.location.barangayName,
      latitude: reportStore.location.latitude,
      longitude: reportStore.location.longitude,
      // Details
      report_type: reportStore.details.reportType,
      excerpt: reportStore.details.excerpt,
      message: reportStore.details.message,
      evidences: reportStore.details.evidences,
      // Complainant
      first_name: reportStore.complainant.firstName,
      middle_name: reportStore.complainant.middleName,
      last_name: reportStore.complainant.lastName,
      gender: reportStore.complainant.gender,
      mobile_number: reportStore.complainant.mobile,
      email: reportStore.complainant.email,
    };

    const result = await submitReport(payload);
    reportStore.setCaseNumber(result.case_number || result.caseNumber || 'PFM XXXXXX XXXX');
    reportStore.setStep(4);
  } catch (e: any) {
    otpError.value = e.response?.data?.message || 'Submission failed. Please try again.';
  } finally {
    submitting.value = false;
  }
}

function startNew() {
  reportStore.reset();
}
</script>
