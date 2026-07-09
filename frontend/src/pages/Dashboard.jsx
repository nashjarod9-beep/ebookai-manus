import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEbooks } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import EbookCard from '../components/EbookCard';
import { Plus, CreditCard, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { data: ebooks, isLoading } = useEbooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Determine limits
  const planLimits = {
    free: 'Illimité (brouillons)',
    starter: 3,
    creator: 10,
    business: 25,
    agency: 60
  };

  const limit = planLimits[user?.plan || 'free'];
  const hasReachedQuota = user?.plan !== 'free' && user?.quotaRemaining <= 0;

  const handleCreateClick = (e) => {
    if (hasReachedQuota) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Subscription & Quota Card */}
      <div className="bg-card border rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Votre abonnement</span>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
              {user?.plan || 'free'}
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {user?.plan === 'free' 
              ? 'Profitez des brouillons et suggestions de titres' 
              : 'Générez des ebooks complets en haute définition'}
          </h2>
          {user?.plan !== 'free' && (
            <div className="pt-2 w-full max-w-sm">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Ebooks consommés : {user?.ebooksConsumed} / {limit}</span>
                <span>Restant : {user?.quotaRemaining}</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${(user?.ebooksConsumed / limit) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <Link 
          to="/pricing"
          className="flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl hover:bg-muted text-sm font-semibold transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          <span>Gérer l'abonnement</span>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Ebooks</h1>
        {hasReachedQuota ? (
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-md cursor-not-allowed opacity-60"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Ebook (Quota atteint)</span>
          </button>
        ) : (
          <Link 
            to="/create" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Ebook</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : ebooks?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ebooks.map(ebook => (
            <EbookCard key={ebook.id} ebook={ebook} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-xl border-dashed">
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'ebook.</p>
          {hasReachedQuota ? (
            <button onClick={() => setShowUpgradeModal(true)} className="text-primary hover:underline font-semibold">Créer mon premier ebook</button>
          ) : (
            <Link to="/create" className="text-primary hover:underline font-semibold">Créer mon premier ebook</Link>
          )}
        </div>
      )}

      {/* Upgrade Quota Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-10 h-10 shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Quota mensuel atteint !</h3>
                <p className="text-xs text-muted-foreground">Vous avez consommé la totalité de vos ebooks ce mois-ci.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Pour pouvoir créer un nouvel ebook dès maintenant, veuillez passer à une offre supérieure (Creator, Business ou Agency). 
              Vos crédits restants seront immédiatement mis à jour !
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border rounded-md text-sm hover:bg-muted font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/pricing');
                }}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm hover:bg-primary/90 font-semibold"
              >
                Changer d'offre
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
