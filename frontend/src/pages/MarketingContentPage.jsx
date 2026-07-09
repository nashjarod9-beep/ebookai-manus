import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEbook } from '../hooks/useEbook';
import api from '../lib/axios';
import { ArrowLeft, Save, Copy, Check, Video, Send, Loader2, Sparkles, Plus, Trash2, Clock } from 'lucide-react';

export default function MarketingContentPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { data: book, isLoading: bookLoading } = useEbook(bookId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(null); // 'tiktok' | 'whatsapp'
  const [activeTab, setActiveTab] = useState('tiktok'); // 'tiktok' | 'whatsapp'
  const [copyIndex, setCopyIndex] = useState(null); // { tab: 'tiktok'|'whatsapp', idx: number }

  const [tiktokScripts, setTiktokScripts] = useState([]);
  const [whatsappMsgs, setWhatsappMsgs] = useState([]);

  useEffect(() => {
    loadMarketingContent();
  }, [bookId]);

  const loadMarketingContent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/marketing/assets/${bookId}`);
      if (data) {
        if (data.tiktokScripts) {
          setTiktokScripts(JSON.parse(data.tiktokScripts));
        }
        if (data.whatsappMsgs) {
          setWhatsappMsgs(JSON.parse(data.whatsappMsgs));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    setGenerating(type);
    try {
      const endpoint = type === 'tiktok' ? '/marketing/tiktok-scripts' : '/marketing/whatsapp-msgs';
      const { data } = await api.post(endpoint, { bookId });
      if (data) {
        if (type === 'tiktok' && data.tiktokScripts) {
          setTiktokScripts(JSON.parse(data.tiktokScripts));
        }
        if (type === 'whatsapp' && data.whatsappMsgs) {
          setWhatsappMsgs(JSON.parse(data.whatsappMsgs));
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du contenu IA.");
    } finally {
      setGenerating(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/marketing/social-scripts/update', {
        bookId,
        tiktokScripts: JSON.stringify(tiktokScripts),
        whatsappMsgs: JSON.stringify(whatsappMsgs)
      });
      alert("Contenu sauvegardé avec succès !");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // Edit Handlers for TikTok
  const updateScriptField = (idx, field, val) => {
    const updated = [...tiktokScripts];
    updated[idx][field] = val;
    setTiktokScripts(updated);
  };

  const deleteScript = (idx) => {
    setTiktokScripts(tiktokScripts.filter((_, i) => i !== idx));
  };

  const addScript = () => {
    setTiktokScripts([
      ...tiktokScripts,
      {
        id: tiktokScripts.length + 1,
        hook: "Nouvelle accroche choc...",
        body: "Développement du conseil...",
        cta: "Cliquez sur le lien pour en savoir plus",
        hashtags: "#viral #ebook",
        duration: "20s"
      }
    ]);
  };

  // Edit Handlers for WhatsApp
  const updateMsgField = (idx, field, val) => {
    const updated = [...whatsappMsgs];
    updated[idx][field] = val;
    setWhatsappMsgs(updated);
  };

  const deleteMsg = (idx) => {
    setWhatsappMsgs(whatsappMsgs.filter((_, i) => i !== idx));
  };

  const addMsg = () => {
    setWhatsappMsgs([
      ...whatsappMsgs,
      {
        approach: "Approche Personnalisée",
        content: "Nouveau message commercial..."
      }
    ]);
  };

  // Copy helpers
  const triggerCopy = (text, tab, idx) => {
    navigator.clipboard.writeText(text);
    setCopyIndex({ tab, idx });
    setTimeout(() => setCopyIndex(null), 2000);
  };

  const formatTikTokText = (sc) => {
    return `🎬 SCRIPT TIKTOK #${sc.id} (Durée : ${sc.duration})
🔥 ACCROCHE : "${sc.hook}"
💬 DÉVELOPPEMENT : ${sc.body}
📢 APPEL À L'ACTION : ${sc.cta}
🏷️ HASHTAGS : ${sc.hashtags}`;
  };

  const formatWhatsAppText = (msg) => {
    return `📲 MESSAGE WHATSAPP - APPROCHE : ${msg.approach}
    
${msg.content}`;
  };

  if (bookLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-semibold text-lg">Chargement du module contenu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Contenu Marketing</h1>
            <p className="text-muted-foreground text-sm">Scripts vidéos TikTok/Reels et messages WhatsApp prêts à l'emploi.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-md shrink-0">
        <button 
          onClick={() => setActiveTab('tiktok')}
          className={`px-6 py-3 font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'tiktok' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Video className="w-4 h-4 text-purple-500" />
          <span>10 Scripts TikTok</span>
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          className={`px-6 py-3 font-semibold border-b-2 flex items-center gap-2 ${activeTab === 'whatsapp' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Send className="w-4 h-4 text-emerald-500" />
          <span>5 Messages WhatsApp</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="space-y-6">
        
        {/* TikTok scripts */}
        {activeTab === 'tiktok' && (
          <div className="space-y-6">
            {tiktokScripts.length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center space-y-4 max-w-md mx-auto">
                <Video className="w-12 h-12 text-purple-400 mx-auto opacity-60" />
                <h3 className="text-lg font-bold">Aucun script TikTok</h3>
                <p className="text-sm text-muted-foreground">L'IA rédigera 10 accroches et développements viraux pour promouvoir votre livre.</p>
                <button 
                  onClick={() => handleGenerate('tiktok')}
                  disabled={generating !== null}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  {generating === 'tiktok' ? 'Génération...' : 'Générer les scripts TikTok'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">{tiktokScripts.length} scripts disponibles</span>
                  <button onClick={addScript} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Ajouter un script
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tiktokScripts.map((sc, idx) => (
                    <div key={idx} className="border rounded-2xl p-5 bg-card relative shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-xs font-bold text-purple-600">SCRIPT #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <input 
                              type="text" 
                              className="w-10 bg-transparent text-xs font-medium focus:outline-none border-b"
                              value={sc.duration}
                              onChange={(e) => updateScriptField(idx, 'duration', e.target.value)}
                            />
                            <button onClick={() => deleteScript(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">🎬 Accroche (Hook)</label>
                          <textarea 
                            className="w-full mt-1 p-2 border rounded bg-background text-sm font-semibold h-12 resize-none focus:outline-none"
                            value={sc.hook}
                            onChange={(e) => updateScriptField(idx, 'hook', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">💬 Développement (Body)</label>
                          <textarea 
                            className="w-full mt-1 p-2 border rounded bg-background text-xs h-20 resize-none focus:outline-none"
                            value={sc.body}
                            onChange={(e) => updateScriptField(idx, 'body', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">📣 CTA</label>
                          <input 
                            type="text" 
                            className="w-full mt-1 p-2 border rounded bg-background text-xs focus:outline-none"
                            value={sc.cta}
                            onChange={(e) => updateScriptField(idx, 'cta', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">🏷️ Hashtags</label>
                          <input 
                            type="text" 
                            className="w-full mt-1 p-2 border rounded bg-background text-xs text-muted-foreground focus:outline-none"
                            value={sc.hashtags}
                            onChange={(e) => updateScriptField(idx, 'hashtags', e.target.value)}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => triggerCopy(formatTikTokText(sc), 'tiktok', idx)}
                        className="w-full mt-4 py-2 border rounded-lg hover:bg-muted text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copyIndex?.tab === 'tiktok' && copyIndex?.idx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-green-500">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier le script</span>
                          </>
                        )}
                      </button>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WhatsApp messages */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            {whatsappMsgs.length === 0 ? (
              <div className="p-12 border border-dashed rounded-2xl text-center space-y-4 max-w-md mx-auto">
                <Send className="w-12 h-12 text-emerald-400 mx-auto opacity-60" />
                <h3 className="text-lg font-bold">Aucun message WhatsApp</h3>
                <p className="text-sm text-muted-foreground">L'IA rédigera 5 messages de prospection optimisés sous 5 angles de persuasion différents.</p>
                <button 
                  onClick={() => handleGenerate('whatsapp')}
                  disabled={generating !== null}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  {generating === 'whatsapp' ? 'Génération...' : 'Générer les messages WhatsApp'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">{whatsappMsgs.length} messages disponibles</span>
                  <button onClick={addMsg} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Ajouter un message
                  </button>
                </div>

                <div className="space-y-6">
                  {whatsappMsgs.map((msg, idx) => (
                    <div key={idx} className="border rounded-2xl p-6 bg-card relative shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600">APPROCHE :</span>
                            <input 
                              type="text" 
                              className="bg-transparent text-xs font-bold text-foreground focus:outline-none border-b"
                              value={msg.approach}
                              onChange={(e) => updateMsgField(idx, 'approach', e.target.value)}
                            />
                          </div>
                          <button onClick={() => deleteMsg(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea 
                          className="w-full mt-1 p-3 border rounded bg-background text-sm h-36 focus:outline-none font-sans whitespace-pre-wrap leading-relaxed"
                          value={msg.content}
                          onChange={(e) => updateMsgField(idx, 'content', e.target.value)}
                        />
                      </div>

                      <button 
                        onClick={() => triggerCopy(formatWhatsAppText(msg), 'whatsapp', idx)}
                        className="py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {copyIndex?.tab === 'whatsapp' && copyIndex?.idx === idx ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copier le message</span>
                          </>
                        )}
                      </button>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
