import axios from 'axios';
import { config } from '../config/env.js';

interface CreateSessionResponse {
  token: string;
  url: string;
}

interface VerificationResult {
  status: string;
  confidence_score: number;
  reference_image_url: string;
}

const CONFIDENCE_THRESHOLD = 95.0;

export class LivenessService {
  private baseUrl = config.faceLiveness.baseUrl;
  private apiKey = config.faceLiveness.apiKey;

  private get headers() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async createSession(
    action: 'redirect' | 'post' | 'close' = 'redirect',
    callbackUrl?: string,
    delay: number = 3000
  ): Promise<CreateSessionResponse> {
    const body: any = { action, delay };
    if (action === 'redirect' && callbackUrl) {
      body.callback_url = callbackUrl;
    }

    const response = await axios.post(`${this.baseUrl}/v1/liveness/session`, body, {
      headers: this.headers,
    });
    return response.data;
  }

  async getResult(sessionToken: string): Promise<VerificationResult> {
    const response = await axios.get(`${this.baseUrl}/v1/liveness/result/${sessionToken}`, {
      headers: { 'x-api-key': this.apiKey },
    });
    return response.data;
  }

  async verifySession(sessionToken: string): Promise<{
    verified: boolean;
    score: number;
    status: string;
    imageUrl?: string;
  }> {
    const result = await this.getResult(sessionToken);
    const verified = result.status === 'SUCCEEDED' && result.confidence_score >= CONFIDENCE_THRESHOLD;

    return {
      verified,
      score: result.confidence_score,
      status: result.status,
      imageUrl: verified ? result.reference_image_url : undefined,
    };
  }
}

export const livenessService = new LivenessService();
