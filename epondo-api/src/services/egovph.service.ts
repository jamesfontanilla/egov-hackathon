import axios from 'axios';
import { config } from '../config/env.js';

export interface EgovPhProfile {
  uniqid: string;
  email: string;
  birth_date: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string | null;
  gender: string;
  nationality: string;
  photo: string;
  mobile: string;
  address: string;
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  postal?: number;
  zip_code?: string;
}

export class EgovPhService {
  private baseUrl = config.egovph.baseUrl;

  /**
   * Step 1: Exchange code for access token
   * POST {{base_url}}/api/token
   * Body: { exchange_code, scope: "SSO_AUTHENTICATION", partner_code, partner_secret }
   * Returns: { access_token }
   */
  async exchangeToken(exchangeCode: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/token`, {
      exchange_code: exchangeCode,
      scope: 'SSO_AUTHENTICATION',
      partner_code: config.egovph.partnerCode,
      partner_secret: config.egovph.partnerSecret,
    });
    return response.data.access_token;
  }

  /**
   * Step 2: Get user profile with access token
   * POST {{base_url}}/api/partner/sso_authentication
   * Header: Authorization: Bearer {{access_token}}
   * Returns: user profile data
   */
  async getProfile(accessToken: string): Promise<EgovPhProfile> {
    const response = await axios.post(
      `${this.baseUrl}/api/partner/sso_authentication`,
      undefined,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data.data || response.data;
  }

  /**
   * Full flow: exchange code → get token → get profile
   */
  async authenticateUser(exchangeCode: string): Promise<EgovPhProfile> {
    const accessToken = await this.exchangeToken(exchangeCode);
    return this.getProfile(accessToken);
  }
}

export const egovPhService = new EgovPhService();
