const fs = require('fs');
const path = require('path');

// Mock storage.service to intercept PDF upload and save it locally
require.cache[require.resolve('../backend/src/services/storage.service')] = {
  exports: {
    uploadPdfExport: async (pdfBuffer, userId, filename) => {
      const outPath = path.join(__dirname, 'output_preview.pdf');
      fs.writeFileSync(outPath, pdfBuffer);
      console.log(`[TEST SUCCESS] PDF successfully saved locally to: ${outPath}`);
      return `file://${outPath}`;
    }
  }
};

// Set dummy environment variables to avoid validation errors
process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';
process.env.DEEPSEEK_API_KEY = 'dummy';
process.env.QWEN_API_KEY = 'dummy';

const { generatePDF } = require('../backend/src/services/pdf.service');

const runTest = async () => {
  console.log("Starting premium PDF generation test...");
  
  const book = {
    id: 'test_book_123',
    title: 'E-COMMERCE 2.0',
    subject: 'Le guide complet du sourcing et des produits digitaux',
    description: 'Transformez une idée simple en empire digital hautement rentable.',
    author: 'MISTER JADORE',
    coverUrl: null,
    contactInfo: 'Auteur : MISTER JADORE\nSite web : www.misterjadore.com\nSupport : contact@misterjadore.com'
  };

  const chapters = [
    {
      order: 1,
      title: 'Partie 1 : Le business des produits digitaux',
      content: `
> [point-cle]
> **LE SYSTÈME AVANT LA TECHNIQUE**
> Dans cette première partie, vous allez comprendre les fondations des produits digitaux rentables. Mais retenez ceci dès maintenant : créer un produit ne suffit pas à générer des ventes régulières. Les résultats réels viennent d'un système complet - positionnement, tunnel de vente, contenu stratégique et automatisation - celui-là même que nous mettons en place, étape par étape, dans nos accompagnements avancés.
`
    },
    {
      order: 2,
      title: 'Pourquoi 90 % des gens échouent avec le digital',
      content: `
La plupart des gens pensent qu'ils échouent parce que « le marché est saturé » ou parce qu'ils « n'ont pas de chance ». C'est faux. L'échec a presque toujours les trois mêmes causes — et la bonne nouvelle, c'est qu'elles se corrigent.

* **Cause n°1 — La mauvaise niche** : Ils choisissent un sujet « parce qu'il leur plaît », pas parce qu'il résout un problème.
* **Cause n°2 — La mauvaise offre** : Ils créent un « produit » au lieu de construire une « offre ».
* **Cause n°3 — L'absence de stratégie de vente** : Ils publient « au feeling », sans logique, sans tunnel.

> [cards]
> * **1x** | Créé une seule fois
> * **∞** | Vendu sans limite
> * **0** | Stock & logistique

Retenez cette grille de lecture. Tout au long de cette partie, chaque chapitre vient renforcer l'une de ces trois fondations : la niche, l'offre, la stratégie de vente.

### Le piège de l'activité sans système

Il existe une quatrième cause, plus sournoise, parce qu'elle ressemble au travail : **confondre l'agitation avec le progrès**.
`
    },
    {
      order: 3,
      title: 'Chine, Turquie ou Dubaï ? Le bon choix selon votre projet.',
      content: `
Il n'existe pas de « meilleure » source dans l'absolu. Il existe la source la mieux adaptée à votre budget, vos délais et votre marché. Voici comment les départager.

| Critère | Chine (1688 · TaoBao · Alibaba) | Turquie | Dubaï |
| --- | --- | --- | --- |
| **Prix d'achat** | Le plus bas, surtout en volume | Intermédiaire | Intermédiaire à élevé |
| **Variété produits** | Quasi illimitée | Forte sur textile & maison | Large, orientée import régional |
| **Délais** | Plus longs (transport) | Courts vers l'Afrique & l'Europe | Courts, hub logistique |
| **Quantité mini (MOQ)** | Souvent élevée | Plus souple | Variable, négociable |
| **Idéal pour...** | Volume & marge maximale | Qualité & réassort rapide | Proximité & relation directe |

### La règle simple pour décider

Vous débutez avec un petit budget et visez la marge ? Commencez par la **Chine** via 1688 ou Alibaba. Vous voulez de la qualité et réapprovisionner vite ? La **Turquie** est votre alliée.

> [attention]
> **L'ERREUR QUI RUINE LA MARGE**
> Le prix affiché par le fournisseur n'est jamais le coût réel. Ajoutez le transport, la douane, les frais de change et les éventuels intermédiaires **avant** de fixer votre prix de vente. Un produit « pas cher » qui devient cher une fois livré a déjà mangé votre bénéfice.
`
    },
    {
      order: 4,
      title: 'Pourquoi la majorité échoue sur Alibaba + Shopify',
      content: `
Le modèle fonctionne — des milliers de personnes en vivent. Mais ceux qui échouent répètent presque toujours les trois mêmes erreurs de départ.

* **Ils choisissent les mauvais produits** : Ils tombent amoureux d'un produit « cool » au lieu d'analyser froidement la demande et la marge.
* **Ils copient au lieu de tester** : Ils reproduisent à l'identique la boutique d'un autre.
* **Ils n'ont aucune stratégie de validation** : Ils commandent un gros stock *avant* d'avoir prouvé que le produit se vend.

> [cards]
> * **1er** | Tester avant d'investir
> * **x2** | Marge minimum visée
> * **B** | Toujours un plan B fournisseur

> [point-cle]
> **LE POINT CLÉ**
> En e-commerce physique, l'erreur ne coûte pas seulement du temps — elle coûte de l'**argent réel, immobilisé**. D'où l'importance vitale de valider avant de s'engager.
`
    },
    {
      order: 5,
      title: 'Vous n\'avez pas un problème de produit. Vous avez un problème de système.',
      content: `
Si vous lisez ces lignes, c'est probablement parce que vous vivez l'une de ces deux situations — et peut-être les deux à la fois.

Vous voulez vendre des **produits digitaux**, mais vous tournez en rond : vous ne savez pas vraiment quoi vendre, vous publiez du contenu qui ne convertit pas. Ou alors vous êtes lancé dans l'**e-commerce physique** avec Alibaba et Shopify : vous avez choisi un produit, créé une boutique... et vous attendez encore les ventes qui ne viennent pas.

Dans les deux cas, le point commun est le même, et il est brutal :

> **« Je suis actif... mais je n'ai pas de système de vente rentable. »**

La bonne nouvelle ? Ce système n'a rien de magique. Il se décompose en pièces simples, que vous allez découvrir dans ce guide.

> [flow]
> Produit | ce que vous vendez -> Offre | pourquoi acheter -> Trafic | qui vous voit -> Ventes | le résultat

Ce guide a été conçu pour vous donner une compréhension claire des deux modèles les plus puissants pour générer des revenus en ligne aujourd'hui : **les produits digitaux et l'e-commerce avec Alibaba et Shopify**.
`
    }
  ];

  try {
    const pdfUrl = await generatePDF(book, chapters, 'dummy_user_id');
    console.log("Generation complete! Output URL:", pdfUrl);
  } catch (error) {
    console.error("Test failed with error:", error);
  }
};

runTest();
