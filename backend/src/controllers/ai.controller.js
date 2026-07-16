const { suggestTitles, generateBookOutline, generateChapterContent } = require('../services/ai.service');
const { generateImage } = require('../services/flux.service');
const { downloadImageToBuffer, uploadCoverImage, uploadChapterImage } = require('../services/storage.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const suggestBookTitles = async (req, res, next) => {
  try {
    const ebookData = req.body;
    // ebookData includes: theme, objective, audience, tone, length, language
    const { titles, modelUsed } = await suggestTitles(ebookData);
    res.json({ titles, modelUsed });
  } catch (error) {
    next(error);
  }
};

const generateOutline = async (req, res, next) => {
  try {
    const ebookData = req.body;
    // ebookData includes: title, theme, objective, audience, tone, length, language
    const { outline, modelUsed } = await generateBookOutline(ebookData);
    
    res.json({
      ...outline,
      modelUsed
    });
  } catch (error) {
    next(error);
  }
};

const generateCover = async (req, res, next) => {
  try {
    const { bookId, coverImagePrompt } = req.body;

    if (!bookId || !coverImagePrompt) {
      return res.status(400).json({ message: 'bookId et coverImagePrompt sont requis.' });
    }

    // Check ownership
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { updateProgress } = require('../services/progress.service');
    updateProgress(bookId, 'cover', 'Génération de la couverture avec l\'IA FLUX...');
    
    // Generate image via FLUX (cover aspect ratio 3:4)
    const fluxUrl = await generateImage(coverImagePrompt, 768, 1024);
    
    updateProgress(bookId, 'cover_download', 'Téléchargement et optimisation de la couverture...');
    // Download image from FLUX temporary URL and upload to Supabase Storage
    const imageBuffer = await downloadImageToBuffer(fluxUrl);
    const filename = `cover_${bookId}_${Date.now()}.png`;
    const publicCoverUrl = await uploadCoverImage(imageBuffer, req.user.id, filename);

    // Save cover URL and model used in Book
    await prisma.book.update({
      where: { id: bookId },
      data: { coverUrl: publicCoverUrl }
    });

    updateProgress(bookId, 'cover_done', '✓ Couverture générée', { coverUrl: publicCoverUrl });

    res.json({ coverUrl: publicCoverUrl });
  } catch (error) {
    next(error);
  }
};

const generateChapter = async (req, res, next) => {
  try {
    const { bookId, chapterData, ebookData } = req.body;
    
    if (!bookId || !chapterData || !ebookData) {
      return res.status(400).json({ message: 'bookId, chapterData et ebookData sont requis.' });
    }

    const { order, title, summary, imagePrompt, subchapters } = chapterData;
    const { plan, email } = req.user;

    if (plan === 'free' && parseInt(order) > 1 && email !== 'nashjarod9@gmail.com') {
      return res.status(403).json({
        message: "L'offre gratuite ne permet de générer que le premier chapitre de l'ebook. Veuillez passer à une offre payante pour générer la suite."
      });
    }

    // Check ownership
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // RESILIENCE / REPRISE SUR ERREUR : Check if this chapter is already generated
    const existingChapter = await prisma.chapter.findFirst({
      where: { bookId, order: parseInt(order) }
    });

    if (existingChapter && existingChapter.content && existingChapter.content.length > 200) {
      console.log(`[Reprise sur erreur] Le chapitre ${order} existe déjà. Renvoi des données locales.`);
      return res.json(existingChapter);
    }

    // Combine global additionalInstructions from the Book draft if they are not passed
    const bookContext = {
      ...ebookData,
      additionalInstructions: ebookData.additionalInstructions || book.additionalInstructions
    };

    const { updateProgress } = require('../services/progress.service');
    updateProgress(bookId, 'chapter_writing', `Rédaction du chapitre ${order} : "${title}"...`, { order: parseInt(order), title });

    console.log(`Génération du contenu textuel pour le chapitre ${order} : "${title}"...`);
    // 1. Generate text via DeepSeek (or Qwen fallback)
    const { content, modelUsed } = await generateChapterContent({ order, title, summary, subchapters }, bookContext);

    updateProgress(bookId, 'chapter_illustration', `Génération de l'illustration pour le chapitre ${order}...`, { order: parseInt(order), title });
    console.log(`Génération de l'illustration pour le chapitre ${order} : "${imagePrompt.substring(0, 40)}..."`);
    // 2. Generate chapter illustration via FLUX (aspect ratio 4:3)
    let publicImageUrl = null;
    if (imagePrompt) {
      try {
        const fluxUrl = await generateImage(imagePrompt, 1024, 768);
        const imageBuffer = await downloadImageToBuffer(fluxUrl);
        const filename = `chapter_${bookId}_${order}_${Date.now()}.png`;
        publicImageUrl = await uploadChapterImage(imageBuffer, req.user.id, filename);
      } catch (imgError) {
        console.error(`Erreur de génération d'image pour le chapitre ${order}, continuation sans image:`, imgError.message);
      }
    }

    // 3. Save chapter to database (upsert to overwrite if it was a partial/empty draft)
    let savedChapter;
    if (existingChapter) {
      savedChapter = await prisma.chapter.update({
        where: { id: existingChapter.id },
        data: {
          title,
          content,
          imageUrl: publicImageUrl || existingChapter.imageUrl,
          imagePrompt,
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
          imageUrl: publicImageUrl,
          imagePrompt,
          modelUsed
        }
      });
    }

    await prisma.book.update({
      where: { id: bookId },
      data: { status: 'generating' }
    });

    updateProgress(bookId, 'chapter_done', `✓ Chapitre ${order} terminé`, { order: parseInt(order), title, chapterText: content, imageUrl: publicImageUrl || null });

    res.json(savedChapter);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  suggestBookTitles,
  generateOutline,
  generateCover,
  generateChapter
};
