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
      return res.status(401).json({ message: 'Non autorisé' });
    }
    res.json(book);
  } catch (error) {
    next(error);
  }
};

const createEbook = async (req, res, next) => {
  try {
    const { plan, quotaRemaining } = req.user;
    
    if (plan !== 'free' && quotaRemaining <= 0) {
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

    if (plan !== 'free') {
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
      return res.status(401).json({ message: 'Non autorisé' });
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
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await prisma.book.delete({ where: { id: bookId } });
    res.json({ message: 'Livre supprimé' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEbooks,
  getEbookById,
  createEbook,
  updateEbook,
  deleteEbook
};
