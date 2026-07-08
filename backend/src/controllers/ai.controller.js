const { generateOutline, generateFullEbook } = require('../services/manus.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateBookOutline = async (req, res, next) => {
  try {
    const ebookData = req.body;
    // ebookData includes: title, theme, objective, audience, tone, length, language
    const outline = await generateOutline(ebookData);
    res.json(outline);
  } catch (error) {
    next(error);
  }
};

const generateFullBookFromOutline = async (req, res, next) => {
  try {
    const { outline, ebookData, bookId } = req.body;
    
    // Check ownership
    if (bookId) {
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book || book.userId !== req.user.id) {
        return res.status(401).json({ message: 'Non autorisé' });
      }
    }

    const fullEbookResult = await generateFullEbook(outline, ebookData);
    
    // Save generated content to database
    if (bookId && fullEbookResult) {
      if (fullEbookResult.coverUrl) {
        await prisma.book.update({
          where: { id: bookId },
          data: { coverUrl: fullEbookResult.coverUrl, status: 'ready' }
        });
      } else {
        await prisma.book.update({
          where: { id: bookId },
          data: { status: 'ready' }
        });
      }

      if (fullEbookResult.chapters && Array.isArray(fullEbookResult.chapters)) {
        // First delete any existing chapters to avoid duplicates if re-generating
        await prisma.chapter.deleteMany({ where: { bookId } });
        
        for (let i = 0; i < fullEbookResult.chapters.length; i++) {
          const ch = fullEbookResult.chapters[i];
          await prisma.chapter.create({
            data: {
              bookId,
              title: ch.title,
              content: ch.content,
              order: i + 1,
              imageUrl: ch.imageUrl
            }
          });
        }
      }
    }

    res.json(fullEbookResult);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateBookOutline,
  generateFullBookFromOutline
};
