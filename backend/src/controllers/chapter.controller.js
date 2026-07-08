const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createChapter = async (req, res, next) => {
  try {
    const { bookId, title, content, order, imageUrl, imagePrompt, quizzes } = req.body;
    
    // Check book ownership
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        title,
        content,
        order,
        imageUrl,
        imagePrompt,
        quizzes: quizzes ? JSON.stringify(quizzes) : null
      }
    });
    res.status(201).json(chapter);
  } catch (error) {
    next(error);
  }
};

const updateChapter = async (req, res, next) => {
  try {
    const chapterId = req.params.id;
    const updateData = req.body;
    
    const chapter = await prisma.chapter.findUnique({ 
      where: { id: chapterId },
      include: { book: true }
    });
    
    if (!chapter || chapter.book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (updateData.quizzes && typeof updateData.quizzes === 'object') {
      updateData.quizzes = JSON.stringify(updateData.quizzes);
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData
    });
    res.json(updatedChapter);
  } catch (error) {
    next(error);
  }
};

const deleteChapter = async (req, res, next) => {
  try {
    const chapterId = req.params.id;
    
    const chapter = await prisma.chapter.findUnique({ 
      where: { id: chapterId },
      include: { book: true }
    });
    
    if (!chapter || chapter.book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await prisma.chapter.delete({ where: { id: chapterId } });
    res.json({ message: 'Chapitre supprimé' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChapter,
  updateChapter,
  deleteChapter
};
