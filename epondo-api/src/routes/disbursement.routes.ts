import { FastifyInstance } from 'fastify';
import { db } from '../db/connection.js';
import { requireRole, authMiddleware } from '../middleware/auth.middleware.js';
import { validateDisbursement } from '../logic/fund-cap.js';
import { logAudit } from '../logic/audit.js';
import { livenessService } from '../services/liveness.service.js';
import { emessageService, notifications } from '../services/emessage.service.js';
import { egovchainService } from '../services/egovchain.service.js';

export async function disbursementRoutes(app: FastifyInstance) {
  // POST /api/budgets/:budgetId/disbursements - Create disbursement
  app.post('/api/budgets/:budgetId/disbursements', {
    preHandler: [requireRole('TREASURER')],
  }, async (request, reply) => {
    const { budgetId } = request.params as { budgetId: string };
    const user = request.user!;
    const body = request.body as any;

    // Validate budget is OPERATIVE
    const budget = await db('barangay_budgets').where({ id: budgetId }).first();
    if (!budget) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    if (budget.budget_status !== 'OPERATIVE') {
      return reply.status(400).send({ success: false, error: { code: 'NOT_OPERATIVE', message: 'Disbursements only allowed for OPERATIVE budgets' } });
    }

    // Validate fund cap
    const capCheck = await validateDisbursement(budgetId, body.fund_category, body.amount);
    if (!capCheck.valid) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'CAP_EXCEEDED',
          message: `Exceeds ${body.fund_category} ceiling. Ceiling: ₱${capCheck.ceiling.toFixed(2)}, Spent: ₱${capCheck.spent.toFixed(2)}, Remaining: ₱${capCheck.remaining.toFixed(2)}, Requested: ₱${body.amount}`,
        },
      });
    }

    // Verify Face Liveness
    const livenessResult = await livenessService.verifySession(body.liveness_session_id);
    if (!livenessResult.verified) {
      return reply.status(400).send({
        success: false,
        error: { code: 'LIVENESS_FAILED', message: `Liveness failed. Score: ${livenessResult.score}` },
      });
    }

    // Generate eGovchain hash
    const blockHash = egovchainService.anchorDisbursement(
      'pending', body.amount, user.id
    );

    // Create disbursement
    const [disbursement] = await db('project_disbursements').insert({
      barangay_budget_id: budgetId,
      project_name: body.project_name,
      project_description: body.project_description,
      fund_category: body.fund_category,
      amount: body.amount,
      payee_supplier_name: body.payee_supplier_name,
      voucher_reference: body.voucher_reference,
      authorized_by: user.id,
      authorized_by_philsys_id: body.authorized_by_philsys_id,
      liveness_session_id: body.liveness_session_id,
      liveness_confidence_score: livenessResult.score,
      voucher_file_url: body.voucher_file_url,
      ai_extracted_data: body.ai_extracted_data ? JSON.stringify(body.ai_extracted_data) : null,
      egovchain_block_hash: blockHash,
      status: body.amount >= 50000 ? 'PENDING' : 'APPROVED',
    }).returning('*');

    // If large disbursement (≥₱50k), notify Captain
    if (body.amount >= 50000) {
      const captains = await db('users').where({ role: 'CAPTAIN', barangay_psgc: user.barangayPsgc });
      for (const captain of captains) {
        if (captain.mobile) {
          await emessageService.sendAndLog({
            recipientUserId: captain.id,
            recipientMobile: captain.mobile,
            messageBody: notifications.largeDisbursement(body.amount, body.payee_supplier_name, body.voucher_reference),
            triggerEvent: 'LARGE_DISBURSEMENT',
            relatedEntityType: 'project_disbursement',
            relatedEntityId: disbursement.id,
          });
        }
      }
    }

    await logAudit({
      action: 'DISBURSEMENT_CREATED',
      entityType: 'project_disbursement',
      entityId: disbursement.id,
      performedBy: user.id,
      apiName: 'FACE_LIVENESS',
      metadata: { amount: body.amount, fundCategory: body.fund_category, blockHash },
    });

    return reply.status(201).send({ success: true, data: disbursement });
  });

  // GET /api/budgets/:budgetId/disbursements - List disbursements
  app.get('/api/budgets/:budgetId/disbursements', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { budgetId } = request.params as { budgetId: string };
    const query = request.query as any;

    let q = db('project_disbursements').where({ barangay_budget_id: budgetId });
    if (query.fund_category) q = q.where({ fund_category: query.fund_category });

    const disbursements = await q.orderBy('created_at', 'desc');
    return reply.send({ success: true, data: disbursements });
  });

  // GET /api/disbursements/:id - Get disbursement detail
  app.get('/api/disbursements/:id', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const disbursement = await db('project_disbursements').where({ id }).first();
    if (!disbursement) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Disbursement not found' } });
    }
    return reply.send({ success: true, data: disbursement });
  });

  // POST /api/disbursements/:id/approve - Captain co-approval
  app.post('/api/disbursements/:id/approve', {
    preHandler: [requireRole('CAPTAIN')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;

    const disbursement = await db('project_disbursements').where({ id }).first();
    if (!disbursement) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Disbursement not found' } });
    if (disbursement.status !== 'PENDING') {
      return reply.status(400).send({ success: false, error: { code: 'NOT_PENDING', message: 'Only PENDING disbursements can be approved' } });
    }

    const [updated] = await db('project_disbursements').where({ id }).update({
      status: 'APPROVED',
      updated_at: new Date(),
    }).returning('*');

    await logAudit({
      action: 'DISBURSEMENT_APPROVED',
      entityType: 'project_disbursement',
      entityId: id,
      performedBy: user.id,
      metadata: { amount: disbursement.amount },
    });

    return reply.send({ success: true, data: updated });
  });
}
