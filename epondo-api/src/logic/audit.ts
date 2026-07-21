import { db } from '../db/connection.js';

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  performedBy?: string;
  apiName?: string;
  apiEndpoint?: string;
  apiRequestSummary?: any;
  apiResponseSummary?: any;
  apiStatusCode?: number;
  ipAddress?: string;
  metadata?: any;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  await db('audit_logs').insert({
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    performed_by: entry.performedBy,
    api_name: entry.apiName,
    api_endpoint: entry.apiEndpoint,
    api_request_summary: entry.apiRequestSummary ? JSON.stringify(entry.apiRequestSummary) : null,
    api_response_summary: entry.apiResponseSummary ? JSON.stringify(entry.apiResponseSummary) : null,
    api_status_code: entry.apiStatusCode,
    ip_address: entry.ipAddress,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
  });
}
