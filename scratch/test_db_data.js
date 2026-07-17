const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres.fkgwawjqwzkdqoqwpnys:Nashjarod1997Ebook@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" }
  }
});

async function main() {
  try {
    console.log("Fetching users count...");
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, plan: true }
    });
    console.log("Users:", users);

    console.log("Fetching books count...");
    const books = await prisma.book.findMany({
      select: { id: true, title: true, userId: true, createdAt: true }
    });
    console.log("Books:", books);

  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
