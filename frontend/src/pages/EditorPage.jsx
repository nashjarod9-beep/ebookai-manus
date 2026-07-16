import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook, useUpdateChapter } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import { useAI } from '../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, Image as ImageIcon, Wand2, Eye, 
  Lock, BookOpen, Sparkles, FileText, Send, Video, Loader2 
} from 'lucide-react';
import FlipbookViewer from '../components/FlipbookViewer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading } = useEbook(id);
  const { user } = useAuth();
  const updateChapter = useUpdateChapter();
  const { generateChapterImage } = useAI();
  
  const [activeMode, setActiveMode] = useState('chapters'); // 'chapters' | 'marketing'
  const [activeChapter, setActiveChapter] = useState(null);
  const [content, setContent] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState('');
  
  // Flipbook & Toast states
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Initial select
  useEffect(() => {
    if (book?.chapters?.length > 0 && !activeChapter) {
      setActiveChapter(book.chapters[0]);
      setContent(book.chapters[0].content);
      setLastSavedContent(book.chapters[0].content);
    }
  }, [book, activeChapter]);

  // Toast handler
  const showEmotionToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // AUTOSAVE Hook: Triggers 25s after last change if content has modified
  useEffect(() => {
    if (!activeChapter || content === lastSavedContent) return;

    const delay = 25000;
    const timer = setTimeout(async () => {
      setSaveStatus('Enregistrement automatique...');
      try {
        await updateChapter.mutateAsync({ id: activeChapter.id, content });
        const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`Enregistré à ${timeStr}`);
        setLastSavedContent(content);
        
        // Trigger emotional toast
        showEmotionToast("🔥 Ce chapitre est particulièrement convaincant.");
      } catch (err) {
        setSaveStatus("Erreur d'enregistrement");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [content, activeChapter?.id, lastSavedContent]);

  const handleChapterSelect = (chapter) => {
    // Auto save previous if changed before switching
    if (activeChapter && content !== activeChapter.content) {
      updateChapter.mutate({ id: activeChapter.id, content });
    }
    setActiveChapter(chapter);
    setContent(chapter.content);
    setLastSavedContent(chapter.content);
  };

  const handleSave = async () => {
    setSaveStatus('Enregistrement...');
    await updateChapter.mutateAsync({ id: activeChapter.id, content });
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setSaveStatus(`Enregistré à ${timeStr}`);
    setLastSavedContent(content);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const url = await generateChapterImage(activeChapter.title, book.subject);
      if (url) {
        await updateChapter.mutateAsync({ id: activeChapter.id, imageUrl: url });
        setActiveChapter({ ...activeChapter, imageUrl: url });
        showEmotionToast("🎉 Votre illustration de chapitre est magnifique.");
      }
    } catch (error) {
      alert("Erreur génération image");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Chargement de l'éditeur...</div>;
  if (!book) return <div className="p-8 text-center text-slate-400">Ebook introuvable</div>;

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-surface-0">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/5 bg-surface-1 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-white font-serif line-clamp-1">{book.title}</h1>
          <span className="text-xs text-brand-accent font-mono ml-2">{saveStatus}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFlipbook(true)} 
            className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/95 text-xs font-semibold shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Mode Lecture 📖</span>
          </button>
          {activeMode === 'chapters' && (
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 px-3.5 py-1.5 border border-white/10 rounded-xl hover:bg-white/5 text-xs font-semibold text-white"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          )}
          <button 
            onClick={() => navigate(`/preview/${book.id}`)} 
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 text-white rounded-xl hover:bg-white/15 text-xs font-semibold border border-white/5"
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu PDF</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-surface-0 flex flex-col shrink-0">
          {/* Tabs header */}
          <div className="flex border-b border-white/5 text-sm shrink-0">
            <button 
              onClick={() => setActiveMode('chapters')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 ${
                activeMode === 'chapters' 
                  ? 'border-brand-accent text-brand-accent bg-white/[0.02]' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Rédiger</span>
            </button>
            <button 
              onClick={() => setActiveMode('marketing')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 ${
                activeMode === 'marketing' 
                  ? 'border-brand-accent text-brand-accent bg-white/[0.02]' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Marketing</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeMode === 'chapters' ? (
              // Chapters List
              <div className="py-2">
                {book.chapters?.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSelect(ch)}
                    className={`w-full text-left px-4 py-3.5 text-xs transition-colors border-l-2 ${
                      activeChapter?.id === ch.id 
                        ? 'border-brand-accent bg-brand-accent/5 font-semibold text-white' 
                        : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="line-clamp-2">{idx + 1}. {ch.title}</div>
                    {ch.imageUrl && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                        <ImageIcon className="w-3 h-3 text-brand-accent" /> Illustré
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              // Marketing Panel Menu
              user?.plan !== 'free' && (
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => navigate(`/product-sheet/${id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 transition-colors hover:bg-white/5"
                  >
                    <FileText className="w-4 h-4 text-brand-accent" />
                    <span>Fiche de vente AIDA</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/marketing/visuals/${id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 transition-colors hover:bg-white/5"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Visuels & Mockups 3D</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/marketing/content/${id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-slate-300 transition-colors hover:bg-white/5"
                  >
                    <Video className="w-4 h-4 text-purple-400" />
                    <span>Scripts publicitaires</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Content / Editor Area (Split view on Chapters) */}
        <div className="flex-1 flex overflow-hidden">
          {activeMode === 'chapters' ? (
            activeChapter ? (
              <div className="flex-1 flex overflow-hidden">
                {/* Column Left: Markdown Editor */}
                <div className="flex-1 border-r border-white/5 flex flex-col relative bg-surface-0">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImg}
                      className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-xl text-xs border border-brand-accent/20 backdrop-blur-md font-semibold disabled:opacity-50"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{isGeneratingImg ? 'Génération...' : 'Illustrer'}</span>
                    </button>
                  </div>
                  
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full p-8 resize-none bg-surface-0 text-white placeholder-slate-600 focus:outline-none font-mono text-sm leading-relaxed"
                    placeholder="Rédigez votre contenu en Markdown..."
                  />
                </div>

                {/* Column Right: Rendered Markdown Preview (HTML sanitized) */}
                <div className="flex-1 bg-surface-1/10 overflow-y-auto p-8 prose prose-slate prose-invert max-w-none text-left">
                  {activeChapter.imageUrl && (
                    <div className="mb-6 relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-lg">
                      <img src={getFullUrl(activeChapter.imageUrl)} alt="Illustration" className="w-full h-auto object-cover max-h-[300px]" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold font-serif text-white mb-8 border-b border-white/5 pb-4">
                    {activeChapter.title}
                  </h1>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Sélectionnez un chapitre pour commencer à rédiger.
              </div>
            )
          ) : (
            // Marketing Assets Hub
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-0">
              {user?.plan === 'free' && user?.email !== 'nashjarod9@gmail.com' ? (
                // Locked screen for free users
                <Card className="max-w-md w-full text-center p-8 bg-surface-1/40 border border-white/5 space-y-6">
                  <div className="w-14 h-14 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto border border-brand-accent/20">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white font-serif">Outils Marketing Verrouillés</h2>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      La fiche produit, les scripts TikTok publicitaires, les templates WhatsApp et les mockups 3D de vos ebooks sont réservés aux abonnés premium.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    variant="primary"
                    className="w-full text-xs font-semibold py-2.5"
                  >
                    Passer à une offre payante
                  </Button>
                </Card>
              ) : (
                // Marketing Hub for upgraded users
                <Card className="max-w-md w-full text-center p-8 bg-surface-1/40 border border-white/5 space-y-6">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white font-serif">Kit Marketing Premium</h2>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Exploitez les visuels publicitaires et le copywriting de Neno AI pour propulser vos ventes.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <button 
                      onClick={() => navigate(`/product-sheet/${id}`)}
                      className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left w-full bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-brand-accent shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white font-serif">Fiche de vente AIDA</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Copywriting persuasif optimisé</div>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate(`/marketing/visuals/${id}`)}
                      className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left w-full bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white font-serif">Visuels & Mockups 3D</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Visuel AIDA en haute définition</div>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate(`/marketing/content/${id}`)}
                      className="flex items-center justify-between p-4 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left w-full bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-purple-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white font-serif">Scripts & Messages WhatsApp</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Promotion sur TikTok et WhatsApp</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Flipbook Modal Viewer */}
      {showFlipbook && (
        <FlipbookViewer 
          book={book} 
          chapters={book.chapters} 
          onClose={() => setShowFlipbook(false)} 
        />
      )}

      {/* Floating Emotional Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-semibold max-w-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
