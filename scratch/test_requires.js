const { createRequire } = require('module');
const myRequire = createRequire(process.cwd() + '/src/server.js');

const deps = [
  '@google/generative-ai',
  '@prisma/client',
  '@sentry/node',
  '@sparticuz/chromium',
  '@supabase/supabase-js',
  'archiver',
  'bcryptjs',
  'bullmq',
  'cors',
  'dotenv',
  'express',
  'express-rate-limit',
  'helmet',
  'ioredis',
  'jsonwebtoken',
  'marked',
  'multer',
  'playwright-core',
  'sanitize-html',
  'sharp',
  'zod'
];

for (const dep of deps) {
  try {
    myRequire(dep);
    console.log(`[OK] ${dep}`);
  } catch (err) {
    console.error(`[FAIL] ${dep}:`, err.message);
  }
}
