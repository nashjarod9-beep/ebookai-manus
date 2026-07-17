const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEbooks = async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(books);
  } catch (error) {
    next(error);
  }
};

const getEbookById = async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: { chapters: { orderBy: { order: 'asc' } } }
    });
    if (!book) {
      return res.status(404).json({ message: 'Livre introuvable' });
    }
    if (book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const createEbook = async (req, res, next) => {
  try {
    const { plan, quotaRemaining, email } = req.user;
    
    if (plan !== 'free' && quotaRemaining <= 0 && email !== 'nashjarod9@gmail.com') {
      return res.status(403).json({
        message: "Votre quota mensuel d'ebooks est épuisé. Veuillez passer à l'offre supérieure pour continuer."
      });
    }

    const { title, subject, description, language, format, outline, author, contactInfo, targetPages, additionalInstructions } = req.body;
    const book = await prisma.book.create({
      data: {
        title,
        subject,
        description,
        language,
        format,
        outline,
        author,
        contactInfo,
        targetPages,
        additionalInstructions,
        userId: req.user.id
      }
    });

    if (plan !== 'free' && email !== 'nashjarod9@gmail.com') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          quotaRemaining: { decrement: 1 },
          ebooksConsumed: { increment: 1 }
        }
      });
    }

    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

const updateEbook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const updateData = req.body;
    
    // Check ownership
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updateData
    });
    res.json(updatedBook);
  } catch (error) {
    next(error);
  }
};

const deleteEbook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await prisma.book.delete({ where: { id: bookId } });
    
    // Log audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'delete',
        metadata: { bookId },
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null
      }
    });

    res.json({ message: 'Livre supprimé' });
  } catch (error) {
    next(error);
  }
};

const duplicateEbook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const srcBook = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: true }
    });

    if (!srcBook || srcBook.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Create duplicated book
    const duplicatedBook = await prisma.book.create({
      data: {
        userId: req.user.id,
        title: `Copie de ${srcBook.title}`,
        subject: srcBook.subject,
        description: srcBook.description,
        language: srcBook.language,
        coverUrl: srcBook.coverUrl,
        format: srcBook.format,
        status: srcBook.status,
        outline: srcBook.outline,
        author: srcBook.author,
        contactInfo: srcBook.contactInfo,
        targetPages: srcBook.targetPages,
        additionalInstructions: srcBook.additionalInstructions,
        chapters: {
          create: srcBook.chapters.map(ch => ({
            title: ch.title,
            content: ch.content,
            imageUrl: ch.imageUrl,
            imagePrompt: ch.imagePrompt,
            order: ch.order,
            quizzes: ch.quizzes,
            videoUrl: ch.videoUrl,
            audioPath: ch.audioPath,
            modelUsed: ch.modelUsed
          }))
        }
      },
      include: {
        chapters: true
      }
    });

    // Log audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'share',
        metadata: { sourceBookId: bookId, duplicatedBookId: duplicatedBook.id },
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null
      }
    });

    res.status(201).json(duplicatedBook);
  } catch (error) {
    next(error);
  }
};

const { progressEmitter } = require('../services/progress.service');
const { enqueueBookGeneration } = require('../lib/queue');

const startBookGeneration = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const { formData, additionalInstructions } = req.body;

    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return res.status(404).json({ message: 'Livre introuvable' });
    }

    if (book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (!book.outline) {
      return res.status(400).json({ message: 'Le plan de l\'ebook doit être généré avant de lancer la rédaction' });
    }

    const outline = JSON.parse(book.outline);
    const chapters = outline.chapters || [];
    
    // Total steps: Cover (1) + Chapters text (N) + Chapters images (M) + PDF (1) + Marketing (1)
    const totalSteps = 1 + chapters.length + chapters.filter(ch => ch.imagePrompt).length + 2;

    // Create a new GenerationJob in DB
    const job = await prisma.generationJob.create({
      data: {
        bookId,
        status: 'queued',
        currentStep: 'File d\'attente rejointe...',
        totalSteps,
        stepIndex: 0
      }
    });

    // Enqueue BullMQ Flow
    await enqueueBookGeneration(book, outline, formData, additionalInstructions, job.id);

    // Update book status
    await prisma.book.update({
      where: { id: bookId },
      data: { status: 'generating' }
    });

    res.status(202).json({
      message: 'Génération asynchrone lancée avec succès',
      jobId: job.id,
      status: job.status
    });
  } catch (error) {
    next(error);
  }
};

const getEbookProgressSSE = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book || book.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const listener = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Try to get latest job progress from DB first
    const latestJob = await prisma.generationJob.findFirst({
      where: { bookId },
      orderBy: { createdAt: 'desc' }
    });

    if (latestJob) {
      res.write(`data: ${JSON.stringify({
        bookId,
        step: latestJob.currentStep,
        message: latestJob.currentStep,
        stepIndex: latestJob.stepIndex,
        totalSteps: latestJob.totalSteps,
        status: latestJob.status,
        timestamp: Date.now()
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ bookId, step: 'init', message: 'Initialisation...', stepIndex: 0, totalSteps: 10, status: 'queued' })}\n\n`);
    }

    progressEmitter.on(`progress:${bookId}`, listener);

    req.on('close', () => {
      progressEmitter.off(`progress:${bookId}`, listener);
    });
  } catch (error) {
    console.error("SSE progress endpoint error:", error);
    res.end();
  }
};

module.exports = {
  getEbooks,
  getEbookById,
  createEbook,
  updateEbook,
  deleteEbook,
  duplicateEbook,
  getEbookProgressSSE,
  startBookGeneration
};
