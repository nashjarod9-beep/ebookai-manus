import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEbook } from '../hooks/useEbook';
import { useAI } from '../hooks/useAI';
import { Loader2, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function CreateEbook() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    theme: '', 
    objective: '', 
    audience: '', 
    tone: 'Professionnel', 
    length: 'Court (environ 5 chapitres)', 
    language: 'fr' 
  });
  const [outline, setOutline] = useState(null);
  const [bookId, setBookId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultData, setResultData] = useState(null);

  const navigate = useNavigate();
  const createEbook = useCreateEbook();
  const { generateOutline, generateFullEbook } = useAI();

  const handleOutlineGeneration = async () => {
    setIsGenerating(true);
    try {
      const generatedOutline = await generateOutline(formData);
      setOutline(generatedOutline);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération de la structure.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFullGeneration = async () => {
    setIsGenerating(true);
    setStep(3);
    try {
      // 1. Create book draft in DB
      const book = await createEbook.mutateAsync({
        title: outline.title,
        subject: formData.theme,
        description: outline.description,
        language: formData.language,
        format: 'static'
      });
      setBookId(book.id);

      // 2. Call Manus AI to generate the full content
      const finalEbook = await generateFullEbook(outline, formData, book.id);
      
      setResultData(finalEbook);
      setStep(4);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération complète de l'ebook par Manus AI.");
      setStep(2); // Go back if failed
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Créer un nouvel ebook via Manus AI</h1>
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Étape 1 : Questionnaire de création</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Thème principal</label>
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
                <label className="block text-sm font-medium mb-1">Ton</label>
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
                <label className="block text-sm font-medium mb-1">Longueur</label>
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
                onClick={handleOutlineGeneration} 
                disabled={!formData.theme || isGenerating}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>Générer la structure</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && outline && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Étape 2 : Validation de la structure</h2>
            <p className="text-muted-foreground text-sm">Vérifiez et ajustez le plan proposé par Manus AI avant de lancer la rédaction complète.</p>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <input 
                className="font-bold text-lg w-full bg-transparent border-b border-transparent focus:border-border outline-none"
                value={outline.title}
                onChange={(e) => setOutline({...outline, title: e.target.value})}
              />
              <textarea 
                className="text-muted-foreground mt-2 w-full bg-transparent border-b border-transparent focus:border-border outline-none resize-none"
                value={outline.description}
                onChange={(e) => setOutline({...outline, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Chapitres ({outline.chapters.length})</h4>
              {outline.chapters.map((ch, idx) => (
                <div key={idx} className="p-3 border rounded-md bg-background flex gap-4">
                  <span className="font-bold text-muted-foreground">{idx + 1}.</span>
                  <div className="flex-1">
                    <input 
                      className="font-medium w-full bg-transparent border-b border-transparent focus:border-border outline-none"
                      value={ch.title}
                      onChange={(e) => {
                        const newChapters = [...outline.chapters];
                        newChapters[idx].title = e.target.value;
                        setOutline({...outline, chapters: newChapters});
                      }}
                    />
                    <textarea 
                      className="text-sm text-muted-foreground w-full bg-transparent border-b border-transparent focus:border-border outline-none resize-none mt-1"
                      value={ch.summary}
                      onChange={(e) => {
                        const newChapters = [...outline.chapters];
                        newChapters[idx].summary = e.target.value;
                        setOutline({...outline, chapters: newChapters});
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-md hover:bg-muted">Modifier le questionnaire</button>
              <button 
                onClick={handleFullGeneration}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
              >
                <span>Générer l'ebook complet (Texte + Images + PDF)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Manus AI est au travail...</h2>
              <p className="text-muted-foreground max-w-sm mx-auto mt-4">
                Manus rédige l'intégralité du livre, génère les illustrations et met en page le document final. 
                <br/><br/>
                Cette opération autonome peut prendre plusieurs minutes.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold">Ebook généré par Manus AI !</h2>
            <p className="text-muted-foreground max-w-md">
              Votre livre a été entièrement rédigé et illustré de manière autonome.
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

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => navigate(`/editor/${bookId}`)}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90"
              >
                Ouvrir dans l'éditeur (Retouches)
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="border px-8 py-3 rounded-md font-medium hover:bg-muted"
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
