const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generatePlaygroundEbook } = require('../controllers/playground.controller');

// Limiteur de débit strict pour le playground (accessible sans connexion)
// Max 3 essais par heure par adresse IP
const playgroundLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: { 
    message: "Vous avez dépassé la limite de 3 essais gratuits par heure. Veuillez créer un compte gratuit pour continuer." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/generate', playgroundLimiter, generatePlaygroundEbook);

module.exports = router;
