import { motion } from 'framer-motion';
import { Sparkles, Download, Layers, ListOrdered, Edit3, Image, FileText, ShoppingBag, Box, ArrowRight, Lightbulb } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PlaygroundDemo from '../components/PlaygroundDemo';
import { fadeInUp, staggerChildren } from '../design-system/motion';

export default function Landing() {
  const features = [
    { icon: Sparkles, title: 'Génération IA', desc: 'Des textes complets et pertinents rédigés en quelques secondes.' },
    { icon: Layers, title: 'Illustrations Auto', desc: 'Des images de haute qualité générées pour chaque chapitre.' },
    { icon: Download, title: 'Export PDF & ZIP', desc: 'Téléchargez votre ebook en PDF de luxe ou en format interactif HTML5.' },
    { icon: ShoppingBag, title: 'Kit Marketing Complet', desc: 'Fiche produit, scripts publicitaires TikTok et messages WhatsApp.' },
  ];

  const animSteps = [
    { icon: Lightbulb, label: 'Idée de départ', desc: 'Saisie de votre simple sujet' },
    { icon: ListOrdered, label: 'Sommaire strucuré', desc: 'Plan détaillé validé par vous' },
    { icon: Edit3, label: 'Écriture automatisée', desc: 'Rédaction approfondie par l\'IA' },
    { icon: Image, label: 'Illustrations de chapitres', desc: 'Images réalistes générées' },
    { icon: FileText, label: 'Compilation PDF', desc: 'Mise en page A4 professionnelle' },
    { icon: ShoppingBag, label: 'Page de vente', desc: 'Fiche produit optimisée conversion' },
    { icon: Box, label: 'Mockups publicitaires 3D', desc: 'Visuels de promotion' },
    { icon: Download, label: 'Téléchargement', desc: 'Lancement sur le marché !' }
  ];

  const scrollPlayground = () => {
    const el = document.getElementById('playground-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center bg-surface-0 min-h-screen">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto py-16 md:py-24 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Colonne Gauche */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Moteur d'IA Premium
          </div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-white"
          >
            Transformez une simple idée en ebook professionnel prêt à vendre grâce à l'IA.
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl"
          >
            Contenu, couverture, illustrations, page de vente, scripts TikTok et mockups générés automatiquement. La première plateforme africaine pour lancer votre infoproduit.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Button onClick={scrollPlayground} variant="primary" className="flex items-center gap-2">
              <span>Créer mon premier ebook gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={scrollFeatures} variant="secondary">
              Voir les fonctionnalités
            </Button>
          </motion.div>
        </motion.div>

        {/* Colonne Droite - Séquence Animée */}
        <div className="relative p-6 md:p-8 rounded-3xl bg-surface-1/30 border border-white/5 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col justify-center">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-60 h-60 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
          
          <p className="text-xs font-mono text-brand-accent uppercase tracking-widest mb-6 text-left">
            Processus de Création Neno AI
          </p>

          <motion.div 
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            className="relative border-l border-white/10 pl-6 ml-3 space-y-4 text-left"
          >
            {animSteps.map((step, idx) => (
              <motion.div 
                key={idx} 
                variants={{
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                }} 
                className="relative flex items-center gap-3.5"
              >
                {/* Icon Bubble */}
                <div className="absolute -left-[35px] w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center border border-brand-accent/35 shadow-lg shadow-brand-primary/20">
                  <step.icon className="w-3 h-3 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-white block text-sm leading-none">{step.label}</span>
                  <span className="text-[11px] text-slate-400">{step.desc}</span>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, delay: 1.2 } }
              }}
              className="pt-2 text-brand-accent font-serif font-bold text-lg italic"
            >
              ✨ En moins de 5 minutes.
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Ebook Playground Section */}
      <section id="playground-section" className="w-full py-16 px-6 border-t border-white/5 bg-surface-0">
        <div className="max-w-6xl mx-auto">
          <PlaygroundDemo />
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features-section" className="w-full py-20 px-6 border-t border-white/5 bg-surface-1/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">Une suite complète d'outils IA pour concevoir, marketer et vendre votre expertise.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card 
                key={i}
                className="p-6 space-y-4 bg-surface-1/40 hover:bg-surface-2/45 transition-colors border border-white/5"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/20 shadow-md shadow-brand-primary/10">
                  <f.icon className="w-6 h-6 text-brand-accent" />
                </div>
                <h3 className="text-lg font-bold text-white font-sans">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 text-center text-slate-500 bg-surface-0/60">
        <p className="text-xs font-mono">© 2026 Neno AI. La première plateforme africaine d'infoproduits.</p>
      </footer>
    </div>
  );
}
