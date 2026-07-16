const { generateImage: generateIdeogramImage } = require('../services/ideogram.service');
const { generateImage: generateFluxImage } = require('../services/flux.service');
const deepseek = require('../services/deepseek.service');
const qwen = require('../services/qwen.service');

// Helper to call DeepSeek or Qwen with JSON response format
const callAIService = async (prompt) => {
  const messages = [
    { role: 'system', content: 'Tu es un concepteur d\'ebooks ultra-rapide. Tu dois obligatoirement répondre sous la forme d\'un objet JSON valide.' },
    { role: 'user', content: prompt }
  ];

  // Try DeepSeek first
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error('API Key missing');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content.replace(/```json/gi, '').replace(/```/g, '').trim());
    }
    throw new Error(`DeepSeek API status ${response.status}`);
  } catch (error) {
    console.warn("Playground generation: DeepSeek failed, falling back to Qwen...", error.message);
    
    // Fallback to Qwen
    const qwenApiKey = process.env.QWEN_API_KEY;
    if (!qwenApiKey) {
      throw new Error('Les deux moteurs d\'IA (DeepSeek & Qwen) sont indisponibles.');
    }

    const qwenResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qwenApiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!qwenResponse.ok) {
      const errorText = await qwenResponse.text();
      throw new Error(`Qwen API error: ${qwenResponse.status} - ${errorText}`);
    }

    const qwenData = await qwenResponse.json();
    return JSON.parse(qwenData.choices[0].message.content.replace(/```json/gi, '').replace(/```/g, '').trim());
  }
};

const generatePlaygroundEbook = async (req, res, next) => {
  try {
    const { theme } = req.body;
    if (!theme || !theme.trim()) {
      return res.status(400).json({ message: "Le thème de l'ebook est obligatoire." });
    }

    console.log(`[Playground] Génération demandée pour l'idée: "${theme}"`);

    // 1. Ask AI for Outline, Title, Cover Prompt and First Page Text
    const aiPrompt = `
Génère un exemple d'ebook simplifié basé sur le thème : "${theme}".
Tu dois renvoyer obligatoirement un objet JSON valide avec cette structure exacte (sans aucun blabla, sans markdown ni backticks de bloc de code) :
{
  "title": "Titre accrocheur et vendeur pour l'ebook",
  "coverImagePrompt": "Prompt d'image réaliste de couverture d'ebook en 1 phrase courte pour un outil d'image",
  "chapters": [
    { "order": 1, "title": "Chapitre 1 : Titre", "summary": "Court résumé du chapitre 1" },
    { "order": 2, "title": "Chapitre 2 : Titre", "summary": "Court résumé du chapitre 2" },
    { "order": 3, "title": "Chapitre 3 : Titre", "summary": "Court résumé du chapitre 3" }
  ],
  "firstPageText": "Le texte de la première page d'introduction ou du premier chapitre (environ 120-150 mots, motivant, fluide et instructif)."
}`;

    const parsedJson = await callAIService(aiPrompt);

    // 2. Generate Cover Image (Ideogram first for speed, fallback to FLUX)
    let coverUrl = '';
    try {
      console.log("[Playground] Appel Ideogram pour la couverture...");
      coverUrl = await generateIdeogramImage(parsedJson.coverImagePrompt || `${parsedJson.title}, premium ebook cover 3d design`);
    } catch (imageError) {
      console.warn("[Playground] Échec Ideogram, bascule sur FLUX...", imageError.message);
      try {
        coverUrl = await generateFluxImage(parsedJson.coverImagePrompt || `${parsedJson.title}, premium ebook cover 3d design`);
      } catch (fluxError) {
        console.error("[Playground] Échec FLUX également", fluxError.message);
        // Fallback to placeholder if all fail
        coverUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';
      }
    }

    // 3. Return everything to client
    res.json({
      title: parsedJson.title,
      coverUrl,
      chapters: parsedJson.chapters,
      firstPageText: parsedJson.firstPageText,
      theme
    });

  } catch (error) {
    console.error("Error generating playground ebook:", error);
    res.status(500).json({ 
      message: "Erreur lors de la génération de démonstration. Veuillez réessayer.",
      error: error.message 
    });
  }
};

module.exports = {
  generatePlaygroundEbook
};
