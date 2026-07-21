import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../db/connection.js';
import { egovPhService } from '../services/egovph.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { logAudit } from '../logic/audit.js';

export async function authRoutes(app: FastifyInstance) {
  // GET /api/auth/login - Redirect to eGovPH SSO
  // eGovPH will redirect back to our callback URL with ?exchange_code=...
  app.get('/api/auth/login', async (request, reply) => {
    // eGovPH SSO: the partner provides a base URL where eGovPH appends {exchange_code}
    // The user is redirected TO eGovPH, which authenticates them, then redirects BACK
    // to our callback URL with the exchange_code parameter.
    const callbackUrl = config.egovph.callbackUrl;
    const ssoUrl = `${config.egovph.baseUrl}/egovph/sso?callback_url=${encodeURIComponent(callbackUrl)}&partner_code=${config.egovph.partnerCode}`;
    return reply.redirect(ssoUrl);
  });

  // GET /api/auth/callback - eGovPH redirects here with exchange_code
  app.get('/api/auth/callback', async (request, reply) => {
    const { exchange_code } = request.query as { exchange_code?: string };

    if (!exchange_code) {
      // Redirect to frontend with error
      return reply.redirect('http://localhost:3001/login?error=no_code');
    }

    try {
      // Exchange code for profile via eGovPH
      const profile = await egovPhService.authenticateUser(exchange_code);

      // Upsert user in database
      const existingUser = await db('users').where({ egovph_imguid: profile.imguid }).first();

      let user;
      if (existingUser) {
        await db('users').where({ id: existingUser.id }).update({
          first_name: profile.first_name,
          middle_name: profile.middle_name,
          last_name: profile.last_name,
          email: profile.email,
          mobile: profile.mobile,
          gender: profile.gender,
          photo_url: profile.photo,
          last_login_at: new Date(),
          updated_at: new Date(),
        });
        user = { ...existingUser, first_name: profile.first_name, last_name: profile.last_name, email: profile.email };
      } else {
        const [newUser] = await db('users').insert({
          egovph_imguid: profile.imguid,
          email: profile.email,
          first_name: profile.first_name,
          middle_name: profile.middle_name,
          last_name: profile.last_name,
          suffix: profile.suffix,
          mobile: profile.mobile,
          gender: profile.gender,
          photo_url: profile.photo,
          role: 'CITIZEN',
          barangay_psgc: profile.barangay || null,
          municipality_psgc: profile.municipality || null,
          last_login_at: new Date(),
        }).returning('*');
        user = newUser;
      }

      // Generate JWT
      const tokenPayload = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        barangayPsgc: user.barangay_psgc,
        municipalityPsgc: user.municipality_psgc,
        mobile: user.mobile,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

      await logAudit({
        action: 'USER_LOGIN',
        entityType: 'user',
        entityId: user.id,
        performedBy: user.id,
        apiName: 'EGOVPH',
        apiEndpoint: '/api/partner/sso_authentication',
        metadata: { email: user.email, role: user.role },
      });

      // Redirect to frontend with token (citizen portal on port 3001)
      return reply.redirect(`http://localhost:3001/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(tokenPayload))}`);
    } catch (error: any) {
      return reply.redirect(`http://localhost:3001/login?error=auth_failed`);
    }
  });

  // POST /api/auth/callback - Exchange code for user session (API-based flow)
  app.post('/api/auth/callback', async (request, reply) => {
    const { exchange_code, role } = request.body as { exchange_code: string; role?: string };

    if (!exchange_code) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_CODE', message: 'exchange_code is required' },
      });
    }

    try {
      const profile = await egovPhService.authenticateUser(exchange_code);

      const existingUser = await db('users').where({ egovph_imguid: profile.imguid }).first();

      let user;
      if (existingUser) {
        await db('users').where({ id: existingUser.id }).update({
          first_name: profile.first_name,
          middle_name: profile.middle_name,
          last_name: profile.last_name,
          email: profile.email,
          mobile: profile.mobile,
          gender: profile.gender,
          last_login_at: new Date(),
          updated_at: new Date(),
        });
        user = existingUser;
      } else {
        const assignedRole = role || 'CITIZEN';
        const [newUser] = await db('users').insert({
          egovph_imguid: profile.imguid,
          email: profile.email,
          first_name: profile.first_name,
          middle_name: profile.middle_name,
          last_name: profile.last_name,
          suffix: profile.suffix,
          mobile: profile.mobile,
          gender: profile.gender,
          photo_url: profile.photo,
          role: assignedRole,
          barangay_psgc: profile.barangay || null,
          municipality_psgc: profile.municipality || null,
          last_login_at: new Date(),
        }).returning('*');
        user = newUser;
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        barangayPsgc: user.barangay_psgc,
        municipalityPsgc: user.municipality_psgc,
        mobile: user.mobile,
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });

      await logAudit({
        action: 'USER_LOGIN',
        entityType: 'user',
        entityId: user.id,
        performedBy: user.id,
        apiName: 'EGOVPH',
        apiEndpoint: '/api/partner/sso_authentication',
        metadata: { email: user.email, role: user.role },
      });

      return reply.send({
        success: true,
        data: { token, user: tokenPayload },
      });
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: { code: 'AUTH_FAILED', message: error.message || 'Authentication failed' },
      });
    }
  });

  // GET /api/auth/me - Get current user profile
  app.get('/api/auth/me', { preHandler: [authMiddleware] }, async (request, reply) => {
    const user = await db('users').where({ id: request.user!.id }).first();
    if (!user) {
      return reply.status(404).send({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }
    return reply.send({ success: true, data: user });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', { preHandler: [authMiddleware] }, async (request, reply) => {
    // JWT is stateless — client should discard the token
    return reply.send({ success: true, data: { message: 'Logged out successfully' } });
  });
}
