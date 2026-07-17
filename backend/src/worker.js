require('dotenv').config();
const Sentry = require('@sentry/node');

// Initialize Sentry for background worker if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('[Sentry] Worker initialized successfully.');
}

const { Worker } = require('bullmq');
const redisConnection = require('./lib/redis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { progressEmitter } = require('./services/progress.service');
const { sendEmailNotification } = require('./services/notification.service');

const {
  executeCoverGeneration,
  executeChapterTextGeneration,
  executeChapterImageGeneration,
  executePdfCompilation,
  executeMarketingGeneration
} = require('./services/ai-logic.service');

console.log('[Worker] Starting EbookAI background generation worker...');

// Function to update progress in DB and trigger real-time SSE updates
const updateJobProgress = async (generationJobId, bookId, name, message, isLast = false) => {
  try {
    const job = await prisma.generationJob.update({
      where: { id: generationJobId },
      data: {
        stepIndex: { increment: 1 },
        currentStep: message,
        status: isLast ? 'completed' : 'running'
      }
    });

    // Notify connected clients via SSE progress emitter
    progressEmitter.emit(`progress:${bookId}`, {
      bookId,
      step: name,
      message,
      stepIndex: job.stepIndex,
      totalSteps: job.totalSteps,
      status: job.status,
      timestamp: Date.now()
    });

    console.log(`[Worker Progress] Job ${generationJobId} -> Step: ${name}, Index: ${job.stepIndex}/${job.totalSteps}`);

    if (isLast) {
      // Set book status to ready
      await prisma.book.update({
        where: { id: bookId },
        data: { status: 'ready' }
      });

      // Send success email notification
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        include: { user: true }
      });
      if (book && book.user) {
        const subject = `📖 Votre ebook "${book.title}" est prêt !`;
        const text = `Félicitations ! Votre ebook "${book.title}" a été généré avec succès.\n\nVous pouvez le lire et le télécharger sur votre tableau de bord Neno AI.`;
        const html = `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
            <h2>Votre Ebook est prêt !</h2>
            <p>Félicitations ! L'écriture et la mise en page de votre ebook <strong>"${book.title}"</strong> sont entièrement terminées.</p>
            <p>Les éléments suivants ont été créés :</p>
            <ul>
              <li>Couverture HD</li>
              <li>Contenu rédigé de tous les chapitres</li>
              <li>Illustrations sur-mesure</li>
              <li>Mise en page PDF Premium</li>
              <li>Fiche produit commerciale, scripts TikTok et messages WhatsApp</li>
            </ul>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #B5893D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 10px;">Accéder à mon Tableau de Bord</a></p>
            <p>À bientôt,<br>L'équipe Neno AI</p>
          </div>
        `;
        await sendEmailNotification(book.user.email, subject, text, html);
      }
    }
  } catch (error) {
    console.error(`[Worker Error] Failed to update progress for job ${generationJobId}:`, error.message);
  }
};

// Define the BullMQ Worker
const worker = new Worker('book-generation-queue', async (job) => {
  const { bookId, userId, generationJobId } = job.data;
  const name = job.name;

  console.log(`[Worker] Processing job "${name}" for book ${bookId} (Job ID: ${job.id})`);

  // Ensure job is set to running
  await prisma.generationJob.update({
    where: { id: generationJobId },
    data: { status: 'running' }
  });

  try {
    if (name === 'cover') {
      const { coverImagePrompt } = job.data;
      await executeCoverGeneration(bookId, userId, coverImagePrompt, job.id);
      await updateJobProgress(generationJobId, bookId, name, '✓ Couverture HD générée');
    }
    
    else if (name === 'chapter-text') {
      const { chapterData, ebookData } = job.data;
      await executeChapterTextGeneration(bookId, userId, chapterData, ebookData, job.id);
      await updateJobProgress(generationJobId, bookId, name, `✓ Chapitre ${chapterData.order} rédigé`);
    }

    else if (name === 'chapter-image') {
      const { order, imagePrompt } = job.data;
      await executeChapterImageGeneration(bookId, userId, order, imagePrompt, job.id);
      await updateJobProgress(generationJobId, bookId, name, `✓ Illustration chapitre ${order} terminée`);
    }

    else if (name === 'pdf') {
      await executePdfCompilation(bookId, userId, job.id);
      await updateJobProgress(generationJobId, bookId, name, '✓ Ebook PDF compilé');
    }

    else if (name === 'marketing') {
      await executeMarketingGeneration(bookId, userId, job.id);
      await updateJobProgress(generationJobId, bookId, name, '✓ Assets marketing générés', true);
    }

    return { success: true };
  } catch (error) {
    console.error(`[Worker Job Error] Fail in job ${name} for book ${bookId}:`, error);
    
    // Capture exception in Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: { jobName: name, bookId }
      });
    }

    // Mark job as failed in DB
    await prisma.generationJob.update({
      where: { id: generationJobId },
      data: {
        status: 'failed',
        error: error.message
      }
    });

    // Notify client via SSE
    progressEmitter.emit(`progress:${bookId}`, {
      bookId,
      status: 'failed',
      error: error.message,
      timestamp: Date.now()
    });

    // Send failure email notification
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { user: true }
    });
    if (book && book.user) {
      const subject = `⚠️ Erreur de génération - Ebook "${book.title}"`;
      const text = `Bonjour,\n\nUne erreur est survenue lors de la génération automatique de votre ebook "${book.title}".\n\nDétail de l'erreur : ${error.message}\n\nVous pouvez retenter la génération depuis votre tableau de bord.`;
      const html = `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2>Une erreur est survenue</h2>
          <p>Bonjour,</p>
          <p>Nous sommes désolés, mais une erreur technique a interrompu la génération de votre ebook <strong>"${book.title}"</strong>.</p>
          <blockquote style="border-left: 4px solid #EF4444; padding-left: 15px; margin: 15px 0; color: #DC2626; font-style: italic;">
            ${error.message}
          </blockquote>
          <p>Vous pouvez vous reconnecter sur votre espace Neno AI et relancer le processus de génération.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accéder à Neno AI</a></p>
        </div>
      `;
      await sendEmailNotification(book.user.email, subject, text, html);
    }

    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 2 // Handle up to 2 parallel tasks
});

worker.on('failed', (job, err) => {
  console.error(`[Worker Global] Job ${job.id} failed:`, err.message);
});

worker.on('completed', (job) => {
  console.log(`[Worker Global] Job ${job.id} completed successfully.`);
});

worker.on('error', (err) => {
  console.error('[BullMQ Worker Error] Connection issues:', err.message);
});
