const callQwen = async (messages, responseFormat = null) => {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API Qwen est manquante dans les variables d\'environnement.');
  }

  const payload = {
    model: 'qwen-plus',
    messages: messages,
    temperature: 0.7,
  };

  // Qwen DashScope compatible endpoint supports JSON response_format
  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Qwen API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Qwen API Request Error:", error);
    throw error;
  }
};

const generateOutline = async (ebookData) => {
  const { title, theme, objective, audience, tone, length, language } = ebookData;

  const prompt = `
Tu es un agent expert en conception et rédaction d'ebooks professionnels.
Génère une structure détaillée pour un e-book basé sur les critères suivants :
- Thème : "${theme}"
- Titre provisoire : "${title || theme}"
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

  const content = await callQwen([
    { role: 'system', content: 'Tu es un architecte d\'ebooks.' },
    { role: 'user', content: prompt }
  ], { type: 'json_object' });

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing de la structure Qwen:", content);
    throw new Error("Le format renvoyé par Qwen n'est pas un JSON valide.");
  }
};

const generateChapter = async (chapterData, bookContext) => {
  const { title, summary, order } = chapterData;
  const { theme, objective, audience, tone, language } = bookContext;

  const prompt = `
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

Instructions de rédaction :
1. Rédige un chapitre complet, extrêmement détaillé, riche et fluide, adapté au public cible.
2. Utilise le format Markdown pour structurer le texte (titres de section H2/H3 avec ## et ###, listes, textes en gras, citations). Ne mets pas de titre H1 (#) au début car il est déjà fourni par le système.
3. Rédige uniquement le contenu textuel du chapitre. N'ajoute pas de préambule ni de commentaires introductifs (ex: "Voici votre chapitre :"). Commence directement par la rédaction.
4. Rédige obligatoirement dans la langue demandée : "${language}".`;

  const content = await callQwen([
    { role: 'system', content: 'Tu es un rédacteur professionnel d\'ebooks haut de gamme.' },
    { role: 'user', content: prompt }
  ]);

  return content.trim();
};

module.exports = {
  generateOutline,
  generateChapter
};
