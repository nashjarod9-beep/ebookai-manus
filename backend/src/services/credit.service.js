const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const creditCosts = require('../config/creditCosts');
const plans = require('../config/plans');

/**
 * Assure qu'un utilisateur a un enregistrement d'abonnement actif (crée un plan gratuit par défaut si nécessaire)
 */
async function getOrCreateSubscription(userId) {
  let sub = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!sub) {
    const now = new Date();
    const cycleEndDate = new Date();
    cycleEndDate.setDate(now.getDate() + 30);

    // Get user details to see if they have a plan set on the User model
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userPlan = user?.plan || 'free';
    const planConfig = plans[userPlan] || plans.free;

    sub = await prisma.subscription.create({
      data: {
        userId,
        plan: userPlan,
        creditsAllocated: planConfig.credits,
        creditsRemaining: planConfig.credits,
        cycleStartDate: now,
        cycleEndDate: cycleEndDate,
        status: 'active'
      }
    });
  }
  return sub;
}

/**
 * Vérifie et réserve les crédits pour une action donnée
 */
async function checkAndReserveCredits(userId, action, quantity = 1, bookId = null) {
  const cost = creditCosts[action];
  if (cost === undefined) {
    throw new Error(`Action inconnue pour le calcul des crédits : ${action}`);
  }

  const totalCost = cost * quantity;

  // Si l'action est gratuite, elle est toujours autorisée
  if (totalCost === 0) {
    return { allowed: true, remaining: 0 };
  }

  const sub = await getOrCreateSubscription(userId);

  // Gérer le cas du plan gratuit d'essai
  if (sub.plan === 'free') {
    if (action === 'chapter_write') {
      // Vérifier si l'utilisateur a déjà écrit un chapitre (essai unique)
      const count = await prisma.creditTransaction.count({
        where: { userId, action: 'chapter_write' }
      });
      if (count === 0) {
        // Enregistrer la transaction d'essai à 0 crédit
        await prisma.creditTransaction.create({
          data: { userId, action, amount: 0, bookId }
        });
        return { allowed: true, remaining: 0 };
      }
      return { allowed: false, reason: "Votre chapitre d'essai gratuit a déjà été utilisé. Veuillez souscrire à un abonnement." };
    }
    if (action === 'export_pdf') {
      // Export avec filigrane non décompté pour le plan gratuit
      return { allowed: true, remaining: 0 };
    }
    return { allowed: false, reason: "Cette action requiert un abonnement Starter, Creator ou supérieur." };
  }

  // Vérifier le solde de crédits restant
  if (sub.creditsRemaining < totalCost) {
    return { allowed: false, reason: `Crédits insuffisants. Cette action requiert ${totalCost} crédits (solde actuel : ${sub.creditsRemaining}).` };
  }

  // Déduire les crédits
  const updatedSub = await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      creditsRemaining: {
        decrement: totalCost
      }
    }
  });

  // Enregistrer la transaction de débit
  await prisma.creditTransaction.create({
    data: {
      userId,
      action,
      amount: -totalCost,
      bookId
    }
  });

  return { allowed: true, remaining: updatedSub.creditsRemaining };
}

/**
 * Rembourse des crédits en cas d'échec d'une action IA
 */
async function refundCredits(userId, action, quantity = 1, reason = "", bookId = null) {
  const cost = creditCosts[action];
  if (cost === undefined || cost === 0) {
    return { success: true };
  }

  const totalRefund = cost * quantity;
  const sub = await getOrCreateSubscription(userId);

  // Le plan gratuit n'a pas de crédits payants à rembourser
  if (sub.plan === 'free') {
    return { success: true, remaining: 0 };
  }

  const updatedSub = await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      creditsRemaining: {
        increment: totalRefund
      }
    }
  });

  // Enregistrer la transaction de remboursement
  await prisma.creditTransaction.create({
    data: {
      userId,
      action,
      amount: totalRefund,
      bookId
    }
  });

  console.log(`[Credits] Refunded ${totalRefund} credits to user ${userId} for ${action}. Reason: ${reason}`);

  return { success: true, remaining: updatedSub.creditsRemaining };
}

/**
 * Récupère le solde de crédits restants
 */
async function getRemainingCredits(userId) {
  const sub = await getOrCreateSubscription(userId);
  return {
    plan: sub.plan,
    creditsRemaining: sub.creditsRemaining,
    creditsAllocated: sub.creditsAllocated,
    cycleEndDate: sub.cycleEndDate,
    status: sub.status
  };
}

/**
 * Job planifié de renouvellement mensuel des crédits
 */
async function resetSubscriptionCreditsMonthly() {
  const now = new Date();
  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: 'active',
      cycleEndDate: {
        lte: now
      }
    }
  });

  console.log(`[Credits Renewal] Found ${expiredSubs.length} subscriptions to renew.`);

  for (const sub of expiredSubs) {
    const planConfig = plans[sub.plan] || plans.free;
    const nextEndDate = new Date();
    nextEndDate.setDate(now.getDate() + 30);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        creditsRemaining: planConfig.credits,
        creditsAllocated: planConfig.credits,
        cycleStartDate: now,
        cycleEndDate: nextEndDate
      }
    });

    console.log(`[Credits Renewal] Renewed ${sub.plan} subscription for user ${sub.userId} to ${planConfig.credits} credits.`);
  }
}

module.exports = {
  getOrCreateSubscription,
  checkAndReserveCredits,
  refundCredits,
  getRemainingCredits,
  resetSubscriptionCreditsMonthly
};
