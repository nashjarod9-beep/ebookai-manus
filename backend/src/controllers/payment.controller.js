const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const plans = require('../config/plans');
const { getOrCreateSubscription } = require('../services/credit.service');

/**
 * Webhook de réception de paiement Stripe (ou simulation en développement)
 */
async function handlePaymentWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  const simulationSignature = req.headers['x-payment-simulation-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let isValid = false;
  let eventType = null;
  let paymentData = null;

  // 1. Signature Verification
  if (webhookSecret && signature) {
    // Real Stripe signature verification
    const parts = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const expectedSignature = parts['v1'];
    
    if (timestamp && expectedSignature) {
      const payload = `${timestamp}.${req.rawBody}`;
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(computedSignature, 'hex'),
          Buffer.from(expectedSignature, 'hex')
        );
      } catch (err) {
        isValid = false;
      }
    }

    if (isValid) {
      try {
        const stripeEvent = JSON.parse(req.rawBody);
        eventType = stripeEvent.type;
        paymentData = stripeEvent.data.object;
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON payload" });
      }
    }
  } else if (process.env.NODE_ENV === 'development' || !webhookSecret) {
    // Dev fallback / Simulation mode
    console.warn("[Payment Webhook] Stripe secret not set, running in developer simulation mode.");
    
    // Simple custom signature check for simulation security
    const simSecret = "neno_simulation_secret_2026";
    if (simulationSignature) {
      const computed = crypto.createHmac('sha256', simSecret).update(req.rawBody).digest('hex');
      isValid = computed === simulationSignature;
    } else {
      // Allow direct simulation in dev if no secret or signature header is provided
      isValid = true;
    }

    if (isValid) {
      try {
        const simEvent = JSON.parse(req.rawBody);
        eventType = simEvent.type;
        paymentData = simEvent.data;
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON payload" });
      }
    }
  }

  if (!isValid) {
    return res.status(401).json({ error: "Signature de paiement invalide ou manquante." });
  }

  console.log(`[Payment Webhook] Event received: ${eventType}`);

  try {
    // 2. Process events
    if (eventType === 'checkout.session.completed' || eventType === 'invoice.payment_succeeded') {
      const { userId, planId, actionType, creditPackAmount } = paymentData.metadata || {};

      if (!userId) {
        return res.status(400).json({ error: "Missing userId in metadata" });
      }

      if (actionType === 'purchase_credits') {
        // Purchase credit pack
        const packAmount = parseInt(creditPackAmount, 10);
        if (isNaN(packAmount)) {
          return res.status(400).json({ error: "Invalid credit pack amount" });
        }

        // Add credits
        await prisma.subscription.update({
          where: { userId },
          data: {
            creditsRemaining: { increment: packAmount }
          }
        });

        // Add transaction log
        await prisma.creditTransaction.create({
          data: {
            userId,
            action: 'credit_purchase',
            amount: packAmount
          }
        });

        // Log audit log
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'purchase',
            metadata: { type: 'credits', amount: packAmount }
          }
        });

        console.log(`[Payment Webhook] Successfully credited ${packAmount} credits to user ${userId}`);

      } else {
        // Upgrade / Change subscription plan
        const selectedPlan = plans[planId];
        if (!selectedPlan) {
          return res.status(400).json({ error: `Plan inconnu : ${planId}` });
        }

        const now = new Date();
        const cycleEndDate = new Date();
        cycleEndDate.setDate(now.getDate() + 30);

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan: planId,
            creditsAllocated: selectedPlan.credits,
            creditsRemaining: selectedPlan.credits, // Reset to plan credits
            cycleStartDate: now,
            cycleEndDate: cycleEndDate,
            status: 'active'
          },
          create: {
            userId,
            plan: planId,
            creditsAllocated: selectedPlan.credits,
            creditsRemaining: selectedPlan.credits,
            cycleStartDate: now,
            cycleEndDate: cycleEndDate,
            status: 'active'
          }
        });

        // Sync main User.plan too
        await prisma.user.update({
          where: { id: userId },
          data: { plan: planId }
        });

        // Add transaction log
        await prisma.creditTransaction.create({
          data: {
            userId,
            action: 'subscription_upgrade',
            amount: selectedPlan.credits
          }
        });

        // Log audit log
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'purchase',
            metadata: { type: 'subscription', plan: planId }
          }
        });

        console.log(`[Payment Webhook] Successfully updated subscription of user ${userId} to ${planId}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Payment Webhook Error]", error);
    return res.status(500).json({ error: "Internal server error processing payment" });
  }
}

/**
 * Endpoint protégé : Crée une session d'achat pour changer d'abonnement
 */
async function createCheckoutSession(req, res) {
  const { planId } = req.body;
  const userId = req.user.id;

  const selectedPlan = plans[planId];
  if (!selectedPlan) {
    return res.status(400).json({ error: "Plan d'abonnement invalide." });
  }

  // En mode simulation (sans clé Stripe), on retourne directement une réponse de simulation
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({
      checkoutUrl: `/billing?simulate=1&planId=${planId}&userId=${userId}`,
      simulation: true
    });
  }

  // TODO: Initialiser Stripe si la clé existe et créer une vraie Checkout Session
  // Pour l'instant on gère le checkout simulé pour faciliter les tests utilisateur
  return res.status(200).json({
    checkoutUrl: `/billing?simulate=1&planId=${planId}&userId=${userId}`,
    simulation: true
  });
}

/**
 * Endpoint protégé : Achat d'un pack de crédits complémentaire
 */
async function purchaseCreditPack(req, res) {
  const { packId } = req.body; // "pack_100" ou "pack_300"
  const userId = req.user.id;

  let priceFcfa = 0;
  let credits = 0;

  if (packId === 'pack_100') {
    priceFcfa = 2500;
    credits = 100;
  } else if (packId === 'pack_300') {
    priceFcfa = 6500;
    credits = 300;
  } else {
    return res.status(400).json({ error: "Pack de crédits inconnu." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({
      checkoutUrl: `/billing?simulate=1&actionType=purchase_credits&credits=${credits}&userId=${userId}`,
      simulation: true
    });
  }

  return res.status(200).json({
    checkoutUrl: `/billing?simulate=1&actionType=purchase_credits&credits=${credits}&userId=${userId}`,
    simulation: true
  });
}

/**
 * Récupère l'abonnement en cours et les crédits restants
 */
async function getMySubscription(req, res) {
  try {
    const userId = req.user.id;
    const sub = await getOrCreateSubscription(userId);
    return res.status(200).json(sub);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handlePaymentWebhook,
  createCheckoutSession,
  purchaseCreditPack,
  getMySubscription
};
