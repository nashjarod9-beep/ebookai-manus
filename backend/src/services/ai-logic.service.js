const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { generateChapterContent } = require('./ai.service');
const { generateImage: generateImageFlux } = require('./flux.service');
const { generateImage: generateImageIdeogram } = require('./ideogram.service');
const { downloadImageToBuffer, uploadCoverImage, uploadChapterImage } = require('./storage.service');
const { generatePDF } = require('./pdf.service');
const { generateZip } = require('./zip.service');
const { getPrompt } = require('./prompts/system-prompts.service');

// Estimation simple des jetons/crédits et calcul du coût en FCFA
const logAiUsage = async ({ userId, bookId, provider, model, inputLength = 0, outputLength = 0, durationMs, success }) => {
  const totalTokens = Math.ceil((inputLength + outputLength) / 3.5);
  
  let costEstimateFcfa = 0.0;
  let tokensOrCredits = totalTokens;

  if (provider === 'deepseek') {
    costEstimateFcfa = totalTokens * 0.00012; // ~0.08 FCFA par 1k tokens
  } else if (provider === 'qwen') {
    costEstimateFcfa = totalTokens * 0.0024;  // ~2.4 FCFA par 1k tokens
  } else if (provider === 'flux') {
    costEstimateFcfa = 50.0; // 50 FCFA par image FLUX
    tokensOrCredits = 5;
  } else if (provider === 'ideogram') {
    costEstimateFcfa = 80.0; // 80 FCFA par image Ideogram
    tokensOrCredits = 8;
  }

  try {
    await prisma.aiUsageLog.create({
      data: {
        userId,
        bookId,
        provider,
        model,
        tokensOrCredits,
        costEstimateFcfa,
        durationMs,
        success
      }
    });
  } catch (err) {
    console.error("[AiUsageLog Error] Failed to log AI usage:", err.message);
  }
};

/**
 * Appel générique de chat pour le marketing (avec bascule automatique)
 */
