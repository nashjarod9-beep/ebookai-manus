import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 text-sm font-medium mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Politique de confidentialité</h1>
            <p className="text-sm text-slate-500 mt-0.5">Dernière mise à jour : Juillet 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Responsable du traitement</h2>
            <p>
              La plateforme <strong>Neno AI</strong> est éditée et exploitée par son fondateur, basé à Dakar, Sénégal. 
              Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse suivante : 
              <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline ml-1">nashjarod9@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes lors de votre utilisation de la plateforme :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Données d'identification</strong> : nom, adresse e-mail, mot de passe chiffré.</li>
              <li><strong>Données d'usage</strong> : ebooks créés, crédits consommés, historique des actions IA.</li>
              <li><strong>Données de paiement</strong> : traitées par notre prestataire de paiement sécurisé (Stripe). Nous ne stockons aucun numéro de carte bancaire.</li>
              <li><strong>Données techniques</strong> : adresse IP, navigateur, logs de connexion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Vous fournir les services de génération d'ebooks par intelligence artificielle.</li>
              <li>Gérer votre compte utilisateur et votre abonnement.</li>
              <li>Vous envoyer des communications relatives à votre compte (factures, alertes de crédit).</li>
              <li>Améliorer nos modèles IA et la qualité du service.</li>
              <li>Respecter nos obligations légales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Base légale du traitement</h2>
            <p>Les traitements reposent sur :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>L'exécution du contrat</strong> : nécessaire à la fourniture de nos services.</li>
              <li><strong>L'intérêt légitime</strong> : amélioration du service, prévention des fraudes.</li>
              <li><strong>Le consentement</strong> : pour les communications marketing (opt-in explicite).</li>
              <li><strong>L'obligation légale</strong> : conservation des données de facturation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Conservation des données</h2>
            <p>
              Vos données sont conservées pendant la durée de votre compte actif et jusqu'à 3 ans après sa clôture, 
              conformément aux obligations légales applicables au Sénégal et aux standards du RGPD européen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Vos droits</h2>
            <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données.</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte.</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
              <li><strong>Droit d'opposition</strong> : s'opposer à certains traitements.</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : 
              <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline ml-1">nashjarod9@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données 
              contre tout accès non autorisé, perte ou divulgation, notamment : chiffrement SSL/TLS, hashage des mots de passe 
              (bcrypt), authentification JWT, et audit de sécurité régulier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Cookies</h2>
            <p>
              Neno AI utilise uniquement des cookies strictement nécessaires au fonctionnement du service 
              (authentification, préférences). Aucun cookie publicitaire tiers n'est déposé sans votre consentement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact</h2>
            <p>
              Pour toute question : <a href="mailto:nashjarod9@gmail.com" className="text-violet-600 hover:underline">nashjarod9@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
