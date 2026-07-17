const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres.fkgwawjqwzkdqoqwpnys:Nashjarod1997Ebook@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" }
  }
});

async function main() {
  const tables = ['user', 'book', 'chapter', 'generationJob', 'subscription', 'creditTransaction', 'auditLog'];
  for (const table of tables) {
    try {
      console.log(`Checking table ${table}...`);
      await prisma[table].findFirst();
      console.log(`[OK] Table ${table} exists.`);
    } catch (error) {
      console.error(`[MISSING/ERROR] Table ${table} fails:`, error.message);
    }
  }
  await prisma.$disconnect();
}

main();
