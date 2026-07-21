import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { egovAiService } from '../services/egovai.service.js';

export async function aiRoutes(app: FastifyInstance) {
  // POST /api/ai/extract-document - Upload voucher for OCR
  app.post('/api/ai/extract-document', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    }

    const buffer = await data.toBuffer();
    const result = await egovAiService.documentExtractor(buffer, data.filename);
    return reply.send({ success: true, data: result });
  });

  // POST /api/ai/assistant - AI budget query
  app.post('/api/ai/assistant', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { prompt, category } = request.body as { prompt: string; category?: string };
    if (!prompt) {
      return reply.status(400).send({ success: false, error: { code: 'NO_PROMPT', message: 'prompt is required' } });
    }

    const result = await egovAiService.aiAssistant(prompt, category || 'PH');
    return reply.send({ success: true, data: result });
  });

  // POST /api/ai/laws - Laws & regulations query
  app.post('/api/ai/laws', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { prompt, category } = request.body as { prompt: string; category?: string };
    if (!prompt) {
      return reply.status(400).send({ success: false, error: { code: 'NO_PROMPT', message: 'prompt is required' } });
    }

    const result = await egovAiService.lawsAndRegulations(prompt, category || 'PH');
    return reply.send({ success: true, data: result });
  });

  // POST /api/ai/translate - Translate text
  app.post('/api/ai/translate', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { prompt, source_lang, target_lang } = request.body as {
      prompt: string;
      source_lang: string;
      target_lang: string;
    };

    if (!prompt || !source_lang || !target_lang) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'prompt, source_lang, and target_lang are required' },
      });
    }

    const result = await egovAiService.translator(prompt, source_lang, target_lang);
    return reply.send({ success: true, data: result });
  });

  // GET /api/ai/credits - Check remaining credits
  app.get('/api/ai/credits', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const credits = await egovAiService.getCredits();
    return reply.send({ success: true, data: credits });
  });
}
