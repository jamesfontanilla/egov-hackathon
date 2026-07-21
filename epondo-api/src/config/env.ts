import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/epondo',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  everify: {
    baseUrl: process.env.EVERIFY_BASE_URL || '',
    clientId: process.env.EVERIFY_CLIENT_ID || '',
    clientSecret: process.env.EVERIFY_CLIENT_SECRET || '',
    pubkey: process.env.EVERIFY_PUBKEY || '',
  },

  faceLiveness: {
    baseUrl: process.env.FACE_LIVENESS_BASE_URL || '',
    apiKey: process.env.FACE_LIVENESS_API_KEY || '',
    callbackUrl: process.env.FACE_LIVENESS_CALLBACK_URL || '',
  },

  dbmCompass: {
    baseUrl: process.env.DBM_COMPASS_BASE_URL || '',
    apiKey: process.env.DBM_COMPASS_API_KEY || '',
  },

  emessage: {
    baseUrl: process.env.EMESSAGE_BASE_URL || '',
    apiToken: process.env.EMESSAGE_API_TOKEN || '',
  },

  ereport: {
    baseUrl: process.env.EREPORT_BASE_URL || '',
    accessToken: process.env.EREPORT_ACCESS_TOKEN || '',
  },

  egovai: {
    baseUrl: process.env.EGOVAI_BASE_URL || '',
    accessCode: process.env.EGOVAI_ACCESS_CODE || '',
  },
};
