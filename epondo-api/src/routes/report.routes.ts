import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { ereportService } from '../services/ereport.service.js';

export async function reportRoutes(app: FastifyInstance) {
  // ===== Dataset Endpoints (PUBLIC — no user auth required) =====
  // These use the backend's integration_token to call eReport.
  // Geographic reference data should be accessible to all users including anonymous.

  // GET /api/reports/datasets/report-types
  app.get('/api/reports/datasets/report-types', async (request, reply) => {
    try {
      const data = await ereportService.getReportTypes();
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(502).send({ success: false, error: { code: 'EREPORT_ERROR', message: err.response?.data?.message || 'Failed to fetch report types' } });
    }
  });

  // GET /api/reports/datasets/regions
  app.get('/api/reports/datasets/regions', async (request, reply) => {
    try {
      const data = await ereportService.getRegions();
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(502).send({ success: false, error: { code: 'EREPORT_ERROR', message: err.response?.data?.message || 'Failed to fetch regions' } });
    }
  });

  // GET /api/reports/datasets/provinces
  app.get('/api/reports/datasets/provinces', async (request, reply) => {
    const { region_code } = request.query as { region_code: string };
    if (!region_code) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_PARAM', message: 'region_code is required' } });
    }
    try {
      const data = await ereportService.getProvinces(region_code);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(502).send({ success: false, error: { code: 'EREPORT_ERROR', message: err.response?.data?.message || 'Failed to fetch provinces' } });
    }
  });

  // GET /api/reports/datasets/municipalities
  app.get('/api/reports/datasets/municipalities', async (request, reply) => {
    const { province_code } = request.query as { province_code: string };
    if (!province_code) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_PARAM', message: 'province_code is required' } });
    }
    try {
      const data = await ereportService.getMunicipalities(province_code);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(502).send({ success: false, error: { code: 'EREPORT_ERROR', message: err.response?.data?.message || 'Failed to fetch municipalities' } });
    }
  });

  // GET /api/reports/datasets/barangays
  app.get('/api/reports/datasets/barangays', async (request, reply) => {
    const { municipality_code } = request.query as { municipality_code: string };
    if (!municipality_code) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_PARAM', message: 'municipality_code is required' } });
    }
    try {
      const data = await ereportService.getBarangays(municipality_code);
      return reply.send({ success: true, data });
    } catch (err: any) {
      return reply.status(502).send({ success: false, error: { code: 'EREPORT_ERROR', message: err.response?.data?.message || 'Failed to fetch barangays' } });
    }
  });

  // ===== Core Report Endpoints (require user auth) =====

  // POST /api/reports/submit - Submit citizen complaint
  // Matches eReport API: POST /api/integration/submit_complaint
  // Required fields: mobile, first_name, last_name, gender, complainant_email,
  // report_type, excerpt, message, evidences, psgc_code, province_name,
  // municipality_code, municipality_name, barangay_code, barangay_name,
  // category, longitude, latitude
  app.post('/api/reports/submit', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const body = request.body as any;

    // Validate required fields per eReport API docs
    const requiredFields = [
      'mobile', 'first_name', 'last_name', 'gender', 'complainant_email',
      'report_type', 'excerpt', 'message', 'psgc_code', 'province_name',
      'municipality_code', 'municipality_name', 'barangay_code', 'barangay_name',
      'category', 'longitude', 'latitude',
    ];
    const missing = requiredFields.filter(f => !body[f]);
    if (missing.length > 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_FIELDS', message: `Missing required fields: ${missing.join(', ')}` },
      });
    }

    // Ensure evidences is an array
    if (!Array.isArray(body.evidences)) {
      body.evidences = body.evidences ? [body.evidences] : [];
    }

    const result = await ereportService.submitComplaint(body);
    return reply.send({ success: true, data: result });
  });

  // POST /api/reports/verify/request - Request OTP
  app.post('/api/reports/verify/request', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { email } = request.body as { email: string };
    if (!email) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_EMAIL', message: 'email is required' } });
    }
    const result = await ereportService.requestOtp(email);
    return reply.send({ success: true, data: result });
  });

  // POST /api/reports/verify/confirm - Confirm OTP
  // Returns report_view_token that the frontend must save and pass as
  // X-EReport-View-Token header for subsequent report list/view calls
  app.post('/api/reports/verify/confirm', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { email, otp } = request.body as { email: string; otp: string };
    if (!email || !otp) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_PARAMS', message: 'email and otp are required' } });
    }
    const result = await ereportService.confirmOtp(email, otp);
    // The response contains report_view_token which the frontend must store
    // and include as X-EReport-View-Token header for GET /reports and GET /reports/:caseNumber
    return reply.send({ success: true, data: result });
  });

  // GET /api/reports - List reports (requires view token)
  app.get('/api/reports', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const viewToken = request.headers['x-ereport-view-token'] as string;
    if (!viewToken) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_TOKEN', message: 'X-EReport-View-Token header required. Complete OTP verification first.' } });
    }

    const query = request.query as { q?: string; page?: string; limit?: string };
    const data = await ereportService.getReports(viewToken, {
      q: query.q,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });
    return reply.send({ success: true, data });
  });

  // GET /api/reports/:caseNumber - View report by case number
  app.get('/api/reports/:caseNumber', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { caseNumber } = request.params as { caseNumber: string };
    const viewToken = request.headers['x-ereport-view-token'] as string;
    if (!viewToken) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_TOKEN', message: 'X-EReport-View-Token header required' } });
    }

    const data = await ereportService.getReportByCaseNumber(viewToken, caseNumber);
    return reply.send({ success: true, data });
  });
}
