import axios from 'axios';
import { config } from '../config/env.js';

export class EreportService {
  private baseUrl = config.ereport.baseUrl;
  private integrationToken: string | null = null;

  async generateToken(): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/integration/token`, {
      access_code: config.ereport.accessCode,
    });
    this.integrationToken = response.data.access_token;
    return this.integrationToken!;
  }

  private async getToken(): Promise<string> {
    if (!this.integrationToken) {
      return this.generateToken();
    }
    return this.integrationToken;
  }

  private async authHeaders() {
    const token = await this.getToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getReportTypes(): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.get(`${this.baseUrl}/api/integration/datasets/report_types`, { headers });
    return response.data;
  }

  async getRegions(): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.get(`${this.baseUrl}/api/integration/datasets/regions`, { headers });
    return response.data;
  }

  async getProvinces(regionCode: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.get(
      `${this.baseUrl}/api/integration/datasets/provinces`,
      { headers, params: { region_code: regionCode } }
    );
    return response.data;
  }

  async getMunicipalities(provinceCode: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.get(
      `${this.baseUrl}/api/integration/datasets/municipalities`,
      { headers, params: { province_code: provinceCode } }
    );
    return response.data;
  }

  async getBarangays(municipalityCode: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.get(
      `${this.baseUrl}/api/integration/datasets/barangays`,
      { headers, params: { municipality_code: municipalityCode } }
    );
    return response.data;
  }

  async submitComplaint(complaint: any): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/integration/submit_complaint`,
      complaint,
      { headers }
    );
    return response.data;
  }

  async requestOtp(email: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/integration/verify/request`,
      { email },
      { headers }
    );
    return response.data;
  }

  async confirmOtp(email: string, otp: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/integration/verify/confirm`,
      { email, otp },
      { headers }
    );
    return response.data;
  }

  async getReports(viewToken: string, params?: { q?: string; page?: number; limit?: number }): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/integration/reports`, {
      headers: { 'X-EReport-View-Token': viewToken },
      params,
    });
    return response.data;
  }

  async getReportByCaseNumber(viewToken: string, caseNumber: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/api/integration/reports/${encodeURIComponent(caseNumber)}`,
      { headers: { 'X-EReport-View-Token': viewToken } }
    );
    return response.data;
  }
}

export const ereportService = new EreportService();
