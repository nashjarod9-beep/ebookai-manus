const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateImage } = require('../services/flux.service');
const { downloadImageToBuffer, uploadChapterImage } = require('../services/storage.service');

const getCallAI = async (prompt, isJson = false) => {
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
    res.json(asset || { bookId, productSheet: null, tiktokScripts: null, whatsappMsgs: null, mockupUrl1: null, mockupUrl2: null, mockupUrl3: null });
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
Tu es un copywriter d'élite spécialisé dans le marketing de produits digitaux.
Rédige une fiche produit marketing complète, persuasive et structurée en JSON pour l'ebook suivant :
- Titre : "${book.title}"
- Thème : "${book.subject}"
- Description : "${book.description || ''}"
- Chapitres : ${book.chapters.map(c => c.title).join(', ')}

La fiche produit doit répondre EXACTEMENT à ce format JSON valide (sans explications en dehors du JSON, sans markdown code block) :
{
  "commercialName": "Un nom commercial optimisé pour vendre l'ebook de manière percutante",
  "promise": "Une phrase d'accroche et de promesse forte qui capte l'attention immédiatement",
  "longDescription": {
    "introduction": "Introduction engageante de l'ebook...",
    "problem": "Le problème majeur auquel est confronté le lecteur cible...",
    "solution": "Comment cet ebook apporte la solution exacte...",
    "whatTheyWillLearn": "Détails de ce que le lecteur va apprendre de concret...",
    "whyDifferent": "Pourquoi cet ebook est différent des autres ressources...",
    "conclusion": "Conclusion motivante pour inciter à l'action..."
  },
  "benefits": [
    "Bénéfice 1 concret et chiffré si possible",
    "Bénéfice 2 concret et chiffré si possible",
    "Bénéfice 3 concret et chiffré si possible",
    "Bénéfice 4 concret et chiffré si possible"
  ],
  "bonus": [
    "Bonus 1 (ex: Checklist de démarrage rapide)",
    "Bonus 2 (ex: PDF complémentaire d'exercices)",
    "Bonus 3 (ex: Templates prêts à l'emploi)"
  ],
  "faq": [
    { "question": "Question fréquente 1", "answer": "Réponse rassurante 1" },
    { "question": "Question fréquente 2", "answer": "Réponse rassurante 2" },
    { "question": "Question fréquente 3", "answer": "Réponse rassurante 3" },
    { "question": "Question fréquente 4", "answer": "Réponse rassurante 4" },
    { "question": "Question fréquente 5", "answer": "Réponse rassurante 5" }
  ],
  "cta": "Un appel à l'action final extrêmement convaincant",
  "seo": {
    "metaTitle": "Titre SEO optimisé (max 60 caractères)",
    "metaDescription": "Description SEO convaincante (max 160 caractères)",
    "keywords": ["motcle1", "motcle2", "motcle3", "motcle4", "motcle5"]
  }
}`;

    const resultText = await getCallAI(prompt, true);
    const cleanContent = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();

    JSON.parse(cleanContent);

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { productSheet: cleanContent },
      create: { bookId, productSheet: cleanContent }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

const updateProductSheet = async (req, res, next) => {
  try {
    const { bookId, productSheet } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    JSON.parse(productSheet);

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { productSheet },
      create: { bookId, productSheet }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

const exportProductSheetPdf = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const asset = await prisma.marketingAsset.findUnique({ where: { bookId } });
    if (!asset || !asset.productSheet) {
      return res.status(404).json({ message: "Fiche produit introuvable. Veuillez la générer d'abord." });
    }

    const data = JSON.parse(asset.productSheet);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Fiche Produit : ${data.commercialName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      color: #2D3748;
      line-height: 1.6;
      font-size: 14px;
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      color: #1A202C;
      margin: 0 0 10px 0;
    }
    .promise {
      font-size: 16px;
      font-weight: 600;
      color: #2B6CB0;
      font-style: italic;
      margin: 0;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    h2 {
      font-size: 18px;
      color: #2D3748;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }
    .grid {
      display: flex;
      gap: 20px;
    }
    .col {
      flex: 1;
    }
    ul {
      margin: 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 6px;
    }
    .faq-item {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .faq-q {
      font-weight: 700;
      color: #2D3748;
    }
    .faq-a {
      color: #4A5568;
      margin-left: 10px;
    }
    .cta {
      background-color: #F7FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      font-weight: 700;
      color: #2B6CB0;
      font-size: 16px;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .seo-box {
      background-color: #EDF2F7;
      border-radius: 8px;
      padding: 15px;
      margin-top: 30px;
      font-size: 12px;
      page-break-inside: avoid;
    }
    .seo-title {
      font-weight: 700;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">${data.commercialName}</h1>
    <p class="promise">"${data.promise}"</p>
  </div>

  <div class="section">
    <h2>Description Commerciale</h2>
    <p><strong>Introduction :</strong> ${data.longDescription?.introduction}</p>
    <p><strong>Le Problème :</strong> ${data.longDescription?.problem}</p>
    <p><strong>La Solution :</strong> ${data.longDescription?.solution}</p>
    <p><strong>Ce que vous allez apprendre :</strong> ${data.longDescription?.whatTheyWillLearn}</p>
    <p><strong>Pourquoi cet ebook est unique :</strong> ${data.longDescription?.whyDifferent}</p>
    <p><strong>Conclusion :</strong> ${data.longDescription?.conclusion}</p>
  </div>

  <div class="grid section">
    <div class="col">
      <h2>Bénéfices Clés</h2>
      <ul>
        ${data.benefits?.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
    <div class="col">
      <h2>Bonus Inclus</h2>
      <ul>
        ${data.bonus?.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Questions Fréquentes (FAQ)</h2>
    ${data.faq?.map(f => `
      <div class="faq-item">
        <div class="faq-q">❓ Q : ${f.question}</div>
        <div class="faq-a">💡 R : ${f.answer}</div>
      </div>
    `).join('')}
  </div>

  <div class="cta">
    📢 ${data.cta}
  </div>

  <div class="seo-box">
    <div class="seo-title">SEO - Meta Title : ${data.seo?.metaTitle}</div>
    <div><strong>Meta Description :</strong> ${data.seo?.metaDescription}</div>
    <div style="margin-top: 4px;"><strong>Mots-clés :</strong> ${data.seo?.keywords?.join(', ')}</div>
  </div>
</body>
</html>
`;

    let browser;
    const isProd = process.env.VERCEL || process.env.NODE_ENV === 'production';

    if (isProd) {
      const playwrightCore = await import('playwright-core');
      const playwrightChromium = playwrightCore.chromium;
      const sparticuzChromiumModule = await import('@sparticuz/chromium');
      const chromium = sparticuzChromiumModule.default || sparticuzChromiumModule;
      
      browser = await playwrightChromium.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const { chromium: playwrightChromium } = require('playwright-core');
      browser = await playwrightChromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        channel: 'chrome'
      });
    }

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fiche_produit_${book.title.replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
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
- Un corps rapide (Développement) apportant un conseil ou une révélation.
- Un appel à l'action clair (CTA) pour télécharger l'ebook.
- Des hashtags pertinents.
- Une durée estimée.

Réponds obligatoirement au format JSON valide, sous la forme d'un tableau d'objets (sans explications, sans markdown code block) :
[
  { 
    "id": 1, 
    "hook": "Accroche choc...", 
    "body": "Développement rapide...", 
    "cta": "Clique sur le lien en bio...",
    "hashtags": "#viral #ebook #marketing",
    "duration": "25s"
  },
  ...
]`;

    const resultText = await getCallAI(prompt, true);
    const cleanContent = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();

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

Les messages doivent avoir un ton ultra naturel et correspondre EXACTEMENT aux 5 approches de vente suivantes :
1. Curiosité (suscite l'intérêt immédiat sans tout révéler).
2. Urgence (joue sur la rareté, le temps limité).
3. Storytelling (raconte une courte histoire de résolution de problème).
4. Preuve sociale (inclut des faux avis / de la validation).
5. Offre limitée (offre de réduction temporaire).

Utilise des emojis pour rendre la lecture fluide et aérée.
Réponds obligatoirement au format JSON valide, sous la forme d'un tableau d'objets (sans explications, sans markdown code block) :
[
  { "approach": "Curiosité", "content": "Message 1..." },
  { "approach": "Urgence", "content": "Message 2..." },
  { "approach": "Storytelling", "content": "Message 3..." },
  { "approach": "Preuve sociale", "content": "Message 4..." },
  { "approach": "Offre limitée", "content": "Message 5..." }
]`;

    const resultText = await getCallAI(prompt, true);
    const cleanContent = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();

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

const updateSocialMarketing = async (req, res, next) => {
  try {
    const { bookId, tiktokScripts, whatsappMsgs } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (tiktokScripts) JSON.parse(tiktokScripts);
    if (whatsappMsgs) JSON.parse(whatsappMsgs);

    const dataToUpdate = {};
    if (tiktokScripts) dataToUpdate.tiktokScripts = tiktokScripts;
    if (whatsappMsgs) dataToUpdate.whatsappMsgs = whatsappMsgs;

    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: dataToUpdate,
      create: { bookId, ...dataToUpdate }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

const generateMockupVariant = async (req, res, next) => {
  try {
    const { bookId, variantId } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const varId = parseInt(variantId);
    console.log(`Génération mockup variante ${varId} pour l'ebook ${bookId}...`);

    let prompt = '';
    if (varId === 1) {
      prompt = `A modern premium square 3D mockup of the book cover for "${book.title}" displayed elegantly on a real hardcover book sitting flat on a rustic wooden table, cozy workspace ambient background, 1080x1080 resolution, professional photography, natural lighting, no text on the background.`;
    } else if (varId === 2) {
      prompt = `A modern premium square 3D mockup of the book cover for "${book.title}" displayed on a book cover being held by a young professional's hand, blurred office interior background, 1080x1080 resolution, professional photography, natural lighting, no text on the background.`;
    } else {
      prompt = `A modern premium square 3D mockup of the book cover for "${book.title}" displayed on a book cover sitting next to a sleek modern laptop on a clean white desk, coffee cup in background, warm workspace vibes, 1080x1080 resolution, professional photography, sharp focus, no text on the background.`;
    }

    const fluxUrl = await generateImage(prompt, 1024, 1024);
    const imageBuffer = await downloadImageToBuffer(fluxUrl);
    const filename = `mockup_v${varId}_${bookId}_${Date.now()}.png`;
    const publicMockupUrl = await uploadChapterImage(imageBuffer, req.user.id, filename);

    const updateField = `mockupUrl${varId}`;
    const asset = await prisma.marketingAsset.upsert({
      where: { bookId },
      update: { [updateField]: publicMockupUrl },
      create: { bookId, [updateField]: publicMockupUrl }
    });

    res.json(asset);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketingAssets,
  generateProductSheet,
  updateProductSheet,
  exportProductSheetPdf,
  generateTikTokScripts,
  generateWhatsAppMessages,
  updateSocialMarketing,
  generateMockupVariant
};
