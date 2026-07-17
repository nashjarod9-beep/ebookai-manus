import React from 'react';
import Card from './ui/Card';
import { Clock, BookOpen, Image, CheckCircle, FileText, BarChart } from 'lucide-react';
import { creditCosts } from '../config/creditCosts';

export default function EstimationPanel({ formData, outline }) {
  const chapterCount = outline && outline.chapters 
    ? outline.chapters.length 
    : (formData.length === 'Très court (1 à 3 chapitres)' ? 3 
      : (formData.length === 'Court (environ 5 chapitres)' ? 5 
        : (formData.length === 'Moyen (environ 8 chapitres)' ? 8 : 10)));

  // Estimation math
  const estimatedTimeSec = (chapterCount * 30) + 45; // 30s per chapter + 45s for cover/pdf
  const estimatedTimeMin = Math.round(estimatedTimeSec / 60);
  
  const estimatedPages = (chapterCount * 3) + 2; // 3 pages per chapter + cover & contact

  // New Credit Cost Calculations based on creditCosts config
  const costCover = creditCosts.cover_hd;
  const costChapters = chapterCount * creditCosts.chapter_write;
  const costIllustrations = chapterCount * creditCosts.illustration;
  const costMarketing = creditCosts.mockup + creditCosts.product_sheet + creditCosts.tiktok_scripts + creditCosts.whatsapp_msgs;
  
  const totalCreditsCost = costCover + costChapters + costIllustrations + costMarketing;

  return (
    <Card className="p-5 bg-surface-1/40 border border-white/5 space-y-5 text-left h-fit w-full sticky top-6">
      <h3 className="text-sm font-bold font-mono text-brand-accent uppercase tracking-wider border-b border-white/5 pb-2">
        Estimation en temps réel
      </h3>

      <div className="space-y-4">
        {/* Temps de génération */}
        <div className="flex gap-3 items-start">
          <Clock className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Temps de génération estimé</p>
            <p className="text-sm font-bold text-white">≈ {estimatedTimeMin} minute{estimatedTimeMin > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Longueur du document */}
        <div className="flex gap-3 items-start">
          <BookOpen className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Longueur du livre</p>
            <p className="text-sm font-bold text-white">≈ {estimatedPages} pages ({chapterCount} chapitres)</p>
          </div>
        </div>

        {/* Illustrations de chapitres */}
        <div className="flex gap-3 items-start">
          <Image className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Illustrations haute définition</p>
            <p className="text-sm font-bold text-white">{chapterCount} images + Couverture 3D FLUX</p>
          </div>
        </div>

        {/* Livrables marketing inclus */}
        <div className="flex gap-3 items-start">
          <FileText className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Kit marketing généré</p>
            <p className="text-sm font-bold text-white">Fiche produit + 10 scripts TikTok + 5 messages WhatsApp</p>
          </div>
        </div>

        {/* Coût en crédits IA */}
        <div className="flex gap-3 items-start pt-3 border-t border-white/5">
          <BarChart className="w-4 h-4 text-brand-success mt-0.5 shrink-0" />
          <div className="w-full">
            <p className="text-xs text-slate-400">Coût estimé en crédits IA</p>
            <div className="flex justify-between items-baseline mt-0.5">
              <span className="text-sm font-extrabold text-brand-success">{totalCreditsCost} crédits IA</span>
              <span className="text-[10px] text-slate-500 font-mono">({costCover} Couv. + {costChapters} Ch. + {costIllustrations} Illus. + {costMarketing} Pub)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
              ⚡ Déduit de votre quota d'abonnement lors du lancement de la génération finale.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
