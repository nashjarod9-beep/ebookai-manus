import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import { 
  Check, Loader2, Sparkles, BookOpen, Image as ImageIcon, 
  Download, FileText, Send, Smartphone, Package, Zap, ShoppingCart
} from 'lucide-react';

const tiers = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 FCFA',
    credits: '0 crédit',
    subtitle: 'Pour découvrir',
    features: [
      'Structure d\'ebook illimitée',
      'Suggestions de titres & plan',
      'Génération du 1er chapitre',
      'Aperçu PDF avec filigrane',
      'Téléchargements désactivés',
      'Outils marketing verrouillés',
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '2 500 FCFA',
    period: '/mois',
    credits: '50 crédits / mois',
    subtitle: 'Pour démarrer',
    features: [
      '50 crédits IA par mois',
      'Génération complète des chapitres',
      'Illustrations standard (Ideogram)',
      'Export PDF HD sans filigrane',
      'Fiche de vente AIDA',
      'Mockup publicitaire 3D HD',
      '10 scripts TikTok viraux',
      '5 messages WhatsApp promo',
    ]
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '5 000 FCFA',
    period: '/mois',
    credits: '150 crédits / mois',
    subtitle: 'Le plus populaire',
    popular: true,
    features: [
      '150 crédits IA par mois',
      'Couvertures HD (Flux) incluses',
      'Export HTML5 interactif (ZIP)',
      'Historique complet des ebooks',
      'Génération multilingue',
      'Toutes les fonctionnalités Starter',
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: '10 000 FCFA',
    period: '/mois',
    credits: '400 crédits / mois',
    subtitle: 'Pour les pros',
    features: [
      '400 crédits IA par mois',
      'Priorité dans la file IA',
      'Historique illimité',
      'Support prioritaire',
      'Toutes les fonctionnalités Creator',
    ]
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '20 000 FCFA',
    period: '/mois',
    credits: '1000 crédits / mois',
    subtitle: 'Pour les équipes',
    features: [
      '1000 crédits IA par mois',
      'Gestion multi-membres',
      'Support prioritaire 24/7',
      'Onboarding personnalisé',
      'Toutes les fonctionnalités Business',
    ]
  }
];

const creditActions = [
  { icon: BookOpen, label: 'Rédaction d\'un chapitre', cost: 1, color: 'text-violet-600 bg-violet-100' },
  { icon: ImageIcon, label: 'Couverture HD (Flux)', cost: 5, color: 'text-rose-600 bg-rose-100' },
  { icon: Sparkles, label: 'Illustration standard (Ideogram)', cost: 3, color: 'text-blue-600 bg-blue-100' },
  { icon: FileText, label: 'Fiche de vente complète', cost: 2, color: 'text-amber-600 bg-amber-100' },
  { icon: Send, label: 'Pack 10 scripts TikTok', cost: 2, color: 'text-pink-600 bg-pink-100' },
  { icon: Smartphone, label: 'Pack 5 messages WhatsApp', cost: 1, color: 'text-green-600 bg-green-100' },
  { icon: Download, label: 'Export PDF HD', cost: 2, color: 'text-indigo-600 bg-indigo-100' },
  { icon: Package, label: 'Export HTML5 interactif', cost: 3, color: 'text-teal-600 bg-teal-100' },
];

