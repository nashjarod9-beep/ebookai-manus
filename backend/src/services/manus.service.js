const MANUS_API_URL = 'https://api.manus.ai/v1/chat/completions'; // Utilisation de l'endpoint compatible OpenAI v1 pour Manus AI

const callManusAI = async (messages, responseFormat = null) => {
  const apiKey = process.env.MANUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('La clé API Manus AI est manquante dans les variables d\'environnement.');
  }

  const payload = {
    model: 'manus', // Nom du modèle par défaut
    messages: messages,
    temperature: 0.7,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await fetch(MANUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Manus API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Manus AI Request Error:", error);
    throw new Error('Erreur lors de la communication avec Manus AI.');
  }
};

const generateOutline = async (ebookData) => {
  const { title, theme, objective, audience, tone, length, language } = ebookData;

  const prompt = `
Tu es un agent expert en conception et rédaction d'ebooks professionnels.
Génère une structure détaillée pour un ebook basé sur les critères suivants :
- Thème : "${theme}"
- Titre provisoire : "${title}"
- Objectif de l'ebook : "${objective}"
- Public cible : "${audience}"
- Ton : "${tone}"
- Longueur souhaitée : "${length}"
- Langue : "${language}"

Réponds UNIQUEMENT en JSON valide, avec la structure suivante (sans markdown markdown ni backticks autour du JSON) :
{
  "title": "titre optimisé accrocheur basé sur le thème",
  "description": "description engageante en 2 phrases",
  "chapters": [
    {
      "order": 1,
      "title": "Titre du chapitre",
      "summary": "Résumé détaillé de ce qui sera couvert",
      "imagePrompt": "Description détaillée de l'illustration pour ce chapitre"
    }
  ],
  "coverImagePrompt": "Description détaillée pour la génération de la couverture"
}
Le nombre de chapitres doit être adapté à la longueur souhaitée (${length}). JSON uniquement, rien d'autre.`;

  const content = await callManusAI([
    { role: 'system', content: 'Tu es un architecte d\'ebooks.' },
    { role: 'user', content: prompt }
  ]);

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing de la structure Manus:", content);
    throw new Error("Le format renvoyé par Manus AI n'est pas un JSON valide.");
  }
};

const generateFullEbook = async (outline, ebookData) => {
  const { theme, objective, audience, tone, length, language } = ebookData;

  const prompt = `
Tu es un agent IA avancé (Manus AI) capable de rédiger du contenu, générer des images et formater un document de manière autonome.
Ton objectif final est de générer l'ebook complet décrit ci-dessous, d'y inclure les illustrations générées par tes soins, et idéalement de fournir un lien vers le document PDF final si tu en as la capacité.

Contexte de l'ebook :
- Titre : "${outline.title}"
- Thème : "${theme}"
- Objectif : "${objective}"
- Public cible : "${audience}"
- Ton : "${tone}"
- Langue : "${language}"

Structure validée :
${JSON.stringify(outline.chapters, null, 2)}

Instructions strictes :
1. Rédige l'intégralité du contenu pour chaque chapitre avec un niveau de détail professionnel.
2. Utilise le format Markdown pour structurer le texte (titres, listes, gras).
3. Génère les images pour la couverture et pour chaque chapitre, et inclus les URL de ces images dans ta réponse.
4. Si tu peux générer un PDF, inclus son URL de téléchargement.

Réponds UNIQUEMENT avec un objet JSON valide correspondant à cette structure :
{
  "coverUrl": "url_de_la_couverture_générée_par_tes_soins",
  "pdfUrl": "url_du_pdf_généré_par_tes_soins_ou_null_si_impossible",
  "chapters": [
    {
      "title": "Titre du chapitre",
      "content": "Contenu complet rédigé en Markdown...",
      "imageUrl": "url_de_l_illustration_du_chapitre_générée_par_tes_soins"
    }
  ]
}
JSON uniquement, sans aucun texte autour.`;

  const content = await callManusAI([
    { role: 'system', content: 'Tu es un générateur autonome d\'ebooks complets (Texte + Images + PDF).' },
    { role: 'user', content: prompt }
  ]);

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing du contenu final Manus:", content);
    throw new Error("Le format final renvoyé par Manus AI n'est pas un JSON valide.");
  }
};

module.exports = {
  generateOutline,
  generateFullEbook
};
