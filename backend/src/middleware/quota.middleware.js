const { checkAndReserveCredits, refundCredits } = require('../services/credit.service');

/**
 * Middleware de quota vérifiant et réservant les crédits avant toute action payante.
 * @param {string} action - L'identifiant de l'action dans creditCosts
 * @param {number|Function} getQuantity - La quantité de crédits à déduire (nombre fixe ou fonction extrayant du request)
 */
const checkQuota = (action, getQuantity = () => 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié." });
      }

      const qty = typeof getQuantity === 'function' ? getQuantity(req) : getQuantity;
      const bookId = req.body?.bookId || req.params?.id || req.params?.bookId || null;

      console.log(`[Quota Check] Checking credits for user ${userId} | Action: ${action} | Quantity: ${qty}`);
      
      const result = await checkAndReserveCredits(userId, action, qty, bookId);

      if (!result.allowed) {
        return res.status(403).json({ error: result.reason });
      }

      // Attache une fonction de remboursement automatique sur l'objet requête en cas d'échec
      let refunded = false;
      req.refundCredits = async (reason = "Route handler execution failure") => {
        if (refunded) return;
        refunded = true;
        await refundCredits(userId, action, qty, reason, bookId);
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkQuota;
