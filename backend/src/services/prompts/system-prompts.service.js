const prompts = {
  suggest_titles: {
    v1: {
      system: "Tu es un concepteur de titres de livres à succès.",
      user: (theme, objective, audience, tone, language) => `
Tu es un expert en marketing d'édition d'ebooks.
Génère 5 propositions de titres accrocheurs, percutants, professionnels et vendeurs pour un ebook basé sur les critères suivants :
- Thème principal : "${theme}"
- Objectif de l'ebook : "${objective}"
- Public cible : "${audience}"
- Ton d'écriture : "${tone}"
- Langue : "${language}"

Sois très rapide. Génère des titres courts (max 8 mots).
Réponds UNIQUEMENT sous la forme d'un tableau JSON de 5 chaînes de caractères (sans markdown, sans backticks, sans blabla) :
[
  "Titre proposé 1",
  "Titre proposé 2",
  "Titre proposé 3",
  "Titre proposé 4",
  "Titre proposé 5"
]`
    }
  },
  generate_outline: {
    v1: {
      system: "Tu es un architecte d'ebooks.",
      user: (title, theme, objective, audience, tone, length, language) => `
Tu es un agent expert en conception et rédaction d'ebooks professionnels.
Génère une structure détaillée pour un e-book basé sur les critères suivants :
- Titre validé de l'ebook : "${title}"
- Thème général : "${theme}"
- Objectif de l'ebook : "${objective}"
- Public cible : "${audience}"
- Ton : "${tone}"
- Nombre de chapitres estimé : "${length}"
- Langue : "${language}"

Pour éviter les délais de traitement (timeout), sois extrêmement concis dans les descriptions.
Réponds UNIQUEMENT en JSON valide, avec la structure suivante (sans markdown ni backticks) :
{
  "title": "${title}",
  "description": "Description de l'ebook en 1 phrase courte",
  "chapters": [
    {
      "order": 1,
      "title": "Titre du chapitre",
      "summary": "Résumé de ce chapitre en 1 phrase simple",
      "subchapters": [
        "Sous-chapitre 1.1",
        "Sous-chapitre 1.2"
      ],
      "imagePrompt": "Description simple et courte pour l'illustration (max 10 mots, sans texte)"
    }
  ],
  "coverImagePrompt": "Description simple et courte pour la couverture (max 10 mots, sans texte)"
}
Le nombre de chapitres doit correspondre à l'estimation demandée (${length}). JSON uniquement, rien d'autre.`
    }
  },
  generate_chapter: {
    v1: {
      system: "Tu es un rédacteur professionnel d'ebooks haut de gamme.",
      user: (title, summary, order, subchapters, theme, objective, audience, tone, language, additionalInstructions) => `
Tu es un rédacteur professionnel d'ebooks. Rédige le chapitre suivant d'un ebook :
 
Contexte général de l'ebook :
- Thème principal : "${theme}"
- Objectif : "${objective}"
- Public cible : "${audience}"
- Ton : "${tone}"
- Langue : "${language}"
 
Détails du chapitre à rédiger :
- Numéro du chapitre : ${order}
- Titre : "${title}"
- Résumé de ce que doit couvrir ce chapitre : "${summary}"
${subchapters && subchapters.length > 0 ? `- Sous-chapitres / sections à couvrir obligatoirement : \n${subchapters.map(s => `  * ${s}`).join('\n')}` : ''}
 
${additionalInstructions ? `Consignes de rédaction particulières fournies par l'utilisateur (à respecter obligatoirement) :
"${additionalInstructions}"` : ''}
 
Instructions de rédaction et mise en page premium :
1. Rédige un chapitre complet, extrêmement détaillé, riche et fluide, structuré selon les sous-chapitres spécifiés.
2. Utilise le format Markdown pour structurer le texte (titres de section H2/H3 avec ## et ###, listes, textes en gras). Ne mets pas de titre H1 (#) au début car il est déjà fourni par le système.
3. Rédige uniquement le contenu textuel du chapitre. N'ajoute pas de préambule ni de commentaires introductifs. Commence directement par la rédaction.
4. Rédige obligatoirement dans la langue demandée : "${language}".
5. **Mise en valeur visuelle d'édition premium** :
   - Mets les termes clés et mots-clés importants en **gras** pour dynamiser la lecture.
   - Utilise des tableaux Markdown si tu présentes des données comparatives (ex: critères, prix, avantages/inconvénients).
   - Utilise les blocs de mise en page personnalisés suivants lorsque le contexte s'y prête (au moins un par chapitre) :
     
     * Pour un **Point Clé** ou une conclusion forte :
       > [point-cle]
       > **TITRE DU POINT CLÉ EN MAJUSCULES**
       > Texte du point clé qui ressort de manière élégante...
       
     * Pour une **Erreur ou Avertissement** important :
       > [attention]
       > **TITRE DE L'ERREUR EN MAJUSCULES**
       > Explication du piège à éviter et comment le contourner...
       
     * Pour une **Grille de Cartes** (présentation de 3 statistiques ou 3 notions clés côte à côte) :
       > [cards]
       > * **Titre 1** | Description courte du premier élément
       > * **Titre 2** | Description courte du deuxième élément
       > * **Titre 3** | Description courte du troisième élément
       
     * Pour un **Processus linéaire** (flowchart) décrivant des étapes :
       > [flow]
       > Étape 1 | Description simple -> Étape 2 | Description simple -> Étape 3 | Description simple`
    }
  },
  marketing_sheet: {
    v1: {
      system: "Tu es un expert en marketing digital de produits d'information.",
      user: (title) => `Rédige une fiche produit marketing complète en JSON pour : ${title}.
Format : {"commercialName": "...", "promise": "...", "longDescription": {"introduction": "...", "problem": "...", "solution": "...", "whatTheyWillLearn": "...", "whyDifferent": "...", "conclusion": "..."}, "benefits": ["..."], "bonus": ["..."], "faq": [{"question": "...", "answer": "..."}], "cta": "...", "seo": {"metaTitle": "...", "metaDescription": "...", "keywords": ["..."]}}`
    }
  },
  marketing_tiktok: {
    v1: {
      system: "Tu es un expert en marketing digital de produits d'information.",
      user: (title) => `Génère 10 scripts viraux TikTok JSON pour : ${title}.
Format : [{"id": 1, "hook": "...", "body": "...", "cta": "...", "hashtags": "...", "duration": "25s"}]`
    }
  },
  marketing_whatsapp: {
    v1: {
      system: "Tu es un expert en marketing digital de produits d'information.",
      user: (title) => `Rédige 5 messages promotionnels WhatsApp JSON pour : ${title}.
Format : [{"approach": "...", "content": "..."}]`
    }
  },
  marketing_mockup: {
    v1: {
      user: (title) => `A premium social media advertising flyer with a 3D book mockup of the cover for "${title}". The book is laying on a stylish wooden table in a high-end cozy workspace. Professional advertising layout, elegant composition, photorealistic, 1080x1080 resolution.`
    }
  }
};

/**
 * Récupère le prompt système par identifiant et version
 * @param {string} id - Identifiant du prompt
 * @param {string} version - Version (défaut 'v1')
 */
function getPrompt(id, version = 'v1') {
  const promptGroup = prompts[id];
  if (!promptGroup || !promptGroup[version]) {
    throw new Error(`Prompt introuvable : ${id} (version ${version})`);
  }
  return promptGroup[version];
}

module.exports = {
  getPrompt
};
