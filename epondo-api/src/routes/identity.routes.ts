import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { livenessService } from '../services/liveness.service.js';
import { everifyService } from '../services/everify.service.js';
import { config } from '../config/env.js';
import { logAudit } from '../logic/audit.js';

export async function identityRoutes(app: FastifyInstance) {
  // POST /api/identity/liveness/create - Create Face Liveness session
  app.post('/api/identity/liveness/create', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const body = request.body as { action?: string; callback_url?: string; delay?: number };

    const session = await livenessService.createSession(
      (body.action as any) || 'redirect',
      body.callback_url || config.faceLiveness.callbackUrl,
      body.delay || 3000
    );

    await logAudit({
      action: 'LIVENESS_SESSION_CREATED',
      entityType: 'liveness_session',
      entityId: session.token,
      performedBy: request.user!.id,
      apiName: 'FACE_LIVENESS',
      apiEndpoint: '/v1/liveness/session',
    });

    return reply.status(201).send({ success: true, data: session });
  });

  // GET /api/identity/liveness/result/:token - Poll liveness result
  app.get('/api/identity/liveness/result/:token', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { token } = request.params as { token: string };

    const result = await livenessService.verifySession(token);

    await logAudit({
      action: 'LIVENESS_RESULT_CHECKED',
      entityType: 'liveness_session',
      entityId: token,
      performedBy: request.user!.id,
      apiName: 'FACE_LIVENESS',
      apiEndpoint: `/v1/liveness/result/${token}`,
      metadata: { verified: result.verified, score: result.score },
    });

    return reply.send({ success: true, data: result });
  });

  // POST /api/identity/verify - Verify via eVerify (demographics + liveness)
  app.post('/api/identity/verify', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const body = request.body as {
      first_name: string;
      middle_name?: string;
      last_name: string;
      suffix?: string;
      birth_date: string;
      face_liveness_session_id: string;
    };

    try {
      const result = await everifyService.verifyPersonalInfo(body);

      await logAudit({
        action: 'IDENTITY_VERIFIED',
        entityType: 'user',
        entityId: request.user!.id,
        performedBy: request.user!.id,
        apiName: 'EVERIFY',
        apiEndpoint: '/api/query',
        apiResponseSummary: { full_name: result.full_name, reference: result.reference },
      });

      return reply.send({ success: true, data: { verified: true, reference: result.reference, full_name: result.full_name } });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VERIFY_FAILED', message: error.response?.data?.message || 'Identity verification failed' },
      });
    }
  });

  // POST /api/identity/qr/check - QR code decode (no biometric)
  app.post('/api/identity/qr/check', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { value } = request.body as { value: string };

    try {
      const result = await everifyService.qrCheck(value);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(422).send({
        success: false,
        error: { code: 'INVALID_QR', message: 'Invalid QR code format' },
      });
    }
  });

  // POST /api/identity/qr/verify - QR code + biometric verify
  app.post('/api/identity/qr/verify', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const body = request.body as { value: string; face_liveness_session_id: string };

    try {
      const result = await everifyService.qrVerify(body.value, body.face_liveness_session_id);
      return reply.send({ success: true, data: { verified: true, profile: result } });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'QR_VERIFY_FAILED', message: 'QR verification failed' },
      });
    }
  });
}
