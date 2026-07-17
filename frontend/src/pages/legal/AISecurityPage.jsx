import { Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, Eye, Zap, Server } from 'lucide-react';

const principles = [
  {
    icon: ShieldCheck,
    title: 'IA responsable',
    desc: 'Nos modèles d\'IA sont configurés avec des garde-fous stricts pour refuser la génération de contenu illicite, discriminatoire ou dangereux.',
    color: 'violet'
  },
  {
    icon: Eye,
    title: 'Transparence algorithmique',
    desc: 'Nous vous informons clairement quand un contenu est généré par IA, et nous indiquons les modèles utilisés (DeepSeek, Ideogram, Flux).',
    color: 'blue'
  },
  {
    icon: Zap,
    title: 'Protection des prompts',
    desc: 'Vos prompts et sujets de livre sont désinfectés et validés avant d\'être envoyés aux modèles IA, pour éviter les injections et abus.',
    color: 'amber'
  },
  {
    icon: Server,
    title: 'Sécurité des données',
    desc: 'Toutes les communications sont chiffrées via HTTPS/TLS. Les données stockées sont protégées par des accès segmentés et audités.',
    color: 'emerald'
  }
];

const colorMap = {
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export default function AISecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 text-sm font-medium mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Sécurité & IA éthique</h1>
            <p className="text-sm text-slate-500 mt-0.5">Notre engagement pour une IA sûre et responsable</p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-slate-600 leading-relaxed mb-10 text-base">
          Chez <strong>Neno AI</strong>, nous croyons que l'intelligence artificielle doit être un outil au service des créateurs africains, 
          dans le respect de leur vie privée, de leurs droits et de l'éthique numérique. Voici les mesures concrètes que nous mettons en place.
        </p>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className={`border rounded-xl p-5 ${colorMap[p.color]}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-bold text-base">{p.title}</h3>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Modèles IA utilisés</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Usage</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Modèle principal</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Fallback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">Génération de texte (chapitres)</td>
                    <td className="px-4 py-3 text-violet-700 font-medium">DeepSeek Chat</td>
                    <td className="px-4 py-3 text-slate-500">Alibaba Qwen Plus</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">Illustrations standard</td>
                    <td className="px-4 py-3 text-violet-700 font-medium">Ideogram Turbo</td>
                    <td className="px-4 py-3 text-slate-500">Flux (Replicate)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">Couverture HD</td>
                    <td className="px-4 py-3 text-violet-700 font-medium">Flux HD</td>
                    <td className="px-4 py-3 text-slate-500">Ideogram</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">Fiche de vente / Marketing</td>
                    <td className="px-4 py-3 text-violet-700 font-medium">DeepSeek Chat</td>
                    <td className="px-4 py-3 text-slate-500">Qwen Plus</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Politique de contenu</h2>
            <p>Neno AI interdit strictement la génération des types de contenus suivants :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Contenu à caractère haineux, raciste, ou discriminatoire.</li>
              <li>Contenu sexuellement explicite ou violant la dignité humaine.</li>
              <li>Contenu promouvant la violence, le terrorisme ou des activités illicites.</li>
              <li>Usurpation d'identité ou plagiat délibéré de tiers.</li>
              <li>Désinformation ou contenu trompeur à grande échelle.</li>
            </ul>
            <p className="mt-3">
              Tout signalement de contenu abusif peut être adressé à : 
              <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline ml-1">nashjarod9@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Infrastructure de sécurité</h2>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Authentification :</strong> Tokens JWT signés avec clé secrète (expiration 7 jours).</li>
              <li><strong>Mots de passe :</strong> Hashés avec bcrypt (salt factor 10+).</li>
              <li><strong>Rate limiting :</strong> 100 requêtes / 15 minutes par IP sur tous les endpoints API.</li>
              <li><strong>Désinfection HTML :</strong> Toute entrée utilisateur est filtrée via sanitize-html avant traitement.</li>
              <li><strong>Headers de sécurité :</strong> Helmet.js pour HSTS, X-Frame-Options, CSP, XSS Protection.</li>
              <li><strong>Surveillance :</strong> Sentry pour la détection en temps réel des erreurs et anomalies.</li>
              <li><strong>Audit CORS :</strong> Seules les origines autorisées peuvent appeler l'API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Contact sécurité</h2>
            <p>
              Pour signaler une vulnérabilité ou un incident de sécurité, contactez-nous en priorité à : 
              <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline ml-1">nashjarod9@gmail.com</a>. 
              Nous nous engageons à traiter toute alerte sérieuse dans un délai de 24 heures.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
