import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
  server: {
    watch: {
      // Prevent EBUSY errors on Windows when large media files are locked by another process.
      ignored: ['**/*.mp4', '**/*.mov', '**/*.avi', '**/*.webm', '**/*.mkv'],
    },
  },
});

