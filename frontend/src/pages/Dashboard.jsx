import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEbooks, useDeleteEbook } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, AlertTriangle, BookOpen, FileText, 
  Image as ImageIcon, Sparkles, Send, Download, Trash2, Copy, Loader2,
  MoreVertical, Search, HelpCircle, Eye, CreditCard, TrendingUp,
  BarChart2, Zap, Star, ArrowUpRight
} from 'lucide-react';
import { fadeInUp, staggerChildren } from '../design-system/motion';

const StatCard = ({ icon: Icon, label, value, sub, gradient, trend }) => (
  <motion.div
    variants={fadeInUp}
    className={`rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg ${gradient}`}
  >
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" />{trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
      <p className="text-white/80 text-xs font-semibold mt-1">{label}</p>
      {sub && <p className="text-white/60 text-[10px] mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { data: ebooks, isLoading, refetch } = useEbooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteEbook = useDeleteEbook();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const itemsPerPage = 5;

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/subscription/me');
      return data;
    }
  });

  const creditsRemaining = subscription?.creditsRemaining ?? 0;
  const creditsTotal = subscription?.creditsTotal ?? 50;
  const plan = subscription?.plan || 'free';
  const hasReachedQuota = plan !== 'free' && creditsRemaining <= 0;

  const totalCreated = ebooks?.length || 0;
  const lastBook = ebooks && ebooks.length > 0 ? ebooks[0] : null;
  const estimatedValue = totalCreated * 15000;
  const creditPct = Math.min(100, Math.round((creditsRemaining / Math.max(creditsTotal, 1)) * 100));

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

  const filteredEbooks = ebooks ? ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'ready' && ebook.status === 'ready') ||
      (statusFilter === 'draft' && ebook.status !== 'ready');
    return matchesSearch && matchesStatus;
  }) : [];

  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);
  const paginatedEbooks = filteredEbooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const recentActivity = ebooks ? ebooks.slice(0, 3).map(ebook => {
    const diffDays = Math.ceil((new Date() - new Date(ebook.createdAt)) / (1000 * 60 * 60 * 24));
    let timeText = `il y a ${diffDays} jours`;
    if (diffDays === 0) timeText = "aujourd'hui";
    else if (diffDays === 1) timeText = "hier";
    return {
      id: ebook.id,
      text: `Vous avez ${ebook.status === 'ready' ? 'finalisé' : 'commencé'} "${ebook.title}" ${timeText}.`,
      title: ebook.title,
      date: ebook.createdAt,
      status: ebook.status
    };
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top banner gradient */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 h-44 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 rounded-full bg-pink-300/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 flex justify-between items-start">
          <div>
            <p className="text-white/70 text-sm font-medium">Bonjour 👋</p>
            <h1 className="text-3xl font-extrabold text-white font-serif">
              {user?.name || 'Créateur'}
            </h1>
            <p className="text-white/60 text-xs mt-1">Que souhaitez-vous créer aujourd'hui ?</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {hasReachedQuota ? (
              <button
                onClick={() => setShowNoCreditsModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors text-sm backdrop-blur-sm"
              >
                <Zap className="w-4 h-4" />
                Crédits épuisés
              </button>
            ) : (
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors text-sm shadow-lg shadow-violet-900/20"
              >
                <Plus className="w-4 h-4" />
                Créer un ebook
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content (pulled up to overlap the banner) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 pb-12 space-y-6"
      >

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Ebooks créés"
            value={totalCreated}
            sub={`${user?.ebooksConsumed || 0} ce mois-ci`}
            gradient="bg-gradient-to-br from-violet-600 to-purple-700"
            trend="+12%"
          />
          <StatCard
            icon={Sparkles}
            label="Crédits IA restants"
            value={creditsRemaining}
            sub={`sur ${creditsTotal} alloués`}
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
            trend={`${creditPct}%`}
          />
          <StatCard
            icon={TrendingUp}
            label="Valeur générée"
            value={`${estimatedValue.toLocaleString('fr-FR')} F`}
            sub="≈ 15 000 FCFA / ebook"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            trend="automatique"
          />
          <StatCard
            icon={Star}
            label="Abonnement"
            value={(plan || 'Gratuit').charAt(0).toUpperCase() + (plan || 'gratuit').slice(1)}
            sub={getDaysRemaining(user?.subscriptionEnd)}
            gradient="bg-gradient-to-br from-teal-500 to-emerald-600"
            trend="actif"
          />
        </div>

        {/* Middle Row: Last Book + Quick Actions + Credits Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Last Book */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-4 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> Dernière génération
            </h2>
            {lastBook ? (
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="w-24 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center shadow-inner">
                  {lastBook.coverUrl ? (
                    <img src={getFullUrl(lastBook.coverUrl)} alt="Couverture" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-3 flex-1 text-left">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight font-serif">{lastBook.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Thème : {lastBook.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      lastBook.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {lastBook.status === 'ready' ? '✓ Terminé' : '⏳ En cours'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(lastBook.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/editor/${lastBook.id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-violet-500/20"
                    >
                      Ouvrir l'éditeur
                    </button>
                    <button
                      onClick={() => navigate(`/preview/${lastBook.id}`)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Aperçu
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-slate-500 text-sm mb-3">Aucun ebook créé pour le moment.</p>
                <button
                  onClick={() => navigate('/create')}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90"
                >
                  Créer mon premier ebook
                </button>
              </div>
            )}
          </div>

          {/* Right: Credits + Quick Actions */}
          <div className="space-y-4">
            {/* Credits progress */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Crédits IA</h3>
                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                  {creditsRemaining} / {creditsTotal}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    creditPct > 50 ? 'bg-gradient-to-r from-violet-500 to-purple-500' :
                    creditPct > 20 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                  style={{ width: `${creditPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{creditPct}% de crédits restants</p>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-3 w-full py-2 text-xs font-bold text-violet-700 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors"
              >
                Recharger les crédits →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Actions rapides</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Plus, label: 'Créer', color: 'from-violet-500 to-purple-600', action: () => navigate('/create') },
                  { icon: FileText, label: 'Fiche produit', color: 'from-amber-500 to-orange-600', action: () => lastBook ? navigate(`/product-sheet/${lastBook.id}`) : navigate('/create') },
                  { icon: ImageIcon, label: 'Visuels 3D', color: 'from-pink-500 to-rose-600', action: () => lastBook ? navigate(`/marketing/visuals/${lastBook.id}`) : navigate('/create') },
                  { icon: Send, label: 'Contenu social', color: 'from-teal-500 to-emerald-600', action: () => lastBook ? navigate(`/marketing/content/${lastBook.id}`) : navigate('/create') },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={action.action}
                      className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Ebook History Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-violet-500" />
              Historique des Livres
            </h2>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par titre..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 w-full md:w-56"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-violet-400"
              >
                <option value="all">Tous les statuts</option>
                <option value="ready">Terminé</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm animate-pulse">
              Chargement de l'historique...
            </div>
          ) : filteredEbooks.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                      <th className="px-6 py-3">Ebook</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Statut</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {paginatedEbooks.map(ebook => (
                      <tr key={ebook.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <Link to={`/editor/${ebook.id}`} className="hover:text-violet-700 font-serif transition-colors">
                            {ebook.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(ebook.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            ebook.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {ebook.status === 'ready' ? '✓ Terminé' : '⏳ Brouillon'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/editor/${ebook.id}`)}
                              className="p-1.5 hover:bg-violet-50 rounded-lg text-slate-400 hover:text-violet-600 transition-colors"
                              title="Ouvrir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(ebook.id)}
                              disabled={duplicatingId === ebook.id}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                              title="Dupliquer"
                            >
                              {duplicatingId === ebook.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                            </button>
                            {ebook.status === 'ready' && (
                              <button
                                onClick={() => navigate(`/preview/${ebook.id}`)}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Télécharger"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(ebook.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
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

              {/* Mobile Cards */}
              <div className="block md:hidden divide-y divide-slate-50">
                {paginatedEbooks.map(ebook => (
                  <div key={ebook.id} className="p-4 flex gap-3 items-center">
                    <div className="w-14 h-18 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                      {ebook.coverUrl ? (
                        <img src={getFullUrl(ebook.coverUrl)} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 font-serif truncate text-sm">{ebook.title}</h4>
                      <p className="text-[10px] text-slate-400">{new Date(ebook.createdAt).toLocaleDateString('fr-FR')}</p>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                        ebook.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ebook.status === 'ready' ? 'Terminé' : 'Brouillon'}
                      </span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === ebook.id ? null : ebook.id); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <AnimatePresence>
                        {activeMenuId === ebook.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 w-40 z-20 text-xs"
                          >
                            <button onClick={() => navigate(`/editor/${ebook.id}`)} className="w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-left">Ouvrir</button>
                            <button onClick={() => handleDuplicate(ebook.id)} className="w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-left">Dupliquer</button>
                            {ebook.status === 'ready' && (
                              <button onClick={() => navigate(`/preview/${ebook.id}`)} className="w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-left">Aperçu</button>
                            )}
                            <hr className="border-slate-100 my-1" />
                            <button onClick={() => handleDelete(ebook.id)} className="w-full px-4 py-2.5 hover:bg-red-50 text-red-500 text-left font-semibold">Supprimer</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 p-4 border-t border-slate-50 text-sm text-slate-500">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Précédent
                  </button>
                  <span className="text-xs">Page {currentPage} sur {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-violet-400" />
              </div>
              <p className="text-slate-500 text-sm mb-4">Aucun ebook ne correspond aux filtres.</p>
              <Link to="/create" className="text-violet-600 hover:underline font-semibold text-sm">
                Créer mon premier ebook →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Activité récente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    activity.status === 'ready' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <BookOpen className={`w-4 h-4 ${activity.status === 'ready' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{activity.text}</p>
                  <span className="text-[10px] font-mono text-violet-500 mt-2 block">
                    {new Date(activity.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </motion.div>

      {/* No Credits Modal */}
      {showNoCreditsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">Crédits épuisés</h3>
              <p className="text-sm text-slate-500 mt-1">
                Votre solde est actuellement à zéro. Rechargez pour continuer à créer.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowNoCreditsModal(false); navigate('/billing'); }}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
              >
                Passer à une offre supérieure ⚡
              </button>
              <button
                onClick={() => { setShowNoCreditsModal(false); navigate('/billing?packs=true'); }}
                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                Acheter des crédits supplémentaires 💎
              </button>
              <button
                onClick={() => setShowNoCreditsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm py-1"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-orange-500">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Quota mensuel atteint</h3>
                <p className="text-xs text-slate-500">Vous avez utilisé tous vos ebooks ce mois-ci.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowUpgradeModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50">Annuler</button>
              <button onClick={() => { setShowUpgradeModal(false); navigate('/billing'); }} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-90">Changer d'offre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
