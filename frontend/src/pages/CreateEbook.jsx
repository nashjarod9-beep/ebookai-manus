import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateEbook, useEbook } from '../hooks/useEbook';
import { useAI } from '../hooks/useAI';
import api from '../lib/axios';
import { Loader2, ArrowRight, ArrowLeft, Check, Sparkles, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';

export default function CreateEbook() {
  const [step, setStep] = useState(1);
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [resultData, setResultData] = useState(null);

  // New states for titles and outline editing
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [newSubchapterText, setNewSubchapterText] = useState({}); // Bound by chapter order
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const navigate = useNavigate();
  const { draftId } = useParams();
  
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
        localStorage.removeItem('playground_ebook'); // Nettoyer pour éviter les rechargements accidentels
      } catch (e) {
        console.error("Error parsing stored playground ebook:", e);
      }
    }
  }, [draftId, bookId]);


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
      alert("Erreur lors de la suggestion des titres. Vous pouvez saisir un titre personnalisé.");
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

  // Step 3 chapter manipulation helpers
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
      subchapters: ["Sous-section 1"],
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

  const handleFullGeneration = async () => {
    setIsGenerating(true);
    setStep(5);
    try {
      let currentBookId = bookId;
      const finalTitle = customTitle.trim() || selectedTitle || outline.title;
      
      // 1. Create book draft in DB if not already created (for retry resilience)
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

      // 2. Generate cover image via FLUX (BFL)
      setProgressMessage("Génération de la couverture avec l'IA FLUX...");
      const coverUrl = await generateCover(currentBookId, outline.coverImagePrompt);
      console.log("Couverture générée :", coverUrl);

      // 3. Generate chapters sequentially to avoid serverless timeouts
      for (let i = 0; i < outline.chapters.length; i++) {
        const ch = outline.chapters[i];
        setProgressMessage(`Génération du chapitre ${i + 1}/${outline.chapters.length} : "${ch.title}"...`);
        const result = await generateChapter(currentBookId, ch, {
          ...formData,
          additionalInstructions
        });
        console.log(`Chapitre ${i + 1} généré avec succès :`, result);
      }

      // 4. Generate final PDF using Playwright
      setProgressMessage("Compilation et mise en page du document PDF professionnel...");
      const { data: pdfResult } = await api.post(`/export/pdf/${currentBookId}`);
      
      setResultData({ pdfUrl: pdfResult.pdfPath });
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      alert(`Erreur lors de la génération : ${errMsg}. Vous pourrez reprendre la génération là où elle a échoué.`);
      setStep(4); // Go back to allow retrying
    } finally {
      setIsGenerating(false);
      setProgressMessage('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {step > 1 && step < 5 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="p-2 border rounded-lg hover:bg-muted transition-colors flex items-center justify-center shrink-0"
              title="Étape précédente"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <h1 className="text-3xl font-bold font-serif">AI Creator Journey</h1>
        </div>
        {/* Progress Bar (5 Steps) */}
        <div className="flex items-center justify-between relative mt-6 mb-10">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`flex flex-col items-center ${s < step && step < 5 ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={() => {
                if (s < step && step < 5) {
                  setStep(s);
                }
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s}
              </div>
              <span className="text-xs text-muted-foreground mt-1 absolute -translate-y-[-28px] font-medium hidden sm:inline">
                {s === 1 && "💡 Trouver votre idée"}
                {s === 2 && "✍️ Construire votre expertise"}
                {s === 3 && "🎨 Donner vie au contenu"}
                {s === 4 && "🚀 Préparer la vente"}
                {s === 5 && "💰 Publier"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        
        {/* Step 1: Questionnaire */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Étape 1 : Questionnaire de création</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de l'auteur</label>
                <input 
                  type="text"
                  className="w-full p-3 border rounded-md bg-background"
                  placeholder="Ex: Jean Dupont"
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Intervalle de pages visé</label>
                <select 
                  className="w-full p-3 border rounded-md bg-background"
                  value={formData.targetPages}
                  onChange={e => setFormData({...formData, targetPages: e.target.value})}
                >
                  <option value="5 à 10 pages">5 à 10 pages</option>
                  <option value="10 à 20 pages">10 à 20 pages</option>
                  <option value="20 à 30 pages">20 à 30 pages</option>
                  <option value="30 pages et plus">30 pages et plus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sujet / Thème principal</label>
              <textarea 
                className="w-full p-3 border rounded-md bg-background"
                placeholder="Ex: Les bases de l'intelligence artificielle pour les PME..."
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objectif de l'ebook</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-md bg-background"
                placeholder="Ex: Générer des leads, former des débutants, etc."
                value={formData.objective}
                onChange={e => setFormData({...formData, objective: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Public Cible</label>
              <input 
                type="text" 
                className="w-full p-3 border rounded-md bg-background"
                placeholder="Ex: Dirigeants, étudiants, développeurs..."
                value={formData.audience}
                onChange={e => setFormData({...formData, audience: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ton d'écriture</label>
                <select 
                  className="w-full p-3 border rounded-md bg-background"
                  value={formData.tone}
                  onChange={e => setFormData({...formData, tone: e.target.value})}
                >
                  <option value="Professionnel">Professionnel</option>
                  <option value="Pédagogique">Pédagogique / Didactique</option>
                  <option value="Inspirant">Inspirant</option>
                  <option value="Humoristique">Humoristique / Décontracté</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre estimé de chapitres</label>
                <select 
                  className="w-full p-3 border rounded-md bg-background"
                  value={formData.length}
                  onChange={e => setFormData({...formData, length: e.target.value})}
                >
                  <option value="Très court (1 à 3 chapitres)">Très court (1 à 3 chapitres)</option>
                  <option value="Court (environ 5 chapitres)">Court (environ 5 chapitres)</option>
                  <option value="Moyen (environ 8 chapitres)">Moyen (environ 8 chapitres)</option>
                  <option value="Long (plus de 10 chapitres)">Long (plus de 10 chapitres)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Informations de contact pour la dernière page (facultatif)</label>
              <textarea 
                className="w-full p-3 border rounded-md bg-background h-24"
                placeholder="Ex: Téléphone : +221 77 123 45 67&#10;Email : contact@entreprise.com&#10;Instagram/LinkedIn : @MonCompte"
                value={formData.contactInfo}
                onChange={e => setFormData({...formData, contactInfo: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Langue</label>
              <select 
                className="w-full p-3 border rounded-md bg-background"
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value})}
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
              </select>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={handleGoToStep2} 
                disabled={!formData.theme}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 font-semibold"
              >
                <span>Suggérer des titres</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Title Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Étape 2 : Suggestions de titres</h2>
            
            {isGeneratingTitles ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Génération de propositions de titres professionnels...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">Sélectionnez un titre parmi les propositions de l'IA ou écrivez le vôtre ci-dessous.</p>
                <div className="grid grid-cols-1 gap-3">
                  {titleSuggestions.map((title, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedTitle(title);
                        setCustomTitle('');
                      }}
                      className={`p-4 border rounded-xl cursor-pointer hover:border-primary/50 transition-colors ${selectedTitle === title && !customTitle ? 'border-primary bg-primary/5' : 'bg-background'}`}
                    >
                      <span className="font-medium text-foreground">{title}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-1">Ou personnalisez votre titre :</label>
                  <input 
                    type="text"
                    className="w-full p-3 border rounded-md bg-background"
                    placeholder="Saisissez un titre entièrement personnalisé..."
                    value={customTitle}
                    onChange={e => {
                      setCustomTitle(e.target.value);
                      setSelectedTitle('');
                    }}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-md hover:bg-muted">Retour</button>
                  <button 
                    onClick={handleGoToStep3}
                    disabled={!selectedTitle && !customTitle.trim()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-semibold"
                  >
                    <span>Valider le titre</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Structure Editor */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Étape 3 : Plan de l'e-book</h2>
            
            {isGeneratingOutline ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Création de la structure et des chapitres...</p>
              </div>
            ) : outline && (
              <div className="space-y-6">
                <p className="text-muted-foreground text-sm">Organisez, renommez ou ajustez les chapitres et leurs sous-sections.</p>
                
                <div className="space-y-4">
                  {outline.chapters.map((ch, idx) => (
                    <div key={idx} className="p-4 border rounded-xl bg-card space-y-4 relative">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-bold text-primary">Chapitre ${idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveChapterUp(idx)} disabled={idx === 0} className="p-1 border rounded hover:bg-muted disabled:opacity-30">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => moveChapterDown(idx)} disabled={idx === outline.chapters.length - 1} className="p-1 border rounded hover:bg-muted disabled:opacity-30">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeChapter(idx)} className="p-1 border border-red-200 text-red-500 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Titre du chapitre</label>
                        <input 
                          className="font-semibold text-lg w-full p-2 border rounded bg-background"
                          value={ch.title}
                          onChange={(e) => {
                            const newChapters = [...outline.chapters];
                            newChapters[idx].title = e.target.value;
                            setOutline({...outline, chapters: newChapters});
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Résumé / Description</label>
                        <textarea 
                          className="text-sm text-muted-foreground w-full p-2 border rounded bg-background h-16 resize-none"
                          value={ch.summary}
                          onChange={(e) => {
                            const newChapters = [...outline.chapters];
                            newChapters[idx].summary = e.target.value;
                            setOutline({...outline, chapters: newChapters});
                          }}
                        />
                      </div>

                      {/* Subchapters List */}
                      <div className="space-y-2 pt-2 border-t">
                        <label className="block text-xs font-bold text-muted-foreground uppercase">Sous-chapitres / sections</label>
                        <div className="space-y-1">
                          {ch.subchapters && ch.subchapters.map((sub, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                              <input 
                                className="bg-transparent outline-none flex-1 font-medium"
                                value={sub}
                                onChange={(e) => {
                                  const newChapters = [...outline.chapters];
                                  newChapters[idx].subchapters[sIdx] = e.target.value;
                                  setOutline({...outline, chapters: newChapters});
                                }}
                              />
                              <button onClick={() => handleRemoveSubchapter(idx, sIdx)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input 
                            type="text"
                            className="text-xs p-2 border rounded bg-background flex-1"
                            placeholder="Nouveau sous-chapitre..."
                            value={newSubchapterText[idx] || ''}
                            onChange={(e) => setNewSubchapterText({ ...newSubchapterText, [idx]: e.target.value })}
                          />
                          <button onClick={() => handleAddSubchapter(idx)} className="bg-secondary text-secondary-foreground text-xs px-3 py-2 rounded flex items-center gap-1 font-medium">
                            <Plus className="w-3.5 h-3.5" /> Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addNewChapter}
                  className="w-full py-3 border border-dashed rounded-xl flex items-center justify-center gap-2 hover:bg-muted text-muted-foreground font-semibold mt-4"
                >
                  <Plus className="w-5 h-5" /> Ajouter un chapitre
                </button>

                <div className="flex justify-between mt-8 border-t pt-4">
                  <button onClick={() => setStep(2)} className="px-4 py-2 border rounded-md hover:bg-muted">Retour</button>
                  <button 
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-semibold"
                  >
                    <span>Valider le plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Additional Instructions */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Étape 4 : Consignes particulières</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Souhaitez-vous ajouter des consignes particulières pour la rédaction ? Vous pouvez par exemple :
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Ajouter des exemples précis ou études de cas.</li>
                <li>Demander d'insister sur certains points spécifiques.</li>
                <li>Demander un style particulier (pédagogique, métaphorique, académique).</li>
                <li>Ajouter des références ou des citations clés.</li>
                <li>Demander d'éviter certains sujets ou termes techniques complexes.</li>
              </ul>
              
              <textarea 
                className="w-full p-3 border rounded-md bg-background h-32 mt-4"
                placeholder="Ex: Utilise des études de cas africaines pour illustrer chaque chapitre. Insiste bien sur l'importance du marketing digital dans le chapitre 3..."
                value={additionalInstructions}
                onChange={e => setAdditionalInstructions(e.target.value)}
              />

              <div className="flex justify-between mt-8 border-t pt-4">
                <button onClick={() => setStep(3)} className="px-4 py-2 border rounded-md hover:bg-muted">Retour</button>
                <div className="flex gap-3">
                  <button onClick={handleFullGeneration} className="px-4 py-2 border rounded-md hover:bg-muted text-muted-foreground">
                    Passer cette étape
                  </button>
                  <button 
                    onClick={handleFullGeneration}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-semibold"
                  >
                    <span>Lancer la génération</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Sequential Generation & Success Page */}
        {step === 5 && (
          <div>
            {isGenerating ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Génération de l'e-book en cours...</h2>
                  <p className="text-primary font-semibold mt-4 text-lg">
                    {progressMessage}
                  </p>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-4 text-sm">
                    L'IA rédige chaque chapitre selon vos consignes, génère les illustrations et met en page le document PDF. 
                    <br/><br/>
                    Cette opération peut prendre quelques minutes. Ne fermez pas cette page.
                  </p>
                </div>
              </div>
            ) : resultData ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold">Ebook généré avec succès !</h2>
                <p className="text-muted-foreground max-w-md">
                  Votre livre a été rédigé de manière autonome par DeepSeek et illustré par l'IA FLUX.
                </p>
                
                {resultData?.pdfUrl && (
                  <a 
                    href={resultData.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-2 text-primary font-bold hover:underline"
                  >
                    <ArrowRight className="w-5 h-5" /> Télécharger le PDF final
                  </a>
                )}

                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  <button 
                    onClick={() => navigate(`/product-sheet/${bookId}`)}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 flex items-center gap-2 shadow"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Générer la fiche produit</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/editor/${bookId}`)}
                    className="bg-secondary text-secondary-foreground border px-8 py-3 rounded-md font-semibold hover:bg-secondary/80"
                  >
                    Ouvrir dans l'éditeur
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="border px-8 py-3 rounded-md font-semibold hover:bg-muted text-muted-foreground"
                  >
                    Retour au dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-red-500 font-medium">Une erreur est survenue lors de la génération.</p>
                <button onClick={() => setStep(4)} className="px-4 py-2 border rounded hover:bg-muted">Retour aux consignes</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
