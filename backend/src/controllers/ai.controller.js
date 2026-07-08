const { createOutlineTask, createFullEbookTask, getTaskStatusAndResult } = require('../services/manus.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateBookOutline = async (req, res, next) => {
  try {
    const ebookData = req.body;
    const taskId = await createOutlineTask(ebookData);
    res.json({ taskId });
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

    const taskId = await createFullEbookTask(outline, ebookData);
    res.json({ taskId });
  } catch (error) {
    next(error);
  }
};

const getAiTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { bookId } = req.query;

    const statusData = await getTaskStatusAndResult(taskId);

    // If it's completed and we have a bookId, save the results to the DB
    if (statusData.status === 'completed' && bookId && statusData.result) {
      const fullEbookResult = statusData.result;
      
      const updateData = { status: 'ready' };
      if (fullEbookResult.coverUrl) {
        updateData.coverUrl = fullEbookResult.coverUrl;
      }
      
      await prisma.book.update({
        where: { id: bookId },
        data: updateData
      });

      if (fullEbookResult.chapters && Array.isArray(fullEbookResult.chapters)) {
        // First delete any existing chapters to avoid duplicates
        await prisma.chapter.deleteMany({ where: { bookId } });
        
        for (let i = 0; i < fullEbookResult.chapters.length; i++) {
          const ch = fullEbookResult.chapters[i];
          await prisma.chapter.create({
            data: {
              bookId,
              title: ch.title,
              content: ch.content || '',
              order: i + 1,
              imageUrl: ch.imageUrl
            }
          });
        }
      }
    }

    res.json(statusData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateBookOutline,
  generateFullBookFromOutline,
  getAiTaskStatus
};
