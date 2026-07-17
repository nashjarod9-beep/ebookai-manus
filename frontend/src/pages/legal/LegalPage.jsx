import { Link } from 'react-router-dom';
import { Info, ArrowLeft } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 text-sm font-medium mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Info className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Mentions Légales</h1>
            <p className="text-sm text-slate-500 mt-0.5">Dernière mise à jour : Juillet 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Éditeur de la plateforme</h2>
            <div className="bg-slate-50 rounded-xl p-5 space-y-2 text-sm">
              <p><strong>Nom de la plateforme :</strong> Neno AI</p>
              <p><strong>Siège social :</strong> Dakar, Sénégal</p>
              <p><strong>Téléphone :</strong> +221 77 838 96 10</p>
              <p><strong>Email :</strong> <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline">nashjarod9@gmail.com</a></p>
              <p><strong>Statut :</strong> Entrepreneur individuel / Startup technologique</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Hébergement</h2>
            <div className="bg-slate-50 rounded-xl p-5 space-y-2 text-sm">
              <p><strong>Frontend :</strong> Vercel Inc., 340 Pine Street Suite 603, San Francisco, CA 94104, USA</p>
              <p><strong>Base de données :</strong> Supabase (PostgreSQL hébergé sur AWS eu-west-1)</p>
              <p><strong>Stockage médias :</strong> Supabase Storage</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Technologies utilisées</h2>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Frontend :</strong> React, Vite, TailwindCSS</li>
              <li><strong>Backend :</strong> Node.js, Express.js, Prisma ORM</li>
              <li><strong>IA Texte :</strong> DeepSeek (modèle deepseek-chat), avec fallback Qwen (Alibaba)</li>
              <li><strong>IA Images :</strong> Ideogram Turbo (défaut), Flux (DALL·E Flux, fallback couvertures HD)</li>
              <li><strong>Paiements :</strong> Stripe (certifié PCI-DSS niveau 1)</li>
              <li><strong>Surveillance :</strong> Sentry (monitoring des erreurs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments constituant la plateforme Neno AI (design, code source, marque, 
              logo, textes de présentation) sont protégés par le droit de la propriété intellectuelle. 
              Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Responsabilité</h2>
            <p>
              Neno AI s'efforce d'assurer la disponibilité du service 24h/24, 7j/7. 
              Toutefois, des interruptions pour maintenance ou en cas de force majeure peuvent survenir. 
              Neno AI ne saurait être tenu responsable des dommages directs ou indirects 
              liés à l'utilisation ou à l'impossibilité d'utiliser la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit sénégalais. 
              Tout litige sera soumis à la juridiction exclusive des tribunaux de Dakar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
            <p>
              Pour toute question ou réclamation : <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline">nashjarod9@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
