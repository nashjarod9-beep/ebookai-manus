import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './ui/Card';
import Button from './ui/Button';
import api from '../lib/axios';
import { fadeInUp, staggerChildren } from '../design-system/motion';
import { Sparkles, BookOpen, Loader2, List, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PlaygroundDemo() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simuler les étapes d'avancement pour faire patienter l'utilisateur de manière engageante
  useEffect(() => {
    if (!isLoading) return;
    
    const steps = [
      { time: 0, text: "💡 Analyse de votre idée..." },
      { time: 2500, text: "📋 Structuration du plan de l'ebook (3 chapitres)..." },
      { time: 5000, text: "🎨 Création de la couverture haute définition..." },
      { time: 7500, text: "✍️ Rédaction de la page d'introduction..." }
    ];

    const timeouts = steps.map(step => 
      setTimeout(() => setStatusText(step.text), step.time)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isLoading]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/playground/generate', { theme: prompt });
      
      // Laisser l'animation finir si elle a été très rapide pour que l'utilisateur voie les étapes
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
        // Sauvegarder dans le localStorage pour l'inscription
        localStorage.setItem('playground_ebook', JSON.stringify(data));
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la génération. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/register');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 md:p-8 bg-surface-1/40 border border-white/10 shadow-2xl rounded-3xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-serif text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-accent animate-pulse" /> Playground AI Ebook
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Testez la puissance de notre IA instantanément. Saisissez votre idée et laissez l'IA générer un extrait d'ebook personnalisé sous vos yeux.
          </p>
        </div>

        {/* Formulaire de prompt */}
        {!isLoading && !result && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                required
                disabled={isLoading}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ex: Un guide pour apprendre l'importation Alibaba, un manuel de jardinage urbain..."
                className="flex-1 p-4 rounded-xl border border-white/10 bg-surface-0/60 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent/50 transition-colors text-sm"
              />
              <Button type="submit" variant="primary">
                Générer l'extrait
              </Button>
            </div>
            {error && <p className="text-brand-error text-xs text-center">{error}</p>}
          </form>
        )}

        {/* Animation de chargement / Skeletons */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
            <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
            <div className="space-y-2">
              <p className="text-white font-medium animate-pulse text-lg">{statusText}</p>
              <p className="text-xs text-muted-foreground">Création en cours (ne consomme aucun crédit de compte)...</p>
            </div>
            
            {/* Skeleton Loader Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="aspect-[3/4] bg-white/5 rounded-xl border border-white/5 animate-pulse flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white/20" />
              </div>
              <div className="md:col-span-2 space-y-3 text-left">
                <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
                <div className="space-y-2 pt-4">
                  <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des résultats */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Couverture */}
                <motion.div variants={fadeInUp} className="flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-2 font-mono">Illustration de couverture premium</p>
                  <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl aspect-[3/4] bg-surface-0 w-full max-w-[200px] md:max-w-none">
                    <img 
                      src={result.coverUrl} 
                      alt="Couverture" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Titre & Sommaire */}
                <motion.div variants={fadeInUp} className="md:col-span-2 space-y-4 text-left">
                  <div>
                    <p className="text-xs text-brand-accent font-mono">Titre Suggéré</p>
                    <h3 className="text-2xl font-bold font-serif text-white">{result.title}</h3>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <List className="w-3.5 h-3.5" /> Plan Généré (3 Chapitres)
                    </p>
                    <div className="space-y-2">
                      {result.chapters.map((ch, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                          <p className="font-semibold text-white">{ch.title}</p>
                          <p className="text-xs text-muted-foreground">{ch.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Première Page de Texte */}
              <motion.div variants={fadeInUp} className="text-left space-y-2 p-6 rounded-2xl bg-surface-0/60 border border-white/5">
                <p className="text-xs text-brand-accent font-mono flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Première Page Rédigée
                </p>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {result.firstPageText}
                </p>
              </motion.div>

              {/* Call To Action Banner */}
              <motion.div 
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 border border-brand-accent/30 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
              >
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-success" /> Votre ebook complet est prêt !
                  </h4>
                  <p className="text-xs text-slate-300">
                    Créez votre compte gratuit Neno AI maintenant pour conserver cet ebook et finaliser sa rédaction.
                  </p>
                </div>
                <Button onClick={handleContinue} variant="primary" className="flex items-center gap-2">
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
