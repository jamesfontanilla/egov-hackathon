import { FastifyInstance } from 'fastify';
import { db } from '../db/connection.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { compassService } from '../services/compass.service.js';
import { logAudit } from '../logic/audit.js';

export async function compassRoutes(app: FastifyInstance) {
  // POST /api/compass/sync/:lguId - Trigger COMPASS sync
  app.post('/api/compass/sync/:lguId', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const { lguId } = request.params as { lguId: string };
    const user = request.user!;
    const body = request.body as { budgetYear?: number; deptCode?: string; agencyCode?: string };

    const lgu = await db('parent_lgus').where({ id: lguId }).first();
    if (!lgu) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'LGU not found' } });

    const budgetYear = body.budgetYear || new Date().getFullYear();

    try {
      const ncaData = await compassService.getNcaRecords({
        budgetYear,
        deptCode: body.deptCode,
        agencyCode: body.agencyCode,
        page: 1,
        limit: 100,
      });

      // Calculate new ceiling from NCA allotments
      let newCeiling = 0;
      if (ncaData.data && Array.isArray(ncaData.data)) {
        newCeiling = ncaData.data.reduce((sum: number, record: any) => {
          return sum + (parseFloat(record.amount) || 0);
        }, 0);
      }

      const previousCeiling = parseFloat(lgu.macro_nta_ceiling);

      // Update LGU ceiling
      await db('parent_lgus').where({ id: lguId }).update({
        macro_nta_ceiling: newCeiling || previousCeiling,
        compass_last_synced_at: new Date(),
        compass_raw_response: JSON.stringify(ncaData),
        updated_at: new Date(),
      });

      // Log sync history
      await db('compass_sync_history').insert({
        parent_lgu_id: lguId,
        sync_type: 'NCA',
        report_year: budgetYear,
        records_fetched: ncaData.data?.length || 0,
        previous_ceiling: previousCeiling,
        new_ceiling: newCeiling || previousCeiling,
        raw_response: JSON.stringify(ncaData),
        status: 'SUCCESS',
      });

      await logAudit({
        action: 'COMPASS_SYNC',
        entityType: 'parent_lgu',
        entityId: lguId,
        performedBy: user.id,
        apiName: 'DBM_COMPASS',
        apiEndpoint: '/api/v1/records/nca',
        metadata: { budgetYear, recordsFetched: ncaData.data?.length || 0, newCeiling },
      });

      return reply.send({
        success: true,
        data: {
          previousCeiling,
          newCeiling: newCeiling || previousCeiling,
          recordsFetched: ncaData.data?.length || 0,
          syncedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      await db('compass_sync_history').insert({
        parent_lgu_id: lguId,
        sync_type: 'NCA',
        report_year: budgetYear,
        status: 'FAILED',
        error_message: error.message,
      });

      return reply.status(500).send({
        success: false,
        error: { code: 'SYNC_FAILED', message: `COMPASS sync failed: ${error.message}` },
      });
    }
  });

  // GET /api/compass/nca/:lguId - Get cached NCA data
  app.get('/api/compass/nca/:lguId', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const { lguId } = request.params as { lguId: string };
    const lgu = await db('parent_lgus').where({ id: lguId }).first();
    if (!lgu) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'LGU not found' } });

    return reply.send({
      success: true,
      data: {
        macroNtaCeiling: lgu.macro_nta_ceiling,
        macroLgsfAllocation: lgu.macro_lgsf_allocation,
        lastSyncedAt: lgu.compass_last_synced_at,
        rawResponse: lgu.compass_raw_response,
      },
    });
  });

  // GET /api/compass/saaodb/dashboard - Get SAAODB summary
  app.get('/api/compass/saaodb/dashboard', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const query = request.query as { reportYear?: string; sheetScope?: string };
    const data = await compassService.getSaadobDashboard({
      reportYear: parseInt(query.reportYear || String(new Date().getFullYear())),
      sheetScope: (query.sheetScope as any) || 'summary',
    });
    return reply.send({ success: true, data });
  });

  // GET /api/compass/lgsf - Get LGSF records
  app.get('/api/compass/lgsf', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const query = request.query as any;
    const data = await compassService.getLgsfRecords(query);
    return reply.send({ success: true, data });
  });
}
