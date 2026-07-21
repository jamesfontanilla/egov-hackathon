import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../db/connection.js';
import { egovPhService } from '../services/egovph.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { logAudit } from '../logic/audit.js';

export async function authRoutes(app: FastifyInstance) {
  // GET /api/auth/login - Info about SSO (no redirect for hackathon)
  // In production, eGovPH's app redirects users to our callback with exchange_code.
  // For hackathon testing, use the test panel to generate an exchange code,
  // then POST it to /api/auth/callback
  app.get('/api/auth/login', async (request, reply) => {
    return reply.send({
      success: true,
      data: {
        message: 'eGovPH SSO - Hackathon Mode',
        instructions: 'Generate an exchange code from the eGovPH test panel, then POST it to /api/auth/callback',
        endpoint: 'POST /api/auth/callback',
        body: '{ "exchange_code": "YOUR_CODE_HERE" }',
        test_panel: 'https://platforms.e.gov.ph/dashboard/api-catalogs/egov-sso',
        test_account: 'josie@yopmail.com',
      },
    });
  });

  // GET /api/auth/callback - eGovPH redirects here with exchange_code after user authenticates
  app.get('/api/auth/callback', async (request, reply) => {
    const { exchange_code, code } = request.query as { exchange_code?: string; code?: string };
    const exchangeCode = exchange_code || code;

    if (!exchangeCode) {
      return reply.redirect('http://localhost:3001/login?error=no_code');
    }

    try {
      // Exchange code for user profile via eGovPH API
      const profile = await egovPhService.authenticateUser(exchangeCode);

      // Generate JWT (skip DB for now if DB is not running)
      const tokenPayload = {
        id: profile.uniqid,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: profile.middle_name,
        role: 'CITIZEN',
        mobile: profile.mobile,
        gender: profile.gender,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

      // Redirect to frontend with token
      return reply.redirect(`http://localhost:3001/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(tokenPayload))}`);
    } catch (error: any) {
      app.log.error(error, 'SSO callback error');
      return reply.redirect(`http://localhost:3001/login?error=auth_failed`);
    }
  });

  // POST /api/auth/callback - API-based exchange code flow (for testing)
  // Use this with the test panel: generate exchange code, then POST it here
  app.post('/api/auth/callback', async (request, reply) => {
    const { exchange_code } = request.body as { exchange_code: string };

    if (!exchange_code) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_CODE', message: 'exchange_code is required' },
      });
    }

    try {
      const profile = await egovPhService.authenticateUser(exchange_code.trim());

      const tokenPayload = {
        id: profile.uniqid,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: profile.middle_name,
        role: 'CITIZEN',
        mobile: profile.mobile,
        gender: profile.gender,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

      return reply.send({
        success: true,
        data: { token, user: tokenPayload },
      });
    } catch (error: any) {
      const upstreamStatus = error.response?.status;
      const status = upstreamStatus === 403 ? 403 : upstreamStatus === 422 ? 422 : 401;
      const code = upstreamStatus === 403
        ? 'EGOV_PARTNER_FORBIDDEN'
        : upstreamStatus === 422
          ? 'INVALID_EXCHANGE_CODE'
          : 'AUTH_FAILED';

      return reply.status(status).send({
        success: false,
        error: { code, message: error.response?.data?.message || error.message || 'Authentication failed' },
      });
    }
  });

  // GET /api/auth/me - Get current user profile
  app.get('/api/auth/me', { preHandler: [authMiddleware] }, async (request, reply) => {
    // Return the JWT payload directly (no DB needed for hackathon demo)
    return reply.send({ success: true, data: request.user });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (request, reply) => {
    return reply.send({ success: true, data: { message: 'Logged out successfully' } });
  });
}
