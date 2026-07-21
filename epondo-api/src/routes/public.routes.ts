import { FastifyInstance } from 'fastify';
import { mockBudgets, mockDisbursements, mockReports } from '../mock-data.js';

/**
 * Public routes that serve mock data for the hackathon demo.
 * These don't require authentication and bypass the database.
 */
export async function publicRoutes(app: FastifyInstance) {
  // GET /api/public/budgets - Public project data (no auth needed)
  app.get('/api/public/budgets', async (request, reply) => {
    const query = request.query as any;

    let budgets = [...mockBudgets];

    // Filter by status
    if (query.status) {
      const statuses = query.status.split(',');
      budgets = budgets.filter(b => statuses.includes(b.budget_status));
    }

    // Filter by barangay
    if (query.barangay_code) {
      budgets = budgets.filter(b => b.barangay_psgc === query.barangay_code);
    }

    // Attach disbursements to each budget
    const budgetsWithDisbursements = budgets.map(b => ({
      ...b,
      disbursements: mockDisbursements.filter(d => d.budget_id === b.id),
    }));

    return reply.send({
      success: true,
      data: budgetsWithDisbursements,
      pagination: { page: 1, limit: 25, total: budgets.length },
    });
  });

  // GET /api/public/projects - All projects/disbursements for map view
  app.get('/api/public/projects', async (request, reply) => {
    const query = request.query as any;

    let projects = [...mockDisbursements];

    if (query.barangay_code) {
      projects = projects.filter(p => p.barangayCode === query.barangay_code);
    }

    return reply.send({
      success: true,
      data: projects,
    });
  });

  // GET /api/public/barangay/:code - Barangay budget detail
  app.get('/api/public/barangay/:code', async (request, reply) => {
    const { code } = request.params as { code: string };

    const budget = mockBudgets.find(b => b.barangay_psgc === code);
    if (!budget) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Barangay budget not found' } });
    }

    const disbursements = mockDisbursements.filter(d => d.budget_id === budget.id);
    const totalSpent = disbursements.reduce((sum, d) => sum + d.amount, 0);
    const skSpent = disbursements.filter(d => d.fundCategory === 'SK').reduce((sum, d) => sum + d.amount, 0);
    const calamitySpent = disbursements.filter(d => d.fundCategory === 'Calamity').reduce((sum, d) => sum + d.amount, 0);

    return reply.send({
      success: true,
      data: {
        ...budget,
        name: budget.barangay_name,
        totalBudget: budget.total_approved_budget,
        skCeiling: budget.sk_allocation,
        skUtilization: budget.sk_allocation > 0 ? Math.round((skSpent / budget.sk_allocation) * 100) : 0,
        calamityCeiling: budget.calamity_allocation,
        calamityUtilization: budget.calamity_allocation > 0 ? Math.round((calamitySpent / budget.calamity_allocation) * 100) : 0,
        totalSpent,
        blockchainHash: budget.egovchain_tx_hash,
        disbursements,
      },
    });
  });

  // GET /api/public/reports/:caseNumber - Track report by case number
  app.get('/api/public/reports/:caseNumber', async (request, reply) => {
    const { caseNumber } = request.params as { caseNumber: string };

    const report = mockReports.find(r => r.case_number === decodeURIComponent(caseNumber));
    if (!report) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    return reply.send({ success: true, data: report });
  });
}
