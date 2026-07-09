import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import { Check, Loader2, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const tiers = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0 FCFA',
      features: [
        'Création illimitée de structures',
        'Génération des suggestions de titres',
        'Génération du premier chapitre uniquement',
        'Aperçu PDF avec filigrane',
        'Téléchargements désactivés',
        'Outils marketing verrouillés'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '2 500 FCFA',
      period: '/mois',
      features: [
        '3 ebooks complets par mois',
        'Maximum 25 pages par ebook',
        'Génération des illustrations',
        'Export PDF HD (sans filigrane)',
        'Génération de la fiche produit',
        'Mockup publicitaire 1080x1080 (FLUX)',
        '10 scripts TikTok viraux',
        '5 messages WhatsApp promotionnels'
      ]
    },
    {
      id: 'creator',
      name: 'Creator',
      price: '5 000 FCFA',
      period: '/mois',
      popular: true,
      features: [
        '10 ebooks complets par mois',
        'Maximum 25 pages par ebook',
        'Historique complet des ebooks',
        'Génération plus rapide',
        'Plusieurs langues de rédaction',
        'Toutes les fonctionnalités Starter'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: '10 000 FCFA',
      period: '/mois',
      features: [
        '25 ebooks complets par mois',
        'Priorité dans la file d\'attente IA',
        'Historique illimité',
        'Toutes les fonctionnalités Creator'
      ]
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '20 000 FCFA',
      period: '/mois',
      features: [
        '60 ebooks complets par mois',
        'Gestion multi-membres / Équipe',
        'Support prioritaire 24/7',
        'Toutes les fonctionnalités Business'
      ]
    }
  ];

  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId);
    try {
      const { data } = await api.post('/auth/update-plan', { plan: planId });
      
      // Update local storage user details
      const token = localStorage.getItem('token');
      if (token) {
        // Simple trick to refresh token/user details
        const updatedUser = {
          ...user,
          plan: data.user.plan,
          quotaRemaining: data.user.quotaRemaining,
          ebooksConsumed: data.user.ebooksConsumed
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Trigger page reload or local state update
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour de l'abonnement.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choisissez l'offre qui vous convient</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Passez à la vitesse supérieure et libérez le plein potentiel créatif d'EbookAI pour rédiger et vendre vos livres.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
        {tiers.map((tier) => (
          <div 
            key={tier.id} 
            className={`border rounded-2xl p-6 bg-card flex flex-col justify-between relative transition-transform hover:scale-[1.02] ${tier.popular ? 'border-primary shadow-md ring-1 ring-primary' : 'border-border'}`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommandé
              </span>
            )}
            
            <div>
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-extrabold">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex gap-2 items-start text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan(tier.id)}
              disabled={loadingPlan !== null || user?.plan === tier.id}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors mt-auto ${
                user?.plan === tier.id 
                  ? 'bg-muted text-muted-foreground cursor-default' 
                  : tier.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {loadingPlan === tier.id ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : user?.plan === tier.id ? (
                'Plan actuel'
              ) : (
                'Choisir cette offre'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
