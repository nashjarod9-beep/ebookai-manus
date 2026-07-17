// Mock bullmq entirely to make the test work without Redis!
const bullmqMock = {
  Queue: class {
    constructor(name) {
      this.name = name;
    }
  },
  FlowProducer: class {
    async add(flow) {
      console.log("[MOCK FlowProducer] Added flow root:", flow.name);
      
      const runJob = async (jobSpec) => {
        console.log(`\n--- [MOCK Queue] Running job: ${jobSpec.name} ---`);
        const callback = global.mockWorkerCallback;
        if (callback) {
          try {
            await callback({
              id: `mock-job-${Math.floor(Math.random() * 10000)}`,
              name: jobSpec.name,
              data: jobSpec.data
            });
          } catch (e) {
            console.error(`[MOCK Queue] Job ${jobSpec.name} failed:`, e);
          }
        }
      };

      // 1. Run all children (cover, chapter-text, chapter-image)
      const children = flow.children[0].children;
      for (const child of children) {
        await runJob(child);
      }

      // 2. Run parent (pdf)
      await runJob(flow.children[0]);

      // 3. Run root (marketing)
      await runJob(flow);
    }
  },
  Worker: class {
    constructor(name, callback) {
      console.log(`[MOCK Worker] Initialized on queue: ${name}`);
      global.mockWorkerCallback = callback;
    }
    on() { return this; }
  }
};

const bullmqPath = require.resolve('../backend/node_modules/bullmq');
require.cache[bullmqPath] = {
  id: bullmqPath,
  loaded: true,
  exports: bullmqMock
};

// Mock ioredis entirely to avoid trying to connect to a non-existent Redis server
const ioredisMock = class {
  constructor() {
    console.log("[MOCK Redis] Initialized dummy connection.");
  }
  on() { return this; }
};
const ioredisPath = require.resolve('../backend/node_modules/ioredis');
require.cache[ioredisPath] = {
  id: ioredisPath,
  loaded: true,
  exports: ioredisMock
};

const { enqueueBookGeneration } = require('../backend/src/lib/queue');
const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Stub notification and external AI services to keep test fast and independent of real API keys/Upstash
require.cache[require.resolve('../backend/src/services/notification.service')] = {
  exports: {
    sendEmailNotification: async (toEmail, subject, text, html) => {
      console.log(`[TEST MOCK EMAIL] Sent to: ${toEmail} | Subject: ${subject}`);
    }
  }
};

require.cache[require.resolve('../backend/src/services/storage.service')] = {
  exports: {
    downloadImageToBuffer: async () => Buffer.from("dummy-image-data"),
    uploadChapterImage: async (buf, userId, name) => {
      console.log(`[TEST MOCK UPLOAD] Chapter image name: ${name}`);
      return `https://supabase.co/storage/v1/object/public/ebookai-storage/images/${userId}/${name}`;
    },
    uploadCoverImage: async (buf, userId, name) => {
      console.log(`[TEST MOCK UPLOAD] Cover image name: ${name}`);
      return `https://supabase.co/storage/v1/object/public/ebookai-storage/covers/${userId}/${name}`;
    },
    uploadPdfExport: async (buf, userId, name) => {
      console.log(`[TEST MOCK UPLOAD] PDF export name: ${name}`);
      return `https://supabase.co/storage/v1/object/public/ebookai-storage/exports/${userId}/${name}`;
    }
  }
};

const runTest = async () => {
  console.log("Starting BullMQ Generation Flow local test...");

  // Get first user in DB or create a dummy one
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "nashjarod9@gmail.com",
        passwordHash: "dummyhash",
        plan: "agency"
      }
    });
  }

  // Create a dummy book
  const book = await prisma.book.create({
    data: {
      userId: user.id,
      title: "SUCCÈS DIGITAL 2026",
      subject: "Marketing en ligne",
      description: "Apprenez à générer des revenus passifs",
      outline: JSON.stringify({
        title: "SUCCÈS DIGITAL 2026",
        description: "Apprenez à générer des revenus passifs",
        coverImagePrompt: "A sleek modern digital book cover",
        chapters: [
          {
            order: 1,
            title: "Le mindset du créateur",
            summary: "Pourquoi tout commence par l'état d'esprit.",
            subchapters: ["Introduction au mindset"],
            imagePrompt: "Mindset illustration"
          }
        ]
      })
    }
  });

  console.log(`Created book draft with ID: ${book.id}`);

  // Create GenerationJob record
  const job = await prisma.generationJob.create({
    data: {
      bookId: book.id,
      status: 'queued',
      currentStep: 'Initialisation...',
      totalSteps: 5, // Cover, Chapter Text, Chapter Image, PDF, Marketing
      stepIndex: 0
    }
  });

  console.log(`Created GenerationJob with ID: ${job.id}`);

  // Require worker to spin it up locally (will register callback on global)
  console.log("Spinning up local Worker...");
  require('../backend/src/worker');

  // Enqueue job flow
  console.log("Enqueuing generation flow...");
  await enqueueBookGeneration(
    book,
    JSON.parse(book.outline),
    { theme: "Marketing en ligne", language: "fr", author: "Mister Jadore" },
    "Veuillez inclure des tableaux",
    job.id
  );

  console.log("Flow enqueued! Monitor console logs for execution details.");
  
  // Keep script open to watch worker process
  setTimeout(async () => {
    // Check final status in DB
    const finalJob = await prisma.generationJob.findUnique({
      where: { id: job.id }
    });
    console.log("\n=========================================");
    console.log("Final Job state in DB:", finalJob);
    console.log("=========================================");
    process.exit(0);
  }, 10000);
};

runTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
