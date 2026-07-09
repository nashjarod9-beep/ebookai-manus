import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook, useUpdateChapter, useUpdateEbook } from '../hooks/useEbook';
import { useAuth } from '../hooks/useAuth';
import { useAI } from '../hooks/useAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../lib/axios';
import { 
  ArrowLeft, Save, Image as ImageIcon, Wand2, Eye, 
  Lock, BookOpen, Sparkles, FileText, Send, Video, Loader2 
} from 'lucide-react';

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

  // Marketing states
  const [marketingAsset, setMarketingAsset] = useState(null);
  const [loadingMarketing, setLoadingMarketing] = useState(false);
  const [generatingAsset, setGeneratingAsset] = useState(null); // 'sheet' | 'mockup' | 'tiktok' | 'whatsapp'
  const [activeMarketingField, setActiveMarketingField] = useState('sheet'); // 'sheet' | 'mockup' | 'tiktok' | 'whatsapp'

  useEffect(() => {
    if (book?.chapters?.length > 0 && !activeChapter) {
      setActiveChapter(book.chapters[0]);
      setContent(book.chapters[0].content);
    }
  }, [book, activeChapter]);

  // Load marketing assets if pay plan and mode is marketing
  useEffect(() => {
    if (activeMode === 'marketing' && user?.plan !== 'free') {
      loadMarketingAssets();
    }
  }, [activeMode, user]);

  const loadMarketingAssets = async () => {
    setLoadingMarketing(true);
    try {
      const { data } = await api.get(`/marketing/assets/${id}`);
      setMarketingAsset(data);
    } catch (e) {
      console.error("Error loading marketing assets:", e);
    } finally {
      setLoadingMarketing(false);
    }
  };

  const handleChapterSelect = (chapter) => {
    // Auto save previous
    if (activeChapter && content !== activeChapter.content) {
      updateChapter.mutate({ id: activeChapter.id, content });
    }
    setActiveChapter(chapter);
    setContent(chapter.content);
  };

  const handleSave = async () => {
    setSaveStatus('Enregistrement...');
    await updateChapter.mutateAsync({ id: activeChapter.id, content });
    setSaveStatus('Enregistré !');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const url = await generateChapterImage(activeChapter.title, book.subject);
      if (url) {
        await updateChapter.mutateAsync({ id: activeChapter.id, imageUrl: url });
        setActiveChapter({ ...activeChapter, imageUrl: url });
      }
    } catch (error) {
      alert("Erreur génération image");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Generate marketing assets helpers
  const handleGenerateMarketing = async (type) => {
    setGeneratingAsset(type);
    try {
      let endpoint = '';
      if (type === 'sheet') endpoint = '/marketing/product-sheet';
      if (type === 'tiktok') endpoint = '/marketing/tiktok-scripts';
      if (type === 'whatsapp') endpoint = '/marketing/whatsapp-msgs';
      if (type === 'mockup') endpoint = '/marketing/mockup';

      const { data } = await api.post(endpoint, { bookId: id });
      setMarketingAsset(data);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du contenu marketing.");
    } finally {
      setGeneratingAsset(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement de l'éditeur...</div>;
  if (!book) return <div className="p-8 text-center">Ebook introuvable</div>;

  const getFullUrl = (url) => url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : null;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-md tooltip" title="Retour">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold line-clamp-1">{book.title}</h1>
          <span className="text-xs text-muted-foreground">{saveStatus}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeMode === 'chapters' && (
            <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-muted text-sm font-semibold">
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          )}
          <button onClick={() => navigate(`/preview/${book.id}`)} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm font-semibold">
            <Eye className="w-4 h-4" />
            <span>Aperçu</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20 flex flex-col shrink-0">
          {/* Tabs header */}
          <div className="flex border-b text-sm shrink-0">
            <button 
              onClick={() => setActiveMode('chapters')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 ${activeMode === 'chapters' ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Rédiger</span>
            </button>
            <button 
              onClick={() => setActiveMode('marketing')}
              className={`flex-1 py-3 text-center font-medium border-b-2 flex items-center justify-center gap-1.5 ${activeMode === 'marketing' ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
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
                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-2 ${
                      activeChapter?.id === ch.id 
                        ? 'border-primary bg-primary/5 font-medium' 
                        : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className="line-clamp-2">{idx + 1}. {ch.title}</div>
                    {ch.imageUrl && <ImageIcon className="w-3 h-3 mt-1 text-muted-foreground inline-block" />}
                  </button>
                ))}
              </div>
            ) : (
              // Marketing Panel Menu
              user?.plan !== 'free' && (
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => setActiveMarketingField('sheet')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeMarketingField === 'sheet' ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-muted'}`}
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span>Fiche Produit</span>
                  </button>
                  <button 
                    onClick={() => setActiveMarketingField('mockup')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeMarketingField === 'mockup' ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-muted'}`}
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>Mockup 1080x1080</span>
                  </button>
                  <button 
                    onClick={() => setActiveMarketingField('tiktok')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeMarketingField === 'tiktok' ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-muted'}`}
                  >
                    <Video className="w-4 h-4 text-purple-500" />
                    <span>Scripts TikTok</span>
                  </button>
                  <button 
                    onClick={() => setActiveMarketingField('whatsapp')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeMarketingField === 'whatsapp' ? 'bg-primary/5 text-primary font-medium' : 'hover:bg-muted'}`}
                  >
                    <Send className="w-4 h-4 text-blue-500" />
                    <span>Messages WhatsApp</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Content / Editor Area */}
        <div className="flex-1 flex overflow-hidden bg-background">
          {activeMode === 'chapters' ? (
            // standard chapter editor
            activeChapter ? (
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 border-r flex flex-col relative">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImg}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm border border-primary/20 backdrop-blur-md font-semibold"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>{isGeneratingImg ? 'Génération...' : 'Illustrer'}</span>
                    </button>
                  </div>
                  
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 w-full p-8 resize-none bg-background focus:outline-none font-mono text-sm leading-relaxed"
                    placeholder="Rédigez votre contenu en Markdown..."
                  />
                </div>

                <div className="flex-1 bg-muted/10 overflow-y-auto p-8 prose prose-slate dark:prose-invert max-w-none">
                  {activeChapter.imageUrl && (
                    <div className="mb-6 relative rounded-xl overflow-hidden border bg-muted">
                      <img src={getFullUrl(activeChapter.imageUrl)} alt="Illustration" className="w-full h-auto object-cover max-h-[300px]" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold mb-8">{activeChapter.title}</h1>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Sélectionnez un chapitre
              </div>
            )
          ) : (
            // Marketing Assets Manager
            <div className="flex-1 flex overflow-hidden">
              {user?.plan === 'free' ? (
                // Locked screen for free users
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Outils Marketing Verrouillés</h2>
                    <p className="text-muted-foreground text-sm">
                      La fiche produit, les scripts TikTok publicitaires, les templates WhatsApp et les mockups FLUX en haute définition sont réservés aux abonnés payants.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/pricing')}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90"
                  >
                    Passer à une offre payante
                  </button>
                </div>
              ) : (
                // Marketing Assets display
                <div className="flex-1 p-8 overflow-y-auto">
                  {loadingMarketing ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto space-y-6">
                      
                      {/* Product Sheet Field */}
                      {activeMarketingField === 'sheet' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Fiche Produit Markdown</h2>
                            {marketingAsset?.productSheet && (
                              <button 
                                onClick={() => handleGenerateMarketing('sheet')}
                                className="text-xs text-primary hover:underline font-semibold"
                              >
                                Régénérer
                              </button>
                            )}
                          </div>
                          
                          {marketingAsset?.productSheet ? (
                            <div className="p-6 border rounded-xl bg-card prose prose-slate max-w-none">
                              <ReactMarkdown>{marketingAsset.productSheet}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="p-8 border border-dashed rounded-xl text-center space-y-4">
                              <p className="text-muted-foreground text-sm">Générez une fiche de vente persuasive pour votre ebook.</p>
                              <button 
                                onClick={() => handleGenerateMarketing('sheet')}
                                disabled={generatingAsset === 'sheet'}
                                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                              >
                                {generatingAsset === 'sheet' ? 'Génération...' : 'Générer la fiche produit'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mockup Field */}
                      {activeMarketingField === 'mockup' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Mockup Publicitaire 3D</h2>
                            {marketingAsset?.mockupUrl && (
                              <button 
                                onClick={() => handleGenerateMarketing('mockup')}
                                className="text-xs text-primary hover:underline font-semibold"
                              >
                                Régénérer
                              </button>
                            )}
                          </div>
                          
                          {marketingAsset?.mockupUrl ? (
                            <div className="p-4 border rounded-xl bg-card flex flex-col items-center">
                              <img 
                                src={getFullUrl(marketingAsset.mockupUrl)} 
                                alt="Marketing Mockup" 
                                className="max-w-md w-full h-auto rounded-lg shadow-md object-cover aspect-square" 
                              />
                            </div>
                          ) : (
                            <div className="p-8 border border-dashed rounded-xl text-center space-y-4">
                              <p className="text-muted-foreground text-sm">Générez un visuel 3D carré (1080x1080) sur smartphone pour vos publicités.</p>
                              <button 
                                onClick={() => handleGenerateMarketing('mockup')}
                                disabled={generatingAsset === 'mockup'}
                                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                              >
                                {generatingAsset === 'mockup' ? 'Génération...' : 'Générer le mockup 1080x1080'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TikTok scripts */}
                      {activeMarketingField === 'tiktok' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">10 Scripts TikTok / Reels</h2>
                            {marketingAsset?.tiktokScripts && (
                              <button 
                                onClick={() => handleGenerateMarketing('tiktok')}
                                className="text-xs text-primary hover:underline font-semibold"
                              >
                                Régénérer
                              </button>
                            )}
                          </div>
                          
                          {marketingAsset?.tiktokScripts ? (
                            <div className="grid grid-cols-1 gap-4">
                              {JSON.parse(marketingAsset.tiktokScripts).map((sc) => (
                                <div key={sc.id} className="p-5 border rounded-xl bg-card space-y-2">
                                  <div className="text-xs font-bold text-primary">Script {sc.id}</div>
                                  <p className="text-sm font-semibold">🎬 Accroche : "{sc.hook}"</p>
                                  <p className="text-sm text-muted-foreground">💬 Contenu : {sc.body}</p>
                                  <p className="text-sm italic text-amber-600 font-medium">📣 CTA : {sc.cta}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 border border-dashed rounded-xl text-center space-y-4">
                              <p className="text-muted-foreground text-sm">Rédigez 10 scripts à fort taux d'engagement pour faire décoller vos ventes.</p>
                              <button 
                                onClick={() => handleGenerateMarketing('tiktok')}
                                disabled={generatingAsset === 'tiktok'}
                                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                              >
                                {generatingAsset === 'tiktok' ? 'Génération...' : 'Générer 10 scripts TikTok'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* WhatsApp messages */}
                      {activeMarketingField === 'whatsapp' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">5 Messages WhatsApp</h2>
                            {marketingAsset?.whatsappMsgs && (
                              <button 
                                onClick={() => handleGenerateMarketing('whatsapp')}
                                className="text-xs text-primary hover:underline font-semibold"
                              >
                                Régénérer
                              </button>
                            )}
                          </div>
                          
                          {marketingAsset?.whatsappMsgs ? (
                            <div className="space-y-4">
                              {JSON.parse(marketingAsset.whatsappMsgs).map((msg, idx) => (
                                <div key={idx} className="p-5 border rounded-xl bg-card space-y-2 whitespace-pre-line text-sm relative">
                                  <div className="text-xs font-bold text-primary border-b pb-1 mb-2">Message {idx + 1}</div>
                                  {msg}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 border border-dashed rounded-xl text-center space-y-4">
                              <p className="text-muted-foreground text-sm">Générez 5 messages de prospection prêts à être copiés-collés.</p>
                              <button 
                                onClick={() => handleGenerateMarketing('whatsapp')}
                                disabled={generatingAsset === 'whatsapp'}
                                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                              >
                                {generatingAsset === 'whatsapp' ? 'Génération...' : 'Générer 5 messages WhatsApp'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
