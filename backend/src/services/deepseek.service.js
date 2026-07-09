const callDeepSeek = async (messages, responseFormat = null) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API DeepSeek est manquante dans les variables d\'environnement.');
  }

  const payload = {
    model: 'deepseek-chat',
    messages: messages,
    temperature: 0.7,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur DeepSeek API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API Request Error:", error);
    throw error;
  }
};

const suggestTitles = async (ebookData) => {
  const { theme, objective, audience, tone, language } = ebookData;

  const prompt = `
Tu es un expert en marketing d'édition d'ebooks.
Génère 5 propositions de titres accrocheurs, percutants, professionnels et vendeurs pour un ebook basé sur les critères suivants :
- Thème principal : "${theme}"
- Objectif de l'ebook : "${objective}"
- Public cible : "${audience}"
- Ton d'écriture : "${tone}"
- Langue : "${language}"

Réponds UNIQUEMENT sous la forme d'un tableau JSON valide de 5 chaînes de caractères (sans bloc de code Markdown, sans backticks, sans explications) :
[
  "Titre proposé 1",
  "Titre proposé 2",
  "Titre proposé 3",
  "Titre proposé 4",
  "Titre proposé 5"
]`;

  const content = await callDeepSeek([
    { role: 'system', content: 'Tu es un concepteur de titres de livres à succès.' },
    { role: 'user', content: prompt }
  ], { type: 'json_object' });

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing des titres suggérés par DeepSeek:", content);
    throw new Error("Le format de titres renvoyé par DeepSeek n'est pas un JSON valide.");
  }
};

const generateOutline = async (ebookData) => {
  const { title, theme, objective, audience, tone, length, language } = ebookData;

  const prompt = `
Tu es un agent expert en conception et rédaction d'ebooks professionnels.
Génère une structure détaillée pour un e-book basé sur les critères suivants :
- Titre validé de l'ebook : "${title}"
- Thème général : "${theme}"
- Objectif de l'ebook : "${objective}"
- Public cible : "${audience}"
- Ton : "${tone}"
- Nombre de chapitres estimé : "${length}"
- Langue : "${language}"

Réponds UNIQUEMENT en JSON valide, avec la structure suivante (sans markdown markdown ni backticks autour du JSON) :
{
  "title": "${title}",
  "description": "description captivante de l'ebook en 2 phrases",
  "chapters": [
    {
      "order": 1,
      "title": "Titre exact du chapitre",
      "summary": "Résumé détaillé du contenu de ce chapitre",
      "subchapters": [
        "Sous-chapitre 1.1",
        "Sous-chapitre 1.2",
        "Sous-chapitre 1.3"
      ],
      "imagePrompt": "Description artistique extrêmement détaillée d'une illustration moderne (ex: style vectoriel 3D épuré ou photo conceptuelle, couleurs vives, fond propre et simple, pas de texte, haute définition) pour ce chapitre"
    }
  ],
  "coverImagePrompt": "Description artistique extrêmement détaillée d'une couverture de livre professionnel (ex: style graphique abstrait, minimaliste ou scène conceptuelle moderne, couleurs riches et harmonieuses, aucun texte ni écriture, haute résolution) à générer avec l'IA FLUX"
}
Le nombre de chapitres doit correspondre à l'estimation demandée (${length}). JSON uniquement, rien d'autre.`;

  const content = await callDeepSeek([
    { role: 'system', content: 'Tu es un architecte d\'ebooks.' },
    { role: 'user', content: prompt }
  ], { type: 'json_object' });

  try {
    const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Erreur de parsing de la structure DeepSeek:", content);
    throw new Error("Le format renvoyé par DeepSeek n'est pas un JSON valide.");
  }
};

const generateChapter = async (chapterData, bookContext) => {
  const { title, summary, order, subchapters } = chapterData;
  const { theme, objective, audience, tone, language, additionalInstructions } = bookContext;

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
${subchapters && subchapters.length > 0 ? `- Sous-chapitres / sections à couvrir obligatoirement : \n${subchapters.map(s => `  * ${s}`).join('\n')}` : ''}

${additionalInstructions ? `Consignes de rédaction particulières fournies par l'utilisateur (à respecter obligatoirement) :
"${additionalInstructions}"` : ''}

Instructions de rédaction :
1. Rédige un chapitre complet, extrêmement détaillé, riche et fluide, structuré selon les sous-chapitres spécifiés.
2. Utilise le format Markdown pour structurer le texte (titres de section H2/H3 avec ## et ###, listes, textes en gras, citations). Ne mets pas de titre H1 (#) au début car il est déjà fourni par le système.
3. Rédige uniquement le contenu textuel du chapitre. N'ajoute pas de préambule ni de commentaires introductifs (ex: "Voici votre chapitre :"). Commence directement par la rédaction.
4. Rédige obligatoirement dans la langue demandée : "${language}".`;

  const content = await callDeepSeek([
    { role: 'system', content: 'Tu es un rédacteur professionnel d\'ebooks haut de gamme.' },
    { role: 'user', content: prompt }
  ]);

  return content.trim();
};

module.exports = {
  suggestTitles,
  generateOutline,
  generateChapter
};
