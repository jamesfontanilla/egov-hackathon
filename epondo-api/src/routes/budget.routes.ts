import { FastifyInstance } from 'fastify';
import { db } from '../db/connection.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';
import { validateTransition } from '../logic/budget-state-machine.js';
import { logAudit } from '../logic/audit.js';
import { livenessService } from '../services/liveness.service.js';
import { everifyService } from '../services/everify.service.js';
import { emessageService, notifications } from '../services/emessage.service.js';
import { egovchainService } from '../services/egovchain.service.js';

export async function budgetRoutes(app: FastifyInstance) {
  // POST /api/budgets - Create new budget (DRAFT)
  app.post('/api/budgets', {
    preHandler: [requireRole('TREASURER')],
  }, async (request, reply) => {
    const user = request.user!;
    const body = request.body as any;

    // Check for existing budget for same barangay + fiscal year
    const existing = await db('barangay_budgets')
      .where({ barangay_psgc: user.barangayPsgc, fiscal_year: body.fiscal_year })
      .first();

    if (existing) {
      return reply.status(409).send({
        success: false,
        error: { code: 'BUDGET_EXISTS', message: `Budget already exists for FY${body.fiscal_year}` },
      });
    }

    const [budget] = await db('barangay_budgets').insert({
      parent_lgu_id: body.parent_lgu_id,
      barangay_name: body.barangay_name,
      barangay_psgc: user.barangayPsgc,
      fiscal_year: body.fiscal_year,
      estimated_national_nta: body.estimated_national_nta || 0,
      estimated_city_rpt_share: body.estimated_city_rpt_share || 0,
      estimated_local_fees: body.estimated_local_fees || 0,
    }).returning('*');

    await logAudit({
      action: 'BUDGET_CREATED',
      entityType: 'barangay_budget',
      entityId: budget.id,
      performedBy: user.id,
      metadata: { fiscal_year: body.fiscal_year },
    });

    return reply.status(201).send({ success: true, data: budget });
  });

  // GET /api/budgets - List budgets (scoped by role)
  app.get('/api/budgets', { preHandler: [authMiddleware] }, async (request, reply) => {
    const user = request.user!;
    const query = request.query as any;

    let q = db('barangay_budgets').select('*');

    if (user.role === 'TREASURER' || user.role === 'CAPTAIN') {
      q = q.where({ barangay_psgc: user.barangayPsgc });
    } else if (user.role === 'CITIZEN') {
      // Citizens only see OPERATIVE and ARCHIVED
      q = q.whereIn('budget_status', ['OPERATIVE', 'ARCHIVED']);
    }
    // CBO_AUDITOR sees all under their LGU (no filter needed for hackathon)

    if (query.status) q = q.where({ budget_status: query.status });
    if (query.fiscal_year) q = q.where({ fiscal_year: query.fiscal_year });

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '25');
    const offset = (page - 1) * limit;

    const [{ count }] = await q.clone().count('* as count');
    const budgets = await q.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return reply.send({
      success: true,
      data: budgets,
      pagination: { page, limit, total: parseInt(count as string) },
    });
  });

  // GET /api/budgets/:id - Get budget detail
  app.get('/api/budgets/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const budget = await db('barangay_budgets').where({ id }).first();

    if (!budget) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    return reply.send({ success: true, data: budget });
  });

  // PUT /api/budgets/:id - Update revenue inputs (DRAFT only)
  app.put('/api/budgets/:id', {
    preHandler: [requireRole('TREASURER')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const budget = await db('barangay_budgets').where({ id }).first();
    if (!budget) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    if (budget.budget_status !== 'DRAFT') {
      return reply.status(400).send({ success: false, error: { code: 'NOT_DRAFT', message: 'Can only edit budgets in DRAFT status' } });
    }

    const [updated] = await db('barangay_budgets').where({ id }).update({
      estimated_national_nta: body.estimated_national_nta ?? budget.estimated_national_nta,
      estimated_city_rpt_share: body.estimated_city_rpt_share ?? budget.estimated_city_rpt_share,
      estimated_local_fees: body.estimated_local_fees ?? budget.estimated_local_fees,
      updated_at: new Date(),
    }).returning('*');

    return reply.send({ success: true, data: updated });
  });

  // POST /api/budgets/:id/submit - Submit budget (DRAFT→SUBMITTED)
  app.post('/api/budgets/:id/submit', {
    preHandler: [requireRole('TREASURER')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;
    const body = request.body as { liveness_session_id: string };

    const budget = await db('barangay_budgets').where({ id }).first();
    if (!budget) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

    validateTransition(budget.budget_status, 'SUBMITTED');

    // Validate revenue fields > 0
    if (budget.estimated_national_nta <= 0 && budget.estimated_city_rpt_share <= 0 && budget.estimated_local_fees <= 0) {
      return reply.status(400).send({ success: false, error: { code: 'EMPTY_BUDGET', message: 'At least one revenue field must be > 0' } });
    }

    // Verify Face Liveness
    const livenessResult = await livenessService.verifySession(body.liveness_session_id);
    if (!livenessResult.verified) {
      return reply.status(400).send({
        success: false,
        error: { code: 'LIVENESS_FAILED', message: `Liveness check failed. Score: ${livenessResult.score}. Minimum: 95.0` },
      });
    }

    // Update budget status
    const [updated] = await db('barangay_budgets').where({ id }).update({
      budget_status: 'SUBMITTED',
      submitted_by: user.id,
      submitted_at: new Date(),
      submission_liveness_session_id: body.liveness_session_id,
      updated_at: new Date(),
    }).returning('*');

    // Send SMS to CBO
    const cboUsers = await db('users').where({ role: 'CBO_AUDITOR' });
    for (const cbo of cboUsers) {
      if (cbo.mobile) {
        await emessageService.sendAndLog({
          recipientUserId: cbo.id,
          recipientMobile: cbo.mobile,
          messageBody: notifications.budgetSubmitted(budget.barangay_name, budget.fiscal_year, id),
          triggerEvent: 'BUDGET_SUBMITTED',
          relatedEntityType: 'barangay_budget',
          relatedEntityId: id,
        });
      }
    }

    await logAudit({
      action: 'BUDGET_SUBMITTED',
      entityType: 'barangay_budget',
      entityId: id,
      performedBy: user.id,
      apiName: 'FACE_LIVENESS',
      metadata: { livenessScore: livenessResult.score },
    });

    return reply.send({ success: true, data: updated });
  });

  // POST /api/budgets/:id/approve - CBO approves (SUBMITTED→OPERATIVE)
  app.post('/api/budgets/:id/approve', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;

    const budget = await db('barangay_budgets').where({ id }).first();
    if (!budget) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

    validateTransition(budget.budget_status, 'OPERATIVE');

    // Generate eGovchain hash
    const txHash = egovchainService.anchorBudgetApproval(
      id, user.id, parseFloat(budget.total_approved_budget)
    );

    const [updated] = await db('barangay_budgets').where({ id }).update({
      budget_status: 'OPERATIVE',
      approved_by: user.id,
      approved_at: new Date(),
      egovchain_tx_hash: txHash,
      updated_at: new Date(),
    }).returning('*');

    // Send SMS to Treasurer
    const treasurer = await db('users').where({ id: budget.submitted_by }).first();
    if (treasurer?.mobile) {
      await emessageService.sendAndLog({
        recipientUserId: treasurer.id,
        recipientMobile: treasurer.mobile,
        messageBody: notifications.budgetApproved(budget.fiscal_year),
        triggerEvent: 'BUDGET_APPROVED',
        relatedEntityType: 'barangay_budget',
        relatedEntityId: id,
      });
    }

    await logAudit({
      action: 'BUDGET_APPROVED',
      entityType: 'barangay_budget',
      entityId: id,
      performedBy: user.id,
      apiName: 'EGOVCHAIN',
      metadata: { txHash },
    });

    return reply.send({ success: true, data: updated });
  });

  // POST /api/budgets/:id/reject - CBO rejects (SUBMITTED→DRAFT)
  app.post('/api/budgets/:id/reject', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;
    const { reason } = request.body as { reason: string };

    const budget = await db('barangay_budgets').where({ id }).first();
    if (!budget) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

    validateTransition(budget.budget_status, 'DRAFT');

    const [updated] = await db('barangay_budgets').where({ id }).update({
      budget_status: 'DRAFT',
      rejection_reason: reason,
      submitted_by: null,
      submitted_at: null,
      updated_at: new Date(),
    }).returning('*');

    // Send SMS to Treasurer
    const treasurer = await db('users').where({ id: budget.submitted_by }).first();
    if (treasurer?.mobile) {
      await emessageService.sendAndLog({
        recipientUserId: treasurer.id,
        recipientMobile: treasurer.mobile,
        messageBody: notifications.budgetRejected(budget.fiscal_year, reason),
        triggerEvent: 'BUDGET_REJECTED',
        relatedEntityType: 'barangay_budget',
        relatedEntityId: id,
      });
    }

    await logAudit({
      action: 'BUDGET_REJECTED',
      entityType: 'barangay_budget',
      entityId: id,
      performedBy: user.id,
      metadata: { reason },
    });

    return reply.send({ success: true, data: updated });
  });

  // POST /api/budgets/:id/archive - Archive (OPERATIVE→ARCHIVED)
  app.post('/api/budgets/:id/archive', {
    preHandler: [requireRole('CBO_AUDITOR')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;

    const budget = await db('barangay_budgets').where({ id }).first();
    if (!budget) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

    validateTransition(budget.budget_status, 'ARCHIVED');

    const archiveHash = egovchainService.anchorBudgetArchive(id, parseFloat(budget.total_approved_budget));

    const [updated] = await db('barangay_budgets').where({ id }).update({
      budget_status: 'ARCHIVED',
      egovchain_archived_hash: archiveHash,
      updated_at: new Date(),
    }).returning('*');

    await logAudit({
      action: 'BUDGET_ARCHIVED',
      entityType: 'barangay_budget',
      entityId: id,
      performedBy: user.id,
      apiName: 'EGOVCHAIN',
      metadata: { archiveHash },
    });

    return reply.send({ success: true, data: updated });
  });
}
