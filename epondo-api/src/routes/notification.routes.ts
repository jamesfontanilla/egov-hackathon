import { FastifyInstance } from 'fastify';
import { db } from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export async function notificationRoutes(app: FastifyInstance) {
  // GET /api/notifications - Get notification history for current user
  app.get('/api/notifications', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const user = request.user!;
    const query = request.query as { page?: string; limit?: string };

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '25');
    const offset = (page - 1) * limit;

    const notifications = await db('notification_logs')
      .where({ recipient_user_id: user.id })
      .orderBy('sent_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('notification_logs')
      .where({ recipient_user_id: user.id })
      .count('* as count');

    return reply.send({
      success: true,
      data: notifications,
      pagination: { page, limit, total: parseInt(count as string) },
    });
  });

  // GET /api/notifications/stats - Notification delivery stats
  app.get('/api/notifications/stats', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const stats = await db('notification_logs')
      .select('trigger_event')
      .count('* as count')
      .groupBy('trigger_event');

    const totalSent = await db('notification_logs').count('* as count').first();

    return reply.send({
      success: true,
      data: {
        totalSent: parseInt((totalSent as any).count),
        byEvent: stats,
      },
    });
  });
}
