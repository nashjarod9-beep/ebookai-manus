import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Sparkles, CreditCard, AlertCircle } from 'lucide-react';

export default function CreditsMeter() {
  const navigate = useNavigate();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/subscription/me');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-6 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  if (!subscription) return null;

  const { plan, creditsRemaining, creditsAllocated, cycleEndDate } = subscription;
  
  // Calculate percentage
  const percent = creditsAllocated > 0 
    ? Math.max(0, Math.min(100, (creditsRemaining / creditsAllocated) * 100))
    : 0;

  const dateStr = cycleEndDate 
    ? new Date(cycleEndDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl space-y-3 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span className="text-xs font-semibold text-white uppercase font-mono">
            Plan {plan === 'free' ? 'Découverte' : plan}
          </span>
        </div>
        {plan !== 'free' && (
          <span className="text-[10px] text-slate-500 font-mono">
            Renouvellement le {dateStr}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-end">
          <span className="text-xs text-slate-400 font-medium font-sans">Solde crédits</span>
          <span className="text-lg font-bold text-white font-mono">
            {plan === 'free' ? '0' : creditsRemaining} <span className="text-xs font-normal text-slate-500">/ {creditsAllocated}</span>
          </span>
        </div>

        {plan !== 'free' && (
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percent < 15 ? 'bg-red-500' : percent < 40 ? 'bg-amber-500' : 'bg-brand-accent'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[10px]">
        {creditsRemaining === 0 && plan !== 'free' ? (
          <span className="text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Solde épuisé
          </span>
        ) : (
          <span className="text-slate-400">Gérez votre consommation</span>
        )}
        <button 
          onClick={() => navigate('/billing')}
          className="text-brand-accent hover:text-brand-accent/90 hover:underline flex items-center gap-1 font-bold font-mono transition-all"
        >
          <CreditCard className="w-3 h-3" /> Recharger
        </button>
      </div>
    </div>
  );
}
