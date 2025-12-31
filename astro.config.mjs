// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    optimizeDeps: {
      // v86 uses dynamic imports and wasm, exclude from pre-bundling
      exclude: ['v86'],
    },
    build: {
      // Ensure wasm files are handled correctly
      target: 'esnext',
    },
    server: {
      headers: {
        // Required for SharedArrayBuffer (used by v86 for better performance)
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    preview: {
      headers: {
        // Also set headers for preview mode
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  },
});