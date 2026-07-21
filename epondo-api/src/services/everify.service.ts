import axios from 'axios';
import { config } from '../config/env.js';

interface EverifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
}

interface VerifyPersonalInfoRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  birth_date: string; // YYYY-MM-DD
  face_liveness_session_id: string;
}

export interface EverifyResult {
  code: string;
  token: string;
  reference: string;
  face_url: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  gender: string;
  marital_status: string;
  blood_type: string;
  email: string;
  mobile_number: string;
  birth_date: string;
  full_address: string;
  address_line_1: string;
}

export class EverifyService {
  private baseUrl = config.everify.baseUrl;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() / 1000 < this.tokenExpiresAt - 60) {
      return this.cachedToken;
    }

    const response = await axios.post(`${this.baseUrl}/api/auth`, {
      client_id: config.everify.clientId,
      client_secret: config.everify.clientSecret,
    });

    const data: EverifyTokenResponse = response.data.data;
    this.cachedToken = data.access_token;
    this.tokenExpiresAt = parseInt(data.expires_at);
    return this.cachedToken;
  }

  async verifyPersonalInfo(params: VerifyPersonalInfoRequest): Promise<EverifyResult> {
    const token = await this.getAccessToken();
    const response = await axios.post(`${this.baseUrl}/api/query`, params, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  }

  async qrCheck(qrValue: string): Promise<any> {
    const token = await this.getAccessToken();
    const response = await axios.post(
      `${this.baseUrl}/api/query/qr/check`,
      { value: qrValue },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  }

  async qrVerify(qrValue: string, livenessSessionId: string): Promise<EverifyResult> {
    const token = await this.getAccessToken();
    const response = await axios.post(
      `${this.baseUrl}/api/query/qr`,
      { value: qrValue, face_liveness_session_id: livenessSessionId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  }
}

export const everifyService = new EverifyService();
