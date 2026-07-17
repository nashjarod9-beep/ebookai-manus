const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { uploadPdfExport } = require('./storage.service');

const generateZip = async (book, chapters, userId, workerId = null) => {
  return new Promise((resolve, reject) => {
    const filename = `ebook_${book.id}_${Date.now()}.zip`;
    // Use OS temp dir which is writable on Vercel Serverless
    const filepath = path.join(os.tmpdir(), filename);
    const output = fs.createWriteStream(filepath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', async function() {
      try {
        const fileBuffer = fs.readFileSync(filepath);
        const publicUrl = await uploadPdfExport(fileBuffer, userId, filename, 'application/zip', workerId);
        // Clean up temp file
        fs.unlinkSync(filepath);
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    archive.on('error', function(err) {
      reject(err);
    });

    archive.pipe(output);

    // Create an index.html file for the interactive viewer
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${book.title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
        .container { max-width: 800px; margin: auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        img { max-width: 100%; height: auto; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${book.title}</h1>
        ${book.coverUrl ? `<img src="${book.coverUrl}" alt="Cover">` : ''}
        <p>${book.description || ''}</p>
        
        <h2>Sommaire</h2>
        <ul>
          ${chapters.map((c, i) => `<li><a href="#chap-${i}">${c.title}</a></li>`).join('')}
        </ul>

        ${chapters.map((c, i) => `
          <div id="chap-${i}" style="margin-top: 40px;">
            <h2>${c.title}</h2>
            ${c.imageUrl ? `<img src="${c.imageUrl}" alt="Chapter ${i}">` : ''}
            <div>
              ${c.content.replace(/\n/g, '<br>')}
            </div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
    `;

    archive.append(htmlContent, { name: 'index.html' });

    // Since we no longer download images locally, we can't append them easily from disk.
    // In a real Vercel environment, we just link to the remote Supabase images in HTML.
    // The ZIP will contain the interactive HTML which loads images remotely.

    archive.finalize();
  });
};

module.exports = { generateZip };
