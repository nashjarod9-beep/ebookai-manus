// Test ALL packages that are required at startup (not lazy loaded)
const { createRequire } = require('module');
const require2 = createRequire(require('path').join(process.cwd(), 'src', 'server.js'));
const tests = [
  // Server deps
  'dotenv',
  '@sentry/node',
  'express',
  'cors',
  'helmet',
  'express-rate-limit',
  // Routes (which pull in controllers)
  'jsonwebtoken',
  '@prisma/client',
  // Services
  'sanitize-html',
  'marked',
  'zod',
  'bcryptjs',
  'archiver',
  'ioredis',
  'bullmq',
  '@supabase/supabase-js',
  'multer',
  'sharp',
];

let allOk = true;
for (const dep of tests) {
  try {
    require2(dep);
    console.log(`[OK] ${dep}`);
  } catch (err) {
    console.error(`[FAIL] ${dep}: ${err.message}`);
    allOk = false;
  }
}
if (allOk) {
  console.log('\n✅ All startup modules load successfully!');
} else {
  console.log('\n❌ Some modules failed - these will crash Vercel!');
  process.exit(1);
}
