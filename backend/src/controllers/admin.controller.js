const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAiUsageSummary = async (req, res, next) => {
  try {
    if (req.user.email !== 'nashjarod9@gmail.com') {
      return res.status(403).json({ message: "Accès refusé. Réservé à l'administrateur." });
    }

    const logs = await prisma.aiUsageLog.findMany({
      include: {
        user: {
          select: { plan: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = {};

    logs.forEach(log => {
      const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
      const provider = log.provider;
      const plan = log.user?.plan || 'free';

      const key = `${dateStr}_${provider}_${plan}`;

      if (!summary[key]) {
        summary[key] = {
          date: dateStr,
          provider,
          plan,
          count: 0,
          tokensOrCredits: 0,
          costEstimateFcfa: 0,
          durationMs: 0,
          successCount: 0
        };
      }

      summary[key].count += 1;
      summary[key].tokensOrCredits += log.tokensOrCredits;
      summary[key].costEstimateFcfa += log.costEstimateFcfa;
      summary[key].durationMs += log.durationMs;
      if (log.success) {
        summary[key].successCount += 1;
      }
    });

    res.json(Object.values(summary));
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    if (req.user.email !== 'nashjarod9@gmail.com') {
      return res.status(403).json({ message: "Accès refusé. Réservé à l'administrateur." });
    }

    const { userId } = req.query;

    const where = {};
    if (userId) {
      where.userId = userId;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(auditLogs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAiUsageSummary,
  getAuditLogs
};
