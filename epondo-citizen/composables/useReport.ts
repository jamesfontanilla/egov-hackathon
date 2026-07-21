import { useApi } from '~/composables/useApi';

export function useReport() {
  const { client } = useApi();

  // Location datasets from eReport API
  // Backend wraps responses as { success: true, data: <eReport response> }
  // eReport API returns the dataset directly (array or object with array)
  async function getRegions() {
    const { data } = await client.get('/api/reports/datasets/regions');
    return data.data; // unwrap backend envelope
  }

  async function getProvinces(regionCode: string) {
    const { data } = await client.get(`/api/reports/datasets/provinces?region_code=${regionCode}`);
    return data.data;
  }

  async function getMunicipalities(provinceCode: string) {
    const { data } = await client.get(`/api/reports/datasets/municipalities?province_code=${provinceCode}`);
    return data.data;
  }

  async function getBarangays(municipalityCode: string) {
    const { data } = await client.get(`/api/reports/datasets/barangays?municipality_code=${municipalityCode}`);
    return data.data;
  }

  async function getReportTypes() {
    const { data } = await client.get('/api/reports/datasets/report-types');
    return data.data;
  }

  // OTP verification
  async function requestOtp(email: string) {
    const { data } = await client.post('/api/reports/verify/request', { email });
    return data.data;
  }

  async function confirmOtp(email: string, otp: string) {
    const { data } = await client.post('/api/reports/verify/confirm', { email, otp });
    return data.data;
  }

  // Report submission
  async function submitReport(payload: Record<string, unknown>) {
    const { data } = await client.post('/api/reports/submit', payload);
    return data.data;
  }

  // Report tracking (requires X-EReport-View-Token header)
  async function trackReport(caseNumber: string, viewToken: string) {
    const { data } = await client.get(`/api/reports/${encodeURIComponent(caseNumber)}`, {
      headers: { 'X-EReport-View-Token': viewToken },
    });
    return data.data;
  }

  // My reports (requires X-EReport-View-Token header)
  async function getMyReports(viewToken: string, params?: { q?: string; page?: number; limit?: number }) {
    const { data } = await client.get('/api/reports', {
      headers: { 'X-EReport-View-Token': viewToken },
      params,
    });
    return data.data;
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
