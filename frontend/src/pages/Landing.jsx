import { motion } from 'framer-motion';
import { 
  Sparkles, Download, Layers, ShoppingBag, ArrowRight, 
  Globe, Shield, Clock, BookOpen, Facebook, Twitter, Linkedin, Phone, Mail, Award
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PlaygroundDemo from '../components/PlaygroundDemo';
import { fadeInUp, staggerChildren } from '../design-system/motion';

export default function Landing() {
  const features = [
    { icon: Sparkles, title: 'Génération IA Autonome', desc: 'Des ebooks entiers de 20 pages rédigés avec une structure logique et un style littéraire de premier plan.' },
    { icon: Layers, title: 'Illustrations HD de Chapitre', desc: 'Chaque chapitre est doté d\'une image illustrative premium pour aérer et enrichir la lecture.' },
    { icon: Download, title: 'Exports PDF & Word de Luxe', desc: 'Téléchargez votre livre finalisé dans un format PDF prêt à imprimer ou un fichier Word éditable.' },
    { icon: ShoppingBag, title: 'Kit Marketing de Vente', desc: 'Fiche produit commerciale AIDA, 10 scripts TikTok viraux et messages WhatsApp de relance.' },
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
      
      {/* 1. Hero Section (Sombre élégant) */}
      <section className="w-full max-w-7xl mx-auto py-16 md:py-24 px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Colonne Gauche (Textes & Boutons) */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="lg:col-span-7 space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> La première plateforme IA africaine
          </div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-white"
          >
            Transformez une <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold">simple idée</span> en <span className="text-brand-accent font-extrabold">ebook professionnel</span> prêt à vendre <span className="bg-gradient-to-r from-brand-accent to-brand-success bg-clip-text text-transparent font-extrabold">grâce à l'IA</span>.
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl"
          >
            Contenu, <span className="text-white font-semibold">couverture</span>, <span className="text-white font-semibold">illustrations</span>, <span className="text-white font-semibold">page de vente</span>, <span className="text-white font-semibold">scripts TikTok</span> et mockups générés automatiquement.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Button onClick={scrollPlayground} variant="primary" className="flex items-center gap-2">
              <span>Créer mon premier ebook gratuitement</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={scrollFeatures} variant="secondary">
              Voir les fonctionnalités
            </Button>
          </motion.div>

          {/* Quick Stats Grid under hero buttons */}
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 mt-8 max-w-lg"
          >
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-serif">5 min</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Création complète</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-serif">100%</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Autonome & Éditable</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-serif">PDF & 3D</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Livrables Inclus</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Colonne Droite (Navigateur Dashboard Mockup HTML/CSS) */}
        <div className="lg:col-span-5 relative">
          {/* Decorative glowing halos in background */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Browser Window Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-left"
          >
            {/* Browser Header Bar */}
            <div className="bg-slate-950 px-4 py-3 flex items-center gap-2 border-b border-white/5">
              {/* Window dots */}
              <div className="flex gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              {/* Address Bar */}
              <div className="flex-1 bg-white/5 border border-white/5 rounded-lg py-1 px-3 text-[10px] font-mono text-slate-500 text-center select-none truncate">
                app.neno.ai/dashboard
              </div>
            </div>

            {/* Browser Content */}
            <div className="p-4 grid grid-cols-12 gap-3 bg-surface-1/40 h-72 overflow-hidden text-xs">
              
              {/* Sidebar Mockup */}
              <div className="col-span-3 border-r border-white/5 pr-2 space-y-3.5 hidden sm:block">
                <div className="flex items-center gap-1.5 font-bold font-serif text-white text-[11px] pb-2 border-b border-white/5">
                  <span className="w-2.5 h-2.5 bg-brand-accent rounded-full animate-pulse" />
                  <span>Neno AI</span>
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-white/10 rounded-md" />
                  <div className="h-5 bg-white/5 rounded-md" />
                  <div className="h-5 bg-white/5 rounded-md" />
                </div>
              </div>

              {/* Main Cockpit Area Mockup */}
              <div className="col-span-12 sm:col-span-9 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div>
                    <p className="text-[10px] text-slate-400">Bienvenue,</p>
                    <p className="font-serif font-bold text-white text-[13px]">Lamine Diop 👋</p>
                  </div>
                  <div className="h-6 w-16 bg-brand-primary/20 border border-brand-accent/20 rounded-lg" />
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[9px] text-slate-500 font-mono">Ebooks</p>
                    <p className="font-bold text-white text-sm">4</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[9px] text-slate-500 font-mono">Crédits</p>
                    <p className="font-bold text-brand-success text-sm">18/20</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[9px] text-slate-500 font-mono">Valeur</p>
                    <p className="font-bold text-brand-accent text-[11px]">90k FCFA</p>
                  </div>
                </div>

                {/* Active Ebook Generating Status */}
                <div className="bg-white/5 p-3 rounded-xl border border-brand-accent/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-[10px] truncate max-w-[140px]">Fintech & Mobile Money</span>
                    <span className="text-[8px] font-bold text-brand-success uppercase bg-green-500/10 px-1.5 py-0.5 rounded">Récriture...</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-accent h-full w-[85%] rounded-full" />
                  </div>
                </div>
              </div>

            </div>

            {/* Floating Quick Action Badge */}
            <div className="absolute -bottom-4 right-4 bg-slate-950 border border-white/10 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-brand-accent" />
              <span>Génération HD &lt; 5min</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Features Section (FOND CLAIR VARIATION) */}
      <section id="features-section" className="w-full py-20 px-6 bg-slate-50 border-y border-slate-200/60 text-slate-900">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent px-3 py-1 bg-brand-accent/10 rounded-full">
              Fonctionnalités Clés
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">Tout ce dont vous avez besoin pour vendre</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Une suite complète d'outils d'intelligence artificielle pour concevoir, illustrer et structurer vos produits digitaux en français.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div 
                key={i}
                className="p-6 bg-white border border-slate-100 hover:border-brand-accent/30 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/10 shadow-sm group-hover:scale-105 transition-transform">
                  <f.icon className="w-6 h-6 text-brand-accent" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI Ebook Playground Section (FOND SOMBRE VARIATION) */}
      <section id="playground-section" className="w-full py-20 px-6 bg-surface-0">
        <div className="max-w-6xl mx-auto">
          <PlaygroundDemo />
        </div>
      </section>

      {/* 4. Detailed Premium Footer (Pied de page détaillé) */}
      <footer className="w-full bg-[#070b13] border-t border-white/5 text-slate-400 pt-16 pb-8 text-left text-xs">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/5">
          
          {/* Info Column (4/12) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold font-serif text-lg">
              <span className="w-3.5 h-3.5 bg-brand-accent rounded-full" />
              <span>Neno AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Transformez vos idées en produits digitaux prêts à vendre grâce à l'intelligence artificielle. Créez votre premier ebook professionnel en 5 minutes et commencez à vendre votre expertise.
            </p>
            <div className="space-y-2 pt-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-accent" />
                <span>+221 77 123 45 67 (Sénégal)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-accent" />
                <span>contact@neno.ai</span>
              </div>
            </div>
          </div>

          {/* Nav columns (8/12 divided into 4 columns) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Produit</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#playground-section" className="hover:text-white transition-colors">Playground Démo</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Tarifs & Offres</a></li>
                <li><a href="#features-section" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Créer un compte</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Solutions</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Cockpit Auteur</a></li>
                <li><a href="/create" className="hover:text-white transition-colors">AI Creator Journey</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Générateur de Fiches</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Mockups Marketing</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Ressources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><span className="text-slate-600">Blog Tech</span></li>
                <li><span className="text-slate-600">Documentation API</span></li>
                <li><span className="text-slate-600">Guides PDF</span></li>
                <li><span className="text-slate-600">FAQ Commerciale</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Légal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><span className="cursor-pointer hover:text-white transition-colors">Confidentialité</span></li>
                <li><span className="cursor-pointer hover:text-white transition-colors">Conditions Générales</span></li>
                <li><span className="cursor-pointer hover:text-white transition-colors">Mentions Légales</span></li>
                <li><span className="cursor-pointer hover:text-white transition-colors">Sécurité de l'IA</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom footer row */}
        <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-slate-500 font-mono">
            © 2026 Neno AI. La première plateforme africaine d'infoproduits. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
