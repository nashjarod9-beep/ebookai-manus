const { generatePDF } = require('../services/pdf.service');
const { generateZip } = require('../services/zip.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exportToPdf = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: { orderBy: { order: 'asc' } } }
    });

    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const pdfPath = await generatePDF(book, book.chapters);
    
    // Save path to DB
    await prisma.book.update({
      where: { id: bookId },
      data: { pdfPath }
    });

    res.json({ pdfPath });
  } catch (error) {
    next(error);
  }
};

const exportToZip = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: { orderBy: { order: 'asc' } } }
    });

    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const zipPath = await generateZip(book, book.chapters);
    
    // Save path to DB
    await prisma.book.update({
      where: { id: bookId },
      data: { zipPath }
    });

    res.json({ zipPath });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportToPdf,
  exportToZip
};
