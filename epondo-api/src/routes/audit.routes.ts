import { FastifyInstance } from 'fastify';
import { db } from '../db/connection.js';
import { requireRole, authMiddleware } from '../middleware/auth.middleware.js';
import { egovchainService } from '../services/egovchain.service.js';

export async function auditRoutes(app: FastifyInstance) {
  // GET /api/audit/logs - Paginated audit log
  app.get('/api/audit/logs', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const query = request.query as {
      page?: string;
      limit?: string;
      action?: string;
      entity_type?: string;
    };

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '25');
    const offset = (page - 1) * limit;

    let q = db('audit_logs').select('*');
    if (query.action) q = q.where({ action: query.action });
    if (query.entity_type) q = q.where({ entity_type: query.entity_type });

    const [{ count }] = await q.clone().count('* as count');
    const logs = await q.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return reply.send({
      success: true,
      data: logs,
      pagination: { page, limit, total: parseInt(count as string) },
    });
  });

  // GET /api/audit/logs/:entityType/:entityId - Audit trail for specific entity
  app.get('/api/audit/logs/:entityType/:entityId', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const { entityType, entityId } = request.params as { entityType: string; entityId: string };

    const logs = await db('audit_logs')
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('created_at', 'asc');

    return reply.send({ success: true, data: logs });
  });

  // GET /api/audit/blockchain/:hash - Verify blockchain hash
  app.get('/api/audit/blockchain/:hash', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { hash } = request.params as { hash: string };
    const verification = egovchainService.verifyHash(hash);

    // Also check if hash exists in our records
    const budgetMatch = await db('barangay_budgets')
      .where({ egovchain_tx_hash: hash })
      .orWhere({ egovchain_archived_hash: hash })
      .first();

    const disbursementMatch = await db('project_disbursements')
      .where({ egovchain_block_hash: hash })
      .first();

    return reply.send({
      success: true,
      data: {
        hash,
        formatValid: verification.format,
        foundInRecords: !!(budgetMatch || disbursementMatch),
        linkedEntity: budgetMatch
          ? { type: 'barangay_budget', id: budgetMatch.id }
          : disbursementMatch
            ? { type: 'project_disbursement', id: disbursementMatch.id }
            : null,
      },
    });
  });
}
