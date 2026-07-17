const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * RGPD : Exportation complète des données de l'utilisateur sous forme de JSON
 */
async function exportUserData(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch all database records related to this user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        books: {
          include: {
            chapters: true,
            marketingAsset: true,
            generationJobs: true
          }
        },
        creditTransactions: true,
        aiUsageLogs: true,
        auditLogs: true,
        storageAssets: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Remove hashed password for security
    const sanitizedData = { ...user };
    delete sanitizedData.passwordHash;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=export_rgpd_user_${userId}.json`);

    return res.status(200).send(JSON.stringify(sanitizedData, null, 2));
  } catch (error) {
    next(error);
  }
}

/**
 * RGPD : Suppression de compte avec purge en cascade des données personnelles
 */
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;
    const { passwordConfirm } = req.body;
    const bcrypt = require('bcryptjs');

    if (!passwordConfirm) {
      return res.status(400).json({ message: "Veuillez fournir votre mot de passe pour confirmer la suppression." });
    }

    // Get current user password hash
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const isMatch = await bcrypt.compare(passwordConfirm, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe de confirmation incorrect." });
    }

    // Log the sensitive delete action before purging the user record
    // Since Cascade Delete will purge the AuditLog table for this user, we don't necessarily persist this log,
    // but if the database has cascade delete, it will clear everything.
    console.log(`[GDPR Delete] Purging all personal data for user ${userId} (${user.email})`);

    // Delete user from DB. Prisma Cascade onDelete configuration will automatically delete books, chapters, subscription, logs, etc.
    await prisma.user.delete({
      where: { id: userId }
    });

    return res.status(200).json({ message: "Votre compte et l'intégralité de vos données personnelles ont été supprimés avec succès." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportUserData,
  deleteAccount
};
