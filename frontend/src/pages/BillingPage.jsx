import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import plans from '../config/plans';
import { Sparkles, CreditCard, Check, Shield, Zap, Info, Loader2, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const creditPacks = [
  {
    id: "bronze",
    name: "Pack Bronze",
    credits: 50,
    price: 1500,
    description: "Parfait pour un petit ebook ou quelques illustrations supplémentaires."
  },
  {
    id: "silver",
    name: "Pack Argent",
    credits: 150,
    price: 4000,
    description: "Le meilleur rapport qualité/prix pour les créateurs réguliers."
  },
  {
    id: "gold",
    name: "Pack Or",
    credits: 500,
    price: 10000,
    description: "Idéal pour les agences ou la création massive d'ebooks."
  }
];

export default function BillingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [showPacksOnly, setShowPacksOnly] = useState(false);

  // Check if query parameters specify packs
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('packs') === 'true') {
      setShowPacksOnly(true);
    }
  }, [location]);

  // Fetch subscription info
  const { data: subscription, isLoading: isLoadingSub, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/subscription/me');
      return data;
    }
  });

  const handleSubscribe = async (planId) => {
    setLoadingActionId(planId);
    try {
      const { data } = await api.post('/subscription/change-plan', { planId });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur: URL de paiement introuvable");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Erreur lors de l'initiation du paiement.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handlePurchasePack = async (packId) => {
    setLoadingActionId(packId);
    try {
      const { data } = await api.post('/credits/purchase', { packId });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur: URL de paiement introuvable");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Erreur lors de l'initiation de l'achat.");
    } finally {
      setLoadingActionId(null);
    }
  };

  if (isLoadingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
          <p className="text-sm text-slate-400 font-mono">Chargement de votre compte de facturation...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const remainingCredits = subscription?.creditsRemaining || 0;
  const allocatedCredits = subscription?.creditsAllocated || 0;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12 text-left">
      
      {/* 1. Header & Quick Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-serif text-white">
            Abonnements & Crédits IA ⚡
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gérez vos forfaits et rechargez vos crédits instantanément pour continuer à créer.
          </p>
        </div>
        
        {/* Solde Card */}
        <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-xl shrink-0">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Solde Actuel</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {currentPlan === 'free' ? '0' : remainingCredits} <span className="text-xs text-slate-500 font-normal">/ {allocatedCredits} crédits</span>
            </div>
            <div className="text-[10px] text-brand-accent mt-0.5 font-medium">
              Plan actuel : <span className="uppercase font-mono font-bold">{currentPlan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => setShowPacksOnly(false)}
          className={`pb-2 text-sm font-semibold transition-all ${
            !showPacksOnly 
              ? 'text-brand-accent border-b-2 border-brand-accent' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Abonnements Mensuels
        </button>
        <button
          onClick={() => setShowPacksOnly(true)}
          className={`pb-2 text-sm font-semibold transition-all ${
            showPacksOnly 
              ? 'text-brand-accent border-b-2 border-brand-accent' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Recharges de Crédits (Packs) 💎
        </button>
      </div>

      {!showPacksOnly ? (
        // 2. Subscription plans comparison grid
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.values(plans).filter(p => p.id !== 'free').map((plan) => {
              const isActive = currentPlan === plan.id;
              const isLoading = loadingActionId === plan.id;
              
              return (
                <Card 
                  key={plan.id}
                  hoverEffect={true} 
                  className={`p-6 flex flex-col justify-between h-full bg-slate-900/40 border text-left ${
                    isActive ? 'border-brand-accent shadow-brand-accent/5 shadow-2xl' : 'border-white/5'
                  }`}
                >
                  <div className="space-y-6">
                    <div>
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-brand-accent/10 border border-brand-accent/20 text-brand-accent px-2 py-0.5 rounded-full mb-3 inline-block">
                          Plan Actif
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-white capitalize">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Crédits inclus : {plan.credits} IA</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {plan.price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">FCFA/mois</span>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-300 pt-6 border-t border-white/5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      disabled={isActive || !!loadingActionId}
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isActive
                          ? 'bg-brand-success/10 text-brand-success border border-brand-success/20 cursor-default'
                          : 'bg-white/10 hover:bg-white/15 text-white border border-white/5 active:scale-[0.98]'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : isActive ? (
                        "Votre abonnement"
                      ) : (
                        "Choisir ce plan"
                      )}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed text-left">
              * Les abonnements mensuels sont renouvelés automatiquement tous les 30 jours. Les crédits non consommés ne sont pas reportables sur le mois suivant. Vous pouvez modifier votre formule à tout moment ; le nouveau barème de crédit s'appliquera immédiatement.
            </p>
          </div>
        </div>
      ) : (
        // 3. Credit packs purchase grid
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creditPacks.map((pack) => {
              const isLoading = loadingActionId === pack.id;
              
              return (
                <Card 
                  key={pack.id} 
                  hoverEffect={true}
                  className="p-6 flex flex-col justify-between h-full bg-slate-900/40 border border-white/5 text-left"
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white font-serif">{pack.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{pack.description}</p>
                      </div>
                      <div className="bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-lg text-brand-accent text-xs font-bold font-mono">
                        +{pack.credits} crédits
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {pack.price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">FCFA</span>
                    </div>

                    <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-white/5">
                      <li className="flex gap-2 items-center">
                        <Check className="w-4 h-4 text-brand-success" />
                        <span>Pas de date d'expiration</span>
                      </li>
                      <li className="flex gap-2 items-center">
                        <Check className="w-4 h-4 text-brand-success" />
                        <span>Crédits cumulables</span>
                      </li>
                      <li className="flex gap-2 items-center">
                        <Check className="w-4 h-4 text-brand-success" />
                        <span>Valable sur toutes les IA</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-8">
                    <button
                      disabled={!!loadingActionId}
                      onClick={() => handlePurchasePack(pack.id)}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-brand-accent hover:bg-brand-accent/90 text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          Acheter maintenant
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed text-left">
              * Les recharges de crédits sont idéales si vous manquez de crédits avant votre renouvellement d'abonnement ou si vous ne souhaitez pas vous engager mensuellement. Ces crédits restent actifs sans limite de temps.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
