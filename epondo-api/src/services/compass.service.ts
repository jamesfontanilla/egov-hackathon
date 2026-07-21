import axios from 'axios';
import { config } from '../config/env.js';

interface NcaParams {
  budgetYear: number;
  deptCode?: string;
  agencyCode?: string;
  operatingUnitCode?: string;
  expenseClass?: string;
  page?: number;
  limit?: number;
}

interface SaadobDashboardParams {
  reportYear: number;
  sheetScope: 'summary' | 'agency' | 'sucs';
}

interface LgsfParams {
  fiscalYear?: number;
  programCode?: string;
  regionCode?: string;
  province?: string;
  cityMunicipality?: string;
  page?: number;
  limit?: number;
}

interface SaroParams {
  saroNo?: string;
  deptCode?: string;
  agencyCode?: string;
  expenseClass?: string;
  page?: number;
  limit?: number;
}

export class CompassService {
  private baseUrl = config.dbmCompass.baseUrl;

  private get headers() {
    return { 'X-API-Key': config.dbmCompass.apiKey };
  }

  async getNcaRecords(params: NcaParams): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/nca`, {
      headers: this.headers,
      params: {
        budgetYear: params.budgetYear,
        deptCode: params.deptCode,
        agencyCode: params.agencyCode,
        operatingUnitCode: params.operatingUnitCode,
        expenseClass: params.expenseClass,
        page: params.page || 1,
        limit: params.limit || 100,
      },
    });
    return response.data;
  }

  async getSaadobDashboard(params: SaadobDashboardParams): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/saaodb/dashboard`, {
      headers: this.headers,
      params: {
        reportYear: params.reportYear,
        sheetScope: params.sheetScope,
      },
    });
    return response.data;
  }

  async getSaadobRecords(params: any): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/saaodb`, {
      headers: this.headers,
      params,
    });
    return response.data;
  }

  async getSaadobEntities(params: any): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/saaodb/entities`, {
      headers: this.headers,
      params,
    });
    return response.data;
  }

  async getSaroRecords(params: SaroParams): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/saro`, {
      headers: this.headers,
      params,
    });
    return response.data;
  }

  async getLgsfRecords(params: LgsfParams): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/lgsf`, {
      headers: this.headers,
      params,
    });
    return response.data;
  }

  async getLgsfDashboard(params: any): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v1/records/lgsf/dashboard`, {
      headers: this.headers,
      params,
    });
    return response.data;
  }
}

export const compassService = new CompassService();
