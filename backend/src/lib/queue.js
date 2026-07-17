const { Queue, FlowProducer } = require('bullmq');
const redisConnection = require('./redis');

const queueName = 'book-generation-queue';

const bookGenerationQueue = new Queue(queueName, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

bookGenerationQueue.on('error', (err) => {
  console.error('[BullMQ Queue Error] Connection issues:', err.message);
});

const flowProducer = new FlowProducer({
  connection: redisConnection
});

flowProducer.on('error', (err) => {
  console.error('[BullMQ FlowProducer Error] Connection issues:', err.message);
});

const enqueueBookGeneration = async (book, outline, formData, additionalInstructions, generationJobId) => {
  const chapters = outline.chapters || [];
  const children = [];

  // 1. Cover Job
  children.push({
    name: 'cover',
    queueName,
    data: {
      bookId: book.id,
      userId: book.userId,
      coverImagePrompt: outline.coverImagePrompt,
      generationJobId
    },
    opts: { failParentOnFailure: true }
  });

  // 2. Chapter Jobs (Text and Image)
  chapters.forEach(ch => {
    children.push({
      name: 'chapter-text',
      queueName,
      data: {
        bookId: book.id,
        userId: book.userId,
        chapterData: ch,
        ebookData: {
          ...formData,
          additionalInstructions
        },
        generationJobId
      },
      opts: { failParentOnFailure: true }
    });

    if (ch.imagePrompt) {
      children.push({
        name: 'chapter-image',
        queueName,
        data: {
          bookId: book.id,
          userId: book.userId,
          order: ch.order,
          imagePrompt: ch.imagePrompt,
          generationJobId
        },
        opts: { failParentOnFailure: false } // Non-critical image failure
      });
    }
  });

  // Root is 'marketing' -> depends on 'pdf' -> depends on 'children'
  await flowProducer.add({
    name: 'marketing',
    queueName,
    data: {
      bookId: book.id,
      userId: book.userId,
      generationJobId
    },
    children: [
      {
        name: 'pdf',
        queueName,
        data: {
          bookId: book.id,
          userId: book.userId,
          generationJobId
        },
        children,
        opts: { failParentOnFailure: true }
      }
    ]
  });
};

module.exports = {
  bookGenerationQueue,
  enqueueBookGeneration
};
