const callManusCreate = async (prompt) => {
  const apiKey = process.env.MANUS_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API Manus AI est manquante dans les variables d\'environnement.');
  }

  try {
    const response = await fetch('https://api.manus.ai/v2/task.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-manus-api-key': apiKey
      },
      body: JSON.stringify({
        message: {
          content: prompt
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Manus API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error?.message || 'Erreur lors de la création de la tâche Manus.');
    }

    return data.task_id;
  } catch (error) {
    console.error("Manus AI Task Creation Error:", error);
    throw new Error('Erreur lors de l\'initialisation de la génération avec Manus AI.');
  }
};

const createOutlineTask = async (ebookData) => {
  const { title, theme, objective, audience, tone, length, language } = ebookData;

  const prompt = `
Tu es un agent expert en conception et rédaction d'ebooks professionnels.
Génère une structure détaillée pour un ebook basé sur les critères suivants :
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

  return await callManusCreate(prompt);
};

const createFullEbookTask = async (outline, ebookData) => {
  const { theme, objective, audience, tone, language } = ebookData;

  const prompt = `
Tu es un agent IA avancé (Manus AI) capable de rédiger du contenu, générer des images et formater un document de manière autonome.
Ton objectif final est de générer l'ebook complet décrit ci-dessous, d'y inclure les illustrations générées par tes soins, et de fournir un lien vers le document PDF final.

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

  return await callManusCreate(prompt);
};

const getTaskStatusAndResult = async (taskId) => {
  const apiKey = process.env.MANUS_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API Manus AI est manquante.');
  }

  try {
    const response = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}`, {
      method: 'GET',
      headers: {
        'x-manus-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur récupération tâche: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error?.message || 'Erreur de lecture de tâche.');
    }

    const messages = data.messages || [];

    // Check if task is stopped
    const stoppedMsg = messages.find(m => m.type === 'status_update' && m.status_update?.agent_status === 'stopped');

    if (stoppedMsg) {
      // Find the assistant message content
      const assistantMsg = messages.find(m => m.type === 'assistant_message');
      if (assistantMsg && assistantMsg.assistant_message?.content) {
        const content = assistantMsg.assistant_message.content;
        try {
          const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          const jsonResult = JSON.parse(cleanContent);
          return { status: 'completed', result: jsonResult };
        } catch (err) {
          console.error("JSON parsing error on assistant message:", content);
          return { status: 'failed', error: "Le format renvoyé par l'IA n'est pas un JSON valide." };
        }
      }
      return { status: 'failed', error: "Aucun contenu généré n'a été trouvé." };
    }

    return { status: 'generating' };
  } catch (error) {
    console.error("Error getting task status:", error);
    return { status: 'failed', error: error.message };
  }
};

module.exports = {
  createOutlineTask,
  createFullEbookTask,
  getTaskStatusAndResult
};
