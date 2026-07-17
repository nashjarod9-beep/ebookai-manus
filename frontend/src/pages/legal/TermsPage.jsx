import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 text-sm font-medium mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Conditions Générales d'Utilisation</h1>
            <p className="text-sm text-slate-500 mt-0.5">Dernière mise à jour : Juillet 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Objet et acceptation</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme 
              <strong> Neno AI</strong>, service de génération d'ebooks par intelligence artificielle. 
              En créant un compte, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description du service</h2>
            <p>Neno AI offre les services suivants :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Génération de texte pour des ebooks professionnels via IA (modèle DeepSeek).</li>
              <li>Génération d'illustrations et de couvertures via IA (Ideogram, Flux).</li>
              <li>Export en formats PDF HD et HTML5 interactif.</li>
              <li>Création d'outils marketing (fiches de vente, scripts TikTok, messages WhatsApp).</li>
              <li>Gestion des crédits IA et des abonnements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Système de crédits</h2>
            <p>
              L'accès aux fonctionnalités payantes est conditionné par la possession de crédits IA. 
              Les crédits sont alloués selon le plan d'abonnement souscrit et peuvent être complétés par 
              des achats de packs. Les crédits non utilisés expirent à la fin du cycle de facturation mensuel, 
              sauf pour les packs achetés séparément.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Propriété intellectuelle</h2>
            <p>
              Les contenus générés par Neno AI à partir de vos prompts vous appartiennent entièrement. 
              Vous êtes seul responsable de l'usage commercial que vous en faites. 
              La plateforme Neno AI, son interface, son code source et sa marque restent la propriété exclusive de leurs créateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Obligations de l'utilisateur</h2>
            <p>L'utilisateur s'engage à :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Ne pas utiliser la plateforme à des fins illicites ou contraires aux bonnes mœurs.</li>
              <li>Ne pas tenter de contourner les mécanismes de sécurité ou de limites de crédits.</li>
              <li>Ne pas générer de contenu à caractère haineux, discriminatoire, ou portant atteinte à des tiers.</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion.</li>
              <li>Fournir des informations exactes lors de l'inscription.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Abonnements et paiements</h2>
            <p>
              Les abonnements sont facturés mensuellement à l'avance. Les paiements sont traités par Stripe, 
              prestataire certifié PCI-DSS. Toute demande de remboursement doit être formulée dans les 48 heures 
              suivant le renouvellement et adressée à : 
              <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline ml-1">nashjarod9@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitation de responsabilité</h2>
            <p>
              Neno AI est un outil d'assistance à la création. Les contenus générés sont produits par des modèles IA 
              et peuvent contenir des inexactitudes. L'utilisateur est seul responsable de la vérification, 
              de la correction et de la publication des contenus créés. Neno AI ne saurait être tenu responsable 
              des pertes commerciales résultant de l'utilisation de ses services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Résiliation</h2>
            <p>
              Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre profil. 
              La résiliation prend effet à la fin du cycle de facturation en cours. 
              Neno AI se réserve le droit de suspendre tout compte qui violerait les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit sénégalais. Tout litige sera soumis à la juridiction 
              compétente de Dakar, Sénégal, sauf disposition légale contraire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
            <p>
              Pour toute question : <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline">nashjarod9@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
