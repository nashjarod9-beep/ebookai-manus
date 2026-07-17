const plans = {
  free: {
    id: "free",
    name: "Découverte",
    price: 0,
    credits: 0,
    features: [
      "Suggestion de titres gratuite",
      "Génération de plan gratuite",
      "1 chapitre d'essai gratuit",
      "Export PDF avec filigrane uniquement"
    ]
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 2500,
    credits: 130,
    features: [
      "130 crédits par mois",
      "Génération de couverture HD",
      "Génération d'illustrations standards",
      "Export PDF HD sans filigrane"
    ]
  },
  creator: {
    id: "creator",
    name: "Creator",
    price: 5000,
    credits: 265,
    features: [
      "265 crédits par mois",
      "Toutes les fonctionnalités Starter",
      "Historique illimité",
      "Génération multilingue",
      "Génération priorisée modérée"
    ]
  },
  business: {
    id: "business",
    name: "Business",
    price: 10000,
    credits: 530,
    features: [
      "530 crédits par mois",
      "Toutes les fonctionnalités Creator",
      "File d'attente prioritaire (haute priorité)"
    ]
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 20000,
    credits: 1055,
    features: [
      "1055 crédits par mois",
      "Toutes les fonctionnalités Business",
      "Multi-membres (invitation d'utilisateurs)",
      "Support prioritaire dédié"
    ]
  }
};

module.exports = plans;
