// ui-kit/vite.config.js
// Vite setup for the ui-kit's demo page (npm run dev -w ui-kit).
// The demo runs on port 5175 because 5173 (web) and 5174 (admin) are reserved.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5175, strictPort: true },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 still uses Sass features that newer Sass versions warn about
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
});
