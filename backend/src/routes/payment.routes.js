const express = require('express');
const router = express.Router();
const { 
  handlePaymentWebhook, 
  createCheckoutSession, 
  purchaseCreditPack,
  getMySubscription 
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Webhook Stripe (Public - gère la vérification interne de signature)
router.post('/', handlePaymentWebhook);

// Gestion de l'abonnement et des crédits (Sécurisé)
router.get('/me', protect, getMySubscription);
router.post('/change-plan', protect, createCheckoutSession);
router.post('/purchase', protect, purchaseCreditPack);

module.exports = router;
