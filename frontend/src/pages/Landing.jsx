import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Download, Layers, ShoppingBag, ArrowRight, 
  BookOpen, ChevronDown, ChevronUp, AlertCircle, HelpCircle, 
  Smartphone, CreditCard, Award, MessageSquare, Flame, CheckCircle, Mail
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PlaygroundDemo from '../components/PlaygroundDemo';
import { fadeInUp, staggerChildren } from '../design-system/motion';

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);

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

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 6 Blocs Colorés "Tout ce que vous pouvez faire sur Neno"
  const nenoCapabilities = [
    {
      title: "Générer un Ebook complet",
      desc: "Texte intégral rédigé en quelques secondes avec une structure logique et un ton d'expert adapté à votre sujet.",
      colorClass: "bg-amber-500/5 border-amber-500/20 text-amber-600",
      iconColor: "text-amber-500 bg-amber-500/10",
      icon: Sparkles
    },
    {
      title: "Couverture & Illustrations",
      desc: "Des images haute définition générées par IA pour la couverture et au début de chaque chapitre de votre livre.",
      colorClass: "bg-emerald-500/5 border-emerald-500/20 text-emerald-600",
      iconColor: "text-emerald-500 bg-emerald-500/10",
      icon: Layers
    },
    {
      title: "Fiche produit de vente AIDA",
      desc: "Une page de vente rédigée avec la méthode persuasive AIDA (Attention, Intérêt, Désir, Action) prête à vendre.",
      colorClass: "bg-blue-500/5 border-blue-500/20 text-blue-600",
      iconColor: "text-blue-500 bg-blue-500/10",
      icon: ShoppingBag
    },
    {
      title: "10 Scripts TikTok viraux",
      desc: "Des scripts vidéos optimisés avec accroches captivantes pour attirer du trafic organique sur votre produit.",
      colorClass: "bg-purple-500/5 border-purple-500/20 text-purple-600",
      iconColor: "text-purple-500 bg-purple-500/10",
      icon: Flame
    },
    {
      title: "Relances WhatsApp",
      desc: "5 messages pré-rédigés pour promouvoir votre ebook auprès de vos contacts et groupes de discussion.",
      colorClass: "bg-rose-500/5 border-rose-500/20 text-rose-600",
      iconColor: "text-rose-500 bg-rose-500/10",
      icon: MessageSquare
    },
    {
      title: "Liseuse 3D Interactive",
      desc: "Un aperçu virtuel réaliste en 3D qui permet à vos futurs lecteurs de feuilleter votre e-book en ligne.",
      colorClass: "bg-yellow-500/5 border-yellow-500/20 text-yellow-600",
      iconColor: "text-yellow-500 bg-yellow-500/10",
      icon: BookOpen
    }
  ];

  // Mobile Money africain list
  const mobileMoneys = [
    { name: "Wave", color: "bg-cyan-500" },
    { name: "Orange Money", color: "bg-orange-500" },
    { name: "MTN Mobile Money", color: "bg-yellow-500" },
    { name: "Moov Money", color: "bg-blue-600" },
    { name: "Free Money", color: "bg-red-600" },
    { name: "E-Money", color: "bg-indigo-600" },
    { name: "T-Money", color: "bg-sky-400" },
    { name: "Airtel Money", color: "bg-rose-600" },
    { name: "Mpesa", color: "bg-emerald-600" },
    { name: "Vodacom", color: "bg-red-500" },
    { name: "Celtiis Money", color: "bg-violet-600" },
    { name: "Nita", color: "bg-blue-500" },
    { name: "Coris Money", color: "bg-indigo-900" },
    { name: "Zamani", color: "bg-emerald-500" }
  ];

  // FAQ items
  const faqs = [
    {
      q: "Comment l'IA génère-t-elle l'ebook ?",
      a: "Neno AI s'appuie sur nos modèles d'IA premium spécialisés pour structurer et rédiger le livre chapitre par chapitre, tout en concevant des illustrations en haute définition adaptées à votre sujet.",
      cat: "Création"
    },
    {
      q: "Puis-je modifier le contenu après la génération ?",
      a: "Absolument. Un éditeur de texte interactif complet est intégré dans votre cockpit pour modifier, ajouter, ou reformuler des chapitres de votre ebook à tout moment.",
      cat: "Éditeur"
    },
    {
      q: "Dans quels formats puis-je télécharger mon livre ?",
      a: "Vous pouvez exporter votre livre sous la forme d'un PDF professionnel de luxe prêt à être distribué, ou récupérer un package web complet avec liseuse interactive 3D.",
      cat: "Export"
    },
    {
      q: "Comment fonctionne le système de crédits ?",
      a: "Chaque génération d'ebook complet consomme 1 crédit de création. Votre abonnement mensuel vous alloue un quota de crédits renouvelé automatiquement.",
      cat: "Abonnement"
    }
  ];

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

          {/* Quick Stats Grid */}
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
              <div className="flex gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
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

            {/* Floating Badge */}
            <div className="absolute -bottom-4 right-4 bg-slate-950 border border-white/10 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-brand-accent" />
              <span>Génération HD &lt; 5min</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Tout ce que vous pouvez faire sur Neno (FOND CLAIR - Blocs Colorés) */}
      <section id="features-section" className="w-full py-20 px-6 bg-slate-50 border-y border-slate-200/60 text-slate-900">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary px-3.5 py-1 bg-brand-primary/10 rounded-full">
              Possibilités Infinies
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900">Tout ce que vous pouvez faire sur Neno</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Une suite complète d'outils de pointe à votre disposition pour rédiger et vendre.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nenoCapabilities.map((item, i) => (
              <div 
                key={i}
                className={`p-6 border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4 text-left ${item.colorClass}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm ${item.iconColor}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI Ebook Playground Section (FOND SOMBRE - BIEN EN AVANT) */}
      <section id="playground-section" className="w-full py-24 px-6 bg-[#090d16] relative overflow-hidden">
        {/* Glow Effects to highlight the section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-brand-primary/10 to-brand-accent/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 border border-brand-accent/30 text-brand-accent text-xs font-bold uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Module d'Essai Instantané
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white">Lab de Création Virtuelle</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              Testez la puissance de notre intelligence artificielle en temps réel. Saisissez votre idée ci-dessous.
            </p>
          </div>
          
          <div className="border border-brand-accent/20 rounded-3xl p-1 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 shadow-2xl">
            <PlaygroundDemo />
          </div>
        </div>
      </section>

      {/* 4. Moyens de Paiement Section (FOND CLAIR) */}
      <section className="w-full py-20 px-6 bg-slate-50 border-y border-slate-200/60 text-slate-900">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary px-3 py-1 bg-brand-primary/10 rounded-full">
              Paiements Mobiles
            </span>
            <h2 className="text-3xl font-bold font-serif text-slate-900">Moyens de paiement acceptés pour votre abonnement</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              Réglez votre abonnement en toute sécurité avec vos solutions de paiement locales favorites.
            </p>
          </div>

          {/* Badge Mobile Money Africain */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-700 font-semibold text-xs tracking-wide">
            <span>💰 Mobile Money Africain</span>
          </div>

          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
            Opérateurs intégrés et acceptés en Afrique de l'Ouest et Centrale
          </p>

          {/* Mobile Money Operator grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {mobileMoneys.map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-2.5 p-3.5 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${item.color}`} />
                <span className="font-semibold text-xs text-slate-800">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section (FOND BLANC / CLAIR) */}
      <section className="w-full py-20 px-6 bg-white text-slate-900">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold font-serif text-slate-900">Questions Fréquentes</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Tout ce que vous devez savoir sur Neno AI — création, édition et exports.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full">
                      {faq.cat}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 pt-1">{faq.q}</h3>
                  </div>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-brand-accent shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-6 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pied de page Blanc (Pied de page détaillé blanc matching Navbar) */}
      <footer className="w-full bg-white border-t border-slate-200 text-slate-500 pt-16 pb-8 text-left text-xs">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-200">
          
          {/* Info Column (4/12) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold font-serif text-lg">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold font-serif text-lg tracking-tight">
                Neno <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              Transformez vos idées en produits digitaux prêts à vendre grâce à l'intelligence artificielle. Créez votre premier ebook professionnel en 5 minutes et commencez à vendre votre expertise.
            </p>
            <div className="space-y-2 pt-2 text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-brand-accent" />
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
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Produit</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><a href="#playground-section" className="hover:text-brand-accent transition-colors">Playground Démo</a></li>
                <li><a href="/pricing" className="hover:text-brand-accent transition-colors">Tarifs & Offres</a></li>
                <li><a href="#features-section" className="hover:text-brand-accent transition-colors">Fonctionnalités</a></li>
                <li><a href="/register" className="hover:text-brand-accent transition-colors">Créer un compte</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Solutions</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><a href="/dashboard" className="hover:text-brand-accent transition-colors">Cockpit Auteur</a></li>
                <li><a href="/create" className="hover:text-brand-accent transition-colors">AI Creator Journey</a></li>
                <li><a href="/dashboard" className="hover:text-brand-accent transition-colors">Générateur de Fiches</a></li>
                <li><a href="/dashboard" className="hover:text-brand-accent transition-colors">Mockups Marketing</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Ressources</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><span className="text-slate-400">Blog Tech</span></li>
                <li><span className="text-slate-400">Documentation API</span></li>
                <li><span className="text-slate-400">Guides PDF</span></li>
                <li><span className="text-slate-400">FAQ Commerciale</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Légal</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><span className="cursor-pointer hover:text-brand-accent transition-colors">Confidentialité</span></li>
                <li><span className="cursor-pointer hover:text-brand-accent transition-colors">Conditions Générales</span></li>
                <li><span className="cursor-pointer hover:text-brand-accent transition-colors">Mentions Légales</span></li>
                <li><span className="cursor-pointer hover:text-brand-accent transition-colors">Sécurité de l'IA</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="max-w-6xl mx-auto px-6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-slate-400 font-mono">
            © 2026 Neno AI. La première plateforme africaine d'infoproduits. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <span className="text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
              <HelpCircle className="w-4 h-4" />
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
