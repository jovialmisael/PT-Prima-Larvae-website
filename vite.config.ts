/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@domainTypes': path.resolve(import.meta.dirname, './src/types'),
      '@services': path.resolve(import.meta.dirname, './src/services'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Windows + jalur berisi spasi ("PT Prima larvae project") membuat pool
    // 'forks' bawaan vitest 4 gagal start worker (timeout). 'threads' aman.
    pool: 'threads',
  }
});
