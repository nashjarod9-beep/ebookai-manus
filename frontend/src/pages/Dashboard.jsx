import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEbooks, useDeleteEbook } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, AlertTriangle, BookOpen, FileText, 
  Image as ImageIcon, Sparkles, Send, Download, Trash2, Copy, Loader2,
  MoreVertical, Search, HelpCircle, Eye
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fadeInUp, staggerChildren } from '../design-system/motion';

export default function Dashboard() {
  const { data: ebooks, isLoading, refetch } = useEbooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteEbook = useDeleteEbook();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState(null);
  
  // États de recherche, filtres et pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const itemsPerPage = 5;

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

  // Calculs statistiques
  const totalCreated = ebooks?.length || 0;
  const lastBook = ebooks && ebooks.length > 0 ? ebooks[0] : null;
  
  // Pourcentage de quotas restants
  const totalAllocated = (user?.quotaRemaining || 0) + (user?.ebooksConsumed || 0);
  const percentRemaining = totalAllocated > 0 ? Math.round((user?.quotaRemaining / totalAllocated) * 100) : 0;

  // Valeur financière générée (15 000 FCFA de valeur moyenne estimée par ebook)
  const estimatedValue = totalCreated * 15000;

  // Fermer les menus d'actions actifs si clic en dehors
  useEffect(() => {
    const handleClose = () => setActiveMenuId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return 'N/A';
    const end = new Date(dateStr);
    const diffTime = end - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} jours` : 'Expiré';
  };

  // Handlers
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

  // Filtrage et pagination
  const filteredEbooks = ebooks ? ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'ready' && ebook.status === 'ready') ||
      (statusFilter === 'draft' && ebook.status !== 'ready');
    return matchesSearch && matchesStatus;
  }) : [];

  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);
  const paginatedEbooks = filteredEbooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Activités récentes narratives
  const recentActivity = ebooks ? ebooks.slice(0, 3).map(ebook => {
    const diffDays = Math.ceil((new Date() - new Date(ebook.createdAt)) / (1000 * 60 * 60 * 24));
    let timeText = `il y a ${diffDays} jours`;
    if (diffDays === 0) timeText = "aujourd'hui";
    else if (diffDays === 1) timeText = "hier";
    
    return {
      id: ebook.id,
      text: `Vous avez ${ebook.status === 'ready' ? 'finalisé la rédaction de' : 'commencé le brouillon de'} '${ebook.title}' ${timeText}.`,
      title: ebook.title,
      date: ebook.createdAt
    };
  }) : [];

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="container mx-auto px-4 py-8 md:px-6 md:py-10 max-w-7xl space-y-10"
    >
      
      {/* 1. Header Cockpit */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-serif text-white text-left">
            Bonjour {user?.name || 'Créateur'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-left">
            Que souhaitez-vous créer aujourd'hui ?
          </p>
        </div>
        
        {hasReachedQuota ? (
          <Button 
            onClick={() => setShowUpgradeModal(true)}
            variant="primary"
            className="flex items-center gap-2 cursor-not-allowed opacity-60"
          >
            <Plus className="w-5 h-5" />
            <span>AI Creator Journey (Quota atteint)</span>
          </Button>
        ) : (
          <Button 
            onClick={() => navigate('/create')} 
            variant="primary"
            className="flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span>AI Creator Journey</span>
          </Button>
        )}
      </motion.div>

      {/* 2. Cartes Cockpit Premium (Staggered) */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Ebooks créés */}
        <Card hoverEffect={true} className="p-5 flex flex-col justify-between h-full bg-surface-1/40 border border-white/5 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">Ebooks Créés</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalCreated}</h3>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5 mt-4">
            <span>Consommation globale</span>
            <span className="font-semibold text-white">{user?.ebooksConsumed || 0} ce mois-ci</span>
          </div>
        </Card>

        {/* Card 2: Crédits IA restants */}
        <Card hoverEffect={true} className="p-5 flex flex-col justify-between h-full bg-surface-1/40 border border-white/5 text-left">
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">Crédits IA Restants</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {user?.plan === 'free' ? 'Brouillons' : `${user?.quotaRemaining} / ${totalAllocated}`}
              </h3>
            </div>
            {/* Linear Progress Bar */}
            {user?.plan !== 'free' && (
              <div className="space-y-1">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${percentRemaining}%` }} />
                </div>
                <p className="text-[9px] text-slate-400 text-right">{percentRemaining}% restants</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5 mt-4">
            <span>Limite mensuelle</span>
            <span className="font-semibold text-white">{limit}</span>
          </div>
        </Card>

        {/* Card 3: Valeur financière générée */}
        <Card hoverEffect={true} className="p-5 flex flex-col justify-between h-full bg-surface-1/40 border border-white/5 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1">
              Valeur Générée 
              <div className="group relative cursor-pointer inline-block">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 border border-white/10 text-[9px] text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-normal shadow-xl">
                  Basé sur une valeur moyenne estimée de 15 000 FCFA par produit digital professionnel généré.
                </div>
              </div>
            </span>
            <h3 className="text-3xl font-extrabold text-brand-success mt-1">
              {estimatedValue.toLocaleString('fr-FR')} FCFA
            </h3>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5 mt-4">
            <span>Économie estimée</span>
            <span className="font-semibold text-white">≈ 100% automatique</span>
          </div>
        </Card>

        {/* Card 4: Abonnement actuel */}
        <Card hoverEffect={true} className="p-5 flex flex-col justify-between h-full bg-surface-1/40 border border-white/5 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">Abonnement Actuel</span>
            <h3 className="text-2xl font-extrabold capitalize text-white mt-1">{user?.plan || 'free'}</h3>
          </div>
          <div className="flex flex-col gap-2 pt-4 border-t border-white/5 mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Date d'échéance</span>
              <span className="font-semibold text-white">{getDaysRemaining(user?.subscriptionEnd)}</span>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/pricing')}
              className="text-xs px-3 py-1.5 w-full mt-1.5"
            >
              Changer d'offre
            </Button>
          </div>
        </Card>

      </motion.div>

      {/* 3. Section: Dernière génération & Raccourcis */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Dernière génération */}
        <Card hoverEffect={false} className="lg:col-span-2 p-6 bg-surface-1/30 border border-white/5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-accent mb-4 text-left">Dernière génération</h2>
          
          {lastBook ? (
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-28 h-36 bg-surface-0 rounded-xl overflow-hidden border border-white/10 shrink-0 flex items-center justify-center shadow-lg">
                {lastBook.coverUrl ? (
                  <img src={getFullUrl(lastBook.coverUrl)} alt="Couverture" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div className="space-y-3 flex-1 text-left">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight font-serif">{lastBook.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Thème : {lastBook.subject}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    lastBook.status === 'ready' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {lastBook.status === 'ready' ? 'Terminé' : 'En rédaction'}
                  </span>
                  <span className="text-xs text-slate-400">Généré le {new Date(lastBook.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="primary"
                    onClick={() => navigate(`/editor/${lastBook.id}`)}
                    className="text-xs px-3.5 py-1.5"
                  >
                    Ouvrir l'éditeur
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => navigate(`/preview/${lastBook.id}`)}
                    className="text-xs px-3.5 py-1.5"
                  >
                    Aperçu
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm">
              Aucun ebook créé pour le moment.
            </div>
          )}
        </Card>

        {/* Right Column: Actions Rapides */}
        <Card hoverEffect={false} className="p-6 bg-surface-1/30 border border-white/5 flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-accent mb-4 text-left">Actions rapides</h2>
          
          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link 
              to="/create" 
              className="flex flex-col items-center justify-center p-4 border border-white/5 rounded-xl hover:bg-white/5 text-center space-y-2 group transition-colors bg-white/5"
            >
              <Plus className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white leading-tight">AI Creator Journey</span>
            </Link>

            <button 
              onClick={() => lastBook ? navigate(`/product-sheet/${lastBook.id}`) : navigate('/create')}
              className="flex flex-col items-center justify-center p-4 border border-white/5 rounded-xl hover:bg-white/5 text-center space-y-2 group transition-colors bg-white/5"
            >
              <FileText className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white leading-tight">Fiche de vente</span>
            </button>

            <button 
              onClick={() => lastBook ? navigate(`/marketing/visuals/${lastBook.id}`) : navigate('/create')}
              className="flex flex-col items-center justify-center p-4 border border-white/5 rounded-xl hover:bg-white/5 text-center space-y-2 group transition-colors bg-white/5"
            >
              <ImageIcon className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white leading-tight">Visuels 3D</span>
            </button>

            <button 
              onClick={() => lastBook ? navigate(`/marketing/content/${lastBook.id}`) : navigate('/create')}
              className="flex flex-col items-center justify-center p-4 border border-white/5 rounded-xl hover:bg-white/5 text-center space-y-2 group transition-colors bg-white/5"
            >
              <Send className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-white leading-tight">Contenu Social</span>
            </button>
          </div>
        </Card>

      </motion.div>

      {/* 4. Section: Historique (Tableau ou Liste de cartes responsive) */}
      <motion.div variants={fadeInUp} className="bg-surface-1/30 border border-white/5 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
          <h2 className="text-xl font-bold font-serif text-white">Historique des Livres</h2>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Rechercher par titre..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-surface-0 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent/50 w-full md:w-60"
              />
            </div>

            {/* Filter Selector */}
            <select 
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs rounded-xl bg-surface-0 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50"
            >
              <option value="all">Tous les statuts</option>
              <option value="ready">Terminé</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Chargement de l'historique...</div>
        ) : filteredEbooks.length > 0 ? (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-bold uppercase text-slate-400">
                    <th className="px-6 py-4">Nom de l'Ebook</th>
                    <th className="px-6 py-4">Date de Création</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {paginatedEbooks.map(ebook => (
                    <tr key={ebook.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white text-left">
                        <Link to={`/editor/${ebook.id}`} className="hover:underline font-serif text-white">
                          {ebook.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-left">
                        {new Date(ebook.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          ebook.status === 'ready' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {ebook.status === 'ready' ? 'Terminé' : 'En rédaction'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Open Editor */}
                          <button 
                            onClick={() => navigate(`/editor/${ebook.id}`)}
                            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                            title="Ouvrir l'éditeur"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Duplicate Button */}
                          <button 
                            onClick={() => handleDuplicate(ebook.id)}
                            disabled={duplicatingId === ebook.id}
                            className="p-2 hover:bg-white/5 rounded-lg text-brand-accent hover:text-white disabled:opacity-50"
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
                              className="p-2 hover:bg-white/5 rounded-lg text-brand-primary hover:text-white"
                              title="Télécharger / Voir"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDelete(ebook.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-brand-error"
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

            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden space-y-4">
              {paginatedEbooks.map(ebook => (
                <Card 
                  key={ebook.id} 
                  hoverEffect={false} 
                  className="p-4 bg-surface-1/40 border border-white/5 relative flex gap-4 items-center"
                >
                  {/* Miniature Cover */}
                  <div className="w-16 h-20 bg-surface-0 rounded-lg overflow-hidden border border-white/10 shrink-0 flex items-center justify-center shadow">
                    {ebook.coverUrl ? (
                      <img src={getFullUrl(ebook.coverUrl)} alt="Couverture" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 text-left space-y-1">
                    <h4 className="font-bold text-white font-serif truncate leading-snug">
                      {ebook.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {new Date(ebook.createdAt).toLocaleDateString()}
                    </p>
                    <div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ebook.status === 'ready' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ebook.status === 'ready' ? 'Terminé' : 'Brouillon'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown Button */}
                  <div className="relative">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveMenuId(activeMenuId === ebook.id ? null : ebook.id); 
                      }}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Popover Action Menu */}
                    <AnimatePresence>
                      {activeMenuId === ebook.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-8 bg-surface-2 border border-white/10 rounded-xl shadow-2xl py-1 w-40 z-20 text-xs text-left"
                        >
                          <button 
                            onClick={() => navigate(`/editor/${ebook.id}`)}
                            className="w-full px-4 py-2.5 hover:bg-white/5 text-white block text-left"
                          >
                            Ouvrir l'éditeur
                          </button>
                          <button 
                            onClick={() => handleDuplicate(ebook.id)}
                            className="w-full px-4 py-2.5 hover:bg-white/5 text-white block text-left"
                          >
                            Dupliquer
                          </button>
                          {ebook.status === 'ready' && (
                            <button 
                              onClick={() => navigate(`/preview/${ebook.id}`)}
                              className="w-full px-4 py-2.5 hover:bg-white/5 text-white block text-left"
                            >
                              Télécharger / Aperçu
                            </button>
                          )}
                          <hr className="border-white/5 my-1" />
                          <button 
                            onClick={() => handleDelete(ebook.id)}
                            className="w-full px-4 py-2.5 hover:bg-red-500/10 text-brand-error block text-left font-semibold"
                          >
                            Supprimer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/5 text-sm text-slate-400">
                <Button 
                  variant="secondary" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-1.5 text-xs font-semibold"
                >
                  Précédent
                </Button>
                <span>Page {currentPage} sur {totalPages}</span>
                <Button 
                  variant="secondary" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-1.5 text-xs font-semibold"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border-t border-white/5">
            <p className="text-slate-500 text-sm mb-4">Aucun ebook ne correspond aux filtres.</p>
            <Link to="/create" className="text-brand-accent hover:underline font-semibold text-sm">Créer mon premier ebook</Link>
          </div>
        )}
      </motion.div>

      {/* 5. Activité récente */}
      <motion.div variants={fadeInUp} className="space-y-4 text-left">
        <h2 className="text-xl font-bold font-serif text-white">Activité récente</h2>
        {recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentActivity.map(activity => (
              <Card key={activity.id} hoverEffect={true} className="p-4 bg-surface-1/30 border border-white/5 flex flex-col justify-between text-left">
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  {activity.text}
                </p>
                <span className="text-[10px] font-mono text-brand-accent mt-3 block">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Aucune activité récente enregistrée.</p>
        )}
      </motion.div>

      {/* Upgrade Quota Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-brand-error">
              <AlertTriangle className="w-10 h-10 shrink-0 animate-bounce" />
              <div>
                <h3 className="text-lg font-bold text-white">Quota mensuel atteint !</h3>
                <p className="text-xs text-slate-400">Vous avez consommé la totalité de vos ebooks ce mois-ci.</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed text-left">
              Pour pouvoir créer un nouvel ebook dès maintenant, veuillez passer à une offre supérieure (Creator, Business ou Agency). 
              Vos crédits restants seront immédiatement mis à jour !
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <Button 
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/pricing');
                }}
                variant="primary"
                className="text-xs"
              >
                Changer d'offre
              </Button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
