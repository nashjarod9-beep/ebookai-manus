const { marked } = require('marked');
const { uploadPdfExport } = require('./storage.service');

// Configure marked to render safe HTML and handle line breaks correctly
marked.setOptions({
  breaks: true,
  gfm: true
});

const markdownToHTML = (md) => {
  if (!md) return '';
  try {
    return marked.parse(md);
  } catch (error) {
    console.error("Markdown parsing error, fallback to raw text:", error);
    return md;
  }
};

const buildEbookHTML = (book, chapters) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${book.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
    
    @page {
      size: A4;
      margin: 20mm 20mm 20mm 20mm;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #2D3748;
      line-height: 1.6;
      font-size: 15px;
    }
    
    /* Cover Page */
    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 92vh;
      text-align: center;
      font-family: 'Playfair Display', serif;
      padding: 20px;
      box-sizing: border-box;
    }
    .cover-title {
      font-size: 42px;
      font-weight: 700;
      color: #1A202C;
      margin-top: 20px;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .cover-subtitle {
      font-size: 18px;
      color: #718096;
      margin-bottom: 30px;
      font-style: italic;
      font-family: 'Inter', sans-serif;
      max-width: 80%;
    }
    .cover-img {
      width: 100%;
      max-width: 90%;
      height: 480px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }
    .cover-author {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #2B6CB0;
      font-weight: 700;
    }
    
    /* Table of Contents */
    .toc {
      page-break-after: always;
      padding: 40px 20px;
    }
    .toc-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #1A202C;
      margin-bottom: 40px;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 10px;
    }
    .toc-list {
      margin-top: 20px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 16px;
    }
    .toc-item-title {
      font-weight: 500;
      color: #2D3748;
    }
    .toc-item-page {
      color: #718096;
      font-weight: 700;
    }
    
    /* Chapters */
    .chapter {
      page-break-before: always;
      padding: 40px 20px;
    }
    .chapter-header {
      margin-bottom: 40px;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 20px;
    }
    .chapter-number {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #3182CE;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .chapter-title {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      color: #1A202C;
      line-height: 1.2;
    }
    .chapter-img {
      width: 100%;
      max-height: 350px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }
    .chapter-body {
      font-size: 16px;
      color: #2D3748;
      line-height: 1.8;
      text-align: justify;
    }
    .chapter-body h2 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #2D3748;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .chapter-body h3 {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: #4A5568;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .chapter-body p {
      margin-bottom: 20px;
    }
    .chapter-body blockquote {
      border-left: 4px solid #3182CE;
      padding: 10px 20px;
      background-color: #F7FAFC;
      margin: 20px 0;
      font-style: italic;
      color: #4A5568;
    }
    .chapter-body ul, .chapter-body ol {
      margin-bottom: 20px;
      padding-left: 20px;
    }
    .chapter-body li {
      margin-bottom: 8px;
    }

    /* Back Cover / Final Page */
    .back-cover {
      page-break-before: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 92vh;
      text-align: center;
      padding: 40px;
      box-sizing: border-box;
      background-color: #F7FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
    }
    .back-cover h2 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #1A202C;
      margin-bottom: 20px;
    }
    .back-cover-author {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #2B6CB0;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .back-cover-details {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      line-height: 2;
      color: #4A5568;
      margin-bottom: 40px;
      max-width: 80%;
    }
    .back-cover-footer {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #A0AEC0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    ${book.coverUrl ? `<img class="cover-img" src="${book.coverUrl}" alt="Cover Image">` : ''}
    <div class="cover-title">${book.title}</div>
    <div class="cover-subtitle">${book.description || ''}</div>
    <div class="cover-author">Par ${book.author || 'EbookAI'}</div>
  </div>
  
  <!-- Table of Contents -->
  <div class="toc">
    <div class="toc-title">Table des Matières</div>
    <div class="toc-list">
      ${chapters.map((c, i) => `
        <div class="toc-item">
          <span class="toc-item-title">Chapitre ${i + 1} : ${c.title}</span>
          <span class="toc-item-page">Page ${i * 4 + 3}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Chapters -->
  ${chapters.map((c, i) => `
    <div class="chapter">
      <div class="chapter-header">
        <div class="chapter-number">Chapitre ${i + 1}</div>
        <div class="chapter-title">${c.title}</div>
      </div>
      ${c.imageUrl ? `<img class="chapter-img" src="${c.imageUrl}" alt="Illustration Chapitre ${i + 1}">` : ''}
      <div class="chapter-body">
        ${markdownToHTML(c.content)}
      </div>
    </div>
  `).join('')}

  <!-- Back Cover / Final Page -->
  ${book.contactInfo ? `
    <div class="back-cover">
      <h2>Contact & Informations</h2>
      <div class="back-cover-author">Auteur : ${book.author || 'Anonyme'}</div>
      <div class="back-cover-details">
        ${book.contactInfo.replace(/\n/g, '<br>')}
      </div>
      <div class="back-cover-footer">Merci pour votre lecture !</div>
    </div>
  ` : ''}
</body>
</html>
`;

const generatePDF = async (book, chapters, userId) => {
  let browser;
  const isProd = process.env.VERCEL || process.env.NODE_ENV === 'production';

  if (isProd) {
    const playwrightCore = await import('playwright-core');
    const playwrightChromium = playwrightCore.chromium;
    
    const sparticuzChromiumModule = await import('@sparticuz/chromium');
    const chromium = sparticuzChromiumModule.default || sparticuzChromiumModule;
    
    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const { chromium: playwrightChromium } = require('playwright-core');
    browser = await playwrightChromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      channel: 'chrome' // Uses locally installed Google Chrome
    });
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  const html = buildEbookHTML(book, chapters);
  await page.setContent(html, { waitUntil: 'load' });

  const filename = `ebook_${book.id}_${Date.now()}.pdf`;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>', // Empty header
    footerTemplate: `
      <div style="font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; font-size: 9px; width: 100%; display: flex; justify-content: space-between; padding: 0 20mm; color: #A0AEC0;">
        <span>${book.title}</span>
        <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
      </div>
    `,
    margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' }
  });

  await browser.close();

  // Upload to Supabase Storage in exports/ folder
  const publicUrl = await uploadPdfExport(pdfBuffer, userId, filename);
  
  return publicUrl;
};

module.exports = { generatePDF };
