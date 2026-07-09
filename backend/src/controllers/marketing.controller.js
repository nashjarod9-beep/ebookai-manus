const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { suggestTitles } = require('../services/ai.service');
const { generateImage } = require('../services/flux.service');
const { downloadImageToBuffer, uploadChapterImage } = require('../services/storage.service');

// Import AI call service helpers
const deepseek = require('../services/deepseek.service');
const qwen = require('../services/qwen.service');

const getCallAI = async (prompt, isJson = false) => {
  // Use DeepSeek, fallback to Qwen
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const payload = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Tu es un expert en marketing digital de produits d\'information.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    };
    if (isJson) payload.response_format = { type: 'json_object' };

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("DeepSeek error");
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek marketing fallback to Qwen...", error.message);
    const qwenApiKey = process.env.QWEN_API_KEY;
    const payload = {
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: 'Tu es un expert en marketing digital de produits d\'information.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    };
    if (isJson) payload.response_format = { type: 'json_object' };

    const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qwenApiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Qwen error");
    const data = await res.json();
    return data.choices[0].message.content;
  }
};

const getMarketingAssets = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const asset = await prisma.marketingAsset.findUnique({ where: { bookId } });
    res.json(asset || { bookId, productSheet: null, tiktokScripts: null, whatsappMsgs: null, mockupUrl: null });
  } catch (error) {
    next(error);
  }
};

const generateProductSheet = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId }, include: { chapters: true } });
    
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const prompt = `
Rédige une fiche produit marketing complète et persuasive pour vendre l'ebook suivant :
- Titre : "${book.title}"
- Thème : "${book.subject}"
- Description : "${book.description || ''}"
- Chapitres : ${book.chapters.map(c => c.title).join(', ')}

La fiche produit doit être structurée en Markdown propre et comprendre :
1. Une introduction accrocheuse (la promesse forte).
2. Ce que le lecteur va apprendre (les bénéfices clés sous forme de liste à puces).
3. À qui s'adresse cet ebook (le public cible idéal).
4. Pourquoi acheter cet ebook maintenant (appel à l'action / urgence).

Ne mets pas d'introduction ou de texte de salutation, commence directement par le texte marketing.`;

    const resultText = await getCallAI(prompt);

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { productSheet: resultText },
      create: { bookId, productSheet: resultText }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

const generateTikTokScripts = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const prompt = `
Génère 10 scripts courts et viraux de 15 à 30 secondes pour faire la promotion de l'ebook suivant sur TikTok / Instagram Reels :
- Titre : "${book.title}"
- Thème principal : "${book.subject}"

Chaque script doit être structuré de manière rigoureuse avec :
- Une accroche ultra-engageante (Hook) pour retenir l'attention dans les 3 premières secondes.
- Un corps rapide (Body) apportant un conseil ou une révélation.
- Un appel à l'action clair (CTA) pour télécharger l'ebook.

Réponds obligatoirement au format JSON valide, sous la forme d'un tableau d'objets (sans explications, sans markdown code block) :
[
  { "id": 1, "hook": "Accroche choc...", "body": "Contenu rapide...", "cta": "Clique sur le lien en bio..." },
  ...
]`;

    const resultText = await getCallAI(prompt, true);
    const cleanContent = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Verify it is parseable JSON
    JSON.parse(cleanContent);

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { tiktokScripts: cleanContent },
      create: { bookId, tiktokScripts: cleanContent }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

const generateWhatsAppMessages = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const prompt = `
Rédige 5 messages promotionnels WhatsApp différents pour promouvoir et vendre l'ebook suivant auprès de groupes et contacts privés :
- Titre : "${book.title}"
- Thème : "${book.subject}"

Les messages doivent avoir des styles variés :
1. Direct et factuel (bénéfice immédiat).
2. Storytelling (résolution d'un problème commun).
3. Liste à puces (les bénéfices clés).
4. Offre limitée / Urgence (FOMO).
5. Amical et informel.

Utilise des emojis pour rendre la lecture fluide et aérée.
Réponds obligatoirement au format JSON valide, sous la forme d'un tableau de 5 chaînes de caractères (sans explications, sans markdown code block) :
[
  "Message 1...",
  "Message 2...",
  "Message 3...",
  "Message 4...",
  "Message 5..."
]`;

    const resultText = await getCallAI(prompt, true);
    const cleanContent = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Verify it is parseable JSON
    JSON.parse(cleanContent);

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { whatsappMsgs: cleanContent },
      create: { bookId, whatsappMsgs: cleanContent }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

const generateMockup = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    console.log(`Génération du mockup publicitaire FLUX pour l'ebook ${bookId}...`);

    // Dynamic mockup image prompt
    const prompt = `A modern square 3D mockup of the ebook cover for "${book.title}" displayed elegantly on a sleek smartphone screen, clean minimalist workspace background with warm wooden accents, bright professional lighting, 1080x1080 aspect ratio advertising visual, high definition, no text on the background.`;

    const fluxUrl = await generateImage(prompt, 1024, 1024);
    const imageBuffer = await downloadImageToBuffer(fluxUrl);
    const filename = `mockup_${bookId}_${Date.now()}.png`;
    const publicMockupUrl = await uploadChapterImage(imageBuffer, req.user.id, filename);

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { mockupUrl: publicMockupUrl },
      create: { bookId, mockupUrl: publicMockupUrl }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketingAssets,
  generateProductSheet,
  generateTikTokScripts,
  generateWhatsAppMessages,
  generateMockup
};
