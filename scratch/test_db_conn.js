const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const run = async () => {
  const url = "postgresql://postgres.fkgwawjqwzkdqoqwpnys:Nashjarod1997Ebook@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30&connection_limit=1";
  console.log("Testing port 5432 with connection_limit=1...");
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    const res = await prisma.$queryRaw`SELECT NOW()`;
    console.log("[SUCCESS] Connected successfully! Result:", res);
  } catch (err) {
    console.error("[ERROR] Connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
};

run();
