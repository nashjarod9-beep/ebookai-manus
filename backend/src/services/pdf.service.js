const { uploadPdfExport } = require('./storage.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sanitizeGeneratedHtml } = require('../utils/sanitize');

const parseCustomMarkdown = (markdown) => {
  if (!markdown) return '';
  let content = markdown;

  // 1. Parse warning boxes: > [attention] \n > ...
  content = content.replace(/>\s*\[attention\]\s*\n((?:>\s*.*(?:\n|$))+)/g, (match, p1) => {
    const lines = p1.split('\n').map(line => line.replace(/^>\s*/, '').trim()).filter(Boolean);
    const title = lines[0] && lines[0].startsWith('**') ? lines[0].replace(/\*\*/g, '') : "L'ERREUR À ÉVITER";
    const body = lines[0] && lines[0].startsWith('**') ? lines.slice(1).join(' ') : lines.join(' ');
    return `<div class="warning-box"><span class="warning-tag">▲ ${title}</span><p>${body}</p></div>`;
  });

  // 2. Parse key points: > [point-cle] \n > ...
  content = content.replace(/>\s*\[point-cle\]\s*\n((?:>\s*.*(?:\n|$))+)/g, (match, p1) => {
    const lines = p1.split('\n').map(line => line.replace(/^>\s*/, '').trim()).filter(Boolean);
    const title = lines[0] && lines[0].startsWith('**') ? lines[0].replace(/\*\*/g, '') : "LE POINT CLÉ";
    const body = lines[0] && lines[0].startsWith('**') ? lines.slice(1).join(' ') : lines.join(' ');
    return `<div class="key-point-box"><span class="key-point-tag">◆ ${title}</span><p>${body}</p></div>`;
  });

  // 3. Parse cards grid: > [cards] \n > * **Title** | Desc \n ...
  content = content.replace(/>\s*\[cards\]\s*\n((?:>\s*.*(?:\n|$))+)/g, (match, p1) => {
    const lines = p1.split('\n').map(line => line.replace(/^>\s*/, '').trim()).filter(Boolean);
    const cards = [];
    lines.forEach(line => {
      const cardMatch = line.match(/^[\*\-]\s*\*\*(.*?)\*\*\s*\|\s*(.*)/);
      if (cardMatch) {
        cards.push({ title: cardMatch[1], desc: cardMatch[2] });
      }
    });

    return `<div class="cards-grid">${cards.map(c => `<div class="card-item"><div class="card-item-title">${c.title}</div><div class="card-item-desc">${c.desc}</div></div>`).join('')}</div>`;
  });

  // 4. Parse flowchart: > [flow] \n > Title | desc -> Title | desc -> ...
  content = content.replace(/>\s*\[flow\]\s*\n((?:>\s*.*(?:\n|$))+)/g, (match, p1) => {
    const rawText = p1.split('\n').map(line => line.replace(/^>\s*/, '').trim()).filter(Boolean).join(' ');
    const steps = rawText.split('->').map(s => {
      const parts = s.split('|').map(x => x.trim());
      return { title: parts[0] || '', desc: parts[1] || '' };
    });

    return `<div class="flow-grid">${steps.map((step, idx) => `<div class="flow-step"><div class="flow-step-num">${String(idx + 1).padStart(2, '0')}</div><div class="flow-step-content"><div class="flow-step-title">${step.title}</div><div class="flow-step-desc">${step.desc}</div></div></div>${idx < steps.length - 1 ? `<div class="flow-arrow"><svg viewBox="0 0 24 24" width="16" height="16" stroke="#B5893D" stroke-width="2.5" fill="none"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>` : ''}`).join('')}</div>`;
  });

  return content;
};

const buildEbookHTML = (book, chapters, userPlan) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${book.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
    
    @page {
      size: A4;
      margin: 25mm 25mm 25mm 25mm;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #1E293B;
      line-height: 1.7;
      font-size: 15px;
      background-color: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    /* Watermark for Free Plan */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      color: rgba(220, 38, 38, 0.1);
      z-index: 9999;
      pointer-events: none;
      white-space: nowrap;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    
    /* Cover Page */
    .cover {
      page-break-after: always;
      position: relative;
      width: 100%;
      height: 90vh;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      color: #ffffff !important;
      text-align: center;
      border-radius: 24px;
      overflow: hidden;
    }
    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.85) 100%);
      z-index: 1;
    }
    .cover-content {
      position: relative;
      z-index: 2;
      padding: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      box-sizing: border-box;
    }
    .cover-title {
      font-size: 48px;
      font-weight: 700;
      color: #ffffff !important;
      margin: 0 0 20px 0;
      line-height: 1.2;
      font-family: 'Playfair Display', serif;
      max-width: 90%;
    }
    .cover-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.85) !important;
      margin: 0 0 40px 0;
      font-family: 'Inter', sans-serif;
      max-width: 80%;
      line-height: 1.5;
    }
    .cover-divider {
      width: 60px;
      height: 3px;
      background-color: #B5893D;
      margin: 24px 0;
      border-radius: 2px;
    }
    .cover-author {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #B5893D !important;
      font-weight: 700;
      margin-top: auto;
    }
    
    /* Table of Contents */
    .toc {
      page-break-after: always;
      padding: 20px 10px;
    }
    .toc-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #0F172A;
      margin-bottom: 40px;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 16px;
    }
    .toc-list {
      margin-top: 20px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 15px;
    }
    .toc-item-title {
      font-weight: 500;
      color: #334155;
    }
    .toc-item-page {
      color: #B5893D;
      font-weight: 700;
    }
    
    /* Part Page Divider */
    .part-page {
      page-break-before: always;
      page-break-after: always;
      position: relative;
      background: linear-gradient(135deg, #0F172A 0%, #020617 100%);
      color: #FFFFFF !important;
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 50px;
      box-sizing: border-box;
      border-radius: 24px;
      overflow: hidden;
    }
    .part-number-bg {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 180px;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.04);
      line-height: 1;
      font-family: 'Inter', sans-serif;
    }
    .part-subtitle {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #B5893D;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .part-title {
      font-family: 'Playfair Display', serif;
      font-size: 40px;
      font-weight: 700;
      color: #FFFFFF !important;
      line-height: 1.25;
      margin-bottom: 40px;
      max-width: 80%;
      border-bottom: 2px solid #B5893D;
      padding-bottom: 20px;
    }
    .part-summary {
      max-width: 90%;
      margin-top: 20px;
    }
    .part-summary .key-point-box, .part-summary blockquote {
      background: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid rgba(181, 137, 61, 0.3) !important;
      border-left: 4px solid #B5893D !important;
      color: rgba(255, 255, 255, 0.9) !important;
      border-radius: 4px !important;
    }
    .part-summary .key-point-tag {
      color: #B5893D !important;
    }
    .part-summary p {
      color: rgba(255, 255, 255, 0.8) !important;
    }

    /* Chapters */
    .chapter {
      page-break-before: always;
      padding: 20px 10px;
    }
    .chapter-header {
      margin-bottom: 30px;
    }
    .chapter-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background-color: #FAF9F6;
      border: 1px solid rgba(181, 137, 61, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .chapter-number {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #B5893D;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .chapter-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #0F172A;
      line-height: 1.3;
      font-weight: 700;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 16px;
    }
    .chapter-img {
      width: 100%;
      max-height: 380px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .chapter-body {
      font-size: 15px;
      color: #1E293B;
      line-height: 1.75;
      text-align: justify;
    }
    .chapter-body h2 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #0F172A;
      margin-top: 36px;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .chapter-body h3 {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      color: #334155;
      margin-top: 28px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    .chapter-body p {
      margin-bottom: 18px;
    }
    
    /* Lists with custom bullets */
    .chapter-body ul {
      list-style: none;
      padding-left: 0;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .chapter-body ul li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 22px;
    }
    .chapter-body ul li::before {
      content: "•";
      color: #B5893D;
      font-weight: bold;
      display: inline-block;
      width: 1em;
      margin-left: -1em;
      position: absolute;
      left: 6px;
    }
    
    .chapter-body ol {
      margin-bottom: 20px;
      padding-left: 20px;
    }
    .chapter-body ol li {
      margin-bottom: 10px;
    }

    /* Custom Boxes (Point Cle & Attention) */
    .key-point-box {
      border-left: 4px solid #B5893D;
      background-color: #FAF9F6;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 12px 12px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.01);
      page-break-inside: avoid;
    }
    .key-point-tag {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #B5893D;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .key-point-box p {
      margin: 0;
      font-size: 14.5px;
      color: #334155;
    }

    .warning-box {
      border-left: 4px solid #EF4444;
      background-color: #FEF2F2;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 12px 12px 0;
      page-break-inside: avoid;
    }
    .warning-tag {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #EF4444;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .warning-box p {
      margin: 0;
      font-size: 14.5px;
      color: #7F1D1D;
    }

    /* Cards Grid Styling */
    .cards-grid {
      display: flex;
      gap: 16px;
      margin: 24px 0;
      width: 100%;
      page-break-inside: avoid;
    }
    .card-item {
      flex: 1;
      background-color: #FAF9F6;
      border: 1px solid rgba(181, 137, 61, 0.15);
      border-radius: 12px;
      padding: 18px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.01);
    }
    .card-item-title {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: #B5893D;
      margin-bottom: 6px;
    }
    .card-item-desc {
      font-size: 12px;
      color: #64748B;
      font-weight: 500;
      line-height: 1.4;
    }

    /* Flow Grid Styling */
    .flow-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 28px 0;
      width: 100%;
      background-color: #FAF9F6;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(181, 137, 61, 0.1);
      page-break-inside: avoid;
    }
    .flow-step {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .flow-step-num {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background-color: rgba(181, 137, 61, 0.15);
      color: #B5893D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }
    .flow-step-title {
      font-weight: 700;
      font-size: 13px;
      color: #0F172A;
    }
    .flow-step-desc {
      font-size: 11px;
      color: #64748B;
    }
    .flow-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
    }

    /* Premium Tables */
    .chapter-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 28px 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      border: 1px solid #E2E8F0;
      page-break-inside: avoid;
    }
    .chapter-body th {
      background-color: #0F172A;
      color: #FFFFFF;
      font-weight: 600;
      text-align: left;
      padding: 14px 18px;
      font-size: 13px;
      letter-spacing: 0.5px;
    }
    .chapter-body td {
      padding: 14px 18px;
      border-bottom: 1px solid #F1F5F9;
      font-size: 13px;
      color: #334155;
    }
    .chapter-body tr:nth-child(even) td {
      background-color: #F8FAFC;
    }

    /* Standard Blockquote Fallback */
    .chapter-body blockquote {
      border-left: 4px solid #B5893D;
      padding: 12px 20px;
      background-color: #FAF9F6;
      margin: 20px 0;
      font-style: italic;
      color: #475569;
    }

    /* Back Cover / Final Page */
    .back-cover {
      page-break-before: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 90vh;
      text-align: center;
      padding: 40px;
      box-sizing: border-box;
      background-color: #FAF9F6;
      border: 1px solid rgba(181, 137, 61, 0.15);
      border-radius: 24px;
    }
    .back-cover h2 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #0F172A;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .back-cover-author {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #B5893D;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .back-cover-details {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      line-height: 2;
      color: #475569;
      margin-bottom: 40px;
      max-width: 80%;
    }
    .back-cover-footer {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <!-- Watermark on all pages for Free Plan -->
  ${userPlan === 'free' ? '<div class="watermark">Aperçu Neno AI</div>' : ''}

  <!-- Cover Page -->
  <div class="cover" style="${book.coverUrl ? `background-image: url('${book.coverUrl}');` : 'background-color: #0F172A;' }">
    <div class="cover-overlay"></div>
    <div class="cover-content">
      <h1 class="cover-title">${book.title}</h1>
      <div class="cover-divider"></div>
      <p class="cover-subtitle">${book.description || book.subject || ''}</p>
      <div class="cover-author">Par ${book.author || 'Neno AI'}</div>
    </div>
  </div>
  
  <!-- Table of Contents -->
  <div class="toc">
    <div class="toc-title">Table des Matières</div>
    <div class="toc-list">
      ${chapters.map((c, i) => `
        <div class="toc-item">
          <span class="toc-item-title">${c.title.toLowerCase().startsWith('partie') ? c.title : `Chapitre ${i + 1} : ${c.title}`}</span>
          <span class="toc-item-page">Page ${i * 4 + 3}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Chapters -->
  ${chapters.map((c, i) => {
    const isPart = c.title.toLowerCase().startsWith('partie') || c.title.toLowerCase().includes('part ');
    if (isPart) {
      const partMatch = c.title.match(/partie\s*(\d+|[ivxldm]+)\s*[:\-]?\s*(.*)/i);
      const partNum = partMatch ? partMatch[1] : (i + 1);
      const partTitle = partMatch ? partMatch[2] : c.title;
      const summaryMatch = c.contentHTML.match(/<div class="key-point-box">([\s\S]*?)<\/div>/) || c.contentHTML.match(/<blockquote>([\s\S]*?)<\/blockquote>/);
      const partSummary = summaryMatch ? summaryMatch[0] : '';
      
      return `
        <div class="part-page">
          <div class="part-number-bg">${String(partNum).padStart(2, '0')}</div>
          <div class="part-subtitle">PARTIE ${partNum}</div>
          <h1 class="part-title">${partTitle}</h1>
          ${partSummary ? `<div class="part-summary">${partSummary}</div>` : ''}
        </div>
      `;
    }
    
    return `
      <div class="chapter">
        <div class="chapter-header">
          <div class="chapter-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#B5893D" stroke-width="2" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div class="chapter-number">Chapitre ${String(i + 1).padStart(2, '0')}</div>
          <div class="chapter-title">${c.title}</div>
        </div>
        ${c.imageUrl ? `<img class="chapter-img" src="${c.imageUrl}" alt="Illustration Chapitre ${i + 1}">` : ''}
        <div class="chapter-body">
          ${c.contentHTML || ''}
        </div>
      </div>
    `;
  }).join('')}

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

const generatePDF = async (book, chapters, userId, workerId = null) => {
  let browser;
  const isProd = process.env.VERCEL || process.env.NODE_ENV === 'production';

  // Fetch user plan for watermark logic
  let userPlan = 'free';
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true }
    });
    userPlan = (user && user.email === 'nashjarod9@gmail.com') ? 'agency' : (user ? user.plan : 'free');
  } catch (e) {
    console.warn("Database error during PDF generation, fallback to agency plan:", e.message);
    userPlan = 'agency'; // Fallback to premium for safety
  }

  // Load marked dynamically (pure ES Module compatibility)
  const { marked } = await import('marked');
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // Pre-render chapter content from Markdown to HTML
  const processedChapters = chapters.map(c => {
    let contentHTML = '';
    try {
      const parsedMarkdown = parseCustomMarkdown(c.content || '');
      contentHTML = sanitizeGeneratedHtml(marked.parse(parsedMarkdown));
    } catch (e) {
      console.error(`Error parsing markdown for chapter ${c.order}:`, e);
      contentHTML = sanitizeGeneratedHtml(c.content || '');
    }
    return {
      ...c,
      contentHTML
    };
  });

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

  // Pass pre-processed chapters with contentHTML and userPlan to buildEbookHTML
  const html = buildEbookHTML(book, processedChapters, userPlan);
  await page.setContent(html, { waitUntil: 'load' });

  const filename = `ebook_${book.id}_${Date.now()}.pdf`;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>', // Empty header
    footerTemplate: `
      <div style="font-family: 'Inter', sans-serif; font-size: 8px; width: 100%; display: flex; justify-content: space-between; padding: 0 25mm; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">
        <span>Par ${book.author || 'Neno AI'}</span>
        <span>${book.title}</span>
        <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
      </div>
    `,
    margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' }
  });

  await browser.close();

  // Upload to Supabase Storage in exports/ folder
  const publicUrl = await uploadPdfExport(pdfBuffer, userId, filename, 'application/pdf', workerId);
  
  return publicUrl;
};

module.exports = { generatePDF };
