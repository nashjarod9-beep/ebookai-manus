const fs = require('fs');
const path = require('path');

const scanDirectory = (dir, query) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scanDirectory(fullPath, query);
      }
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(query)) {
        console.log(`Found "${query}" in: ${fullPath}`);
      }
    }
  }
};

console.log("Scanning frontend...");
scanDirectory(path.join(__dirname, '../frontend/src'), 'react-markdown');
scanDirectory(path.join(__dirname, '../frontend/src'), 'react-pageflip');
scanDirectory(path.join(__dirname, '../frontend/src'), 'dangerouslySetInnerHTML');
scanDirectory(path.join(__dirname, '../frontend/src'), 'html');
