import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { tokens } from '../design-system/tokens';
import { fadeInUp, staggerChildren } from '../design-system/motion';
import { Sparkles, Palette, Type, Layers, Play } from 'lucide-react';

export default function DesignPreview() {
  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="container mx-auto px-6 py-12 max-w-5xl space-y-12"
    >
      {/* En-tête */}
      <motion.div variants={fadeInUp} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-sm font-semibold">
          <Sparkles className="w-4 h-4" /> Neno AI Design System
        </div>
        <h1 className="text-5xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Système de Design Premium
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Découvrez la charte graphique et les composants interactifs de la plateforme Neno AI. Conçu pour transformer vos idées en produits digitaux à forte valeur ajoutée.
        </p>
      </motion.div>

      {/* 1. Palette de Couleurs */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <h2 className="text-2xl font-bold font-serif flex items-center gap-2 border-b border-white/5 pb-2">
          <Palette className="w-5 h-5 text-brand-accent" /> Palette de Couleurs (Tokens)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card hoverEffect={false} className="p-4 space-y-2">
            <div className="h-16 rounded-lg bg-brand-primary" />
            <div>
              <p className="font-semibold text-sm">Brand Primary</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.brand.primary}</p>
            </div>
          </Card>
          <Card hoverEffect={false} className="p-4 space-y-2">
            <div className="h-16 rounded-lg bg-brand-accent" />
            <div>
              <p className="font-semibold text-sm">Brand Accent</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.brand.accent}</p>
            </div>
          </Card>
          <Card hoverEffect={false} className="p-4 space-y-2">
            <div className="h-16 rounded-lg bg-brand-success" />
            <div>
              <p className="font-semibold text-sm">Success</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.brand.success}</p>
            </div>
          </Card>
          <Card hoverEffect={false} className="p-4 space-y-2">
            <div className="h-16 rounded-lg bg-brand-error" />
            <div>
              <p className="font-semibold text-sm">Error</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.brand.error}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <Card hoverEffect={false} className="p-4 space-y-2 bg-surface-0 border border-white/5">
            <div className="h-16 rounded-lg bg-surface-0 border border-white/10" />
            <div>
              <p className="font-semibold text-sm">Surface 0 (App Bg)</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.surface[0]}</p>
            </div>
          </Card>
          <Card hoverEffect={false} className="p-4 space-y-2 bg-surface-1 border border-white/5">
            <div className="h-16 rounded-lg bg-surface-1" />
            <div>
              <p className="font-semibold text-sm">Surface 1 (Card Bg)</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.surface[1]}</p>
            </div>
          </Card>
          <Card hoverEffect={false} className="p-4 space-y-2 bg-surface-2 border border-white/5">
            <div className="h-16 rounded-lg bg-surface-2" />
            <div>
              <p className="font-semibold text-sm">Surface 2 (Hover/Active)</p>
              <p className="text-xs text-muted-foreground">{tokens.colors.surface[2]}</p>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* 2. Typographie */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <h2 className="text-2xl font-bold font-serif flex items-center gap-2 border-b border-white/5 pb-2">
          <Type className="w-5 h-5 text-brand-accent" /> Typographie
        </h2>
        <Card hoverEffect={false} className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-mono">Polices & Styles</p>
            <h3 className="text-4xl font-serif">Playfair Display (Serif)</h3>
            <p className="text-slate-300 font-serif italic text-lg">"Générez votre premier ebook en 5 minutes"</p>
          </div>
          <hr className="border-white/5" />
          <div className="space-y-2">
            <h3 className="text-2xl font-sans font-bold">Inter (Sans-serif)</h3>
            <p className="text-slate-400 font-sans leading-relaxed text-sm">
              La police Inter est optimisée pour l'interface utilisateur, offrant une lisibilité parfaite dans les formulaires, tableaux de bord et boutons d'action.
            </p>
          </div>
        </Card>
      </motion.section>

      {/* 3. Cartes Glassmorphismes */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <h2 className="text-2xl font-bold font-serif flex items-center gap-2 border-b border-white/5 pb-2">
          <Layers className="w-5 h-5 text-brand-accent" /> Cartes (Cards)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-bold font-serif">Carte Statique</h3>
            <p className="text-sm text-slate-400">
              Un effet de verre dépoli élégant, idéal pour les blocs d'information statiques. Comprend une bordure fine blanche semi-transparente.
            </p>
          </Card>
          
          <Card 
            onClick={() => alert("Carte cliquée !")}
            className="p-6 space-y-4"
          >
            <h3 className="text-xl font-bold font-serif text-brand-accent flex items-center gap-2">
              Carte Interactive <Play className="w-4 h-4" />
            </h3>
            <p className="text-sm text-slate-400">
              Survolez cette carte pour observer l'élévation fluide, le halo lumineux interne ainsi que le changement dynamique de bordure. Cliquez pour déclencher la micro-interaction.
            </p>
          </Card>
        </div>
      </motion.section>

      {/* 4. Boutons */}
      <motion.section variants={fadeInUp} className="space-y-6">
        <h2 className="text-2xl font-bold font-serif flex items-center gap-2 border-b border-white/5 pb-2">
          <Sparkles className="w-5 h-5 text-brand-accent" /> Boutons
        </h2>
        <Card hoverEffect={false} className="p-6">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Bouton Primaire</p>
              <Button variant="primary">Démarrez maintenant</Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Bouton Secondaire</p>
              <Button variant="secondary">En savoir plus</Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Bouton Désactivé</p>
              <Button variant="primary" disabled>Créer un ebook</Button>
            </div>
          </div>
        </Card>
      </motion.section>
    </motion.div>
  );
}
