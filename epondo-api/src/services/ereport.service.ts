import axios from 'axios';
import { config } from '../config/env.js';

export class EreportService {
  private baseUrl = config.ereport.baseUrl;
  private integrationToken: string | null = null;

  /**
   * Generate Token endpoint:
   * POST {{base}}/api/integration/token
   * Body: { "access_code": "<pre-issued access code>" }
   * Response: { "access_token": "<token>" }
   * 
   * The test script auto-saves access_token to integration_token env variable.
   */
  async generateToken(): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/api/integration/token`,
      { access_code: config.ereport.accessToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
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

  /**
   * Submit Complaint endpoint:
   * POST {{base}}/api/integration/submit_complaint
   * Auth: Bearer {{integration_token}}
   * 
   * All fields documented from eReport API:
   * - mobile: string (E.164, e.g. +639000000000)
   * - first_name: string
   * - middle_name: string
   * - last_name: string
   * - gender: string ("Male" | "Female")
   * - complainant_email: string
   * - report_type: string (from Report Type List dataset)
   * - excerpt: string (short description / headline)
   * - message: string (full detail)
   * - evidences: array of strings (URLs to evidence images)
   * - psgc_code: string (PSGC code of barangay)
   * - province_name: string
   * - municipality_code: string
   * - municipality_name: string
   * - barangay_code: string
   * - barangay_name: string
   * - category: string (full address)
   * - longitude: string
   * - latitude: string
   * 
   * Response: Success returns a case number with the generated report reference.
   */
  async submitComplaint(complaint: {
    mobile: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: string;
    complainant_email: string;
    report_type: string;
    excerpt: string;
    message: string;
    evidences: string[];
    psgc_code: string;
    province_name: string;
    municipality_code: string;
    municipality_name: string;
    barangay_code: string;
    barangay_name: string;
    category: string;
    longitude: string;
    latitude: string;
  }): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/integration/submit_complaint`,
      complaint,
      { headers }
    );
    return response.data;
  }

  /**
   * Verify – Request OTP:
   * POST {{base}}/api/integration/verify/request
   * Auth: Bearer {{integration_token}}
   * Body: { "email": "user@example.com" }
   * 
   * A successful response indicates OTP has been dispatched to the email.
   * The client should prompt the user to enter the OTP they received.
   */
  async requestOtp(email: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/integration/verify/request`,
      { email },
      { headers }
    );
    return response.data;
  }

  /**
   * Verify – Confirm OTP:
   * POST {{base}}/api/integration/verify/confirm
   * Auth: Bearer {{integration_token}}
   * Body: { "email": "user@example.com", "otp": "080800" }
   * 
   * On success, response contains report_view_token which grants
   * access to report viewing functionality.
   * The post-response script auto-saves this as integration_report_view_token.
   */
  async confirmOtp(email: string, otp: string): Promise<{ report_view_token: string; [key: string]: any }> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/integration/verify/confirm`,
      { email, otp },
      { headers }
    );
    return response.data;
  }

  /**
   * Reports List:
   * GET {{base}}/api/integration/reports
   * Auth Header: X-EReport-View-Token: {{integration_report_view_token}}
   * Query Params: q (optional filter), page (default 1), limit (default 25)
   * 
   * Retrieves a paginated list of reports available to the integration.
   */
  async getReports(viewToken: string, params?: { q?: string; page?: number; limit?: number }): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/integration/reports`, {
      headers: { 'X-EReport-View-Token': viewToken },
      params,
    });
    return response.data;
  }

  /**
   * View Report by Case Number:
   * GET {{base}}/api/integration/reports/:case_number
   * Auth Header: X-EReport-View-Token: {{integration_report_view_token}}
   * Path Param: case_number (string, e.g. "PFM 071826 0014")
   * 
   * Retrieves the full details of a specific report by its case number.
   */
  async getReportByCaseNumber(viewToken: string, caseNumber: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/api/integration/reports/${encodeURIComponent(caseNumber)}`,
      { headers: { 'X-EReport-View-Token': viewToken } }
    );
    return response.data;
  }
}

export const ereportService = new EreportService();
