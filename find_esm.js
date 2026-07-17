const fs = require('fs');
const path = require('path');

const nmDir = path.join(__dirname, 'backend', 'node_modules');

const esm = [];
const dirs = fs.readdirSync(nmDir);

for (const dir of dirs) {
  if (dir.startsWith('.')) continue;

  // handle scoped packages (@scope/pkg)
  let pkgJsonPath;
  if (dir.startsWith('@')) {
    const scopedDir = path.join(nmDir, dir);
    if (!fs.statSync(scopedDir).isDirectory()) continue;
    const inner = fs.readdirSync(scopedDir);
    for (const sub of inner) {
      pkgJsonPath = path.join(scopedDir, sub, 'package.json');
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkg.type === 'module') {
          esm.push({ name: `${dir}/${sub}`, version: pkg.version });
        }
      } catch {}
    }
    continue;
  }

  pkgJsonPath = path.join(nmDir, dir, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    if (pkg.type === 'module') {
      esm.push({ name: dir, version: pkg.version });
    }
  } catch {}
}

if (esm.length === 0) {
  console.log('[OK] No ESM-only packages found in node_modules root.');
} else {
  console.log('[WARNING] ESM-only packages found (these will crash Vercel CJS requires):');
  esm.forEach(p => console.log(`  - ${p.name}@${p.version}`));
}
