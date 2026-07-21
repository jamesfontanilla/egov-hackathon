import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config/env.js';

export class EgovAiService {
  private baseUrl = config.egovai.baseUrl;
  private hackathonToken: string | null = null;

  async generateToken(): Promise<{ accessToken: string; credits: number }> {
    const response = await axios.post(`${this.baseUrl}/api/v1/egov/integration/token`, {
      access_code: config.egovai.accessCode,
    });
    this.hackathonToken = response.data.access_token;
    return {
      accessToken: this.hackathonToken!,
      credits: response.data.credits_remaining,
    };
  }

  private async getToken(): Promise<string> {
    if (!this.hackathonToken) {
      const result = await this.generateToken();
      return result.accessToken;
    }
    return this.hackathonToken;
  }

  private async authHeaders() {
    const token = await this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async aiAssistant(prompt: string, category: string = 'PH'): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/v1/egov/integration/ai_assistant/generate`,
      { prompt, category },
      { headers }
    );
    return response.data;
  }

  async lawsAndRegulations(prompt: string, category: string = 'PH'): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/v1/egov/integration/laws_and_regulations/generate`,
      { prompt, category },
      { headers }
    );
    return response.data;
  }

  async translator(prompt: string, sourceLang: string, targetLang: string): Promise<any> {
    const headers = await this.authHeaders();
    const response = await axios.post(
      `${this.baseUrl}/api/v1/egov/integration/translator/generate`,
      { prompt, source_lang: sourceLang, target_lang: targetLang },
      { headers }
    );
    return response.data;
  }

  async documentExtractor(fileBuffer: Buffer, fileName: string): Promise<any> {
    const token = await this.getToken();
    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName });

    const response = await axios.post(
      `${this.baseUrl}/api/v1/egov/integration/document_extractor/generate`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...form.getHeaders(),
        },
      }
    );
    return response.data;
  }

  async getCredits(): Promise<{ credits_total: number; credits_used: number; credits_remaining: number; expires_at: string }> {
    const token = await this.getToken();
    const response = await axios.get(`${this.baseUrl}/api/v1/egov/integration/credits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}

export const egovAiService = new EgovAiService();
