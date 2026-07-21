import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'TREASURER' | 'CAPTAIN' | 'CBO_AUDITOR' | 'CITIZEN';
  barangayPsgc: string;
  municipalityPsgc: string;
  mobile: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    request.user = decoded;
  } catch {
    return reply.status(401).send({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'Token is invalid or expired' } });
  }
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authMiddleware(request, reply);
    if (reply.sent) return;

    if (!request.user || !roles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: `Requires one of: ${roles.join(', ')}` },
      });
    }
  };
}