const creditPacks = [
  { credits: 20, price: '1 500 FCFA', perCredit: '75 FCFA/crédit' },
  { credits: 50, price: '3 000 FCFA', perCredit: '60 FCFA/crédit' },
  { credits: 100, price: '5 000 FCFA', perCredit: '50 FCFA/crédit', best: true },
  { credits: 300, price: '12 000 FCFA', perCredit: '40 FCFA/crédit' },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [customCredits, setCustomCredits] = useState(100);

  const customPrice = Math.round(customCredits * 50).toLocaleString('fr-FR');

  const handleSelectPlan = async (planId) => {
    setLoadingPlan(planId);
    try {
      const { data } = await api.post('/auth/update-plan', { plan: planId });
      const token = localStorage.getItem('token');
      if (token) {
        const updatedUser = { ...user, plan: data.user.plan };
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-pink-400/10 blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Tarifs & Crédits
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-serif">
            Choisissez l'offre qui vous convient
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-base leading-relaxed">
            Passez à la vitesse supérieure et libérez le plein potentiel créatif de{' '}
            <strong>Neno AI</strong> pour rédiger et vendre vos livres.
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all hover:-translate-y-1 duration-200 ${
                tier.popular
                  ? 'bg-gradient-to-b from-violet-600 to-purple-700 text-white shadow-2xl shadow-violet-500/30 scale-105'
                  : 'bg-white border border-slate-200 shadow-sm text-slate-800'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3" /> Recommandé
                </span>
              )}

              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${tier.popular ? 'text-violet-200' : 'text-slate-400'}`}>
                  {tier.subtitle}
                </p>
                <h3 className={`text-xl font-extrabold mb-1 ${tier.popular ? 'text-white' : 'text-slate-900'}`}>{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-2xl font-extrabold ${tier.popular ? 'text-white' : 'text-slate-900'}`}>{tier.price}</span>
                  {tier.period && <span className={`text-sm ${tier.popular ? 'text-violet-200' : 'text-slate-400'}`}>{tier.period}</span>}
                </div>
                <span className={`text-xs font-semibold inline-block mb-5 px-2.5 py-1 rounded-full ${tier.popular ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-700'}`}>
                  {tier.credits}
                </span>

                <ul className="space-y-2.5 mb-6 text-sm">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className={`flex gap-2 items-start ${tier.popular ? 'text-violet-100' : 'text-slate-600'}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-green-300' : 'text-violet-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(tier.id)}
                disabled={loadingPlan !== null || user?.plan === tier.id}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-auto ${
                  user?.plan === tier.id
                    ? tier.popular ? 'bg-white/20 text-white/70 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default'
                    : tier.popular
                      ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90'
                }`}
              >
                {loadingPlan === tier.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : user?.plan === tier.id ? (
                  '✓ Plan actuel'
                ) : tier.id === 'free' ? (
                  'Démarrer gratuitement'
                ) : (
                  'Choisir cette offre →'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How Credits Work */}
      <div className="bg-gradient-to-br from-slate-50 to-violet-50/50 border-y border-slate-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 font-serif mb-3">
              Comment fonctionnent les <span className="text-violet-600">Crédits IA</span> ?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              Chaque action sur Neno AI consomme un nombre précis de crédits. 
              Les crédits gratuits sont alloués automatiquement chaque mois selon votre plan.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {creditActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow text-center group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-600 leading-tight mb-2">{action.label}</p>
                  <span className={`text-lg font-extrabold ${action.color.split(' ')[0]}`}>
                    {action.cost} crédit{action.cost > 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Free actions note */}
          <div className="mt-6 text-center">
            <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-2 rounded-full">
              ✓ Suggestions de titres & génération du plan : <strong>GRATUIT</strong> sur tous les plans
            </span>
          </div>
        </div>
      </div>

      {/* Need More Capacity */}
      <div className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 font-serif mb-3">
            Besoin de plus de <span className="text-pink-600">capacité</span> ?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Achetez des crédits supplémentaires. Ils ne sont pas liés à un cycle et n'expirent jamais.
          </p>
        </div>

        {/* Credit Packs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {creditPacks.map((pack, i) => (
            <div
              key={i}
              className={`relative border rounded-2xl p-5 text-center transition-all hover:-translate-y-1 duration-200 ${
                pack.best
                  ? 'border-violet-400 bg-gradient-to-b from-violet-50 to-purple-50 shadow-lg shadow-violet-100'
                  : 'border-slate-200 bg-white hover:shadow-md'
              }`}
            >
              {pack.best && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  Meilleur rapport
                </span>
              )}
              <p className={`text-3xl font-extrabold mb-0.5 ${pack.best ? 'text-violet-700' : 'text-slate-800'}`}>
                {pack.credits}
              </p>
              <p className={`text-xs font-bold mb-3 ${pack.best ? 'text-violet-500' : 'text-slate-400'}`}>crédits</p>
              <p className={`text-xl font-extrabold mb-1 ${pack.best ? 'text-violet-900' : 'text-slate-900'}`}>{pack.price}</p>
              <p className="text-xs text-slate-400 mb-4">{pack.perCredit}</p>
              <button
                onClick={() => navigate('/billing?packs=true')}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  pack.best
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 shadow-md'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Acheter
              </button>
            </div>
          ))}
        </div>

        {/* Custom pack calculator */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-violet-400" />
              <p className="font-bold text-white text-sm">Recharge personnalisée</p>
            </div>
            <p className="text-slate-400 text-xs">Définissez votre capacité selon vos besoins. 50 FCFA/crédit.</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-semibold">Nombre de crédits</label>
              <input
                type="number"
                min={10}
                max={10000}
                value={customCredits}
                onChange={e => setCustomCredits(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-24 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm text-center focus:outline-none focus:border-violet-400"
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{customPrice} FCFA</p>
              <p className="text-xs text-slate-400">pour {customCredits} crédits</p>
            </div>
            <button
              onClick={() => navigate('/billing?packs=true')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Acheter {customCredits} crédits
            </button>
          </div>
        </div>
      </div>

      {/* FAQ / CTA */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4 font-serif">Prêt à créer votre premier ebook ?</h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Commencez gratuitement, sans carte bancaire. Passez à un plan payant quand vous êtes prêt.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
          >
            Créer un compte gratuit →
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
