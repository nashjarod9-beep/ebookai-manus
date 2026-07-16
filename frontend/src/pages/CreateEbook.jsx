import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateEbook, useEbook } from '../hooks/useEbook';
import { useAI } from '../hooks/useAI';
import api from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ArrowRight, ArrowLeft, Check, Sparkles, 
  Trash2, ArrowUp, ArrowDown, Plus, BookOpen, AlertTriangle
} from 'lucide-react';
import EstimationPanel from '../components/EstimationPanel';
import FlipbookViewer from '../components/FlipbookViewer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Questions pour l'étape 1 conversationnelle
const questionsList = [
  {
    key: 'theme',
    label: 'Quel est le sujet principal ou le thème de votre ebook ?',
    placeholder: 'Ex: Guide complet de l\'exportation de produits agricoles vers l\'Europe...',
    type: 'textarea'
  },
  {
    key: 'audience',
    label: 'À qui s\'adresse cet ebook en priorité (public cible) ?',
    placeholder: 'Ex: Agriculteurs locaux, PME d\'export, coopératives...',
    type: 'text'
  },
  {
    key: 'objective',
    label: 'Quel résultat concret ou quelle promesse souhaitez-vous apporter à vos lecteurs ?',
    placeholder: 'Ex: Maîtriser les normes douanières de l\'UE et expédier sa première cargaison...',
    type: 'text'
  },
  {
    key: 'author',
    label: 'Sous quel nom d\'auteur ou de marque souhaitez-vous publier ?',
    placeholder: 'Ex: Neno Éditions, Jean Dupont...',
    type: 'text'
  },
  {
    key: 'targetPages',
    label: 'Combien de pages visez-vous environ ?',
    type: 'select',
    options: [
      { value: '5 à 10 pages', label: '5 à 10 pages' },
      { value: '10 à 20 pages', label: '10 à 20 pages' },
      { value: '20 à 30 pages', label: '20 à 30 pages' },
      { value: '30 pages et plus', label: '30 pages et plus' }
    ]
  },
  {
    key: 'tone',
    label: "Quel ton d'écriture correspond le mieux à votre marque ?",
    type: 'select',
    options: [
      { value: 'Professionnel', label: 'Professionnel' },
      { value: 'Pédagogique', label: 'Pédagogique / Didactique' },
      { value: 'Inspirant', label: 'Inspirant' },
      { value: 'Humoristique', label: 'Humoristique / Décontracté' }
    ]
  },
  {
    key: 'length',
    label: 'Combien de chapitres préférez-vous pour structurer ce livre ?',
    type: 'select',
    options: [
      { value: 'Très court (1 à 3 chapitres)', label: 'Très court (1 à 3 chapitres)' },
      { value: 'Court (environ 5 chapitres)', label: 'Court (environ 5 chapitres)' },
      { value: 'Moyen (environ 8 chapitres)', label: 'Moyen (environ 8 chapitres)' },
      { value: 'Long (plus de 10 chapitres)', label: 'Long (plus de 10 chapitres)' }
    ]
  },
  {
    key: 'contactInfo',
    label: 'Quelles informations de contact souhaitez-vous faire figurer en fin d\'ouvrage ? (Facultatif)',
    placeholder: 'Ex: Téléphone : +221 77 123 45 67, Email : contact@coop.com',
    type: 'textarea'
  },
  {
    key: 'language',
    label: 'Dans quelle langue l\'ebook doit-il être rédigé ?',
    type: 'select',
    options: [
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'English' }
    ]
  }
];

