import axios from 'axios';
import { config } from '../config/env.js';

export interface EgovPhProfile {
  imguid: string;
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
  zip_code: string;
}

export class EgovPhService {
  private baseUrl = config.egovph.baseUrl;

  async exchangeToken(exchangeCode: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/token`, {
      exchange_code: exchangeCode,
      scope: 'SSO_AUTHENTICATION',
      partner_code: config.egovph.partnerCode,
      partner_secret: config.egovph.partnerSecret,
    });
    return response.data.access_token;
  }

  async getProfile(accessToken: string): Promise<EgovPhProfile> {
    const response = await axios.post(
      `${this.baseUrl}/api/partner/sso_authentication`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data.data;
  }

  async authenticateUser(exchangeCode: string): Promise<EgovPhProfile> {
    const accessToken = await this.exchangeToken(exchangeCode);
    return this.getProfile(accessToken);
  }
}

export const egovPhService = new EgovPhService();
