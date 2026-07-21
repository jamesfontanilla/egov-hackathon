export function useReport() {
  const { client } = useApi();

  // Location datasets
  async function getRegions() {
    const { data } = await client.get('/api/reports/datasets/regions');
    return data;
  }

  async function getProvinces(regionCode: string) {
    const { data } = await client.get(`/api/reports/datasets/provinces?region_code=${regionCode}`);
    return data;
  }

  async function getMunicipalities(provinceCode: string) {
    const { data } = await client.get(`/api/reports/datasets/municipalities?province_code=${provinceCode}`);
    return data;
  }

  async function getBarangays(municipalityCode: string) {
    const { data } = await client.get(`/api/reports/datasets/barangays?municipality_code=${municipalityCode}`);
    return data;
  }

  async function getReportTypes() {
    const { data } = await client.get('/api/reports/datasets/report-types');
    return data;
  }

  // OTP verification
  async function requestOtp(email: string) {
    const { data } = await client.post('/api/reports/verify/request', { email });
    return data;
  }

  async function confirmOtp(email: string, otp: string) {
    const { data } = await client.post('/api/reports/verify/confirm', { email, otp });
    return data;
  }

  // Report submission
  async function submitReport(payload: Record<string, unknown>) {
    const { data } = await client.post('/api/reports/submit', payload);
    return data;
  }

  // Report tracking
  async function trackReport(caseNumber: string) {
    const { data } = await client.get(`/api/reports/${caseNumber}`);
    return data;
  }

  // My reports
  async function getMyReports() {
    const { data } = await client.get('/api/reports');
    return data;
  }

  return {
    getRegions,
    getProvinces,
    getMunicipalities,
    getBarangays,
    getReportTypes,
    requestOtp,
    confirmOtp,
    submitReport,
    trackReport,
    getMyReports,
  };
}

import { useApi } from '~/composables/useApi';
