import { defineConfig } from 'vite';
import { rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.ts',
      external: [
        // Keep Node.js built-ins as runtime imports (not bundled).
        /^node:/,
        /readline/,
        /process/,
      ],
      output: {
        entryFileNames: '[name].js',
        dir: 'dist',
        // Preserve ES module format so Node can resolve the external imports.
        format: 'es',
      },
    },
  },

  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/dist/**'],
  },
});
