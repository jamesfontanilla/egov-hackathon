import { FastifyInstance } from 'fastify';
import { promisify } from 'node:util';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { db } from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const scrypt = promisify(scryptCallback);
const VALID_ROLES = ['TREASURER', 'CAPTAIN', 'CBO_AUDITOR', 'CITIZEN'] as const;
type AppRole = (typeof VALID_ROLES)[number];

interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  role: AppRole;
  barangay_psgc: string | null;
  municipality_psgc: string | null;
  mobile: string | null;
  gender: string | null;
  is_active: boolean;
}

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash) return false;

  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  try {
    const derivedKey = await scrypt(password, salt, 64) as Buffer;
    const expectedKey = Buffer.from(hash, 'hex');
    return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
  } catch {
    return false;
  }
}

function isRole(value: unknown): value is AppRole {
  return typeof value === 'string' && VALID_ROLES.includes(value as AppRole);
}

function toAuthUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    middleName: user.middle_name || '',
    lastName: user.last_name,
    role: user.role,
    barangayPsgc: user.barangay_psgc,
    municipalityPsgc: user.municipality_psgc,
    mobile: user.mobile || '',
    gender: user.gender || '',
  };
}

function issueToken(user: UserRow): string {
  return jwt.sign(toAuthUser(user), config.jwtSecret, { expiresIn: '24h' });
}

function invalidCredentials(reply: any) {
  return reply.status(401).send({
    success: false,
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  });
}

export async function authRoutes(app: FastifyInstance) {
  // GET /api/auth/login - Local authentication information
  app.get('/api/auth/login', async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        message: 'Local email/password authentication',
        login_endpoint: 'POST /api/auth/login',
        registration_endpoint: 'POST /api/auth/register',
      },
    });
  });

  // POST /api/auth/register - Create a local account
  app.post('/api/auth/register', async (request, reply) => {
    const body = request.body as {
      email?: string;
      password?: string;
      first_name?: string;
      firstName?: string;
      middle_name?: string;
      middleName?: string;
      last_name?: string;
      lastName?: string;
      mobile?: string;
      gender?: string;
      role?: string;
      barangay_psgc?: string;
      municipality_psgc?: string;
    };

    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const firstName = (body.first_name || body.firstName || '').trim();
    const middleName = (body.middle_name || body.middleName || '').trim() || null;
    const lastName = (body.last_name || body.lastName || '').trim();

    if (!email || !email.includes('@') || !firstName || !lastName || password.length < 8) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_REGISTRATION',
          message: 'Provide a valid email, first name, last name, and a password of at least 8 characters',
        },
      });
    }

    try {
      const passwordHash = await hashPassword(password);
      const existingUser = await db<UserRow>('users').where({ email }).first();

      // Allow existing legacy users to set a local password during migration.
      if (existingUser) {
        if (existingUser.password_hash) {
          return reply.status(409).send({
            success: false,
            error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists' },
          });
        }

        const [updatedUser] = await db('users')
          .where({ id: existingUser.id })
          .update({
            password_hash: passwordHash,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            mobile: body.mobile?.trim() || existingUser.mobile,
            gender: body.gender?.trim() || existingUser.gender,
            last_login_at: new Date(),
            updated_at: new Date(),
          })
          .returning('*');

        const token = issueToken(updatedUser);
        return reply.status(201).send({ success: true, data: { token, user: toAuthUser(updatedUser) } });
      }

      // Role selection is useful for the local hackathon demo. Production deployments
      // should assign official roles through an administrator instead.
      const role: AppRole = config.nodeEnv === 'development' && isRole(body.role) ? body.role : 'CITIZEN';
      const [user] = await db('users')
        .insert({
          email,
          password_hash: passwordHash,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          mobile: body.mobile?.trim() || null,
          gender: body.gender?.trim() || null,
          role,
          barangay_psgc: body.barangay_psgc?.trim() || null,
          municipality_psgc: body.municipality_psgc?.trim() || null,
          is_active: true,
          last_login_at: new Date(),
        })
        .returning('*');

      const token = issueToken(user);
      return reply.status(201).send({ success: true, data: { token, user: toAuthUser(user) } });
    } catch (error: any) {
      app.log.error({ err: error }, 'Local registration failed');
      return reply.status(500).send({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: 'Unable to create the account' },
      });
    }
  });

  // POST /api/auth/login - Authenticate with local email/password credentials
  app.post('/api/auth/login', async (request, reply) => {
    const body = request.body as { email?: string; password?: string };
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) return invalidCredentials(reply);

    try {
      const user = await db<UserRow>('users').where({ email }).first();
      if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
        return invalidCredentials(reply);
      }

      await db('users').where({ id: user.id }).update({ last_login_at: new Date() });
      const token = issueToken(user);
      return reply.send({ success: true, data: { token, user: toAuthUser(user) } });
    } catch (error: any) {
      app.log.error({ err: error }, 'Local login failed');
      return reply.status(500).send({
        success: false,
        error: { code: 'LOGIN_FAILED', message: 'Unable to authenticate right now' },
      });
    }
  });

  // GET /api/auth/me - Get the current authenticated user
  app.get('/api/auth/me', { preHandler: [authMiddleware] }, async (request, reply) => {
    return reply.send({ success: true, data: request.user });
  });

  // POST /api/auth/logout - JWT logout is handled by clearing the client token
  app.post('/api/auth/logout', async (_request, reply) => {
    return reply.send({ success: true, data: { message: 'Logged out successfully' } });
  });
}