const getMarketingAIResponse = async (prompt, isJson = false) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const systemPrompt = getPrompt('marketing_sheet', 'v1').system;
  
  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  };
  if (isJson) payload.response_format = { type: 'json_object' };

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("DeepSeek marketing failed");
    const data = await res.json();
    return { content: data.choices[0].message.content, provider: 'deepseek', model: 'deepseek-chat' };
  } catch (error) {
    console.warn("DeepSeek marketing fallback to Qwen plus...");
    const qwenApiKey = process.env.QWEN_API_KEY;
    const qwenPayload = {
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    };
    if (isJson) qwenPayload.response_format = { type: 'json_object' };

    const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${qwenApiKey}`
      },
      body: JSON.stringify(qwenPayload)
    });
    if (!res.ok) throw new Error("Qwen marketing failed");
    const data = await res.json();
    return { content: data.choices[0].message.content, provider: 'qwen', model: 'qwen-plus' };
  }
};

const executeCoverGeneration = async (bookId, userId, coverImagePrompt, workerId = null) => {
  const startTime = Date.now();
  let success = false;
  try {
    console.log(`[Worker - Cover] Generating cover for book ${bookId}...`);
    const fluxUrl = await generateImageFlux(coverImagePrompt, 768, 1024);
    const imageBuffer = await downloadImageToBuffer(fluxUrl);
    const filename = `cover_${bookId}_${Date.now()}.png`;
    
    const publicCoverUrl = await uploadCoverImage(imageBuffer, userId, filename, workerId);

    await prisma.book.update({
      where: { id: bookId },
      data: { coverUrl: publicCoverUrl }
    });

    success = true;
    await logAiUsage({
      userId,
      bookId,
      provider: 'flux',
      model: 'flux-dev',
      durationMs: Date.now() - startTime,
      success
    });

    return publicCoverUrl;
  } catch (error) {
    await logAiUsage({
      userId,
      bookId,
      provider: 'flux',
      model: 'flux-dev',
      durationMs: Date.now() - startTime,
      success: false
    });
    throw error;
  }
};

const executeChapterTextGeneration = async (bookId, userId, chapterData, bookContext, workerId = null) => {
  const startTime = Date.now();
  const { order, title, summary, subchapters } = chapterData;
  let success = false;

  try {
    console.log(`[Worker - Chapter Text] Generating chapter ${order} : "${title}"...`);
    const { content, modelUsed } = await generateChapterContent({ order, title, summary, subchapters }, bookContext);
    
    // Upsert chapter
    const existingChapter = await prisma.chapter.findFirst({
      where: { bookId, order: parseInt(order) }
    });

    let savedChapter;
    if (existingChapter) {
      savedChapter = await prisma.chapter.update({
        where: { id: existingChapter.id },
        data: {
          title,
          content,
          modelUsed
        }
      });
    } else {
      savedChapter = await prisma.chapter.create({
        data: {
          bookId,
          title,
          content,
          order: parseInt(order),
          modelUsed
        }
      });
    }

    success = true;
    await logAiUsage({
      userId,
      bookId,
      provider: modelUsed.includes('deepseek') ? 'deepseek' : 'qwen',
      model: modelUsed,
      inputLength: (bookContext.theme + bookContext.objective + summary).length,
      outputLength: content.length,
      durationMs: Date.now() - startTime,
      success
    });

    return savedChapter;
  } catch (error) {
    await logAiUsage({
      userId,
      bookId,
      provider: 'deepseek',
      model: 'deepseek-chat',
      durationMs: Date.now() - startTime,
      success: false
    });
    throw error;
  }
};

const executeChapterImageGeneration = async (bookId, userId, order, imagePrompt, workerId = null) => {
  const startTime = Date.now();
  let success = false;
  if (!imagePrompt) return null;

  try {
    console.log(`[Worker - Chapter Image] Generating image for chapter ${order}...`);
    const fluxUrl = await generateImageFlux(imagePrompt, 1024, 768);
    const imageBuffer = await downloadImageToBuffer(fluxUrl);
    const filename = `chapter_${bookId}_${order}_${Date.now()}.png`;

    const publicImageUrl = await uploadChapterImage(imageBuffer, userId, filename, workerId);

    const chapter = await prisma.chapter.findFirst({
      where: { bookId, order: parseInt(order) }
    });

    if (chapter) {
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { imageUrl: publicImageUrl }
      });
    }

    success = true;
    await logAiUsage({
      userId,
      bookId,
      provider: 'flux',
      model: 'flux-dev',
      durationMs: Date.now() - startTime,
      success
    });

    return publicImageUrl;
  } catch (error) {
    console.error(`[Worker - Chapter Image Error] Failed to generate image for chapter ${order}:`, error.message);
    await logAiUsage({
      userId,
      bookId,
      provider: 'flux',
      model: 'flux-dev',
      durationMs: Date.now() - startTime,
      success: false
    });
    return null; // Don't crash the whole generation if image fails
  }
};

const executePdfCompilation = async (bookId, userId, workerId = null) => {
  console.log(`[Worker - PDF] Compiling PDF for book ${bookId}...`);
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { chapters: { orderBy: { order: 'asc' } } }
  });

  if (!book) throw new Error("Livre introuvable pour compilation");

  const pdfPath = await generatePDF(book, book.chapters, userId, workerId);

  await prisma.book.update({
    where: { id: bookId },
    data: { pdfPath }
  });

  return pdfPath;
};

const executeMarketingGeneration = async (bookId, userId, workerId = null) => {
  console.log(`[Worker - Marketing] Generating marketing assets for book ${bookId}...`);
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { chapters: true }
  });

  if (!book) throw new Error("Livre introuvable pour marketing");

  // 1. Product Sheet
  const sheetPrompt = getPrompt('marketing_sheet', 'v1').user(book.title);
  
  const startSheet = Date.now();
  const sheetRes = await getMarketingAIResponse(sheetPrompt, true);
  const cleanSheet = sheetRes.content.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  await logAiUsage({
    userId,
    bookId,
    provider: sheetRes.provider,
    model: sheetRes.model,
    inputLength: sheetPrompt.length,
    outputLength: cleanSheet.length,
    durationMs: Date.now() - startSheet,
    success: true
  });

  // 2. TikTok Scripts
  const tiktokPrompt = getPrompt('marketing_tiktok', 'v1').user(book.title);
  
  const startTiktok = Date.now();
  const tiktokRes = await getMarketingAIResponse(tiktokPrompt, true);
  const cleanTiktok = tiktokRes.content.replace(/```json/gi, '').replace(/```/g, '').trim();

  await logAiUsage({
    userId,
    bookId,
    provider: tiktokRes.provider,
    model: tiktokRes.model,
    inputLength: tiktokPrompt.length,
    outputLength: cleanTiktok.length,
    durationMs: Date.now() - startTiktok,
    success: true
  });

  // 3. WhatsApp Messages
  const whatsappPrompt = getPrompt('marketing_whatsapp', 'v1').user(book.title);

  const startWhatsapp = Date.now();
  const whatsappRes = await getMarketingAIResponse(whatsappPrompt, true);
  const cleanWhatsapp = whatsappRes.content.replace(/```json/gi, '').replace(/```/g, '').trim();

  await logAiUsage({
    userId,
    bookId,
    provider: whatsappRes.provider,
    model: whatsappRes.model,
    inputLength: whatsappPrompt.length,
    outputLength: cleanWhatsapp.length,
    durationMs: Date.now() - startWhatsapp,
    success: true
  });

  // 4. Mockup (Variant 1)
  const mockupPrompt = getPrompt('marketing_mockup', 'v1').user(book.title);
  const startMockup = Date.now();
  let mockupUrl = null;
  let mockupProvider = 'ideogram';

  try {
    mockupUrl = await generateImageIdeogram(mockupPrompt, 'ASPECT_1_1');
  } catch (ideogramError) {
    console.warn("Ideogram failed, fallback to FLUX...");
    mockupUrl = await generateImageFlux(mockupPrompt, 1024, 1024);
    mockupProvider = 'flux';
  }

  const imageBuffer = await downloadImageToBuffer(mockupUrl);
  const filename = `mockup_v1_${bookId}_${Date.now()}.png`;
  const publicMockupUrl = await uploadChapterImage(imageBuffer, userId, filename, workerId);

  await logAiUsage({
    userId,
    bookId,
    provider: mockupProvider,
    model: mockupProvider === 'ideogram' ? 'ideogram-turbo' : 'flux-dev',
    durationMs: Date.now() - startMockup,
    success: true
  });

  // Save all assets
  const asset = await prisma.marketingAsset.upsert({
    where: { bookId },
    update: {
      productSheet: cleanSheet,
      tiktokScripts: cleanTiktok,
      whatsappMsgs: cleanWhatsapp,
      mockupUrl1: publicMockupUrl
    },
    create: {
      bookId,
      productSheet: cleanSheet,
      tiktokScripts: cleanTiktok,
      whatsappMsgs: cleanWhatsapp,
      mockupUrl1: publicMockupUrl
    }
  });

  return asset;
};

module.exports = {
  executeCoverGeneration,
  executeChapterTextGeneration,
  executeChapterImageGeneration,
  executePdfCompilation,
  executeMarketingGeneration
};
