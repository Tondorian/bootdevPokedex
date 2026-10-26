/** Post-build hook: add .js extensions to relative imports in the bundled output so that Node.js ESM can resolve them. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const mainJs = join(distDir, 'main.js');

const content = readFileSync(mainJs, 'utf-8');

// Match ES import statements with relative paths that lack a .js extension.
const patched = content.replace(
  /(\bfrom\s+['"])(\.[^'"]+?)(['"])/g,
  (_, before, mid, after) => {
    // Already has an extension or is absolute — leave it alone.
    if (mid.match(/\.(js|ts|mjs)$/)) return before + mid + after;
    return before + mid + '.js' + after;
  },
);

if (patched !== content) {
  writeFileSync(mainJs, patched);
  console.log('Post-build: added .js extensions to relative imports in dist/main.js');
} else {
  console.log('Post-build: no changes needed in dist/main.js');
}