export default function CreateEbook() {
  const [step, setStep] = useState(1);
  const [activeQ, setActiveQ] = useState(0); // Question conversationnelle active
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(null);

  const [formData, setFormData] = useState({ 
    theme: '', 
    objective: '', 
    audience: '', 
    tone: 'Professionnel', 
    length: 'Court (environ 5 chapitres)', 
    language: 'fr',
    author: '',
    targetPages: '10 à 20 pages',
    contactInfo: ''
  });
  const [outline, setOutline] = useState(null);
  const [bookId, setBookId] = useState(null);
  
  // Génération states
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [resultData, setResultData] = useState(null);

  // Proposal states
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [newSubchapterText, setNewSubchapterText] = useState({}); // Bound by chapter order
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // SSE Real-time states
  const [sseProgress, setSseProgress] = useState({});
  const [previewText, setPreviewText] = useState('');
  const [generatedCover, setGeneratedCover] = useState(null);

  // Emotional toasts / Flipbook
  const [toastMessage, setToastMessage] = useState('');
  const [showFlipbook, setShowFlipbook] = useState(false);
  
  const navigate = useNavigate();
  const { draftId } = useParams();
  const sseSourceRef = useRef(null);
  
  const createEbook = useCreateEbook();
  const { data: draftBook } = useEbook(draftId);
  const { suggestTitles, generateOutline, generateCover, generateChapter } = useAI();

  // Load draft details if draftId is present
  useEffect(() => {
    if (draftBook) {
      setBookId(draftBook.id);
      if (draftBook.outline) {
        try {
          const parsed = JSON.parse(draftBook.outline);
          setOutline(parsed);
          setSelectedTitle(parsed.title);
          setStep(3); // Direct to step 3 (Outline validator) if outline loaded
        } catch (e) {
          console.error("Error parsing draft outline:", e);
        }
      }
      setFormData({
        theme: draftBook.subject || '',
        objective: draftBook.description || '',
        audience: '',
        tone: 'Professionnel',
        length: 'Court (environ 5 chapitres)',
        language: draftBook.language || 'fr',
        author: draftBook.author || '',
        targetPages: draftBook.targetPages || '10 à 20 pages',
        contactInfo: draftBook.contactInfo || ''
      });
      setAdditionalInstructions(draftBook.additionalInstructions || '');
    }
  }, [draftBook]);

  // Chargement automatique d'un ebook généré dans le Playground local
  useEffect(() => {
    const storedPlayground = localStorage.getItem('playground_ebook');
    if (storedPlayground && !draftId && !bookId) {
      try {
        const parsed = JSON.parse(storedPlayground);
        setFormData(prev => ({
          ...prev,
          theme: parsed.theme || ''
        }));
        setSelectedTitle(parsed.title || '');
        setOutline({
          title: parsed.title,
          description: `Ebook créé à partir de la démo sur le thème : ${parsed.theme}`,
          coverImagePrompt: parsed.coverImagePrompt || 'Illustration de couverture premium',
          chapters: parsed.chapters.map((ch, idx) => ({
            order: ch.order,
            title: ch.title,
            summary: ch.summary,
            subchapters: ["Introduction", "Développement"],
            imagePrompt: `Illustration pour le chapitre ${idx + 1}`
          }))
        });
        setStep(3); // Redirige directement à l'étape 3 (Structure)
        localStorage.removeItem('playground_ebook');
      } catch (e) {
        console.error("Error parsing stored playground ebook:", e);
      }
    }
  }, [draftId, bookId]);

  // Check and restore draft autosaved in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('neno_draft_ebook_v1');
    if (saved && !draftId && !bookId) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData && parsed.formData.theme) {
          setRestoredDraft(parsed);
          setShowRestoreModal(true);
        }
      } catch (err) {}
    }
  }, [draftId, bookId]);

  // Autosave Step 1 content
  useEffect(() => {
    if (step === 1 && (formData.theme || activeQ > 0)) {
      localStorage.setItem('neno_draft_ebook_v1', JSON.stringify({ formData, activeQ }));
    }
  }, [formData, activeQ, step]);

  const restoreDraft = () => {
    if (restoredDraft) {
      setFormData(restoredDraft.formData);
      setActiveQ(restoredDraft.activeQ || 0);
      setShowRestoreModal(false);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem('neno_draft_ebook_v1');
    setShowRestoreModal(false);
  };

  // Toast handler
  const showEmotionToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Step 1 -> Step 2
  const handleGoToStep2 = async () => {
    setIsGeneratingTitles(true);
    setStep(2);
    try {
      const suggestions = await suggestTitles(formData);
      setTitleSuggestions(suggestions);
      if (suggestions.length > 0) {
        setSelectedTitle(suggestions[0]);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suggestion des titres. Saisissez votre titre.");
      setTitleSuggestions(["Titre par défaut"]);
      setSelectedTitle("Titre par défaut");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  // Step 2 -> Step 3
  const handleGoToStep3 = async () => {
    setIsGeneratingOutline(true);
    setStep(3);
    const finalTitle = customTitle.trim() || selectedTitle;
    try {
      const generatedOutline = await generateOutline({
        ...formData,
        title: finalTitle
      });
      setOutline(generatedOutline);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération de la structure. Veuillez réessayer.");
      setStep(2);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // Outline helpers
  const moveChapterUp = (idx) => {
    if (idx === 0) return;
    const newChapters = [...outline.chapters];
    const temp = newChapters[idx];
    newChapters[idx] = newChapters[idx - 1];
    newChapters[idx - 1] = temp;
    newChapters.forEach((ch, i) => {
      ch.order = i + 1;
    });
    setOutline({ ...outline, chapters: newChapters });
  };

  const moveChapterDown = (idx) => {
    if (idx === outline.chapters.length - 1) return;
    const newChapters = [...outline.chapters];
    const temp = newChapters[idx];
    newChapters[idx] = newChapters[idx + 1];
    newChapters[idx + 1] = temp;
    newChapters.forEach((ch, i) => {
      ch.order = i + 1;
    });
    setOutline({ ...outline, chapters: newChapters });
  };

  const removeChapter = (idx) => {
    const newChapters = outline.chapters.filter((_, i) => i !== idx);
    newChapters.forEach((ch, i) => {
      ch.order = i + 1;
    });
    setOutline({ ...outline, chapters: newChapters });
  };

  const addNewChapter = () => {
    const newChapters = [...outline.chapters];
    newChapters.push({
      order: newChapters.length + 1,
      title: "Nouveau chapitre",
      summary: "Résumé succinct du contenu de ce chapitre.",
      subchapters: ["Introduction"],
      imagePrompt: "Illustration moderne et conceptuelle"
    });
    setOutline({ ...outline, chapters: newChapters });
  };

  const handleAddSubchapter = (chapterIdx) => {
    const text = newSubchapterText[chapterIdx] || '';
    if (!text.trim()) return;

    const newChapters = [...outline.chapters];
    if (!newChapters[chapterIdx].subchapters) {
      newChapters[chapterIdx].subchapters = [];
    }
    newChapters[chapterIdx].subchapters.push(text.trim());
    setOutline({ ...outline, chapters: newChapters });
    setNewSubchapterText({ ...newSubchapterText, [chapterIdx]: '' });
  };

  const handleRemoveSubchapter = (chapterIdx, subIdx) => {
    const newChapters = [...outline.chapters];
    newChapters[chapterIdx].subchapters = newChapters[chapterIdx].subchapters.filter((_, i) => i !== subIdx);
    setOutline({ ...outline, chapters: newChapters });
  };

  // SSE Connect helper
  const connectSSE = (id) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = userData ? userData.token : '';
    const isProd = window.location.hostname.includes('vercel.app') || !window.location.hostname.includes('localhost');
    const sseBase = import.meta.env.VITE_API_URL || (isProd ? '/api' : 'http://localhost:5000/api');
    const url = `${sseBase}/ebooks/${id}/progress?token=${token}`;

    const eventSource = new EventSource(url);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE update:", data);
        
        setSseProgress(prev => ({
          ...prev,
          [data.step]: true,
          currentStep: data.step,
          currentMessage: data.message
        }));

        if (data.coverUrl) {
          setGeneratedCover(data.coverUrl);
          showEmotionToast("🎉 Votre couverture est magnifique.");
        }
        if (data.chapterText) {
          setPreviewText(data.chapterText);
        }
        if (data.step === 'chapter_done') {
          showEmotionToast(`🔥 Le chapitre ${data.order} est particulièrement convaincant.`);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (e) => {
      console.warn("SSE disconnected, retrying or closed.", e);
      eventSource.close();
    };

    sseSourceRef.current = eventSource;
    return eventSource;
  };

  // Sequencer + SSE Trigger
  const handleFullGeneration = async () => {
    setIsGenerating(true);
    setStep(5);
    setSseProgress({});
    setPreviewText('');
    setGeneratedCover(null);

    let sseSource = null;
    try {
      let currentBookId = bookId;
      const finalTitle = customTitle.trim() || selectedTitle || outline.title;
      
      // 1. Create DB Draft
      if (!currentBookId) {
        setProgressMessage("Création du livre dans la base de données...");
        const book = await createEbook.mutateAsync({
          title: finalTitle,
          subject: formData.theme,
          description: outline.description,
          language: formData.language,
          format: 'static',
          outline: JSON.stringify(outline),
          author: formData.author,
          contactInfo: formData.contactInfo,
          targetPages: formData.targetPages,
          additionalInstructions: additionalInstructions
        });
        currentBookId = book.id;
        setBookId(book.id);
      }

      // Connect to SSE stream
      sseSource = connectSSE(currentBookId);

      // 2. Cover
      setProgressMessage("Génération de la couverture avec l'IA FLUX...");
      const coverRes = await generateCover(currentBookId, outline.coverImagePrompt);
      console.log("Cover complete:", coverRes);

      // 3. Chapters
      for (let i = 0; i < outline.chapters.length; i++) {
        const ch = outline.chapters[i];
        setProgressMessage(`Génération du chapitre ${i + 1}/${outline.chapters.length} : "${ch.title}"...`);
        await generateChapter(currentBookId, ch, {
          ...formData,
          additionalInstructions
        });
      }

      // 4. PDF
      setProgressMessage("Compilation et mise en page du document PDF professionnel...");
      const { data: pdfResult } = await api.post(`/export/pdf/${currentBookId}`);

      // 5. Product Sheet
      setProgressMessage("Création de la page de vente et de la fiche produit...");
      await api.post('/marketing/product-sheet', { bookId: currentBookId });

      // 6. TikTok
      setProgressMessage("Génération des 10 scripts viraux TikTok...");
      await api.post('/marketing/tiktok-scripts', { bookId: currentBookId });

      // 7. Mockup
      setProgressMessage("Génération du mockup publicitaire 3D...");
      await api.post('/marketing/mockup', { bookId: currentBookId, variantId: 1 });

      setResultData({ pdfUrl: pdfResult.pdfPath });
      localStorage.removeItem('neno_draft_ebook_v1'); // Clean on success
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      alert(`Erreur lors de la génération : ${errMsg}. Reprenez le processus.`);
      setStep(4);
    } finally {
      setIsGenerating(false);
      setProgressMessage('');
      if (sseSource) sseSource.close();
      if (sseSourceRef.current) sseSourceRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      if (sseSourceRef.current) {
        sseSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-10 max-w-6xl">
      
      {/* Restore Draft Alert Banner */}
      {showRestoreModal && (
        <div className="mb-6 p-4 rounded-2xl bg-surface-1/80 border border-brand-accent/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-lg">
          <div className="flex gap-3 items-center">
            <AlertTriangle className="w-5 h-5 text-brand-accent shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Brouillon de livre en cours détecté !</p>
              <p className="text-[10px] text-slate-400">Voulez-vous reprendre là où vous vous étiez arrêté sur le sujet : "{restoredDraft?.formData?.theme?.substring(0, 50)}..." ?</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={restoreDraft} className="px-3.5 py-1.5 bg-brand-primary text-white text-[11px] font-bold rounded-xl hover:bg-brand-primary/95 transition-colors">
              Restaurer
            </button>
            <button onClick={discardDraft} className="px-3.5 py-1.5 border border-white/10 text-slate-400 text-[11px] rounded-xl hover:bg-white/5 transition-colors">
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Main flow layout (Step + Estimation panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Step container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-8 text-left">
            <div className="flex items-center gap-4 mb-4">
              {step > 1 && step < 5 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="p-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center shrink-0"
                  title="Étape précédente"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
              )}
              <h1 className="text-3xl font-bold font-serif text-white">AI Creator Journey</h1>
            </div>
            
            {/* Steps indicator */}
            <div className="flex items-center justify-between relative mt-6 mb-10">
              <div className="absolute left-0 top-1/2 w-full h-[1px] bg-white/10 -z-10 -translate-y-1/2"></div>
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s} 
                  className={`flex flex-col items-center ${s < step && step < 5 ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => {
                    if (s < step && step < 5) setStep(s);
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= s ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-surface-1 border border-white/5 text-slate-500'}`}>
                    {s}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 absolute -translate-y-[-24px] font-bold hidden sm:inline">
                    {s === 1 && "💡 Idée"}
                    {s === 2 && "✍️ Titre"}
                    {s === 3 && "🎨 Structure"}
                    {s === 4 && "🚀 Vente"}
                    {s === 5 && "💰 Publier"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-4 md:p-6 bg-surface-1/20 border border-white/5 shadow-2xl">
            {/* Step 1: Conversational Chat-like form */}
            {step === 1 && (
              <div className="space-y-6 text-left">
                <h2 className="text-xl font-bold font-serif text-white">Parlons de votre futur livre.</h2>
                
                {/* Scrollable conversation thread */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {questionsList.slice(0, activeQ).map((q, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-start">
                        <div className="bg-surface-1 border border-white/5 rounded-2xl p-3 text-xs text-slate-300 max-w-md">
                          {q.label}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-brand-primary/10 border border-brand-accent/20 text-white rounded-2xl p-3 text-xs max-w-md font-semibold">
                          {q.type === 'select' 
                            ? q.options.find(o => o.value === formData[q.key])?.label || formData[q.key]
                            : formData[q.key] || '(Facultatif / Sauté)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Question Box */}
                <AnimatePresence mode="wait">
                  {activeQ < questionsList.length && (
                    <motion.div 
                      key={activeQ}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-5 bg-surface-1/40 border border-white/5 rounded-2xl space-y-4"
                    >
                      <p className="text-sm font-bold text-white">
                        {questionsList[activeQ].label}
                      </p>

                      {questionsList[activeQ].type === 'textarea' && (
                        <textarea
                          className="w-full p-3 text-xs rounded-xl bg-surface-2 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 h-24"
                          placeholder={questionsList[activeQ].placeholder}
                          value={formData[questionsList[activeQ].key]}
                          onChange={e => setFormData({ ...formData, [questionsList[activeQ].key]: e.target.value })}
                        />
                      )}

                      {questionsList[activeQ].type === 'text' && (
                        <input
                          type="text"
                          className="w-full p-3 text-xs rounded-xl bg-surface-2 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50"
                          placeholder={questionsList[activeQ].placeholder}
                          value={formData[questionsList[activeQ].key]}
                          onChange={e => setFormData({ ...formData, [questionsList[activeQ].key]: e.target.value })}
                        />
                      )}

                      {questionsList[activeQ].type === 'select' && (
                        <select
                          className="w-full p-3 text-xs rounded-xl bg-surface-2 border border-white/10 text-white focus:outline-none focus:border-brand-accent/50"
                          value={formData[questionsList[activeQ].key]}
                          onChange={e => setFormData({ ...formData, [questionsList[activeQ].key]: e.target.value })}
                        >
                          {questionsList[activeQ].options.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <button
                          disabled={activeQ === 0}
                          onClick={() => setActiveQ(prev => prev - 1)}
                          className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
                        >
                          Précédent
                        </button>
                        
                        <div className="flex gap-2">
                          {questionsList[activeQ].key === 'contactInfo' && (
                            <button
                              onClick={() => {
                                setFormData({ ...formData, contactInfo: '' });
                                setActiveQ(prev => prev + 1);
                              }}
                              className="px-4 py-2 border border-white/10 rounded-xl text-xs text-slate-300 hover:bg-white/5"
                            >
                              Passer
                            </button>
                          )}
                          <Button
                            disabled={
                              questionsList[activeQ].key !== 'contactInfo' &&
                              !formData[questionsList[activeQ].key]?.toString().trim()
                            }
                            onClick={() => {
                              if (activeQ === questionsList.length - 1) {
                                handleGoToStep2();
                              } else {
                                setActiveQ(prev => prev + 1);
                              }
                            }}
                            variant="primary"
                            className="text-xs px-5 py-2 font-semibold"
                          >
                            {activeQ === questionsList.length - 1 ? 'Valider & Suggérer des titres' : 'Suivant'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Step 2: Title Proposal Selection */}
            {step === 2 && (
              <div className="space-y-6 text-left">
                <h2 className="text-xl font-bold font-serif text-white">Suggestions de titres</h2>
                
                {isGeneratingTitles ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                    <p className="text-slate-400 text-xs">Génération de propositions de titres uniques...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-xs">Sélectionnez le titre de votre choix ou personnalisez-le ci-dessous.</p>
                    <div className="grid grid-cols-1 gap-3">
                      {titleSuggestions.map((title, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setSelectedTitle(title);
                            setCustomTitle('');
                          }}
                          className={`p-4 border rounded-2xl cursor-pointer hover:bg-white/5 transition-all text-left ${
                            selectedTitle === title && !customTitle 
                              ? 'border-brand-accent bg-brand-accent/10' 
                              : 'border-white/5 bg-white/5'
                          }`}
                        >
                          <span className="font-semibold text-white text-xs">{title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <label className="block text-xs font-bold text-slate-400 mb-2">Titre personnalisé :</label>
                      <input 
                        type="text"
                        className="w-full p-3 text-xs rounded-xl bg-surface-2 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50"
                        placeholder="Écrivez le titre de votre choix..."
                        value={customTitle}
                        onChange={e => {
                          setCustomTitle(e.target.value);
                          setSelectedTitle('');
                        }}
                      />
                    </div>

                    <div className="flex justify-between mt-6 pt-4 border-t border-white/5">
                      <button onClick={() => setStep(1)} className="px-4 py-2 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white">Retour</button>
                      <Button 
                        onClick={handleGoToStep3}
                        disabled={!selectedTitle && !customTitle.trim()}
                        variant="primary"
                        className="text-xs font-semibold"
                      >
                        Valider le titre
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Chapter Plan Validator */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <h2 className="text-xl font-bold font-serif text-white">Plan détaillé de l'e-book</h2>
                
                {isGeneratingOutline ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
                    <p className="text-slate-400 text-xs">Structuration et rédaction du sommaire par l'IA...</p>
                  </div>
                ) : outline && (
                  <div className="space-y-6">
                    <p className="text-slate-400 text-xs">Vous pouvez déplacer, ajouter ou renommer des chapitres ainsi que modifier leurs sous-sections.</p>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {outline.chapters.map((ch, idx) => (
                        <div key={idx} className="p-4 border border-white/5 bg-white/5 rounded-2xl space-y-4 relative">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-bold text-xs text-brand-accent font-mono">Chapitre 0{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => moveChapterUp(idx)} disabled={idx === 0} className="p-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-30">
                                <ArrowUp className="w-4 h-4 text-white" />
                              </button>
                              <button onClick={() => moveChapterDown(idx)} disabled={idx === outline.chapters.length - 1} className="p-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-30">
                                <ArrowDown className="w-4 h-4 text-white" />
                              </button>
                              <button onClick={() => removeChapter(idx)} className="p-1 border border-red-500/20 text-brand-error rounded hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Titre</label>
                            <input 
                              className="font-bold text-sm w-full p-2.5 rounded-xl bg-surface-2 border border-white/5 text-white"
                              value={ch.title}
                              onChange={(e) => {
                                const newChapters = [...outline.chapters];
                                newChapters[idx].title = e.target.value;
                                setOutline({...outline, chapters: newChapters});
                              }}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Description / Résumé</label>
                            <textarea 
                              className="text-xs text-slate-300 w-full p-2.5 rounded-xl bg-surface-2 border border-white/5 h-16 resize-none"
                              value={ch.summary}
                              onChange={(e) => {
                                const newChapters = [...outline.chapters];
                                newChapters[idx].summary = e.target.value;
                                setOutline({...outline, chapters: newChapters});
                              }}
                            />
                          </div>

                          {/* Subchapters */}
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sous-sections</label>
                            <div className="space-y-1">
                              {ch.subchapters?.map((sub, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-xl border border-white/5 text-xs text-white">
                                  <input 
                                    className="bg-transparent outline-none flex-1 font-semibold"
                                    value={sub}
                                    onChange={(e) => {
                                      const newChapters = [...outline.chapters];
                                      newChapters[idx].subchapters[sIdx] = e.target.value;
                                      setOutline({...outline, chapters: newChapters});
                                    }}
                                  />
                                  <button onClick={() => handleRemoveSubchapter(idx, sIdx)} className="text-brand-error hover:opacity-80">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <input 
                                type="text"
                                className="text-xs p-2.5 border border-white/10 rounded-xl bg-surface-2 flex-1 text-white placeholder-slate-600"
                                placeholder="Nouveau sous-chapitre..."
                                value={newSubchapterText[idx] || ''}
                                onChange={(e) => setNewSubchapterText({ ...newSubchapterText, [idx]: e.target.value })}
                              />
                              <button onClick={() => handleAddSubchapter(idx)} className="bg-white/5 border border-white/10 text-white text-xs px-3.5 rounded-xl hover:bg-white/10 flex items-center gap-1 font-semibold">
                                <Plus className="w-3.5 h-3.5 text-brand-accent" /> Ajouter
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={addNewChapter}
                      className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 text-slate-400 hover:text-white font-semibold mt-4 text-xs transition-colors"
                    >
                      <Plus className="w-4 h-4 text-brand-accent" /> Ajouter un chapitre
                    </button>

                    <div className="flex justify-between mt-8 border-t border-white/5 pt-4">
                      <button onClick={() => setStep(2)} className="px-4 py-2 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white">Retour</button>
                      <Button 
                        onClick={() => setStep(4)}
                        variant="primary"
                        className="text-xs font-semibold"
                      >
                        Valider le plan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Final Instructions */}
            {step === 4 && (
              <div className="space-y-6 text-left">
                <h2 className="text-xl font-bold font-serif text-white">Consignes de rédaction</h2>
                
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs">
                    Souhaitez-vous ajouter des instructions supplémentaires à l'IA avant la rédaction autonome ? (Exemples, ton spécifique, interdictions...)
                  </p>
                  
                  <textarea 
                    className="w-full p-3 text-xs rounded-xl bg-surface-2 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent/50 h-32"
                    placeholder="Ex: Utilise un style inspirant avec des études de cas basées sur des startups africaines. Insiste bien sur l'importance du marketing digital..."
                    value={additionalInstructions}
                    onChange={e => setAdditionalInstructions(e.target.value)}
                  />

                  <div className="flex justify-between mt-8 border-t border-white/5 pt-4">
                    <button onClick={() => setStep(3)} className="px-4 py-2 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white">Retour</button>
                    <div className="flex gap-3">
                      <button onClick={handleFullGeneration} className="px-4 py-2 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white transition-colors">
                        Passer cette étape
                      </button>
                      <Button 
                        onClick={handleFullGeneration}
                        variant="primary"
                        className="text-xs font-semibold flex items-center gap-2"
                      >
                        <span>Lancer la génération</span>
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Real-time generation experience & Success */}
            {step === 5 && (
              <div className="text-left">
                {isGenerating ? (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-white">Génération autonome en cours...</h2>
                      <p className="text-xs text-slate-400 mt-1">Neno AI structure, illustre et compile votre livre. Cette opération dure environ 2 à 3 minutes.</p>
                    </div>

                    {/* Split layout inside loader */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      
                      {/* Left: SSE Checklist */}
                      <div className="space-y-4 bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-3.5">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent mb-2">Étapes franchies</p>
                          
                          {/* Checklist item 1: Plan */}
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-brand-success/20 text-brand-success flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-xs text-white font-semibold">✓ Plan du livre structuré</span>
                          </div>

                          {/* Checklist item 2: Cover */}
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sseProgress.cover_done ? 'bg-brand-success/20 text-brand-success' : 'bg-white/10 text-slate-500'}`}>
                              {sseProgress.cover_done ? <Check className="w-2.5 h-2.5" /> : <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                            </div>
                            <span className={`text-xs ${sseProgress.cover_done ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              Couverture HD FLUX
                            </span>
                          </div>

                          {/* Checklist item 3: Chapters */}
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sseProgress.chapter_done ? 'bg-brand-success/20 text-brand-success' : 'bg-white/10 text-slate-500'}`}>
                              {sseProgress.chapter_done ? <Check className="w-2.5 h-2.5" /> : <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                            </div>
                            <span className={`text-xs ${sseProgress.chapter_done ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              {sseProgress.currentStep === 'chapter_writing' || sseProgress.currentStep === 'chapter_illustration' 
                                ? sseProgress.currentMessage 
                                : 'Rédaction & Illustrations de chapitres'}
                            </span>
                          </div>

                          {/* Checklist item 4: PDF */}
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sseProgress.pdf_done ? 'bg-brand-success/20 text-brand-success' : 'bg-white/10 text-slate-500'}`}>
                              {sseProgress.pdf_done ? <Check className="w-2.5 h-2.5" /> : (sseProgress.currentStep === 'pdf' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : null)}
                            </div>
                            <span className={`text-xs ${sseProgress.pdf_done ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              Compilation PDF professionnelle
                            </span>
                          </div>

                          {/* Checklist item 5: Sales Sheet */}
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sseProgress.marketing_sheet_done ? 'bg-brand-success/20 text-brand-success' : 'bg-white/10 text-slate-500'}`}>
                              {sseProgress.marketing_sheet_done ? <Check className="w-2.5 h-2.5" /> : (sseProgress.currentStep === 'marketing_sheet' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : null)}
                            </div>
                            <span className={`text-xs ${sseProgress.marketing_sheet_done ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              Fiche de vente AIDA
                            </span>
                          </div>

                          {/* Checklist item 6: TikTok Scripts */}
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sseProgress.marketing_tiktok_done ? 'bg-brand-success/20 text-brand-success' : 'bg-white/10 text-slate-500'}`}>
                              {sseProgress.marketing_tiktok_done ? <Check className="w-2.5 h-2.5" /> : (sseProgress.currentStep === 'marketing_tiktok' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : null)}
                            </div>
                            <span className={`text-xs ${sseProgress.marketing_tiktok_done ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              Scripts TikTok publicitaires
                            </span>
                          </div>

                          {/* Checklist item 7: Mockups */}
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${sseProgress.mockup_1_done ? 'bg-brand-success/20 text-brand-success' : 'bg-white/10 text-slate-500'}`}>
                              {sseProgress.mockup_1_done ? <Check className="w-2.5 h-2.5" /> : (sseProgress.currentStep === 'mockup_1' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : null)}
                            </div>
                            <span className={`text-xs ${sseProgress.mockup_1_done ? 'text-white font-semibold' : 'text-slate-400'}`}>
                              Mockup publicitaire 3D
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-4">
                          <p className="text-[10px] font-mono text-brand-accent tracking-wide uppercase">Dernière action :</p>
                          <p className="text-xs text-white font-bold mt-1 line-clamp-1">{progressMessage || "Compilation en cours..."}</p>
                        </div>
                      </div>

                      {/* Right: Live Preview */}
                      <div className="space-y-4 bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-2 flex-grow">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent">Aperçu en direct</p>
                          
                          {/* Typewriter text preview box */}
                          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-brand-success overflow-y-auto h-40 scrollbar-thin whitespace-pre-wrap leading-relaxed">
                            {previewText ? (
                              <TypewriterText text={previewText} />
                            ) : (
                              "Générateur IA en attente d'écriture..."
                            )}
                          </div>
                        </div>

                        {/* Generated cover preview */}
                        {generatedCover && (
                          <div className="flex gap-3 items-center pt-3 border-t border-white/5 mt-2">
                            <div className="w-10 h-14 rounded overflow-hidden border border-white/10 shrink-0">
                              <img src={generatedCover} alt="Couverture générée" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-mono">Couverture générée</p>
                              <p className="text-xs text-white font-semibold">Illustration 3D chargée</p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ) : resultData ? (
                  // Success layout
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/10 text-brand-success rounded-full flex items-center justify-center border border-brand-success/20 animate-pulse">
                      <Check className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-serif text-white">Ebook généré avec succès !</h2>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto mt-2">
                        Votre livre électronique, sa fiche de vente AIDA, ses scripts publicitaires TikTok et son visuel mockup 3D sont prêts.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center pt-4">
                      {/* Flipbook option */}
                      <Button 
                        onClick={() => setShowFlipbook(true)}
                        variant="primary"
                        className="flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Lire en 3D (Flipbook)</span>
                      </Button>
                      
                      {resultData?.pdfUrl && (
                        <a 
                          href={getFullUrl(resultData.pdfUrl)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white hover:bg-white/5 flex items-center gap-2"
                        >
                          <DownloadIcon className="w-4 h-4 text-brand-accent" />
                          <span>Télécharger le PDF</span>
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-white/5 w-full">
                      <button 
                        onClick={() => navigate(`/editor/${bookId}`)}
                        className="text-xs font-semibold border border-white/10 text-white rounded-xl px-5 py-2 hover:bg-white/5"
                      >
                        Ouvrir dans l'éditeur
                      </button>
                      <button 
                        onClick={() => navigate(`/product-sheet/${bookId}`)}
                        className="text-xs font-semibold bg-white/5 border border-white/5 text-white rounded-xl px-5 py-2 hover:bg-white/10"
                      >
                        Fiche de vente
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Retour au cockpit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-brand-error font-semibold">Une erreur est survenue lors de la génération.</p>
                    <button onClick={() => setStep(4)} className="px-4 py-2 border border-white/10 rounded-xl text-xs hover:bg-white/5 text-white">Retour aux consignes</button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Estimation Panel */}
        <div className="lg:col-span-1">
          {step >= 2 && step <= 4 && (
            <EstimationPanel formData={formData} outline={outline} />
          )}
        </div>

      </div>

      {/* Flipbook Viewer Modal */}
      {showFlipbook && (
        <FlipbookViewer 
          book={{
            title: customTitle.trim() || selectedTitle || outline?.title || 'Ebook Neno AI',
            coverUrl: generatedCover || (outline ? outline.coverUrl : null),
            author: formData.author,
            subject: formData.theme
          }}
          chapters={outline?.chapters || []}
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
            className="fixed bottom-6 right-6 bg-slate-900 border border-white/10 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-semibold max-w-sm text-left"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-helper for typewriter preview animation
function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!text) return;
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length || i > 250) { // Limit live typewriter text length for readability
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
}

// Compact Download Icon
function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
  );
}
