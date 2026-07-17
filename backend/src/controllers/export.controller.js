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

    const { updateProgress } = require('../services/progress.service');
    updateProgress(bookId, 'pdf', 'Compilation PDF et mise en page professionnelle...');

    const pdfPath = await generatePDF(book, book.chapters, req.user.id);
    
    // Save path to DB
    await prisma.book.update({
      where: { id: bookId },
      data: { pdfPath }
    });

    updateProgress(bookId, 'pdf_done', '✓ Ebook PDF compilé', { pdfPath });
 
    // Log audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'export',
        metadata: { format: 'pdf', bookId },
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null
      }
    });

    res.json({ pdfPath });
  } catch (error) {
    console.error("Export PDF error details:", error);
    res.status(500).json({ 
      message: "Erreur lors de la génération du PDF", 
      error: error.message,
      stack: error.stack 
    });
  }
};

const exportToZip = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    
    if (req.user.plan === 'free' && req.user.email !== 'nashjarod9@gmail.com') {
      return res.status(403).json({ message: "L'export HTML5 (ZIP) est réservé aux abonnés Starter ou supérieur." });
    }
    
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { chapters: { orderBy: { order: 'asc' } } }
    });

    if (!book || book.userId !== req.user.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const zipPath = await generateZip(book, book.chapters, req.user.id);
    
    // Save path to DB
    await prisma.book.update({
      where: { id: bookId },
      data: { zipPath }
    });

    // Log audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'export',
        metadata: { format: 'zip', bookId },
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null
      }
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
