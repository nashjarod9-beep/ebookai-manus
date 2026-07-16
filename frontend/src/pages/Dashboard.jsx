import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEbooks, useDeleteEbook } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import { 
  Plus, CreditCard, AlertTriangle, BookOpen, FileText, 
  Image as ImageIcon, Sparkles, Send, Download, Trash2, Copy, Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const { data: ebooks, isLoading, refetch } = useEbooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteEbook = useDeleteEbook();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState(null);

  // Constants
  const planLimits = {
    free: 'Brouillons uniquement',
    starter: 3,
    creator: 10,
    business: 25,
    agency: 60
  };

  const planPrices = {
    free: 'Gratuit',
    starter: '2 500 FCFA/mois',
    creator: '5 000 FCFA/mois',
    business: '10 000 FCFA/mois',
    agency: '20 000 FCFA/mois'
  };

  const limit = planLimits[user?.plan || 'free'];
  const hasReachedQuota = user?.plan !== 'free' && user?.quotaRemaining <= 0 && user?.email !== 'nashjarod9@gmail.com';

  // Calculation helpers
  const totalCreated = ebooks?.length || 0;
  const lastBook = ebooks && ebooks.length > 0 ? ebooks[0] : null; // assumes sorted by createdAt desc
  
  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return 'N/A';
    const end = new Date(dateStr);
    const diffTime = end - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} jours` : 'Expiré';
  };

  // Ebook handlers
  const handleDuplicate = async (bookId) => {
    setDuplicatingId(bookId);
    try {
      await api.post(`/ebooks/duplicate/${bookId}`);
      refetch();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la duplication.");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (bookId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet ebook ? Cette action est irréversible.")) {
      await deleteEbook.mutateAsync(bookId);
      refetch();
    }
  };

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl space-y-10">
      
      {/* 1. Header block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground text-sm">Gérez vos abonnements, ebooks, visuels et campagnes marketing.</p>
        </div>
        
        {hasReachedQuota ? (
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-2 bg-muted text-muted-foreground px-5 py-2.5 rounded-xl cursor-not-allowed opacity-60 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Ebook (Quota atteint)</span>
          </button>
        ) : (
          <Link 
            to="/create" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary/90 text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Ebook</span>
          </Link>
        )}
      </div>

      {/* 2. Overhauled top statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Mon abonnement */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Mon abonnement</span>
            <h3 className="text-xl font-extrabold capitalize">{user?.plan || 'free'}</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>Tarif actif</span>
            <span className="font-semibold text-foreground">{planPrices[user?.plan || 'free']}</span>
          </div>
        </div>

        {/* Card 2: Quota restant */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Quota Restant</span>
            <h3 className="text-xl font-extrabold">
              {user?.plan === 'free' ? 'Brouillons illimités' : `${user?.quotaRemaining} ebooks`}
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>Limite mensuelle</span>
            <span className="font-semibold text-foreground">{limit}</span>
          </div>
        </div>

        {/* Card 3: Nombre d'ebooks créés */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Ebooks Créés</span>
            <h3 className="text-xl font-extrabold">{totalCreated} créations</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>Consommation totale</span>
            <span className="font-semibold text-foreground">{user?.ebooksConsumed || 0} ce mois-ci</span>
          </div>
        </div>

        {/* Card 4: Prochain renouvellement */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Facturation</span>
            <h3 className="text-xl font-extrabold">{getDaysRemaining(user?.subscriptionEnd)}</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <span>Date d'échéance</span>
            <span className="font-semibold text-foreground">
              {user?.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Section: Dernière génération & Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Dernière génération detail */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-md font-bold uppercase tracking-wider text-primary">Dernière génération</h2>
          
          {lastBook ? (
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-32 h-44 bg-muted rounded-lg overflow-hidden border shrink-0 flex items-center justify-center">
                {lastBook.coverUrl ? (
                  <img src={getFullUrl(lastBook.coverUrl)} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{lastBook.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Sujet : {lastBook.subject}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    lastBook.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {lastBook.status === 'ready' ? 'Prêt' : 'En rédaction'}
                  </span>
                  <span className="text-xs text-muted-foreground">Créé le {new Date(lastBook.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => navigate(`/editor/${lastBook.id}`)}
                    className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/95 shadow-sm"
                  >
                    Ouvrir l'éditeur
                  </button>
                  <button 
                    onClick={() => navigate(`/preview/${lastBook.id}`)}
                    className="text-xs border font-semibold px-3 py-1.5 rounded-lg hover:bg-muted"
                  >
                    Aperçu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Aucun ebook créé pour le moment.
            </div>
          )}
        </div>

        {/* Right Column: Actions Rapides */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-md font-bold uppercase tracking-wider text-primary">Actions rapides</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/create" 
              className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted text-center space-y-2 group transition-colors"
            >
              <Plus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Créer Ebook</span>
            </Link>

            <button 
              onClick={() => lastBook ? navigate(`/product-sheet/${lastBook.id}`) : navigate('/create')}
              className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted text-center space-y-2 group transition-colors"
            >
              <FileText className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Fiche de vente</span>
            </button>

            <button 
              onClick={() => lastBook ? navigate(`/marketing/visuals/${lastBook.id}`) : navigate('/create')}
              className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted text-center space-y-2 group transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Visuels 3D</span>
            </button>

            <button 
              onClick={() => lastBook ? navigate(`/marketing/content/${lastBook.id}`) : navigate('/create')}
              className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-muted text-center space-y-2 group transition-colors"
            >
              <Send className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Contenu Social</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Section: Historique (Tableau des ebooks) */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden space-y-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-md font-bold uppercase tracking-wider text-primary">Historique des Livres</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de l'historique...</div>
        ) : ebooks?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-xs font-bold uppercase text-muted-foreground border-b">
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {ebooks.map(ebook => (
                  <tr key={ebook.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/editor/${ebook.id}`} className="font-bold text-foreground hover:underline">
                        {ebook.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(ebook.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ebook.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ebook.status === 'ready' ? 'Prêt' : 'En rédaction'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Duplicate Button */}
                        <button 
                          onClick={() => handleDuplicate(ebook.id)}
                          disabled={duplicatingId === ebook.id}
                          className="p-2 hover:bg-muted rounded text-blue-500 hover:text-blue-700 tooltip"
                          title="Dupliquer"
                        >
                          {duplicatingId === ebook.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Download PDF Button */}
                        {ebook.status === 'ready' && (
                          <button 
                            onClick={() => navigate(`/preview/${ebook.id}`)}
                            className="p-2 hover:bg-muted rounded text-primary"
                            title="Télécharger / Voir"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(ebook.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 border-t">
            <p className="text-muted-foreground text-sm mb-4">Vous n'avez aucun ebook généré.</p>
            <Link to="/create" className="text-primary hover:underline font-semibold text-sm">Créer mon premier ebook</Link>
          </div>
        )}
      </div>

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
              <button onClick={() => setShowUpgradeModal(false)} className="px-4 py-2 border rounded-md text-sm hover:bg-muted font-medium">
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
