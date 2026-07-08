const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const markdownToHTML = (md) => {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n\n/gim, '<br><br>')
    .replace(/\n/gim, '<br>');
};

const buildEbookHTML = (book, chapters) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${book.title}</title>
  <style>
    @page { margin: 0; }
    body { font-family: 'Lato', sans-serif; color: #1a1a1a; }
    .cover { page-break-after: always; display: flex; flex-direction: column;
             align-items: center; justify-content: center; min-height: 100vh;
             background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
    .cover h1 { font-family: 'Playfair Display', serif; font-size: 48px;
                color: white; text-align: center; padding: 40px; }
    .cover img { max-width: 80%; border-radius: 12px; margin: 20px; }
    .toc { page-break-after: always; padding: 60px 80px; }
    .toc h2 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 30px; }
    .toc-item { display: flex; justify-content: space-between; padding: 8px 0;
                border-bottom: 1px dotted #ccc; font-size: 15px; }
    .chapter { page-break-before: always; padding: 60px 80px; }
    .chapter h1 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 24px; }
    .chapter h2 { font-family: 'Playfair Display', serif; font-size: 22px; margin: 24px 0 12px; }
    .chapter p { line-height: 1.8; margin-bottom: 16px; font-size: 15px; }
    .chapter img { max-width: 100%; border-radius: 8px; margin: 24px auto; display: block; }
    .footer { position: fixed; bottom: 10mm; left: 18mm; right: 18mm;
              display: flex; justify-content: space-between; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <div class="cover">
    ${book.coverUrl ? `<img src="http://localhost:${process.env.PORT || 5000}${book.coverUrl}" alt="Cover">` : ''}
    <h1>${book.title}</h1>
  </div>
  
  <div class="toc">
    <h2>Sommaire</h2>
    ${chapters.map((c, i) => `
      <div class="toc-item">
        <span>${i + 1}. ${c.title}</span>
        <span>${i * 3 + 4}</span>
      </div>
    `).join('')}
  </div>

  ${chapters.map(c => `
    <div class="chapter">
      <h1>${c.title}</h1>
      ${c.imageUrl ? `<img src="http://localhost:${process.env.PORT || 5000}${c.imageUrl}" alt="Chapter Image">` : ''}
      <div>${markdownToHTML(c.content)}</div>
    </div>
  `).join('')}

  <div class="footer">
    <span>${book.title}</span>
    <span><span class="pageNumber"></span></span>
  </div>
</body>
</html>
`;

const generatePDF = async (book, chapters) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  const page = await browser.newPage();

  const html = buildEbookHTML(book, chapters);
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const filename = `ebook_${book.id}_${Date.now()}.pdf`;
  const pdfsDir = path.join(__dirname, '../../uploads/pdfs');
  
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  const filepath = path.join(pdfsDir, filename);

  await page.pdf({
    path: filepath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' }
  });

  await browser.close();
  return `/uploads/pdfs/${filename}`;
};

module.exports = { generatePDF };
