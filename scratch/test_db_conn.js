const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const run = async () => {
  const url = "postgresql://postgres.fkgwawjqwzkdqoqwpnys:Nashjarod1997Ebook@db.fkgwawjqwzkdqoqwpnys.supabase.co:5432/postgres?sslmode=require&connect_timeout=30";
  console.log("Testing direct DB connection...");
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
