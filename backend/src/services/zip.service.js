const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const generateZip = async (book, chapters) => {
  return new Promise((resolve, reject) => {
    const filename = `ebook_${book.id}_${Date.now()}.zip`;
    const exportsDir = path.join(__dirname, '../../uploads/exports');
    
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const filepath = path.join(exportsDir, filename);
    const output = fs.createWriteStream(filepath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    output.on('close', function() {
      resolve(`/uploads/exports/${filename}`);
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
        ${book.coverUrl ? `<img src=".${book.coverUrl}" alt="Cover">` : ''}
        <p>${book.description || ''}</p>
        
        <h2>Sommaire</h2>
        <ul>
          ${chapters.map((c, i) => `<li><a href="#chap-${i}">${c.title}</a></li>`).join('')}
        </ul>

        ${chapters.map((c, i) => `
          <div id="chap-${i}" style="margin-top: 40px;">
            <h2>${c.title}</h2>
            ${c.imageUrl ? `<img src=".${c.imageUrl}" alt="Chapter ${i}">` : ''}
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

    // Append images
    if (book.coverUrl) {
      const coverPath = path.join(__dirname, '../..', book.coverUrl);
      if (fs.existsSync(coverPath)) {
        archive.file(coverPath, { name: book.coverUrl.replace('/uploads/', 'uploads/') });
      }
    }

    chapters.forEach(c => {
      if (c.imageUrl) {
        const imgPath = path.join(__dirname, '../..', c.imageUrl);
        if (fs.existsSync(imgPath)) {
          archive.file(imgPath, { name: c.imageUrl.replace('/uploads/', 'uploads/') });
        }
      }
    });

    archive.finalize();
  });
};

module.exports = { generateZip };
